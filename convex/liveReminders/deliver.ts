import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { sendLiveReminderEmail } from "../email/liveReminder";
import type { Id } from "../_generated/dataModel";

function frontendBaseUrl(): string {
  const url = process.env.FRONTEND_URL?.trim() ?? "";
  return url.replace(/\/+$/, "");
}

function liveRoomUrl(classId: Id<"liveClasses">): string {
  const base = frontendBaseUrl();
  const path = `/חדר-לייב?classId=${classId}`;
  return base ? `${base}${path}` : path;
}

function pushCopy(kind: "day_before" | "thirty_minutes", classTitle: string) {
  if (kind === "day_before") {
    return {
      title: "מחר שיעור חי",
      body: `${classTitle} — מחר`,
      tag: "live-reminder-day",
    };
  }
  return {
    title: "השיעור מתחיל בקרוב",
    body: `${classTitle} — בעוד 30 דקות`,
    tag: "live-reminder-30m",
  };
}

export const finalize = internalMutation({
  args: {
    reminderId: v.id("liveReminderEvents"),
    pushSentAt: v.optional(v.number()),
    emailSentAt: v.optional(v.number()),
    deliveryError: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("skipped")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.reminderId, {
      status: args.status,
      processedAt: now,
      pushSentAt: args.pushSentAt,
      emailSentAt: args.emailSentAt,
      deliveryError: args.deliveryError,
    });
    return null;
  },
});

export const one = internalAction({
  args: { reminderId: v.id("liveReminderEvents") },
  returns: v.object({
    status: v.union(v.literal("sent"), v.literal("skipped"), v.literal("missing"), v.literal("inactive")),
  }),
  handler: async (ctx, args) => {
    const reminder = await ctx.runQuery(internal.liveReminders.queries.reminderContext, {
      reminderId: args.reminderId,
    });

    if (reminder === null) {
      return { status: "missing" as const };
    }

    if (reminder.status !== "pending") {
      return { status: "inactive" as const };
    }

    if (reminder.skipped) {
      await ctx.runMutation(internal.liveReminders.deliver.finalize, {
        reminderId: args.reminderId,
        status: "skipped",
      });
      return { status: "skipped" as const };
    }

    const prefs = reminder.preferences;
    const roomUrl = liveRoomUrl(reminder.liveClassId);
    const copy = pushCopy(reminder.kind, reminder.classTitle);
    const now = Date.now();
    const errors: string[] = [];
    let pushSentAt: number | undefined;
    let emailSentAt: number | undefined;

    if (prefs.liveRemindersPush) {
      const pushResult = await ctx.runAction(internal.push.send.sendToUser, {
        userId: reminder.userId,
        payload: {
          title: copy.title,
          body: copy.body,
          url: roomUrl,
          tag: copy.tag,
        },
      });
      if (pushResult.sent > 0) {
        pushSentAt = now;
      } else if (pushResult.attempted === 0 && reminder.hasPushSubscriptions) {
        errors.push("push: no active device");
      }
    }

    if (prefs.liveRemindersEmail && reminder.email) {
      try {
        await sendLiveReminderEmail(ctx, {
          to: reminder.email,
          classTitle: reminder.classTitle,
          startsAt: new Date(reminder.startsAt),
          kind: reminder.kind,
          roomUrl,
        });
        emailSentAt = now;
      } catch (error) {
        errors.push(
          `email: ${error instanceof Error ? error.message : "send failed"}`,
        );
      }
    }

    await ctx.runMutation(internal.liveReminders.deliver.finalize, {
      reminderId: args.reminderId,
      status: "sent",
      pushSentAt,
      emailSentAt,
      deliveryError: errors.length > 0 ? errors.join("; ") : undefined,
    });

    return { status: "sent" as const };
  },
});
