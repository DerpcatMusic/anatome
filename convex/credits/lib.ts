import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function getCurrentCreditBucket(ctx: MutationCtx | QueryCtx, userId: Id<"users">) {
  const now = Date.now();
  const buckets = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user_period", (q) => q.eq("userId", userId))
    .order("desc")
    .take(10);

  return buckets.find((bucket) => bucket.periodStart <= now && bucket.periodEnd > now) ?? null;
}

export function availableLiveCredits(bucket: Pick<Doc<"creditBuckets">, "liveGranted" | "liveUsed" | "liveReserved">) {
  return bucket.liveGranted - bucket.liveUsed - (bucket.liveReserved ?? 0);
}

export function availableOneOnOneCredits(bucket: Pick<Doc<"creditBuckets">, "oneOnOneGranted" | "oneOnOneUsed" | "oneOnOneReserved">) {
  return bucket.oneOnOneGranted - bucket.oneOnOneUsed - (bucket.oneOnOneReserved ?? 0);
}

export function availableVodCredits(bucket: Pick<Doc<"creditBuckets">, "vodGranted" | "vodUsed">) {
  return bucket.vodGranted - bucket.vodUsed;
}
