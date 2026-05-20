import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function purchaseVodCredit(ctx: MutationCtx, bucket: Doc<"creditBuckets">) {
  await ctx.db.patch(bucket._id, { vodUsed: bucket.vodUsed + 1 });
}
