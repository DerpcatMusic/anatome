import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentCreditBucket } from "./lib/credits";
import { requireAppProfile, requireCustomer, requireUserId } from "./lib/authz";
import {
  type AvailableOneOnOneSlot,
  buildAvailableSlots,
  isOneOnOneSlotFree,
  oneOnOneAvailableCredits,
  slotMatchesAvailability,
} from "./lib/oneOnOne";

export const listAvailableSlots = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args): Promise<AvailableOneOnOneSlot[]> => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireCustomer(profile);
    if (args.from >= args.to) throw new Error("Invalid range");

    const bucket = await getCurrentCreditBucket(ctx, userId);
    const availableCredits = bucket === null ? 0 : oneOnOneAvailableCredits(bucket);
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
      .take(25);
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
    if (args.startsAt <= Date.now() + 2 * 60 * 60 * 1000) throw new Error("Slot is too soon");
    if (args.endsAt <= args.startsAt) throw new Error("Invalid slot");
    if (!(await slotMatchesAvailability(ctx, args.instructorUserId, args.startsAt, args.endsAt))) {
      throw new Error("Slot is not available");
    }
    if (!(await isOneOnOneSlotFree(ctx, args.instructorUserId, args.startsAt, args.endsAt))) {
      throw new Error("Slot is no longer available");
    }

    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null) throw new Error("No active credit bucket");
    if (oneOnOneAvailableCredits(bucket) < 1) throw new Error("No 1:1 credit available");

    const now = Date.now();
    await ctx.db.patch(bucket._id, {
      oneOnOneReserved: (bucket.oneOnOneReserved ?? 0) + 1,
    });

    return await ctx.db.insert("oneOnOneRequests", {
      customerUserId: userId,
      instructorUserId: args.instructorUserId,
      requestedStartsAt: args.startsAt,
      requestedEndsAt: args.endsAt,
      note: args.note.trim().slice(0, 500),
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
    if (request === null || request.customerUserId !== userId) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Only pending requests can be cancelled");

    const bucket = await ctx.db.get(request.creditBucketId);
    if (bucket !== null) {
      await ctx.db.patch(bucket._id, {
        oneOnOneReserved: Math.max(0, (bucket.oneOnOneReserved ?? 0) - 1),
      });
    }
    await ctx.db.patch(request._id, { status: "cancelled", updatedAt: Date.now(), decidedAt: Date.now() });
    return request._id;
  },
});
