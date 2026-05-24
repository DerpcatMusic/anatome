import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function scheduleLiveClassLifecycle(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  startsAt: number,
  joinOpensAt: number,
  joinClosesAt: number,
) {
  const startScheduledFunctionId = await ctx.scheduler.runAt(
    joinOpensAt,
    internal.live.cron.startOne,
    { liveClassId, expectedStartsAt: startsAt },
  );
  const endScheduledFunctionId = await ctx.scheduler.runAt(
    joinClosesAt,
    internal.live.cron.endOne,
    { liveClassId, expectedJoinClosesAt: joinClosesAt },
  );

  return { startScheduledFunctionId, endScheduledFunctionId };
}
