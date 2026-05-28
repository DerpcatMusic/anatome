import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { billingHistoryItemValidator, checkoutOrderStatusReturns } from "../contracts/payments";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { isStaff, requireAppProfile, requireCustomer, requireUserId } from "../lib/authz";
import {
  assertCheckoutEnabled,
  assertSubscriptionsEnabled,
} from "../lib/featureFlags";
import { getActiveSubscription } from "./lib";
import { DEFAULT_PLANS, planPayload } from "./plans";

async function assertCheckoutCustomer(ctx: MutationCtx, userId: Id<"users">) {
  assertSubscriptionsEnabled();
  assertCheckoutEnabled();
  const profile = await requireAppProfile(ctx, userId);
  if (isStaff(profile)) {
    throw new Error("מנוי בתשלום זמין למנויות בלבד, לא למדריכות.");
  }
  requireCustomer(profile);
}

async function getActivePlanBySlug(
  ctx: MutationCtx,
  slug: string,
): Promise<Doc<"plans"> | null> {
  const plans = await ctx.db
    .query("plans")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .take(10);
  return plans.find((plan) => plan.isActive) ?? null;
}

async function resolvePlan(
  ctx: MutationCtx,
  planSlug: string,
): Promise<Doc<"plans">> {
  const slug = planSlug.trim().toLowerCase();
  let plan = await getActivePlanBySlug(ctx, slug);
  if (plan === null) {
    const fallback = DEFAULT_PLANS.find((item) => item.slug === slug);
    if (fallback === undefined) throw new Error("Plan is not available");
    const planId = await ctx.db.insert("plans", planPayload(fallback));
    plan = await ctx.db.get(planId);
  }
  if (plan === null || !plan.isActive) throw new Error("Plan is not available");
  return plan;
}

export async function beginCheckout(
  ctx: MutationCtx,
  userId: Id<"users">,
  args: {
    planSlug: string;
    kind: "subscribe" | "renew" | "upgrade";
    amountIls?: number;
  },
) {
  const plan = await resolvePlan(ctx, args.planSlug);
  const now = Date.now();
  const active = await getActiveSubscription(ctx, userId, now);

  if (args.kind === "subscribe") {
    if (active !== null) {
      throw new Error("כבר יש מנוי פעיל");
    }
  } else if (active === null) {
    throw new Error("אין מנוי פעיל");
  }

  let amountIls = plan.monthlyPriceIls;
  if (args.kind === "upgrade") {
    if (active === null) throw new Error("No active subscription");
    const currentPlan = await ctx.db.get(active.planId);
    if (currentPlan === null) throw new Error("Current plan is not available");
    if (plan.monthlyPriceIls <= currentPlan.monthlyPriceIls) {
      throw new Error("שדרוג מסלול דורש מסלול יקר יותר");
    }
    amountIls = args.amountIls ?? plan.monthlyPriceIls - currentPlan.monthlyPriceIls;
  } else if (args.kind === "renew") {
    amountIls = plan.monthlyPriceIls;
  }

  const profile = await requireAppProfile(ctx, userId);
  const idempotencyKey = `${userId}:${plan._id}:${args.kind}:${now}`;

  const orderId = await ctx.db.insert("subscriptionOrders", {
    userId,
    planId: plan._id,
    kind: args.kind,
    amountIls,
    currency: "ILS",
    status: "pending",
    idempotencyKey,
    creditGrantSnapshot: {
      vod: plan.vodCreditsPerMonth,
      live: plan.liveCreditsPerMonth,
      oneOnOne: plan.oneOnOneCreditsPerMonth,
    },
    productDescription: `מנוי ${plan.nameHe}`,
    buyerName: profile.displayName,
    buyerEmail: profile.email,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.scheduler.runAfter(0, internal.payments.cardcom.create.createLowProfileForOrder, {
    orderId,
  });

  return { orderId };
}

export const startCheckout = mutation({
  args: {
    planSlug: v.string(),
    kind: v.optional(
      v.union(v.literal("subscribe"), v.literal("renew"), v.literal("upgrade")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertCheckoutCustomer(ctx, userId);
    return await beginCheckout(ctx, userId, {
      planSlug: args.planSlug,
      kind: args.kind ?? "subscribe",
    });
  },
});

export const listMyBillingHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(billingHistoryItemValidator),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = Math.min(Math.max(args.limit ?? 12, 1), 50);
    const orders = await ctx.db
      .query("subscriptionOrders")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return orders.map((order) => ({
      _id: order._id,
      createdAt: order.createdAt,
      fulfilledAt: order.fulfilledAt ?? null,
      amountIls: order.amountIls,
      status: order.status,
      kind: order.kind,
      productDescription: order.productDescription,
      invoiceNumber:
        order.cardcomDocumentNumber !== undefined
          ? `${order.cardcomDocumentType ?? "doc"}-${order.cardcomDocumentNumber}`
          : null,
    }));
  },
});

export const getOrderStatus = query({
  args: {
    orderId: v.id("subscriptionOrders"),
  },
  returns: checkoutOrderStatusReturns,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const order = await ctx.db.get(args.orderId);
    if (order === null || order.userId !== userId) return null;

    return {
      status: order.status,
      redirectUrl: order.redirectUrl ?? null,
      subscriptionId: order.subscriptionId ?? null,
      failedAt: order.failedAt ?? null,
    };
  },
});
