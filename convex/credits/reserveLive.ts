import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function reserveLiveCredits(ctx: MutationCtx, bucket: Doc<"creditBuckets">, amount: number) {
  await ctx.db.patch(bucket._id, { liveReserved: (bucket.liveReserved ?? 0) + amount });
}
