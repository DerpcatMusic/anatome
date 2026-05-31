import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import { normalizeEquipmentList } from "../lib/equipmentCatalog";
import { equipmentListValidator } from "../lib/validators";
import { MS, RULES, LIMITS } from "../lib/constants";

const STUDIO_CALENDAR_PAST_MS = 14 * MS.DAY;
const STUDIO_CALENDAR_FUTURE_MS = 10 * 7 * MS.DAY;
import { ensureLiveRoomForClass } from "../lib/liveRoom";
import { requireQueryNow } from "../lib/queryNow";
import { isAutoPublishedOpenSlot } from "../lib/liveClassDisplay";
import { hasLiveClassConflict } from "../lib/oneOnOne";
import { releaseLiveReservationHoldIfStillReserved } from "../credits/lib";
import { scheduleLiveClassLifecycle } from "./schedule";
import { settleReservationsForClass } from "./settle";
import { assertInLiveJoinWindow } from "../lib/liveJoin";
import { joinAccessSnapshotValidator } from "./joinContract";
import { resolveJoinAccess } from "./joinAccess";
import { loadClassRosterSummary } from "./roster";
import { viewerCanSeeLiveClass } from "../lib/liveClassAccess";
import {
  liveClassTypeValidator,
  subscriberReceivePresetValidator,
} from "../lib/domainValidators";
import {
  cancelPendingReminderEventsForClass,
  endLiveRoomForClass,
  requireLiveClassManager,
  reschedulePendingReminderEventsForClass,
} from "./management";

const classType = liveClassTypeValidator;

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

    if (userId === null) return null;

    if (!(await viewerCanSeeLiveClass(ctx, liveClass, userId))) {
      return null;
    }

    if (liveClass.type === "group_live") {
      return liveClass;
    }

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

export const getJoinAccess = query({
  args: {
    liveClassId: v.id("liveClasses"),
    now: v.number(),
  },
  returns: v.union(v.null(), joinAccessSnapshotValidator),
  handler: async (ctx, args) => {
    const resolved = await resolveJoinAccess(ctx, args.liveClassId, args.now);
    return resolved?.snapshot ?? null;
  },
});

export const setSubscriberReceivePreset = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
    preset: subscriberReceivePresetValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { liveClass } = await requireLiveClassManager(ctx, args.liveClassId);
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("לא ניתן לעדכן איכות צפייה לשיעור בסטטוס זה");
    }

    await ctx.db.patch(args.liveClassId, {
      subscriberReceivePreset: args.preset,
      updatedAt: Date.now(),
    });
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
    const durationMinutes =
      args.type === "one_on_one" ? RULES.ONE_ON_ONE_DURATION_MINUTES : args.durationMinutes;
    if (durationMinutes < RULES.MIN_CLASS_DURATION_MINUTES || durationMinutes > RULES.MAX_CLASS_DURATION_MINUTES) {
      throw new Error(`משך השיעור חייב להיות בין ${RULES.MIN_CLASS_DURATION_MINUTES} ל-${RULES.MAX_CLASS_DURATION_MINUTES} דקות`);
    }
    const maxCapacity = args.type === "one_on_one" ? 1 : RULES.MAX_GROUP_CAPACITY;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error(args.type === "one_on_one" ? "קיבולת 1:1 חייבת להיות 1" : `קיבולת חייבת להיות בין 1 ל-${RULES.MAX_GROUP_CAPACITY}`);
    }
    const requiredEquipment = normalizeEquipmentList(args.requiredEquipment);
    if (requiredEquipment.length === 0) throw new Error("חובה לבחור לפחות פריט ציוד אחד");
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("זמן פתיחת כניסה חייב להיות בין 0 ל-60 דקות לפני תחילת השיעור");
    }

    const now = Date.now();
    const endsAt = args.startsAt + durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - MS.FIVE_MINUTES) throw new Error("ניתן לתזמן שיעור רק לעתיד");

    if (await hasLiveClassConflict(ctx, userId, args.startsAt, endsAt)) {
      throw new Error("החלון חופף לשיעור אחר בלוח");
    }

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
      requiredEquipment,
      creditKind: args.type === "one_on_one" ? "oneOnOne" : "live",
      creditCost: 1,
      seatsTaken: 0,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
    const scheduled = await scheduleLiveClassLifecycle(
      ctx,
      liveClassId,
      args.startsAt,
      joinOpensAt,
      joinClosesAt,
    );
    await ctx.db.patch(liveClassId, scheduled);
    return liveClassId;
  },
});

export const start = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const { userId, liveClass } = await requireLiveClassManager(ctx, args.liveClassId);
    if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
      throw new Error("רק שיעורים חיים משתמשים ב-LiveKit");
    }
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("לא ניתן להתחיל את השיעור");
    }

    const now = Date.now();
    if (now > liveClass.joinClosesAt) {
      throw new Error("השיעור כבר הסתיים");
    }
    assertInLiveJoinWindow(liveClass, now);

    await ctx.db.patch(args.liveClassId, {
      status: "live",
      updatedAt: now,
    });

    await ensureLiveRoomForClass(ctx, args.liveClassId, now, {
      startedByUserId: userId,
    });

    return args.liveClassId;
  },
});

export const end = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    await requireLiveClassManager(ctx, args.liveClassId);

    const now = Date.now();
    await ctx.db.patch(args.liveClassId, {
      status: "ended",
      updatedAt: now,
    });

    await endLiveRoomForClass(ctx, args.liveClassId, now);

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
    const { liveClass } = await requireLiveClassManager(ctx, args.liveClassId);
    if (liveClass.status !== "scheduled") {
      throw new Error("ניתן לתזמן מחדש רק שיעורים מתוזמנים");
    }

    const durationMinutes =
      liveClass.type === "one_on_one" ? RULES.ONE_ON_ONE_DURATION_MINUTES : args.durationMinutes;
    if (durationMinutes < RULES.MIN_CLASS_DURATION_MINUTES || durationMinutes > RULES.MAX_CLASS_DURATION_MINUTES) {
      throw new Error(`משך השיעור חייב להיות בין ${RULES.MIN_CLASS_DURATION_MINUTES} ל-${RULES.MAX_CLASS_DURATION_MINUTES} דקות`);
    }
    const maxCapacity = liveClass.type === "one_on_one" ? 1 : RULES.MAX_GROUP_CAPACITY;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error("קיבולת לא תקינה");
    }
    const requiredEquipment = normalizeEquipmentList(args.requiredEquipment);
    if (requiredEquipment.length === 0) {
      throw new Error("חובה לבחור לפחות פריט ציוד אחד");
    }
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("זמן פתיחת כניסה חייב להיות בין 0 ל-60 דקות");
    }

    const now = Date.now();
    const endsAt = args.startsAt + durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - MS.FIVE_MINUTES) {
      throw new Error("ניתן לתזמן שיעור רק לעתיד");
    }

    if (
      await hasLiveClassConflict(
        ctx,
        liveClass.instructorUserId,
        args.startsAt,
        endsAt,
        args.liveClassId,
      )
    ) {
      throw new Error("החלון חופף לשיעור אחר בלוח");
    }

    const patch: Record<string, unknown> = {
      startsAt: args.startsAt,
      endsAt,
      joinOpensAt,
      joinClosesAt,
      capacity: args.capacity,
      requiredEquipment,
      updatedAt: now,
    };
    if (args.title !== undefined && args.title.trim().length >= 3) {
      patch.title = args.title.trim();
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim();
    }
    await ctx.db.patch(args.liveClassId, patch);
    const scheduled = await scheduleLiveClassLifecycle(
      ctx,
      args.liveClassId,
      args.startsAt,
      joinOpensAt,
      joinClosesAt,
    );
    await ctx.db.patch(args.liveClassId, scheduled);

    await reschedulePendingReminderEventsForClass(ctx, args.liveClassId, args.startsAt, now);

    return args.liveClassId;
  },
});

export const cancel = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const { liveClass } = await requireLiveClassManager(ctx, args.liveClassId);
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("לא ניתן לבטל שיעור בסטטוס זה");
    }

    const now = Date.now();
    const wasLive = liveClass.status === "live";

    await ctx.db.patch(args.liveClassId, {
      status: "cancelled",
      updatedAt: now,
    });

    if (wasLive) {
      await endLiveRoomForClass(ctx, args.liveClassId, now);
    }

    const activeStatuses = ["reserved", "joined"] as const;
    for (const status of activeStatuses) {
      const reservations = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_status", (q) =>
          q.eq("liveClassId", args.liveClassId).eq("status", status),
        )
        .take(LIMITS.LIVE_PARTICIPANTS);

      for (const res of reservations) {
        if (status === "reserved") {
          await releaseLiveReservationHoldIfStillReserved(ctx, res._id);
        }
        await ctx.db.patch(res._id, {
          status: "cancelled",
          cancelledAt: now,
        });
      }
    }

    await ctx.db.patch(args.liveClassId, {
      seatsTaken: 0,
      updatedAt: now,
    });

    await cancelPendingReminderEventsForClass(ctx, args.liveClassId, now);

    return args.liveClassId;
  },
});

export const listMine = query({
  args: {
    now: v.number(),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const now = requireQueryNow(args.now);
    const windowStart = args.from ?? now - STUDIO_CALENDAR_PAST_MS;
    const windowEnd = args.to ?? now + STUDIO_CALENDAR_FUTURE_MS;

    if (windowStart >= windowEnd) {
      throw new Error("Invalid studio calendar range");
    }
    if (windowEnd - windowStart > STUDIO_CALENDAR_FUTURE_MS + STUDIO_CALENDAR_PAST_MS) {
      throw new Error("Studio calendar range is too large");
    }

    const scanned = await ctx.db
      .query("liveClasses")
      .withIndex("by_instructorUserId_and_startsAt", (q) =>
        q.eq("instructorUserId", userId).gte("startsAt", windowStart).lt("startsAt", windowEnd),
      )
      .order("asc")
      .take(LIMITS.INSTRUCTOR_LIST_SCAN);

    const visible = scanned.filter((liveClass) => !isAutoPublishedOpenSlot(liveClass));
    const enriched = [];
    for (const liveClass of visible) {
      const rosterSummary = await loadClassRosterSummary(ctx, liveClass._id, liveClass, now);
      enriched.push({ ...liveClass, rosterSummary });
    }
    return enriched;
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
