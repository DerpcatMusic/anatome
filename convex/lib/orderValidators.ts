import { v } from "convex/values";

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("redirected"),
  v.literal("paid"),
  v.literal("failed_payment"),
  v.literal("pending_charge"),
  v.literal("refunded"),
  v.literal("fulfilled"),
);

export const subscriptionOrderKindValidator = v.union(
  v.literal("subscribe"),
  v.literal("renew"),
  v.literal("upgrade"),
);

export const currencyIlsValidator = v.literal("ILS");

export const creditPoolValidator = v.union(
  v.literal("vod"),
  v.literal("live"),
  v.literal("oneOnOne"),
);

export const creditGrantSnapshotValidator = v.object({
  vod: v.number(),
  live: v.number(),
  oneOnOne: v.number(),
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

export const buyerContactFields = {
  buyerName: v.optional(v.string()),
  buyerEmail: v.optional(v.string()),
} as const;

export const subscriptionBuyerExtraFields = {
  buyerPhone: v.optional(v.string()),
  buyerIdentityNumber: v.optional(v.string()),
} as const;

export const cardcomOrderFields = {
  redirectUrl: v.optional(v.string()),
  cardcomLowProfileId: v.optional(v.string()),
  cardcomOperation: v.optional(v.string()),
  cardcomTranzactionId: v.optional(v.number()),
  cardcomToken: v.optional(v.string()),
  cardcomTokenCardYear: v.optional(v.number()),
  cardcomTokenCardMonth: v.optional(v.number()),
  cardcomTokenApprovalNumber: v.optional(v.string()),
  cardcomTokenCardOwnerIdentityNumber: v.optional(v.string()),
  cardcomResponseCode: v.optional(v.string()),
  cardcomDescription: v.optional(v.string()),
  cardcomDocumentType: v.optional(v.string()),
  cardcomDocumentNumber: v.optional(v.number()),
  fulfilledAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),
} as const;
