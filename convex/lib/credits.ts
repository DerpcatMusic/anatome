import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getCurrentCreditBucket(ctx: MutationCtx | QueryCtx, userId: Id<"users">) {
  const now = Date.now();
  const buckets = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user_period", (q) => q.eq("userId", userId))
    .collect();

  return buckets.find((bucket) => bucket.periodStart <= now && bucket.periodEnd > now) ?? null;
}
