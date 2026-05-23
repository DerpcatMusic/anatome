import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function scheduleReminderEvent(
  ctx: MutationCtx,
  reminderId: Id<"liveReminderEvents">,
  sendAt: number,
) {
  return await ctx.scheduler.runAt(
    sendAt,
    internal.liveReminders.process.one,
    { reminderId, expectedSendAt: sendAt },
  );
}
