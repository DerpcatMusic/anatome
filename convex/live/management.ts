import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import { LIMITS, MS } from "../lib/constants";
import { scheduleReminderEvent } from "../liveReminders/schedule";

export async function requireLiveClassManager(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
): Promise<{
  userId: Id<"users">;
  profile: Doc<"appProfiles">;
  liveClass: Doc<"liveClasses">;
}> {
  const userId = await requireUserId(ctx);
  const profile = await requireAppProfile(ctx, userId);
  requireRole(profile, ["instructor", "admin"]);

  const liveClass = await ctx.db.get(liveClassId);
  if (liveClass === null) throw new Error("Class not found");
  if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
    throw new Error("Unauthorized");
  }

  return { userId, profile, liveClass };
}

export async function endLiveRoomForClass(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  now: number,
) {
  const rooms = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClassId))
    .take(1);
  const room = rooms[0] ?? null;

  if (room === null) return null;

  await ctx.db.patch(room._id, {
    status: "ended",
    endedAt: now,
    updatedAt: now,
  });

  await ctx.scheduler.runAfter(0, internal.livekit.rooms.deleteRoomByName, {
    roomName: room.roomName,
  });

  return room;
}

export async function cancelPendingReminderEventsForClass(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  now: number,
) {
  const reminders = await ctx.db
    .query("liveReminderEvents")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClassId))
    .take(LIMITS.LIVE_PARTICIPANTS * 2);

  for (const reminder of reminders) {
    if (reminder.status === "pending") {
      await ctx.db.patch(reminder._id, {
        status: "cancelled",
        processedAt: now,
      });
    }
  }
}

export async function reschedulePendingReminderEventsForClass(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  startsAt: number,
  now: number,
) {
  const reminders = await ctx.db
    .query("liveReminderEvents")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClassId))
    .take(LIMITS.LIVE_PARTICIPANTS * 2);

  for (const reminder of reminders) {
    if (reminder.status !== "pending") continue;

    const newSendAt =
      reminder.kind === "day_before"
        ? startsAt - MS.DAY
        : startsAt - MS.THIRTY_MINUTES;

    if (newSendAt <= now) {
      await ctx.db.patch(reminder._id, {
        status: "skipped",
        processedAt: now,
      });
    } else {
      const scheduledFunctionId = await scheduleReminderEvent(ctx, reminder._id, newSendAt);
      await ctx.db.patch(reminder._id, {
        sendAt: newSendAt,
        scheduledFunctionId,
      });
    }
  }
}
