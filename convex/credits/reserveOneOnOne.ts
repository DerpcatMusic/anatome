import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function reserveOneOnOneCredits(ctx: MutationCtx, bucket: Doc<"creditBuckets">, amount: number) {
  await ctx.db.patch(bucket._id, { oneOnOneReserved: (bucket.oneOnOneReserved ?? 0) + amount });
}
