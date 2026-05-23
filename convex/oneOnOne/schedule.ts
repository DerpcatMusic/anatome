import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function scheduleOneOnOneRequestExpiration(
  ctx: MutationCtx,
  requestId: Id<"oneOnOneRequests">,
  requestedStartsAt: number,
) {
  return await ctx.scheduler.runAt(
    requestedStartsAt,
    internal.oneOnOne.cron.expireOne,
    { requestId, expectedRequestedStartsAt: requestedStartsAt },
  );
}
