import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { consumeCredits, type LiveCreditPool } from "../credits/lib";
import { liveClassIdFromRoomName } from "../lib/live";
import { broadcastMetaForClass } from "../live/joinAccess";
import {
  findActiveReservation,
  getAppProfile,
  getParticipantRole,
  parseLiveKitIdentity,
  validateBaseJoinEligibility,
  validateCustomerJoinEligibility,
} from "../live/joinPolicy";

export const handleWebhook = internalMutation({
  args: {
    roomName: v.string(),
    identity: v.string(),
    event: v.string(),
  },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("liveRooms")
      .withIndex("by_roomName", (q) => q.eq("roomName", args.roomName))
      .take(1);
    const room = rooms[0] ?? null;

    if (room === null) return { authorized: false };

    const parsedClassId = liveClassIdFromRoomName(args.roomName);
    if (parsedClassId !== null && parsedClassId !== room.liveClassId) {
      return { authorized: false };
    }

    const liveClass = await ctx.db.get(room.liveClassId);
    if (liveClass === null) return { authorized: false };
    if (
      liveClass.status === "ended" ||
      liveClass.status === "cancelled" ||
      liveClass.status === "draft"
    ) {
      return { authorized: false };
    }

    const parsedIdentity = parseLiveKitIdentity(args.identity);
    if (parsedIdentity === null) return { authorized: false };
    const { role: roleStr, userId } = parsedIdentity;
    const profile = await getAppProfile(ctx, userId);

    if (args.event === "participant_joined") {
      const joinCtx = { ctx, userId, profile, liveClass, now: Date.now() };
      const computedRole = getParticipantRole(joinCtx);
      let reservation = await findActiveReservation(ctx, room.liveClassId, userId);
      let isAuthorized = false;
      let deniedReason = "webhook_unauthorized";

      try {
        const baseRole = await validateBaseJoinEligibility(joinCtx);
        if (roleStr !== baseRole.participantRole) {
          deniedReason = "role_mismatch";
        } else if (computedRole.isInstructor) {
          isAuthorized = true;
        } else {
          const broadcast = await broadcastMetaForClass(
            ctx,
            room.liveClassId,
            liveClass.status,
          );
          if (!broadcast.isBroadcastLive) {
            deniedReason = "broadcast_not_started";
          } else {
            reservation = await validateCustomerJoinEligibility(joinCtx);
            isAuthorized =
              reservation !== null &&
              (reservation.status === "reserved" || reservation.status === "joined");
            if (!isAuthorized) deniedReason = "missing_active_reservation";
          }
        }
      } catch (reason: unknown) {
        deniedReason = reason instanceof Error ? reason.message : "webhook_unauthorized";
      }

      if (isAuthorized) {
        if (!computedRole.isInstructor && reservation !== null && reservation.status === "reserved") {
          const wallet = await ctx.db.get(reservation.walletId);
          const creditKind: LiveCreditPool =
            reservation.creditKind === "live" ? "live" : "oneOnOne";
          const reserved =
            wallet === null
              ? 0
              : creditKind === "live"
                ? wallet.liveReserved
                : wallet.oneOnOneReserved;
          if (reserved < reservation.creditsReserved) {
            await ctx.db.insert("liveJoinEvents", {
              liveClassId: room.liveClassId,
              userId,
              role: "customer",
              result: "denied",
              reason: "missing_credit_bucket",
              createdAt: Date.now(),
            });
            return { authorized: false };
          }

          await consumeCredits(
            ctx,
            reservation.walletId,
            creditKind,
            reservation.creditsReserved,
          );
          await ctx.db.patch(reservation._id, { status: "joined", joinedAt: Date.now() });
        }

        const priorSessions = await ctx.db
          .query("liveAttendance")
          .withIndex("by_liveClassId_and_userId", (q) =>
            q.eq("liveClassId", room.liveClassId).eq("userId", userId),
          )
          .collect();
        const hasOpenSession = priorSessions.some((row) => row.leftAt === undefined);
        if (!hasOpenSession) {
          await ctx.db.insert("liveAttendance", {
            liveClassId: room.liveClassId,
            userId,
            identity: args.identity,
            joinedAt: Date.now(),
          });
        }

        await ctx.db.insert("liveJoinEvents", {
          liveClassId: room.liveClassId,
          userId,
          role: roleStr as "customer" | "instructor" | "admin",
          result: "allowed",
          reason: "webhook_verified",
          createdAt: Date.now(),
        });
      } else {
        await ctx.db.insert("liveJoinEvents", {
          liveClassId: room.liveClassId,
          userId,
          role: roleStr,
          result: "denied",
          reason: deniedReason,
          createdAt: Date.now(),
        });
      }

      return { authorized: isAuthorized };
    }

    if (args.event === "participant_left") {
      const sessions = await ctx.db
        .query("liveAttendance")
        .withIndex("by_liveClassId_and_identity", (q) =>
          q.eq("liveClassId", room.liveClassId).eq("identity", args.identity),
        )
        .order("desc")
        .take(20);
      const openSession = sessions.find((row) => row.leftAt === undefined) ?? null;

      if (openSession !== null) {
        await ctx.db.patch(openSession._id, { leftAt: Date.now() });
      }

      return { authorized: true };
    }

    return { authorized: false };
  },
});
