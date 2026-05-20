import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function releaseLiveCredits(ctx: MutationCtx, bucket: Doc<"creditBuckets">, amount: number) {
  await ctx.db.patch(bucket._id, { liveReserved: Math.max(0, (bucket.liveReserved ?? 0) - amount) });
}
