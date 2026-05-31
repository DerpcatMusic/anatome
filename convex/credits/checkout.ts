import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { requireAppProfile, requireUserId } from "../lib/authz";
import {
  assertCheckoutEnabled,
  assertCreditsPurchaseEnabled,
  CHECKOUT_ENABLED,
  CREDITS_PURCHASE_ENABLED,
} from "../lib/featureFlags";
import type { CreditPool } from "./lib";
import {
  CREDIT_MAX_VOLUME_DISCOUNT_PERCENT,
  CREDIT_PURCHASE_MAX_QUANTITY,
  CREDIT_PURCHASE_QUANTITY_PRESETS,
  CREDIT_UNIT_PRICE_ILS,
  CREDIT_VOLUME_TIERS,
  creditPoolLabelHe,
  creditCartProductDescription,
  quoteCreditCart,
  quoteCreditPurchase,
} from "./pricing";
import {
  creditCartLineInputValidator,
  creditCartQuoteValidator,
  creditCheckoutStatusReturns,
  creditPoolValidator,
  creditPurchaseQuoteValidator,
} from "../contracts/credits";
import { requireSelfServeBillingCustomer } from "../lib/billingAuth";

async function assertCreditCheckoutCustomer(ctx: MutationCtx, userId: Id<"users">) {
  assertCreditsPurchaseEnabled();
  assertCheckoutEnabled();
  await requireSelfServeBillingCustomer(
    ctx,
    userId,
    "רכישת קרדיטים זמינה למנויות בלבד, לא למדריכות.",
  );
}

export const getCatalog = query({
  args: {},
  returns: v.object({
    enabled: v.boolean(),
    maxDiscountPercent: v.number(),
    unitPricesIls: v.object({
      vod: v.number(),
      live: v.number(),
      oneOnOne: v.number(),
    }),
    volumeTiers: v.array(
      v.object({
        minQty: v.number(),
        discountPercent: v.number(),
      }),
    ),
    presets: v.array(v.number()),
    maxQuantity: v.number(),
    poolLabelsHe: v.object({
      vod: v.string(),
      live: v.string(),
      oneOnOne: v.string(),
    }),
  }),
  handler: async () => ({
    enabled: CREDITS_PURCHASE_ENABLED && CHECKOUT_ENABLED,
    maxDiscountPercent: CREDIT_MAX_VOLUME_DISCOUNT_PERCENT,
    unitPricesIls: { ...CREDIT_UNIT_PRICE_ILS },
    volumeTiers: CREDIT_VOLUME_TIERS.map((tier) => ({ ...tier })),
    presets: [...CREDIT_PURCHASE_QUANTITY_PRESETS],
    maxQuantity: CREDIT_PURCHASE_MAX_QUANTITY,
    poolLabelsHe: {
      vod: creditPoolLabelHe("vod"),
      live: creditPoolLabelHe("live"),
      oneOnOne: creditPoolLabelHe("oneOnOne"),
    },
  }),
});

export const getQuote = query({
  args: {
    pool: creditPoolValidator,
    quantity: v.number(),
  },
  returns: creditPurchaseQuoteValidator,
  handler: async (_ctx, args) => {
    return quoteCreditPurchase(args.pool as CreditPool, args.quantity);
  },
});

export const getCartQuote = query({
  args: {
    lines: v.array(creditCartLineInputValidator),
  },
  returns: creditCartQuoteValidator,
  handler: async (_ctx, args) => {
    return quoteCreditCart(
      args.lines.map((line) => ({
        pool: line.pool as CreditPool,
        quantity: line.quantity,
      })),
    );
  },
});

export async function beginCreditCheckout(
  ctx: MutationCtx,
  userId: Id<"users">,
  args: { lines: { pool: CreditPool; quantity: number }[] },
) {
  const cart = quoteCreditCart(args.lines);
  const profile = await requireAppProfile(ctx, userId);
  const now = Date.now();
  const primary = cart.lines[0]!;
  const idempotencyKey = `${userId}:credit-cart:${cart.lines.map((l) => `${l.pool}x${l.quantity}`).join(",")}:${now}`;

  const orderId = await ctx.db.insert("creditOrders", {
    userId,
    pool: primary.pool,
    quantity: primary.quantity,
    lines: cart.lines.map((line) => ({
      pool: line.pool,
      quantity: line.quantity,
      unitListIls: line.unitListIls,
      unitEffectiveIls: line.unitEffectiveIls,
      discountPercent: line.discountPercent,
      discountIls: line.discountIls,
      lineTotalIls: line.lineTotalIls,
    })),
    unitListIls: primary.unitListIls,
    unitEffectiveIls: primary.unitEffectiveIls,
    discountPercent: primary.discountPercent,
    discountIls: cart.discountIls,
    amountIls: cart.totalIls,
    currency: "ILS",
    status: "pending",
    idempotencyKey,
    productDescription: creditCartProductDescription(cart),
    buyerName: profile.displayName,
    buyerEmail: profile.email,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.scheduler.runAfter(0, internal.payments.cardcom.createCredit.createLowProfileForCreditOrder, {
    orderId,
  });

  return { orderId, cart };
}

export const startCheckout = mutation({
  args: {
    lines: v.array(creditCartLineInputValidator),
  },
  returns: v.object({
    orderId: v.id("creditOrders"),
    cart: creditCartQuoteValidator,
  }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertCreditCheckoutCustomer(ctx, userId);
    const lines = args.lines.map((line) => ({
      pool: line.pool as CreditPool,
      quantity: line.quantity,
    }));
    return await beginCreditCheckout(ctx, userId, { lines });
  },
});

/** @deprecated Prefer `startCheckout` with `lines`. Kept for older clients. */
export const startCheckoutSingle = mutation({
  args: {
    pool: creditPoolValidator,
    quantity: v.number(),
  },
  returns: v.object({
    orderId: v.id("creditOrders"),
    quote: creditPurchaseQuoteValidator,
  }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertCreditCheckoutCustomer(ctx, userId);
    const result = await beginCreditCheckout(ctx, userId, {
      lines: [{ pool: args.pool as CreditPool, quantity: args.quantity }],
    });
    const quote = result.cart.lines[0]!;
    return { orderId: result.orderId, quote };
  },
});

export const getOrderStatus = query({
  args: {
    orderId: v.id("creditOrders"),
  },
  returns: creditCheckoutStatusReturns,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const order = await ctx.db.get(args.orderId);
    if (order === null || order.userId !== userId) return null;

    return {
      status: order.status,
      redirectUrl: order.redirectUrl ?? null,
      failedAt: order.failedAt ?? null,
    };
  },
});
