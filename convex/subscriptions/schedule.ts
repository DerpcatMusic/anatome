import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function scheduleSubscriptionRenewal(
  ctx: MutationCtx,
  subscriptionId: Id<"userSubscriptions">,
  currentPeriodEnd: number,
) {
  return await ctx.scheduler.runAt(
    currentPeriodEnd,
    internal.subscriptions.internal.renewOne,
    { subscriptionId, expectedPeriodEnd: currentPeriodEnd },
  );
}
