import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("process live reminder queue", { minutes: 5 }, internal.liveReminders.processDue);

export default crons;
