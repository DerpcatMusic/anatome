import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("process live reminder queue", { minutes: 5 }, internal.liveReminders.processDue);
crons.interval("expire live rooms", { minutes: 1 }, internal.livekit.expireDueRooms, {});
crons.interval("auto start live classes", { minutes: 1 }, internal.liveClasses.autoStartDueLiveClasses, {});
crons.interval("expire stale 1:1 requests", { hours: 1 }, internal.customerOneOnOne.expireStaleOneOnOneRequests, {});

export default crons;
