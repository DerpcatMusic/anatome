import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { MS } from "../lib/constants";
import { scheduleReminderEvent } from "./schedule";

export async function createReminderEventsForReservation(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  reservationId: Id<"liveReservations">,
  userId: Id<"users">,
  startsAt: number,
) {
  const now = Date.now();
  const reminders = [
    { kind: "day_before" as const, sendAt: startsAt - MS.DAY },
    { kind: "thirty_minutes" as const, sendAt: startsAt - MS.THIRTY_MINUTES },
  ].filter((reminder) => reminder.sendAt > now);

  for (const reminder of reminders) {
    const reminderId = await ctx.db.insert("liveReminderEvents", {
      liveClassId,
      reservationId,
      userId,
      kind: reminder.kind,
      sendAt: reminder.sendAt,
      status: "pending",
      createdAt: now,
    });
    const scheduledFunctionId = await scheduleReminderEvent(ctx, reminderId, reminder.sendAt);
    await ctx.db.patch(reminderId, { scheduledFunctionId });
  }
}
