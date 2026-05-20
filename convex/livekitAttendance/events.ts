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
    const room = await ctx.db
      .query("liveRooms")
      .withIndex("by_roomName", (q) => q.eq("roomName", args.roomName))
      .unique();

    if (room === null) return { authorized: false };

    const liveClass = await ctx.db.get(room.liveClassId);
    if (liveClass === null) return { authorized: false };
    if (liveClass.status !== "live") return { authorized: false };

    const parts = args.identity.split("_");
    if (parts.length < 2) return { authorized: false };
    const roleStr = parts[0];
    const userIdStr = parts.slice(1).join("_");
    const userId = userIdStr as Id<"users">;

    if (args.event === "participant_joined") {
      const reservation = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_userId", (q) =>
          q.eq("liveClassId", room.liveClassId).eq("userId", userId),
        )
        .unique();

      const isAuthorized =
        reservation !== null &&
        (reservation.status === "reserved" || reservation.status === "joined");

      if (isAuthorized) {
        if (reservation !== null && reservation.status === "reserved") {
          const bucket = await ctx.db.get(reservation.creditBucketId);
          if (bucket !== null) {
            if (reservation.creditKind === "live") {
              await consumeLiveCredits(ctx, bucket, reservation.creditsReserved);
            } else {
              await consumeOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
            }
            await ctx.db.patch(reservation._id, { status: "joined", joinedAt: Date.now() });
          }
        }

        const existing = await ctx.db
          .query("liveAttendance")
          .withIndex("by_liveClassId_and_identity", (q) =>
            q.eq("liveClassId", room.liveClassId).eq("identity", args.identity),
          )
          .unique();

        if (existing === null) {
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
        .unique();

      if (existing !== null && existing.leftAt === undefined) {
        await ctx.db.patch(existing._id, { leftAt: Date.now() });
      }

      return { authorized: true };
    }

    return { authorized: false };
  },
});
