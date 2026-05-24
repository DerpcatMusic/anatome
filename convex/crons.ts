import { cronJobs } from "convex/server";
import { components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupResendComponent = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, {
      olderThan: 4 * ONE_WEEK_MS,
    });
  },
});

crons.interval("process live reminder queue", { minutes: 5 }, internal.liveReminders.process.due);
crons.interval("expire live rooms", { minutes: 1 }, internal.livekit.rooms.expireDue, {});
crons.interval("auto start live classes", { minutes: 1 }, internal.live.cron.autoStart, {});
crons.interval("expire stale 1:1 requests", { hours: 1 }, internal.oneOnOne.cron.expireStale, {});
crons.interval("renew active subscriptions", { hours: 1 }, internal.subscriptions.internal.renewDue, {});
crons.interval(
  "cleanup resend component emails",
  { hours: 6 },
  internal.crons.cleanupResendComponent,
);

export default crons;
