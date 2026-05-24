import { internalMutation } from "../_generated/server";
import { LIMITS } from "../lib/constants";
import { scheduleLiveClassLifecycle } from "../live/schedule";
import { scheduleReminderEvent } from "../liveReminders/schedule";
import { scheduleOneOnOneRequestExpiration } from "../oneOnOne/schedule";
import { scheduleSubscriptionRenewal } from "../subscriptions/schedule";

const REPAIR_BATCH = 50;

export const scheduleMissing = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let subscriptions = 0;
    let liveClasses = 0;
    let reminders = 0;
    let oneOnOneRequests = 0;

    for (const status of ["active", "trialing"] as const) {
      const rows = await ctx.db
        .query("userSubscriptions")
        .withIndex("by_status_and_currentPeriodEnd", (q) =>
          q.eq("status", status).gte("currentPeriodEnd", now),
        )
        .take(REPAIR_BATCH);
      for (const subscription of rows) {
        if (subscription.renewalScheduledFunctionId !== undefined) continue;
        const renewalScheduledFunctionId = await scheduleSubscriptionRenewal(
          ctx,
          subscription._id,
          subscription.currentPeriodEnd,
        );
        await ctx.db.patch(subscription._id, { renewalScheduledFunctionId });
        subscriptions += 1;
      }
    }

    const scheduledClasses = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "scheduled"))
      .take(LIMITS.CRON_CLASSES);
    const liveRows = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
      .take(LIMITS.CRON_CLASSES);

    for (const liveClass of [...scheduledClasses, ...liveRows]) {
      if (
        liveClass.startScheduledFunctionId !== undefined &&
        liveClass.endScheduledFunctionId !== undefined
      ) {
        continue;
      }
      const scheduled = await scheduleLiveClassLifecycle(
        ctx,
        liveClass._id,
        liveClass.startsAt,
        liveClass.joinOpensAt,
        liveClass.joinClosesAt,
      );
      await ctx.db.patch(liveClass._id, scheduled);
      liveClasses += 1;
    }

    const reminderRows = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_status_and_sendAt", (q) =>
        q.eq("status", "pending").gte("sendAt", now),
      )
      .take(REPAIR_BATCH);
    for (const reminder of reminderRows) {
      if (reminder.scheduledFunctionId !== undefined) continue;
      const scheduledFunctionId = await scheduleReminderEvent(ctx, reminder._id, reminder.sendAt);
      await ctx.db.patch(reminder._id, { scheduledFunctionId });
      reminders += 1;
    }

    const requestRows = await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_status_and_requestedStartsAt", (q) =>
        q.eq("status", "pending").gte("requestedStartsAt", now),
      )
      .take(REPAIR_BATCH);
    for (const request of requestRows) {
      if (request.expirationScheduledFunctionId !== undefined) continue;
      const expirationScheduledFunctionId = await scheduleOneOnOneRequestExpiration(
        ctx,
        request._id,
        request.requestedStartsAt,
      );
      await ctx.db.patch(request._id, { expirationScheduledFunctionId });
      oneOnOneRequests += 1;
    }

    return { subscriptions, liveClasses, reminders, oneOnOneRequests };
  },
});
