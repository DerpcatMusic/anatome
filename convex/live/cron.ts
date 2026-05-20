import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

function roomNameForClass(liveClassId: Id<"liveClasses">) {
  return `homebody_liveClass_${liveClassId}`;
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
      .take(50);

    for (const liveClass of dueClasses) {
      if (liveClass.status !== "scheduled") continue;
      if (now > liveClass.joinClosesAt) continue;

      await ctx.db.patch(liveClass._id, { status: "live", updatedAt: now });

      const existingRoom = await ctx.db
        .query("liveRooms")
        .withIndex("by_liveClassId", (q) =>
          q.eq("liveClassId", liveClass._id),
        )
        .unique();

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
          updatedAt: now,
        });
      }
    }
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
      .take(100);

    const expiredRoomNames: string[] = [];

    for (const liveClass of dueClasses) {
      await ctx.db.patch(liveClass._id, {
        status: "ended",
        updatedAt: args.now,
        seatsTaken: 0,
      });

      const room = await ctx.db
        .query("liveRooms")
        .withIndex("by_liveClassId", (q) =>
          q.eq("liveClassId", liveClass._id),
        )
        .unique();

      if (room !== null) {
        expiredRoomNames.push(room.roomName);
        await ctx.db.patch(room._id, {
          status: "ended",
          endedAt: room.endedAt ?? args.now,
          updatedAt: args.now,
        });
      }

      await ctx.runMutation(internal.live.settle.settle, {
        liveClassId: liveClass._id,
      });
    }

    return {
      expiredClassIds: dueClasses.map((liveClass) => liveClass._id),
      expiredRoomNames,
    };
  },
});
