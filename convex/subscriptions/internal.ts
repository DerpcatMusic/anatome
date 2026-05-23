import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../lib/constants";
import { syncCreditBucketForPeriod, MONTH_MS } from "./lib";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { scheduleSubscriptionRenewal } from "./schedule";

async function renewSubscription(
  ctx: MutationCtx,
  subscription: Doc<"userSubscriptions">,
  now: number,
) {
  if (subscription.cancelAtPeriodEnd) {
    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      updatedAt: now,
    });
    return "cancelled" as const;
  }

  const currentPlan = await ctx.db.get(subscription.planId);
  const pendingPlan = subscription.pendingPlanId
    ? await ctx.db.get(subscription.pendingPlanId)
    : null;
  const plan = pendingPlan?.isActive ? pendingPlan : currentPlan;
  if (plan === null || !plan.isActive) {
    await ctx.db.patch(subscription._id, {
      status: "expired",
      updatedAt: now,
    });
    return "expired" as const;
  }

  const nextStart = subscription.currentPeriodEnd;
  const nextEnd = nextStart + MONTH_MS;
  const renewalScheduledFunctionId = await scheduleSubscriptionRenewal(
    ctx,
    subscription._id,
    nextEnd,
  );

  await ctx.db.patch(subscription._id, {
    planId: plan._id,
    currentPeriodStart: nextStart,
    currentPeriodEnd: nextEnd,
    pendingPlanId: null,
    pendingPlanChangeAt: null,
    pendingPlanChangeKind: null,
    renewalScheduledFunctionId,
    updatedAt: now,
  });

  const renewed = await ctx.db.get(subscription._id);
  if (renewed !== null) {
    await syncCreditBucketForPeriod(ctx, renewed, plan);
  }
  return "renewed" as const;
}

export const renewDue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeDue = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_status_and_currentPeriodEnd", (q) => q.eq("status", "active").lte("currentPeriodEnd", now))
      .take(LIMITS.SUBSCRIPTION_RENEWALS);
    const trialingDue = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_status_and_currentPeriodEnd", (q) => q.eq("status", "trialing").lte("currentPeriodEnd", now))
      .take(LIMITS.SUBSCRIPTION_RENEWALS);
    const due = [...activeDue, ...trialingDue].slice(0, LIMITS.SUBSCRIPTION_RENEWALS);

    for (const subscription of due) {
      await renewSubscription(ctx, subscription, now);
    }

    return due.length;
  },
});

export const renewOne = internalMutation({
  args: {
    subscriptionId: v.id("userSubscriptions"),
    expectedPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (subscription === null) return { status: "missing" as const };
    if (subscription.currentPeriodEnd !== args.expectedPeriodEnd) {
      return { status: "stale" as const };
    }
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return { status: "inactive" as const };
    }

    const status = await renewSubscription(ctx, subscription, Date.now());
    return { status };
  },
});
