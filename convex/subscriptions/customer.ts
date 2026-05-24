import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import {
  getActiveSubscription,
  grantSubscriptionPeriodCredits,
  grantPlanUpgradeDelta,
  MONTH_MS,
} from "./lib";
import { getCreditAccess, ensureUserWallet } from "../credits/lib";
import { DEFAULT_PLANS, planPayload } from "./plans";
import { scheduleSubscriptionRenewal } from "./schedule";

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
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const { subscription, wallet } = await getCreditAccess(ctx, userId);
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
    const planSlug = args.planSlug.trim().toLowerCase();

    let plan = await getActivePlanBySlug(ctx, planSlug);

    if (plan === null) {
      const fallback = DEFAULT_PLANS.find((item) => item.slug === planSlug);
      if (fallback === undefined) throw new Error("Plan is not available");
      const planId = await ctx.db.insert("plans", planPayload(fallback));
      plan = await ctx.db.get(planId);
    }

    if (plan === null || !plan.isActive) throw new Error("Plan is not available");

    const active = await getActiveSubscription(ctx, userId);
    if (active !== null) {
      const wallet = await ensureUserWallet(ctx, userId);
      return { subscriptionId: active._id, walletId: wallet._id };
    }

    const now = Date.now();
    const subscriptionId = await ctx.db.insert("userSubscriptions", {
      userId,
      planId: plan._id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: now + MONTH_MS,
      cancelAtPeriodEnd: false,
      provider: "manual",
      createdAt: now,
      updatedAt: now,
    });
    const renewalScheduledFunctionId = await scheduleSubscriptionRenewal(
      ctx,
      subscriptionId,
      now + MONTH_MS,
    );
    await ctx.db.patch(subscriptionId, { renewalScheduledFunctionId });

    const subscription = await ctx.db.get(subscriptionId);
    if (subscription === null) throw new Error("Subscription creation failed");
    const walletId = await grantSubscriptionPeriodCredits(ctx, subscription, plan);

    return { subscriptionId, walletId };
  },
});

export const changePlan = mutation({
  args: {
    planSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
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

    await ctx.db.patch(subscription._id, {
      planId: plan._id,
      pendingPlanId: null,
      pendingPlanChangeAt: null,
      pendingPlanChangeKind: null,
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(subscription._id);
    if (updated === null) throw new Error("Subscription update failed");
    const walletId = await grantPlanUpgradeDelta(ctx, userId, plan, currentPlan);

    return { subscriptionId: subscription._id, walletId, mode: "immediate" as const };
  },
});

export const cancelPendingPlanChange = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
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
    const subscription = await getActiveSubscription(ctx, userId);
    if (subscription === null) throw new Error("No active subscription");

    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});
