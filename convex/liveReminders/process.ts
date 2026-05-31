import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { LIMITS } from "../lib/constants";
import { shouldSkipLiveReminderDelivery } from "../lib/liveReminderDelivery";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

async function scheduleDelivery(
  ctx: MutationCtx,
  reminder: Doc<"liveReminderEvents">,
) {
  await ctx.scheduler.runAfter(0, internal.liveReminders.deliver.one, {
    reminderId: reminder._id,
  });
}

async function processReminder(
  ctx: MutationCtx,
  reminder: Doc<"liveReminderEvents">,
) {
  if (reminder.status !== "pending") return "inactive" as const;

  const reservation: Doc<"liveReservations"> | null = await ctx.db.get(reminder.reservationId);
  const liveClass: Doc<"liveClasses"> | null = await ctx.db.get(reminder.liveClassId);

  if (shouldSkipLiveReminderDelivery(reservation, liveClass)) {
    await ctx.db.patch(reminder._id, {
      status: "skipped",
      processedAt: Date.now(),
    });
    return "skipped" as const;
  }

  if (reminder.deliveryScheduledAt === undefined) {
    await ctx.db.patch(reminder._id, { deliveryScheduledAt: Date.now() });
  }
  await scheduleDelivery(ctx, reminder);
  return "scheduled" as const;
}

export const due = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_status_and_sendAt", (q) =>
        q.eq("status", "pending").lte("sendAt", now),
      )
      .take(LIMITS.REMINDER_BATCH);

    let processed = 0;
    for (const reminder of due) {
      if (reminder.deliveryScheduledAt !== undefined) continue;
      await ctx.db.patch(reminder._id, { deliveryScheduledAt: now });
      await scheduleDelivery(ctx, reminder);
      processed += 1;
    }

    return { processed };
  },
});

export const one = internalMutation({
  args: {
    reminderId: v.id("liveReminderEvents"),
    expectedSendAt: v.number(),
  },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.reminderId);
    if (reminder === null) return { status: "missing" as const };
    if (reminder.sendAt !== args.expectedSendAt) return { status: "stale" as const };
    const status = await processReminder(ctx, reminder);
    return { status };
  },
});
