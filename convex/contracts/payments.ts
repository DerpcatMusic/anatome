import { v } from "convex/values";

export const subscriptionOrderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("redirected"),
  v.literal("paid"),
  v.literal("failed_payment"),
  v.literal("pending_charge"),
  v.literal("refunded"),
  v.literal("fulfilled"),
);

export const billingHistoryItemValidator = v.object({
  _id: v.id("subscriptionOrders"),
  createdAt: v.number(),
  fulfilledAt: v.union(v.number(), v.null()),
  amountIls: v.number(),
  status: subscriptionOrderStatusValidator,
  kind: v.union(v.literal("subscribe"), v.literal("renew"), v.literal("upgrade")),
  productDescription: v.string(),
  invoiceNumber: v.union(v.string(), v.null()),
});

export const checkoutOrderStatusReturns = v.union(
  v.null(),
  v.object({
    status: subscriptionOrderStatusValidator,
    redirectUrl: v.union(v.string(), v.null()),
    subscriptionId: v.union(v.id("userSubscriptions"), v.null()),
    failedAt: v.union(v.number(), v.null()),
  }),
);
