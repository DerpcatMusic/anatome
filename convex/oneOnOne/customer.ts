import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
  getCreditAccess,
  requireWallet,
  availableOneOnOneCredits,
  reserveOneOnOneCredits,
  releaseOneOnOneCredits,
} from "../credits/lib";
import { requireAppProfile, requireCustomer, requireUserId } from "../lib/authz";
import {
  type AvailableOneOnOneSlot,
  type OneOnOneDayWindow,
  buildAvailableSlots,
  buildDayAvailabilityWindows,
  isOneOnOneSlotFree,
  addLocalDays,
  slotMatchesAvailability,
  startOfLocalDay,
} from "../lib/oneOnOne";
import { requireQueryNow } from "../lib/queryNow";
import { MS, RULES, LIMITS } from "../lib/constants";
import { checkRateLimit } from "../lib/rateLimit";
import { scheduleOneOnOneRequestExpiration } from "./schedule";

export const listAvailableSlots = query({
  args: {
    from: v.number(),
    to: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args): Promise<AvailableOneOnOneSlot[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    if (args.from >= args.to) throw new Error("טווח תאריכים לא תקין");

    const at = requireQueryNow(args.now);
    const { wallet } = await getCreditAccess(ctx, userId, at);
    const availableCredits = wallet === null ? 0 : availableOneOnOneCredits(wallet);
    return await buildAvailableSlots(
      ctx,
      args.from,
      args.to,
      availableCredits,
      at,
    );
  },
});

export const listDayAvailability = query({
  args: {
    from: v.number(),
    to: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args): Promise<OneOnOneDayWindow[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    if (args.from >= args.to) throw new Error("טווח תאריכים לא תקין");

    const at = requireQueryNow(args.now);
    const { wallet } = await getCreditAccess(ctx, userId, at);
    const availableCredits = wallet === null ? 0 : availableOneOnOneCredits(wallet);
    return await buildDayAvailabilityWindows(
      ctx,
      args.from,
      args.to,
      availableCredits,
      at,
    );
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
    await checkRateLimit(ctx, userId, "oneOnOneRequest");
    if (args.startsAt <= Date.now() + MS.TWO_HOURS) throw new Error("התאריך קרוב מדי");
    const latestDayStart = addLocalDays(
      startOfLocalDay(Date.now()),
      RULES.ONE_ON_ONE_MAX_ADVANCE_DAYS,
    );
    if (startOfLocalDay(args.startsAt) > latestDayStart) {
      throw new Error("ניתן לבקש שיעור 1:1 עד 30 יום קדימה בלבד");
    }
    if (args.endsAt <= args.startsAt) throw new Error("חלון זמן לא תקין");
    if (args.endsAt - args.startsAt !== RULES.ONE_ON_ONE_DURATION_MINUTES * MS.MINUTE) {
      throw new Error("שיעור 1:1 תמיד 45 דקות");
    }
    if (!(await slotMatchesAvailability(ctx, args.instructorUserId, args.startsAt, args.endsAt))) {
      throw new Error("החלון אינו זמין");
    }
    if (!(await isOneOnOneSlotFree(ctx, args.instructorUserId, args.startsAt, args.endsAt))) {
      throw new Error("החלון כבר אינו זמין");
    }

    const pendingRequests = await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_customerUserId_and_status", (q) =>
        q.eq("customerUserId", userId).eq("status", "pending"),
      )
      .take(RULES.MAX_PENDING_ONE_ON_ONE_REQUESTS + 1);
    if (pendingRequests.length >= RULES.MAX_PENDING_ONE_ON_ONE_REQUESTS) {
      throw new Error("יותר מדי בקשות 1:1 בהמתנה");
    }

    const wallet = await requireWallet(ctx, userId);
    if (availableOneOnOneCredits(wallet) < 1) {
      throw new Error("אין נקודות 1:1 זמינות");
    }
    await reserveOneOnOneCredits(ctx, wallet._id, 1);

    const now = Date.now();
    let requestId: Id<"oneOnOneRequests">;
    try {
      requestId = await ctx.db.insert("oneOnOneRequests", {
        customerUserId: userId,
        instructorUserId: args.instructorUserId,
        requestedStartsAt: args.startsAt,
        requestedEndsAt: args.endsAt,
        note: args.note.trim().slice(0, RULES.MAX_NOTE_LENGTH),
        status: "pending",
        walletId: wallet._id,
        createdAt: now,
        updatedAt: now,
      });
      const expirationScheduledFunctionId = await scheduleOneOnOneRequestExpiration(
        ctx,
        requestId,
        args.startsAt,
      );
      await ctx.db.patch(requestId, { expirationScheduledFunctionId });
    } catch (error) {
      await releaseOneOnOneCredits(ctx, wallet._id, 1);
      throw error;
    }
    return requestId;
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

    await releaseOneOnOneCredits(ctx, request.walletId, 1);
    await ctx.db.patch(request._id, { status: "cancelled", updatedAt: Date.now(), decidedAt: Date.now() });
    return request._id;
  },
});
