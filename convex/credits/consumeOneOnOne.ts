import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function consumeOneOnOneCredits(ctx: MutationCtx, bucket: Doc<"creditBuckets">, amount: number) {
  await ctx.db.patch(bucket._id, {
    oneOnOneReserved: Math.max(0, (bucket.oneOnOneReserved ?? 0) - amount),
    oneOnOneUsed: bucket.oneOnOneUsed + amount,
  });
}
