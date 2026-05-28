import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";
import { logCardcomAudit } from "./audit";

export const getOrderInternal = internalQuery({
  args: { orderId: v.id("subscriptionOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const markRedirectReady = internalMutation({
  args: {
    orderId: v.id("subscriptionOrders"),
    lowProfileId: v.string(),
    redirectUrl: v.string(),
    cardcomOperation: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      cardcomLowProfileId: args.lowProfileId,
      redirectUrl: args.redirectUrl,
      cardcomOperation: args.cardcomOperation,
      status: "redirected",
      updatedAt: now,
    });
  },
});

export const markCreateFailed = internalMutation({
  args: {
    orderId: v.id("subscriptionOrders"),
    error: v.string(),
    cardcomDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      status: "failed_payment",
      cardcomDescription: args.cardcomDescription ?? args.error,
      failedAt: now,
      updatedAt: now,
    });
    await logCardcomAudit(
      ctx,
      "cardcom.create_low_profile.failed",
      {
        orderId: args.orderId,
        description: args.cardcomDescription ?? args.error,
        importance: "high",
      },
      order?.userId,
    );
  },
});
