import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { LIMITS } from "../lib/constants";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { roomNameForClass } from "../lib/live";
import { settleReservationsForClass } from "./settle";

async function startLiveClass(
  ctx: MutationCtx,
  liveClass: Doc<"liveClasses">,
  now: number,
) {
  await ctx.db.patch(liveClass._id, { status: "live", updatedAt: now });

  const existingRooms = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) =>
      q.eq("liveClassId", liveClass._id),
    )
    .take(1);
  const existingRoom = existingRooms[0] ?? null;

  if (existingRoom === null) {
    await ctx.db.insert("liveRooms", {
      liveClassId: liveClass._id,
      provider: "livekit",
      roomName: roomNameForClass(liveClass._id),
      status: "active",
      startedAt: now,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(existingRoom._id, {
      status: "active",
      startedAt: existingRoom.startedAt ?? now,
      updatedAt: now,
    });
  }
}

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

export const autoStart = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const dueClasses = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) =>
        q.eq("status", "scheduled").lte("startsAt", now),
      )
      .take(LIMITS.CRON_CLASSES);

    for (const liveClass of dueClasses) {
      if (liveClass.status !== "scheduled") continue;
      if (now > liveClass.joinClosesAt) continue;
      await startLiveClass(ctx, liveClass, now);
    }
  },
});

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

    const now = Date.now();
    if (now > liveClass.joinClosesAt) return { status: "closed" as const };
    await startLiveClass(ctx, liveClass, now);
    return { status: "started" as const };
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
