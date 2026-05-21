import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import { getCurrentCreditBucket, availableOneOnOneCredits } from "../credits/lib";
import { requireAppProfile, requireCustomer, requireUserId } from "../lib/authz";
import {
  type AvailableOneOnOneSlot,
  buildAvailableSlots,
  isOneOnOneSlotFree,
  slotMatchesAvailability,
} from "../lib/oneOnOne";
import { reserveOneOnOneCredits } from "../credits/reserveOneOnOne";
import { releaseOneOnOneCredits } from "../credits/releaseOneOnOne";
import { MS, RULES, LIMITS } from "../lib/constants";
import { checkRateLimit } from "../lib/rateLimit";

export const listAvailableSlots = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args): Promise<AvailableOneOnOneSlot[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    if (args.from >= args.to) throw new Error("טווח תאריכים לא תקין");

    const bucket = await getCurrentCreditBucket(ctx, userId);
    const availableCredits = bucket === null ? 0 : availableOneOnOneCredits(bucket);
    return await buildAvailableSlots(ctx, args.from, args.to, availableCredits);
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx): Promise<Doc<"oneOnOneRequests">[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    return await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_customerUserId_and_createdAt", (q) => q.eq("customerUserId", userId))
      .order("desc")
      .take(LIMITS.CUSTOMER_REQUESTS);
  },
});

export const listMinePaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    return await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_customerUserId_and_createdAt", (q) => q.eq("customerUserId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const requestSlot = mutation({
  args: {
    instructorUserId: v.id("users"),
    startsAt: v.number(),
    endsAt: v.number(),
    note: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"oneOnOneRequests">> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    if (args.startsAt <= Date.now() + MS.TWO_HOURS) throw new Error("התאריך קרוב מדי");
    if (args.endsAt <= args.startsAt) throw new Error("חלון זמן לא תקין");
    if (!(await slotMatchesAvailability(ctx, args.instructorUserId, args.startsAt, args.endsAt))) {
      throw new Error("החלון אינו זמין");
    }
    if (!(await isOneOnOneSlotFree(ctx, args.instructorUserId, args.startsAt, args.endsAt))) {
      throw new Error("החלון כבר אינו זמין");
    }

    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null) throw new Error("אין תיק נקודות פעיל");
    if (availableOneOnOneCredits(bucket) < 1) throw new Error("אין נקודות 1:1 זמינות");

    const now = Date.now();
    await reserveOneOnOneCredits(ctx, bucket, 1);

    return await ctx.db.insert("oneOnOneRequests", {
      customerUserId: userId,
      instructorUserId: args.instructorUserId,
      requestedStartsAt: args.startsAt,
      requestedEndsAt: args.endsAt,
      note: args.note.trim().slice(0, RULES.MAX_NOTE_LENGTH),
      status: "pending",
      creditBucketId: bucket._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const cancelRequest = mutation({
  args: {
    requestId: v.id("oneOnOneRequests"),
  },
  handler: async (ctx, args): Promise<Id<"oneOnOneRequests">> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    const request = await ctx.db.get(args.requestId);
    if (request === null || request.customerUserId !== userId) throw new Error("הבקשה לא נמצאה");
    if (request.status !== "pending") throw new Error("ניתן לבטל רק בקשות בהמתנה");

    const bucket = await ctx.db.get(request.creditBucketId);
    if (bucket !== null) {
      await releaseOneOnOneCredits(ctx, bucket, 1);
    }
    await ctx.db.patch(request._id, { status: "cancelled", updatedAt: Date.now(), decidedAt: Date.now() });
    return request._id;
  },
});
