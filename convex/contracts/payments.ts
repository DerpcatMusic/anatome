import { v } from "convex/values";
import {
  orderStatusValidator,
  subscriptionOrderKindValidator,
} from "../lib/orderValidators";

export const subscriptionOrderStatusValidator = orderStatusValidator;

export const billingHistoryItemValidator = v.object({
  _id: v.id("subscriptionOrders"),
  createdAt: v.number(),
  fulfilledAt: v.union(v.number(), v.null()),
  amountIls: v.number(),
  status: subscriptionOrderStatusValidator,
  kind: subscriptionOrderKindValidator,
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
