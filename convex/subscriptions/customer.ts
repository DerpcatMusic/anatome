import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { isStaff, requireAppProfile, requireCustomer, requireUserId } from "../lib/authz";
import type { Id } from "../_generated/dataModel";
import { getActiveSubscription } from "./lib";
import { getCreditAccess, ensureUserWallet } from "../credits/lib";
import { requireQueryNow } from "../lib/queryNow";
import { DEFAULT_PLANS, planPayload } from "./plans";
import {
  assertCheckoutEnabled,
  assertSubscriptionsEnabled,
  CHECKOUT_ENABLED,
  CREDITS_PURCHASE_ENABLED,
  SUBSCRIPTIONS_ENABLED,
} from "../lib/featureFlags";
import { isBillingSandboxEnabled } from "../lib/billingSandbox";
import { beginCheckout } from "./checkout";

async function assertSelfServeSubscriptionCustomer(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  assertSubscriptionsEnabled();
  const profile = await requireAppProfile(ctx, userId);
  if (isStaff(profile)) {
    throw new Error("מנוי בתשלום זמין למנויות בלבד, לא למדריכות.");
  }
  requireCustomer(profile);
}

const PAID_CHECKOUT_REQUIRED =
  "נדרש תשלום להפעלת מנוי. השתמשו בתהליך התשלום או פנו לצוות.";

/** Public billing gates — UI should follow this (matches Convex deployment sandbox). */
export const getBillingFlags = query({
  args: {},
  returns: v.object({
    sandbox: v.boolean(),
    subscriptionsEnabled: v.boolean(),
    checkoutEnabled: v.boolean(),
    creditsPurchaseEnabled: v.boolean(),
  }),
  handler: async () => {
    const sandbox = isBillingSandboxEnabled();
    return {
      sandbox,
      subscriptionsEnabled: SUBSCRIPTIONS_ENABLED,
      checkoutEnabled: CHECKOUT_ENABLED,
      creditsPurchaseEnabled: CREDITS_PURCHASE_ENABLED && CHECKOUT_ENABLED,
    };
  },
});

/** Whether the signed-in user may self-serve subscribe (customers only). */
export const getSubscriptionAccess = query({
  args: {},
  returns: v.object({
    canSubscribe: v.boolean(),
    role: v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin")),
  }),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    return {
      canSubscribe: !isStaff(profile),
      role: profile.role,
    };
  },
});

export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_isActive_and_slug", (q) => q.eq("isActive", true))
      .take(20);

    if (plans.length > 0) return plans;
    return DEFAULT_PLANS.map((plan) => ({
      _id: plan.slug,
      _creationTime: 0,
      ...planPayload(plan),
    }));
  },
});

export const getMine = query({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const at = requireQueryNow(args.now);
    const { subscription, wallet } = await getCreditAccess(ctx, userId, at);
    const plan = subscription ? await ctx.db.get(subscription.planId) : null;
    const pendingPlan = subscription?.pendingPlanId
      ? await ctx.db.get(subscription.pendingPlanId)
      : null;

    return { subscription, plan, pendingPlan, wallet };
  },
});

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

export const activatePlan = mutation({
  args: {
    planSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertSelfServeSubscriptionCustomer(ctx, userId);
    if (!CHECKOUT_ENABLED) {
      throw new Error(PAID_CHECKOUT_REQUIRED);
    }
    assertCheckoutEnabled();
    return await beginCheckout(ctx, userId, {
      planSlug: args.planSlug,
      kind: "subscribe",
    });
  },
});

export const changePlan = mutation({
  args: {
    planSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertSelfServeSubscriptionCustomer(ctx, userId);
    const subscription = await getActiveSubscription(ctx, userId);
    if (subscription === null) throw new Error("No active subscription");
    const currentPlan = await ctx.db.get(subscription.planId);
    if (currentPlan === null) throw new Error("Current plan is not available");

    const planSlug = args.planSlug.trim().toLowerCase();
    const plan = await getActivePlanBySlug(ctx, planSlug);
    if (plan === null) throw new Error("Plan is not available");

    if (plan._id === subscription.planId) {
      await ctx.db.patch(subscription._id, {
        pendingPlanId: null,
        pendingPlanChangeAt: null,
        pendingPlanChangeKind: null,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      });
      const wallet = await ensureUserWallet(ctx, userId);
      return {
        subscriptionId: subscription._id,
        walletId: wallet._id,
        mode: "unchanged" as const,
      };
    }

    if (plan.monthlyPriceIls > currentPlan.monthlyPriceIls) {
      if (!CHECKOUT_ENABLED) throw new Error(PAID_CHECKOUT_REQUIRED);
      assertCheckoutEnabled();
      return {
        ...(await beginCheckout(ctx, userId, {
          planSlug: args.planSlug,
          kind: "upgrade",
        })),
        mode: "checkout" as const,
      };
    }

    if (plan.monthlyPriceIls < currentPlan.monthlyPriceIls) {
      await ctx.db.patch(subscription._id, {
        pendingPlanId: plan._id,
        pendingPlanChangeAt: subscription.currentPeriodEnd,
        pendingPlanChangeKind: "downgrade",
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      });
      const wallet = await ensureUserWallet(ctx, userId);
      return {
        subscriptionId: subscription._id,
        walletId: wallet._id,
        mode: "scheduled" as const,
      };
    }

    throw new Error(PAID_CHECKOUT_REQUIRED);
  },
});

export const cancelPendingPlanChange = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await assertSelfServeSubscriptionCustomer(ctx, userId);
    const subscription = await getActiveSubscription(ctx, userId);
    if (subscription === null) throw new Error("No active subscription");

    await ctx.db.patch(subscription._id, {
      pendingPlanId: null,
      pendingPlanChangeAt: null,
      pendingPlanChangeKind: null,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});

export const cancelAtPeriodEnd = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await assertSelfServeSubscriptionCustomer(ctx, userId);
    const subscription = await getActiveSubscription(ctx, userId);
    if (subscription === null) throw new Error("No active subscription");

    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: true,
      pendingPlanId: null,
      pendingPlanChangeAt: null,
      pendingPlanChangeKind: null,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});

export const resume = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await assertSelfServeSubscriptionCustomer(ctx, userId);
    const subscription = await getActiveSubscription(ctx, userId);
    if (subscription === null) throw new Error("No active subscription");

    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});
