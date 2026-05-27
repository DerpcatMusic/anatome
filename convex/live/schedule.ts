import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/** Schedules automatic end at join close. Go-live is manual via `api.live.class.start` only. */
export async function scheduleLiveClassLifecycle(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  _startsAt: number,
  _joinOpensAt: number,
  joinClosesAt: number,
) {
  const endScheduledFunctionId = await ctx.scheduler.runAt(
    joinClosesAt,
    internal.live.cron.endOne,
    { liveClassId, expectedJoinClosesAt: joinClosesAt },
  );

  return { endScheduledFunctionId };
}
