import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { shouldSkipLiveReminderDelivery } from "../lib/liveReminderDelivery";

export const reminderContext = internalQuery({
  args: { reminderId: v.id("liveReminderEvents") },
  returns: v.union(
    v.null(),
    v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("sent"),
        v.literal("cancelled"),
        v.literal("skipped"),
      ),
      skipped: v.boolean(),
      userId: v.id("users"),
      liveClassId: v.id("liveClasses"),
      kind: v.union(v.literal("day_before"), v.literal("thirty_minutes")),
      classTitle: v.string(),
      startsAt: v.number(),
      email: v.union(v.string(), v.null()),
      preferences: v.object({
        liveRemindersPush: v.boolean(),
        liveRemindersEmail: v.boolean(),
      }),
      hasPushSubscriptions: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.reminderId);
    if (reminder === null) return null;

    const [reservation, liveClass, user] = await Promise.all([
      ctx.db.get(reminder.reservationId),
      ctx.db.get(reminder.liveClassId),
      ctx.db.get(reminder.userId),
    ]);

    const skipped = shouldSkipLiveReminderDelivery(reservation, liveClass);

    const prefsRow = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", reminder.userId))
      .unique();

    const preferences = {
      liveRemindersPush: prefsRow?.liveRemindersPush ?? true,
      liveRemindersEmail: prefsRow?.liveRemindersEmail ?? true,
    };

    const pushRows = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", reminder.userId))
      .take(1);

    const profile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", reminder.userId))
      .unique();

    const email =
      profile?.email ??
      (typeof user?.email === "string" ? user.email : null);

    return {
      status: reminder.status,
      skipped,
      userId: reminder.userId,
      liveClassId: reminder.liveClassId,
      kind: reminder.kind,
      classTitle: liveClass?.title ?? "שיעור חי",
      startsAt: liveClass?.startsAt ?? reminder.sendAt,
      email,
      preferences,
      hasPushSubscriptions: pushRows.length > 0,
    };
  },
});
