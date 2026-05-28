import { v } from "convex/values";

export const creditPoolValidator = v.union(
  v.literal("vod"),
  v.literal("live"),
  v.literal("oneOnOne"),
);

export const creditOrderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("redirected"),
  v.literal("paid"),
  v.literal("failed_payment"),
  v.literal("pending_charge"),
  v.literal("refunded"),
  v.literal("fulfilled"),
);

export const creditPurchaseQuoteValidator = v.object({
  pool: creditPoolValidator,
  quantity: v.number(),
  unitListIls: v.number(),
  unitEffectiveIls: v.number(),
  listSubtotalIls: v.number(),
  discountPercent: v.number(),
  discountIls: v.number(),
  totalIls: v.number(),
});

export const creditCartLineInputValidator = v.object({
  pool: creditPoolValidator,
  quantity: v.number(),
});

export const creditCartLineQuoteValidator = v.object({
  pool: creditPoolValidator,
  quantity: v.number(),
  unitListIls: v.number(),
  unitEffectiveIls: v.number(),
  listSubtotalIls: v.number(),
  discountPercent: v.number(),
  discountIls: v.number(),
  totalIls: v.number(),
  lineTotalIls: v.number(),
});

export const creditCartQuoteValidator = v.object({
  lines: v.array(creditCartLineQuoteValidator),
  listSubtotalIls: v.number(),
  discountIls: v.number(),
  totalIls: v.number(),
});

export const creditOrderLineValidator = v.object({
  pool: creditPoolValidator,
  quantity: v.number(),
  unitListIls: v.number(),
  unitEffectiveIls: v.number(),
  discountPercent: v.number(),
  discountIls: v.number(),
  lineTotalIls: v.number(),
});

export const creditCheckoutStatusReturns = v.union(
  v.null(),
  v.object({
    status: creditOrderStatusValidator,
    redirectUrl: v.union(v.string(), v.null()),
    failedAt: v.union(v.number(), v.null()),
  }),
);
