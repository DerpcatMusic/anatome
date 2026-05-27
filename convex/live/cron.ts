import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { LIMITS } from "../lib/constants";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { settleReservationsForClass } from "./settle";

async function endLiveClass(
  ctx: MutationCtx,
  liveClass: Doc<"liveClasses">,
  now: number,
) {
  await ctx.db.patch(liveClass._id, {
    status: "ended",
    updatedAt: now,
    seatsTaken: 0,
  });

  const rooms = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) =>
      q.eq("liveClassId", liveClass._id),
    )
    .take(1);
  const room = rooms[0] ?? null;

  if (room !== null) {
    await ctx.db.patch(room._id, {
      status: "ended",
      endedAt: room.endedAt ?? now,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.livekit.rooms.deleteRoomByName, {
      roomName: room.roomName,
    });
  }

  await settleReservationsForClass(ctx, liveClass._id);
}

/** @deprecated Auto go-live removed; instructors use `api.live.class.start`. Kept for stale scheduled jobs. */
export const startOne = internalMutation({
  args: {
    liveClassId: v.id("liveClasses"),
    expectedStartsAt: v.number(),
  },
  handler: async (ctx, args) => {
    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) return { status: "missing" as const };
    if (liveClass.startsAt !== args.expectedStartsAt) return { status: "stale" as const };
    if (liveClass.status !== "scheduled") return { status: "inactive" as const };
    return { status: "manual_start_required" as const };
  },
});

export const expire = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const dueClasses = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_joinClosesAt", (q) =>
        q.eq("status", "live").lte("joinClosesAt", args.now),
      )
      .take(LIMITS.CRON_SETTLE);

    const expiredRoomNames: string[] = [];

    for (const liveClass of dueClasses) {
      const rooms = await ctx.db
        .query("liveRooms")
        .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClass._id))
        .take(1);
      const room = rooms[0] ?? null;
      if (room !== null) expiredRoomNames.push(room.roomName);
      await endLiveClass(ctx, liveClass, args.now);
    }

    return {
      expiredClassIds: dueClasses.map((liveClass) => liveClass._id),
      expiredRoomNames,
    };
  },
});

export const endOne = internalMutation({
  args: {
    liveClassId: v.id("liveClasses"),
    expectedJoinClosesAt: v.number(),
  },
  handler: async (ctx, args) => {
    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) return { status: "missing" as const };
    if (liveClass.joinClosesAt !== args.expectedJoinClosesAt) return { status: "stale" as const };
    if (liveClass.status !== "live" && liveClass.status !== "scheduled") {
      return { status: "inactive" as const };
    }

    await endLiveClass(ctx, liveClass, Date.now());
    return { status: "ended" as const };
  },
});
