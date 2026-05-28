import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { MS } from "../lib/constants";
import { ensureUserWallet, grantWalletCredits } from "../credits/lib";
import { scheduleSubscriptionRenewal } from "./schedule";

export const MONTH_MS = 30 * MS.DAY;
const ACTIVE_STATUSES = new Set(["trialing", "active"]);

export async function getActiveSubscription(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  at: number = Date.now(),
) {
  const rows = await ctx.db
    .query("userSubscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .order("desc")
    .take(10);

  return (
    rows.find(
      (row) =>
        ACTIVE_STATUSES.has(row.status) &&
        row.currentPeriodStart <= at &&
        row.currentPeriodEnd > at,
    ) ?? null
  );
}

/** @deprecated Use getActiveSubscription — same period-aware eligibility. */
export async function getEntitledSubscription(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  at: number = Date.now(),
) {
  return await getActiveSubscription(ctx, userId, at);
}

export { availableFromWallet as availableFromBucket } from "../credits/lib";

function planCreditGrant(plan: Doc<"plans">) {
  return {
    vod: plan.vodCreditsPerMonth,
    live: plan.liveCreditsPerMonth,
    oneOnOne: plan.oneOnOneCreditsPerMonth,
  };
}

function grantDelta(
  next: Doc<"plans">,
  previous: Doc<"plans"> | null,
) {
  if (previous === null) return planCreditGrant(next);
  return {
    vod: Math.max(0, next.vodCreditsPerMonth - previous.vodCreditsPerMonth),
    live: Math.max(0, next.liveCreditsPerMonth - previous.liveCreditsPerMonth),
    oneOnOne: Math.max(
      0,
      next.oneOnOneCreditsPerMonth - previous.oneOnOneCreditsPerMonth,
    ),
  };
}

/**
 * Add plan credits to the user's persistent wallet once per billing period.
 * Idempotent per subscription.currentPeriodStart.
 */
export async function grantSubscriptionPeriodCredits(
  ctx: MutationCtx,
  subscription: Doc<"userSubscriptions">,
  plan: Doc<"plans">,
  options?: { floorPlan?: Doc<"plans"> | null; force?: boolean },
) {
  await ensureUserWallet(ctx, subscription.userId);

  const periodStart = subscription.currentPeriodStart;
  if (
    !options?.force &&
    subscription.lastCreditsGrantedPeriodStart === periodStart
  ) {
    const wallet = await ensureUserWallet(ctx, subscription.userId);
    return wallet._id;
  }

  const floor = options?.floorPlan ?? null;
  const grant = {
    vod: Math.max(plan.vodCreditsPerMonth, floor?.vodCreditsPerMonth ?? 0),
    live: Math.max(plan.liveCreditsPerMonth, floor?.liveCreditsPerMonth ?? 0),
    oneOnOne: Math.max(
      plan.oneOnOneCreditsPerMonth,
      floor?.oneOnOneCreditsPerMonth ?? 0,
    ),
  };

  const walletId = await grantWalletCredits(ctx, subscription.userId, grant);
  await ctx.db.patch(subscription._id, {
    lastCreditsGrantedPeriodStart: periodStart,
    updatedAt: Date.now(),
  });
  return walletId;
}

/** Immediate upgrade: add only the positive delta between plans. */
export async function grantPlanUpgradeDelta(
  ctx: MutationCtx,
  userId: Id<"users">,
  nextPlan: Doc<"plans">,
  previousPlan: Doc<"plans">,
) {
  const delta = grantDelta(nextPlan, previousPlan);
  if (delta.vod === 0 && delta.live === 0 && delta.oneOnOne === 0) {
    const wallet = await ensureUserWallet(ctx, userId);
    return wallet._id;
  }
  return await grantWalletCredits(ctx, userId, delta);
}

export function planWithCreditSnapshot(
  plan: Doc<"plans">,
  snapshot: { vod: number; live: number; oneOnOne: number },
): Doc<"plans"> {
  return {
    ...plan,
    vodCreditsPerMonth: snapshot.vod,
    liveCreditsPerMonth: snapshot.live,
    oneOnOneCreditsPerMonth: snapshot.oneOnOne,
  };
}

/**
 * Apply a paid CardCom order: active subscription + wallet credits.
 * Idempotent when order.status is already fulfilled.
 */
export async function fulfillPaidOrder(
  ctx: MutationCtx,
  orderId: Id<"subscriptionOrders">,
) {
  const order = await ctx.db.get(orderId);
  if (order === null) throw new Error("Order not found");
  if (order.status === "fulfilled") {
    return {
      subscriptionId: order.subscriptionId ?? null,
      alreadyFulfilled: true as const,
    };
  }

  const plan = await ctx.db.get(order.planId);
  if (plan === null) throw new Error("Plan not found");
  const grantPlan = planWithCreditSnapshot(plan, order.creditGrantSnapshot);
  const now = Date.now();

  let subscription = await getActiveSubscription(ctx, order.userId, now);
  const previousPlan =
    subscription !== null ? await ctx.db.get(subscription.planId) : null;

  if (order.kind === "subscribe") {
    if (subscription !== null) {
      throw new Error("User already has an active subscription");
    }
    const subscriptionId = await ctx.db.insert("userSubscriptions", {
      userId: order.userId,
      planId: plan._id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: now + MONTH_MS,
      cancelAtPeriodEnd: false,
      provider: "cardcom",
      lastOrderId: orderId,
      createdAt: now,
      updatedAt: now,
    });
    const renewalScheduledFunctionId = await scheduleSubscriptionRenewal(
      ctx,
      subscriptionId,
      now + MONTH_MS,
    );
    await ctx.db.patch(subscriptionId, { renewalScheduledFunctionId });
    subscription = await ctx.db.get(subscriptionId);
  } else if (order.kind === "renew") {
    if (subscription === null) {
      throw new Error("No subscription to renew");
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
      status: "active",
      currentPeriodStart: nextStart,
      currentPeriodEnd: nextEnd,
      provider: "cardcom",
      lastOrderId: orderId,
      renewalScheduledFunctionId,
      updatedAt: now,
    });
    subscription = await ctx.db.get(subscription._id);
  } else if (order.kind === "upgrade") {
    if (subscription === null) {
      throw new Error("No subscription to upgrade");
    }
    if (previousPlan === null) throw new Error("Previous plan not found");
    await ctx.db.patch(subscription._id, {
      planId: plan._id,
      provider: "cardcom",
      lastOrderId: orderId,
      updatedAt: now,
    });
    subscription = await ctx.db.get(subscription._id);
    if (subscription === null) throw new Error("Subscription update failed");
    await grantPlanUpgradeDelta(ctx, order.userId, grantPlan, previousPlan);
    await ctx.db.patch(orderId, {
      status: "fulfilled",
      subscriptionId: subscription._id,
      fulfilledAt: now,
      updatedAt: now,
    });
    return { subscriptionId: subscription._id, alreadyFulfilled: false as const };
  }

  if (subscription === null) throw new Error("Subscription fulfillment failed");
  await grantSubscriptionPeriodCredits(ctx, subscription, grantPlan);
  await ctx.db.patch(orderId, {
    status: "fulfilled",
    subscriptionId: subscription._id,
    fulfilledAt: now,
    updatedAt: now,
  });
  return { subscriptionId: subscription._id, alreadyFulfilled: false as const };
}

/** @deprecated Use grantSubscriptionPeriodCredits */
export async function syncCreditBucketForPeriod(
  ctx: MutationCtx,
  subscription: Doc<"userSubscriptions">,
  plan: Doc<"plans">,
  floorPlan?: Doc<"plans"> | null,
) {
  return await grantSubscriptionPeriodCredits(ctx, subscription, plan, {
    floorPlan,
  });
}
