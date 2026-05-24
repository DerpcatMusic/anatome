import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireAppProfile, requireInstructorOrAdmin, requireUserId } from "../lib/authz";
import { hasLiveClassConflict, minuteMs, oneOnOneTimezone } from "../lib/oneOnOne";
import { LIMITS } from "../lib/constants";
import { releaseOneOnOneCredits } from "../credits/lib";
import { scheduleLiveClassLifecycle } from "../live/schedule";
import { createReminderEventsForReservation } from "../liveReminders/create";

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
    if (args.slotMinutes < 20 || args.slotMinutes > 120) throw new Error("משך חלון זמן לא תקין");
    if (args.bufferMinutes < 0 || args.bufferMinutes > 60) throw new Error("חוצץ זמן לא תקין");

    const now = Date.now();
    const payload = {
      weekday: args.weekday, startMinute: args.startMinute, endMinute: args.endMinute,
      slotMinutes: args.slotMinutes, bufferMinutes: args.bufferMinutes,
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

    const now = Date.now();
    const liveClassId = await ctx.db.insert("liveClasses", {
      title: "שיעור 1:1 אישי", description: request.note, type: "one_on_one",
      instructorUserId: userId, startsAt: request.requestedStartsAt, endsAt: request.requestedEndsAt,
      joinOpensAt: request.requestedStartsAt - 10 * minuteMs, joinClosesAt: request.requestedEndsAt,
      capacity: 1, requiredEquipment: ["mat"], creditKind: "oneOnOne", creditCost: 1,
      status: "scheduled", seatsTaken: 1, createdAt: now, updatedAt: now,
    });
    const scheduled = await scheduleLiveClassLifecycle(
      ctx,
      liveClassId,
      request.requestedStartsAt,
      request.requestedEndsAt,
    );
    await ctx.db.patch(liveClassId, scheduled);

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
