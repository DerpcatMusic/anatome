import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const DEFAULT_PREFS = {
  liveRemindersPush: true,
  liveRemindersEmail: true,
} as const;

export async function getOrCreateNotificationPreferences(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const existingRows = await ctx.db
    .query("notificationPreferences")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(2);
  if (existingRows.length > 1) {
    throw new Error("Duplicate notification preferences require repair");
  }
  const existing = existingRows[0] ?? null;

  if (existing !== null) return existing;

  const now = Date.now();
  const id = await ctx.db.insert("notificationPreferences", {
    userId,
    ...DEFAULT_PREFS,
    updatedAt: now,
  });
  const created = await ctx.db.get(id);
  if (created === null) throw new Error("Failed to create notification preferences");
  return created;
}

export const get = query({
  args: {},
  returns: v.object({
    liveRemindersPush: v.boolean(),
    liveRemindersEmail: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(2);
    if (rows.length > 1) {
      throw new Error("Duplicate notification preferences require repair");
    }
    const row = rows[0] ?? null;

    if (row === null) {
      return { ...DEFAULT_PREFS };
    }

    return {
      liveRemindersPush: row.liveRemindersPush,
      liveRemindersEmail: row.liveRemindersEmail,
    };
  },
});

export const update = mutation({
  args: {
    liveRemindersPush: v.boolean(),
    liveRemindersEmail: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await getOrCreateNotificationPreferences(ctx, userId);
    await ctx.db.patch(existing._id, {
      liveRemindersPush: args.liveRemindersPush,
      liveRemindersEmail: args.liveRemindersEmail,
      updatedAt: Date.now(),
    });
    return null;
  },
});
