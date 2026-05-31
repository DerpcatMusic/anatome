import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireAppProfile, requireInstructorOrAdmin, requireUserId } from "../lib/authz";
import {
  addLocalDays,
  hasLiveClassConflict,
  isOneOnOneSlotFree,
  slotMatchesAvailability,
  localDateTimeOnDay,
  minuteMs,
  oneOnOneTimezone,
  startOfLocalDay,
  weekday,
} from "../lib/oneOnOne";
import { LIMITS, RULES } from "../lib/constants";
import { releaseOneOnOneCredits } from "../credits/lib";
import { createReminderEventsForReservation } from "../liveReminders/create";
import { createScheduledOneOnOneClass } from "./liveClass";

export const listRequests = query({
  args: {},
  handler: async (ctx): Promise<Doc<"oneOnOneRequests">[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);
    return await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_instructorUserId_and_status_and_requestedStartsAt", (q) =>
        q.eq("instructorUserId", userId).eq("status", "pending"),
      )
      .order("asc")
      .take(LIMITS.INSTRUCTOR_REQUESTS);
  },
});

export const listRequestsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);
    return await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_instructorUserId_and_status_and_requestedStartsAt", (q) =>
        q.eq("instructorUserId", userId).eq("status", "pending"),
      )
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const listAvailability = query({
  args: {},
  handler: async (ctx): Promise<Doc<"oneOnOneAvailabilityRules">[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);
    const rules: Doc<"oneOnOneAvailabilityRules">[] = [];
    for (let day = 0; day < 7; day += 1) {
      const dayRules = await ctx.db
        .query("oneOnOneAvailabilityRules")
        .withIndex("by_instructorUserId_and_weekday", (q) => q.eq("instructorUserId", userId).eq("weekday", day))
        .take(25);
      rules.push(...dayRules);
    }
    return rules.sort((a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute);
  },
});

export const setAvailabilityRule = mutation({
  args: {
    ruleId: v.optional(v.id("oneOnOneAvailabilityRules")),
    weekday: v.number(),
    startMinute: v.number(),
    endMinute: v.number(),
    slotMinutes: v.number(),
    bufferMinutes: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args): Promise<Id<"oneOnOneAvailabilityRules">> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);
    if (args.weekday < 0 || args.weekday > 6) throw new Error("יום שבוע לא תקין");
    if (args.startMinute < 0 || args.endMinute > 24 * 60 || args.startMinute >= args.endMinute) {
      throw new Error("שעות זמינות לא תקינות");
    }

    const slotMinutes = RULES.ONE_ON_ONE_DURATION_MINUTES;
    const bufferMinutes = RULES.ONE_ON_ONE_BUFFER_MINUTES;

    const now = Date.now();
    const payload = {
      weekday: args.weekday, startMinute: args.startMinute, endMinute: args.endMinute,
      slotMinutes, bufferMinutes,
      timezone: oneOnOneTimezone, isActive: args.isActive, updatedAt: now,
    };

    if (args.ruleId !== undefined) {
      const existing = await ctx.db.get(args.ruleId);
      if (existing === null || existing.instructorUserId !== userId) throw new Error("הכלל לא נמצא");
      await ctx.db.patch(args.ruleId, payload);
      return args.ruleId;
    }

    return await ctx.db.insert("oneOnOneAvailabilityRules", { instructorUserId: userId, ...payload, createdAt: now });
  },
});

/** @deprecated Prefer weekly rules + customer requestSlot. Bulk-creates empty liveClasses for legacy calendars. */
export const publishAvailability = mutation({
  args: {
    weeksAhead: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ created: number; skipped: number }> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);

    const weeks = Math.min(8, Math.max(1, args.weeksAhead ?? 4));
    const from = Date.now();
    const to = addLocalDays(startOfLocalDay(from), weeks * 7 + 1);

    const rules = await ctx.db
      .query("oneOnOneAvailabilityRules")
      .withIndex("by_instructorUserId_and_weekday", (q) => q.eq("instructorUserId", userId))
      .take(50);
    const activeRules = rules.filter((rule) => rule.isActive);
    if (activeRules.length === 0) {
      throw new Error("אין כללי זמינות פעילים לפרסום");
    }

    let created = 0;
    let skipped = 0;

    for (let dayStart = startOfLocalDay(from); dayStart < to; dayStart = addLocalDays(dayStart, 1)) {
      const dayRules = activeRules.filter((rule) => rule.weekday === weekday(dayStart));
      for (const rule of dayRules) {
        const duration = RULES.ONE_ON_ONE_DURATION_MINUTES * minuteMs;
        for (let startMinute = rule.startMinute; startMinute + RULES.ONE_ON_ONE_DURATION_MINUTES <= rule.endMinute; startMinute += RULES.ONE_ON_ONE_DURATION_MINUTES + RULES.ONE_ON_ONE_BUFFER_MINUTES) {
          const startsAt = localDateTimeOnDay(dayStart, startMinute);
          const endsAt = startsAt + duration;
          if (startsAt < from || endsAt > to) continue;
          if (startsAt <= Date.now() + 2 * 60 * 60 * 1000) continue;
          if (!(await isOneOnOneSlotFree(ctx, userId, startsAt, endsAt))) {
            skipped += 1;
            continue;
          }

          const now = Date.now();
          await createScheduledOneOnOneClass(
            ctx,
            {
              instructorUserId: userId,
              startsAt,
              endsAt,
              title: "שיעור 1:1 אישי",
              description: "חלון פתוח להזמנה",
              seatsTaken: 0,
              now,
            },
          );
          created += 1;
        }
      }
    }

    return { created, skipped };
  },
});

export const approveRequest = mutation({
  args: { requestId: v.id("oneOnOneRequests") },
  handler: async (ctx, args): Promise<Id<"liveClasses">> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);
    const request = await ctx.db.get(args.requestId);
    if (request === null || request.instructorUserId !== userId) throw new Error("הבקשה לא נמצאה");
    if (request.status !== "pending") throw new Error("הבקשה אינה בהמתנה");
    if (await hasLiveClassConflict(ctx, userId, request.requestedStartsAt, request.requestedEndsAt)) {
      throw new Error("החלון כבר אינו פנוי");
    }
    if (
      !(await slotMatchesAvailability(
        ctx,
        userId,
        request.requestedStartsAt,
        request.requestedEndsAt,
      ))
    ) {
      throw new Error("החלון אינו זמין");
    }
    if (
      !(await isOneOnOneSlotFree(
        ctx,
        userId,
        request.requestedStartsAt,
        request.requestedEndsAt,
        request._id,
      ))
    ) {
      throw new Error("החלון כבר אינו פנוי");
    }

    const now = Date.now();
    const liveClassId = await createScheduledOneOnOneClass(
      ctx,
      {
        instructorUserId: userId,
        startsAt: request.requestedStartsAt,
        endsAt: request.requestedEndsAt,
        title: "שיעור 1:1 אישי",
        description: request.note,
        seatsTaken: 1,
        now,
      },
    );

    const reservationId = await ctx.db.insert("liveReservations", {
      liveClassId, userId: request.customerUserId, walletId: request.walletId,
      status: "reserved", creditKind: "oneOnOne", creditsReserved: 1, reservedAt: now,
    });
    await createReminderEventsForReservation(
      ctx,
      liveClassId,
      reservationId,
      request.customerUserId,
      request.requestedStartsAt,
    );

    await ctx.db.patch(request._id, { status: "approved", liveClassId, updatedAt: now, decidedAt: now });
    return liveClassId;
  },
});

export const rejectRequest = mutation({
  args: { requestId: v.id("oneOnOneRequests") },
  handler: async (ctx, args): Promise<Id<"oneOnOneRequests">> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireInstructorOrAdmin(profile);
    const request = await ctx.db.get(args.requestId);
    if (request === null || request.instructorUserId !== userId) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request is not pending");

    await releaseOneOnOneCredits(ctx, request.walletId, 1);
    await ctx.db.patch(request._id, { status: "rejected", updatedAt: Date.now(), decidedAt: Date.now() });
    return request._id;
  },
});
