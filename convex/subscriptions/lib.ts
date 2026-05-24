import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { MS } from "../lib/constants";
import { ensureUserWallet, grantWalletCredits } from "../credits/lib";

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
