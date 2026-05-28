import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { requireAppProfile, requireRole } from "../lib/authz";

export const requireAdminInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await requireAppProfile(ctx, args.userId);
    requireRole(profile, ["admin"]);
    return true;
  },
});

export const getOrderInternal = internalQuery({
  args: { orderId: v.id("subscriptionOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

/** Ops-only: list orders from Convex Dashboard (not exposed on the website). */
export const listOrdersInternal = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);
    return await ctx.db.query("subscriptionOrders").order("desc").take(limit);
  },
});

export const applyRefund = internalMutation({
  args: {
    orderId: v.id("subscriptionOrders"),
    newDocumentNumber: v.optional(v.number()),
    newDocumentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (order === null) throw new Error("Order not found");
    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      status: "refunded",
      cardcomDocumentNumber: args.newDocumentNumber ?? order.cardcomDocumentNumber,
      cardcomDocumentType: args.newDocumentType ?? order.cardcomDocumentType,
      updatedAt: now,
    });
  },
});
