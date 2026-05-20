import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import { equipmentListValidator } from "../lib/validators";
import { missingRequiredEquipment } from "../lib/equipment";
import { releaseLiveCredits } from "../credits/releaseLive";
import { releaseOneOnOneCredits } from "../credits/releaseOneOnOne";

const classType = v.union(v.literal("group_live"), v.literal("one_on_one"));
const creditKind = v.union(v.literal("live"), v.literal("oneOnOne"));

function validateClassCreditModel(
  type: "group_live" | "one_on_one",
  kind: "live" | "oneOnOne",
  cost: number,
) {
  if (cost !== 1) throw new Error("Live classes always cost 1 credit");
  if (type === "group_live" && kind !== "live")
    throw new Error("Group live must use live credits");
  if (type === "one_on_one" && kind !== "oneOnOne")
    throw new Error("1:1 live must use 1:1 credits");
}

function roomNameForClass(liveClassId: Id<"liveClasses">) {
  return `homebody_liveClass_${liveClassId}`;
}

export const get = query({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) return null;

    if (liveClass.type === "group_live") {
      return liveClass;
    }

    if (userId === null) return null;

    const profile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const isStaff =
      profile !== null && (profile.role === "instructor" || profile.role === "admin");
    if (isStaff) return liveClass;

    const reservation = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .unique();

    const hasValidReservation =
      reservation !== null &&
      (reservation.status === "reserved" || reservation.status === "joined");

    if (hasValidReservation) return liveClass;

    return null;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: classType,
    startsAt: v.number(),
    durationMinutes: v.number(),
    joinOpensMinutesBefore: v.number(),
    capacity: v.number(),
    requiredEquipment: equipmentListValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    if (args.title.trim().length < 3) throw new Error("Class title is too short");
    if (args.durationMinutes < 15 || args.durationMinutes > 180) {
      throw new Error("Duration must be between 15 and 180 minutes");
    }
    const maxCapacity = args.type === "one_on_one" ? 1 : 12;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error(args.type === "one_on_one" ? "1:1 capacity must be 1" : "Capacity must be between 1 and 12");
    }
    if (args.requiredEquipment.length === 0) throw new Error("At least one equipment item is required");
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("Join opens must be between 0 and 60 minutes before start");
    }

    const now = Date.now();
    const endsAt = args.startsAt + args.durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - 5 * 60 * 1000) throw new Error("Can only schedule future classes");

    return await ctx.db.insert("liveClasses", {
      title: args.title.trim(),
      description: args.description.trim(),
      type: args.type,
      instructorUserId: userId,
      startsAt: args.startsAt,
      endsAt,
      joinOpensAt,
      joinClosesAt,
      capacity: args.capacity,
      requiredEquipment: args.requiredEquipment,
      creditKind: args.type === "one_on_one" ? "oneOnOne" : "live",
      creditCost: 1,
      seatsTaken: 0,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const start = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
      throw new Error("Only live classes use LiveKit");
    }
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("Class cannot be started");
    }

    const now = Date.now();
    if (now > liveClass.joinClosesAt) {
      throw new Error("Class has already ended");
    }

    await ctx.db.patch(args.liveClassId, {
      status: "live",
      updatedAt: now,
    });

    const existingRoom = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .unique();

    if (existingRoom === null) {
      await ctx.db.insert("liveRooms", {
        liveClassId: args.liveClassId,
        provider: "livekit",
        roomName: roomNameForClass(args.liveClassId),
        status: "active",
        startedAt: now,
        startedByUserId: userId,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existingRoom._id, {
        status: "active",
        startedAt: existingRoom.startedAt ?? now,
        startedByUserId: existingRoom.startedByUserId ?? userId,
        updatedAt: now,
      });
    }

    return args.liveClassId;
  },
});

export const end = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(args.liveClassId, {
      status: "ended",
      updatedAt: now,
    });

    const room = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .unique();

    if (room !== null) {
      await ctx.db.patch(room._id, {
        status: "ended",
        endedAt: now,
        updatedAt: now,
      });
    }

    await ctx.runMutation(internal.live.settle.settle, {
      liveClassId: args.liveClassId,
    });

    return args.liveClassId;
  },
});

export const reschedule = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
    startsAt: v.number(),
    durationMinutes: v.number(),
    joinOpensMinutesBefore: v.number(),
    capacity: v.number(),
    requiredEquipment: equipmentListValidator,
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }
    if (liveClass.status !== "scheduled") {
      throw new Error("Only scheduled classes can be rescheduled");
    }

    if (args.durationMinutes < 15 || args.durationMinutes > 180) {
      throw new Error("משך השיעור חייב להיות בין 15 ל-180 דקות");
    }
    const maxCapacity = liveClass.type === "one_on_one" ? 1 : 12;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error("קיבולת לא תקינה");
    }
    if (args.requiredEquipment.length === 0) {
      throw new Error("חובה לבחור לפחות פריט ציוד אחד");
    }
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("זמן פתיחת כניסה חייב להיות בין 0 ל-60 דקות");
    }

    const now = Date.now();
    const endsAt = args.startsAt + args.durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - 5 * 60 * 1000) {
      throw new Error("ניתן לתזמן שיעור רק לעתיד");
    }

    const patch: Record<string, unknown> = {
      startsAt: args.startsAt,
      endsAt,
      joinOpensAt,
      joinClosesAt,
      capacity: args.capacity,
      requiredEquipment: args.requiredEquipment,
      updatedAt: now,
    };
    if (args.title !== undefined && args.title.trim().length >= 3) {
      patch.title = args.title.trim();
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim();
    }
    await ctx.db.patch(args.liveClassId, patch);

    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .collect();

    for (const reminder of reminders) {
      if (reminder.status !== "pending") continue;

      let newSendAt = args.startsAt;
      if (reminder.kind === "day_before") {
        newSendAt = args.startsAt - 24 * 60 * 60 * 1000;
      } else if (reminder.kind === "thirty_minutes") {
        newSendAt = args.startsAt - 30 * 60 * 1000;
      }

      if (newSendAt <= now) {
        await ctx.db.patch(reminder._id, {
          status: "skipped",
          processedAt: now,
        });
      } else {
        await ctx.db.patch(reminder._id, {
          sendAt: newSendAt,
        });
      }
    }

    return args.liveClassId;
  },
});

export const cancel = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("Class cannot be cancelled in this status");
    }

    const now = Date.now();

    await ctx.db.patch(args.liveClassId, {
      status: "cancelled",
      updatedAt: now,
    });

    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("status", "reserved"),
      )
      .collect();

    for (const res of reservations) {
      const bucket = await ctx.db.get(res.creditBucketId);
      if (bucket !== null) {
        if (res.creditKind === "live") {
          await releaseLiveCredits(ctx, bucket, res.creditsReserved);
        } else {
          await releaseOneOnOneCredits(ctx, bucket, res.creditsReserved);
        }
      }
      await ctx.db.patch(res._id, {
        status: "cancelled",
        cancelledAt: now,
      });
    }

    await ctx.db.patch(args.liveClassId, {
      seatsTaken: 0,
      updatedAt: now,
    });

    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .collect();

    for (const reminder of reminders) {
      if (reminder.status === "pending") {
        await ctx.db.patch(reminder._id, {
          status: "cancelled",
          processedAt: now,
        });
      }
    }

    return args.liveClassId;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    return await ctx.db
      .query("liveClasses")
      .withIndex("by_instructorUserId_and_startsAt", (q) => q.eq("instructorUserId", userId))
      .order("desc")
      .take(50);
  },
});
