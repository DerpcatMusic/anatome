import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("process live reminder queue", { minutes: 5 }, internal.liveReminders.process.due);
crons.interval("expire live rooms", { minutes: 1 }, internal.livekit.rooms.expireDue, {});
crons.interval("auto start live classes", { minutes: 1 }, internal.live.cron.autoStart, {});
crons.interval("expire stale 1:1 requests", { hours: 1 }, internal.oneOnOne.cron.expireStale, {});
crons.interval("renew active subscriptions", { hours: 1 }, internal.subscriptions.internal.renewDue, {});

export default crons;
