import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import { equipmentListValidator } from "../lib/validators";
import { missingRequiredEquipment } from "../lib/equipment";
import { MS, RULES, LIMITS } from "../lib/constants";
import { roomNameForClass } from "../lib/live";
import { releaseCredits, type LiveCreditPool } from "../credits/lib";
import { scheduleLiveClassLifecycle } from "./schedule";
import { settleReservationsForClass } from "./settle";
import { scheduleReminderEvent } from "../liveReminders/schedule";

const classType = v.union(v.literal("group_live"), v.literal("one_on_one"));
const creditKind = v.union(v.literal("live"), v.literal("oneOnOne"));

function validateClassCreditModel(
  type: "group_live" | "one_on_one",
  kind: "live" | "oneOnOne",
  cost: number,
) {
  if (cost !== 1) throw new Error("שיעור חי תמיד עולה נקודה אחת");
  if (type === "group_live" && kind !== "live")
    throw new Error("שיעור קבוצתי חייב להשתמש בנקודות שיעור חי");
  if (type === "one_on_one" && kind !== "oneOnOne")
    throw new Error("שיעור 1:1 חייב להשתמש בנקודות 1:1");
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

    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;
    const isStaff =
      profile !== null && (profile.role === "instructor" || profile.role === "admin");
    if (isStaff) return liveClass;

    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .take(10);
    const reservation =
      reservations.find((row) => row.status === "joined") ??
      reservations.find((row) => row.status === "reserved") ??
      null;

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

    if (args.title.trim().length < 3) throw new Error("כותרת השיעור קצרה מדי");
    if (args.durationMinutes < RULES.MIN_CLASS_DURATION_MINUTES || args.durationMinutes > RULES.MAX_CLASS_DURATION_MINUTES) {
      throw new Error(`משך השיעור חייב להיות בין ${RULES.MIN_CLASS_DURATION_MINUTES} ל-${RULES.MAX_CLASS_DURATION_MINUTES} דקות`);
    }
    const maxCapacity = args.type === "one_on_one" ? 1 : RULES.MAX_GROUP_CAPACITY;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error(args.type === "one_on_one" ? "קיבולת 1:1 חייבת להיות 1" : `קיבולת חייבת להיות בין 1 ל-${RULES.MAX_GROUP_CAPACITY}`);
    }
    if (args.requiredEquipment.length === 0) throw new Error("חובה לבחור לפחות פריט ציוד אחד");
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("זמן פתיחת כניסה חייב להיות בין 0 ל-60 דקות לפני תחילת השיעור");
    }

    const now = Date.now();
    const endsAt = args.startsAt + args.durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - MS.FIVE_MINUTES) throw new Error("ניתן לתזמן שיעור רק לעתיד");

    const liveClassId = await ctx.db.insert("liveClasses", {
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
    const scheduled = await scheduleLiveClassLifecycle(ctx, liveClassId, args.startsAt, joinClosesAt);
    await ctx.db.patch(liveClassId, scheduled);
    return liveClassId;
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
    if (liveClass === null) throw new Error("השיעור לא נמצא");
    if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
      throw new Error("רק שיעורים חיים משתמשים ב-LiveKit");
    }
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("אין הרשאה");
    }
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("לא ניתן להתחיל את השיעור");
    }

    const now = Date.now();
    if (now > liveClass.joinClosesAt) {
      throw new Error("השיעור כבר הסתיים");
    }

    await ctx.db.patch(args.liveClassId, {
      status: "live",
      updatedAt: now,
    });

    const existingRooms = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .take(1);
    const existingRoom = existingRooms[0] ?? null;

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

    const rooms = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .take(1);
    const room = rooms[0] ?? null;

    if (room !== null) {
      await ctx.db.patch(room._id, {
        status: "ended",
        endedAt: now,
        updatedAt: now,
      });
    }

    if (room !== null) {
      await ctx.scheduler.runAfter(0, internal.livekit.rooms.deleteRoomByName, {
        roomName: room.roomName,
      });
    }

    await settleReservationsForClass(ctx, args.liveClassId);

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
      throw new Error("ניתן לתזמן מחדש רק שיעורים מתוזמנים");
    }

    if (args.durationMinutes < RULES.MIN_CLASS_DURATION_MINUTES || args.durationMinutes > RULES.MAX_CLASS_DURATION_MINUTES) {
      throw new Error(`משך השיעור חייב להיות בין ${RULES.MIN_CLASS_DURATION_MINUTES} ל-${RULES.MAX_CLASS_DURATION_MINUTES} דקות`);
    }
    const maxCapacity = liveClass.type === "one_on_one" ? 1 : RULES.MAX_GROUP_CAPACITY;
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

    if (args.startsAt <= now - MS.FIVE_MINUTES) {
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
    const scheduled = await scheduleLiveClassLifecycle(ctx, args.liveClassId, args.startsAt, joinClosesAt);
    await ctx.db.patch(args.liveClassId, scheduled);

    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .take(LIMITS.LIVE_PARTICIPANTS * 2);

    for (const reminder of reminders) {
      if (reminder.status !== "pending") continue;

      let newSendAt = args.startsAt;
      if (reminder.kind === "day_before") {
        newSendAt = args.startsAt - MS.DAY;
      } else if (reminder.kind === "thirty_minutes") {
        newSendAt = args.startsAt - MS.THIRTY_MINUTES;
      }

      if (newSendAt <= now) {
        await ctx.db.patch(reminder._id, {
          status: "skipped",
          processedAt: now,
        });
      } else {
        const scheduledFunctionId = await scheduleReminderEvent(ctx, reminder._id, newSendAt);
        await ctx.db.patch(reminder._id, {
          sendAt: newSendAt,
          scheduledFunctionId,
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
      throw new Error("לא ניתן לבטל שיעור בסטטוס זה");
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
      .take(LIMITS.LIVE_PARTICIPANTS);

    for (const res of reservations) {
      const creditKind: LiveCreditPool =
        res.creditKind === "live" ? "live" : "oneOnOne";
      await releaseCredits(
        ctx,
        res.walletId,
        creditKind,
        res.creditsReserved,
      );
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
      .take(LIMITS.LIVE_PARTICIPANTS * 2);

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
      .take(LIMITS.INSTRUCTOR_CLASSES);
  },
});

export const listMinePaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    return await ctx.db
      .query("liveClasses")
      .withIndex("by_instructorUserId_and_startsAt", (q) => q.eq("instructorUserId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
