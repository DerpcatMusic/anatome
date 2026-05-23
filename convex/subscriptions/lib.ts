import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { MS } from "../lib/constants";

export const MONTH_MS = 30 * MS.DAY;
const ACTIVE_STATUSES = new Set(["trialing", "active"]);

export async function getActiveSubscription(ctx: MutationCtx, userId: Id<"users">) {
  const rows = await ctx.db
    .query("userSubscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .order("desc")
    .take(10);

  const now = Date.now();
  return rows.find((row) =>
    ACTIVE_STATUSES.has(row.status) &&
    row.currentPeriodStart <= now &&
    row.currentPeriodEnd > now
  ) ?? null;
}

export async function getEntitledSubscription(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const rows = await ctx.db
    .query("userSubscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .order("desc")
    .take(10);

  return rows.find((row) => ACTIVE_STATUSES.has(row.status)) ?? null;
}

export function availableFromBucket(bucket: Pick<Doc<"creditBuckets">,
  "vodGranted" | "vodUsed" | "liveGranted" | "liveUsed" | "liveReserved" | "oneOnOneGranted" | "oneOnOneUsed" | "oneOnOneReserved"
>) {
  return {
    vod: bucket.vodGranted - bucket.vodUsed,
    live: bucket.liveGranted - bucket.liveUsed - (bucket.liveReserved ?? 0),
    oneOnOne: bucket.oneOnOneGranted - bucket.oneOnOneUsed - (bucket.oneOnOneReserved ?? 0),
  };
}

export async function getBucketForPeriod(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  periodStart: number,
) {
  const rows = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user_period", (q) => q.eq("userId", userId).eq("periodStart", periodStart))
    .take(1);
  return rows[0] ?? null;
}

export async function syncCreditBucketForPeriod(
  ctx: MutationCtx,
  subscription: Doc<"userSubscriptions">,
  plan: Doc<"plans">,
  floorPlan?: Doc<"plans"> | null,
) {
  const existing = await getBucketForPeriod(ctx, subscription.userId, subscription.currentPeriodStart);
  const vodGrantFloor = Math.max(plan.vodCreditsPerMonth, floorPlan?.vodCreditsPerMonth ?? 0);
  const liveGrantFloor = Math.max(plan.liveCreditsPerMonth, floorPlan?.liveCreditsPerMonth ?? 0);
  const oneOnOneGrantFloor = Math.max(
    plan.oneOnOneCreditsPerMonth,
    floorPlan?.oneOnOneCreditsPerMonth ?? 0,
  );

  if (existing !== null) {
    await ctx.db.patch(existing._id, {
      subscriptionId: subscription._id,
      planId: plan._id,
      periodEnd: subscription.currentPeriodEnd,
      vodGranted: Math.max(existing.vodGranted, vodGrantFloor),
      liveGranted: Math.max(existing.liveGranted, liveGrantFloor),
      oneOnOneGranted: Math.max(existing.oneOnOneGranted, oneOnOneGrantFloor),
    });
    return existing._id;
  }

  return await ctx.db.insert("creditBuckets", {
    userId: subscription.userId,
    subscriptionId: subscription._id,
    planId: plan._id,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    vodGranted: vodGrantFloor,
    vodUsed: 0,
    liveGranted: liveGrantFloor,
    liveReserved: 0,
    liveUsed: 0,
    oneOnOneGranted: oneOnOneGrantFloor,
    oneOnOneReserved: 0,
    oneOnOneUsed: 0,
  });
}
