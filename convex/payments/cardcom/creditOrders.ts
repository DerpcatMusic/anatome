import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";
import { logCardcomAudit } from "./audit";

export const getCreditOrderInternal = internalQuery({
  args: { orderId: v.id("creditOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const markCreditRedirectReady = internalMutation({
  args: {
    orderId: v.id("creditOrders"),
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

export const markCreditCreateFailed = internalMutation({
  args: {
    orderId: v.id("creditOrders"),
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
      "cardcom.create_low_profile.credit_failed",
      {
        orderId: args.orderId,
        description: args.cardcomDescription ?? args.error,
        importance: "high",
      },
      order?.userId,
    );
  },
});
