import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { consumeLiveCredits } from "../credits/consumeLive";
import { consumeOneOnOneCredits } from "../credits/consumeOneOnOne";

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

    const liveClass = await ctx.db.get(room.liveClassId);
    if (liveClass === null) return { authorized: false };
    if (liveClass.status !== "live") return { authorized: false };

    const parts = args.identity.split("_");
    if (parts.length < 2) return { authorized: false };
    const roleStr = parts[0];
    const userIdStr = parts.slice(1).join("_");
    const userId = userIdStr as Id<"users">;
    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;
    const isInstructor = roleStr === "instructor" && liveClass.instructorUserId === userId;
    const isAdmin = roleStr === "admin" && profile?.role === "admin";

    if (args.event === "participant_joined") {
      const reservations = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_userId", (q) =>
          q.eq("liveClassId", room.liveClassId).eq("userId", userId),
        )
        .take(10);
      const reservation =
        reservations.find((row) => row.status === "joined") ??
        reservations.find((row) => row.status === "reserved") ??
        null;

      const isAuthorized =
        isInstructor ||
        isAdmin ||
        reservation !== null &&
        (reservation.status === "reserved" || reservation.status === "joined");

      if (isAuthorized) {
        if (!isInstructor && !isAdmin && reservation !== null && reservation.status === "reserved") {
          const bucket = await ctx.db.get(reservation.creditBucketId);
          if (bucket === null) {
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

          if (reservation.creditKind === "live") {
            await consumeLiveCredits(ctx, bucket, reservation.creditsReserved);
          } else {
            await consumeOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
          }
          await ctx.db.patch(reservation._id, { status: "joined", joinedAt: Date.now() });
        }

        const existing = await ctx.db
          .query("liveAttendance")
          .withIndex("by_liveClassId_and_identity", (q) =>
            q.eq("liveClassId", room.liveClassId).eq("identity", args.identity),
          )
          .take(1);

        if (existing[0] === undefined) {
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
          role: roleStr as "customer" | "instructor" | "admin",
          result: "denied",
          reason: "webhook_unauthorized",
          createdAt: Date.now(),
        });
      }

      return { authorized: isAuthorized };
    }

    if (args.event === "participant_left") {
      const existing = await ctx.db
        .query("liveAttendance")
        .withIndex("by_liveClassId_and_identity", (q) =>
          q.eq("liveClassId", room.liveClassId).eq("identity", args.identity),
        )
        .take(1);

      if (existing[0] !== undefined && existing[0].leftAt === undefined) {
        await ctx.db.patch(existing[0]._id, { leftAt: Date.now() });
      }

      return { authorized: true };
    }

    return { authorized: false };
  },
});
