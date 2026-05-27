import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

const subscriptionKeys = v.object({
  p256dh: v.string(),
  auth: v.string(),
});

export const upsert = mutation({
  args: {
    endpoint: v.string(),
    keys: subscriptionKeys,
    userAgent: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing !== null) {
      if (existing.userId !== userId) {
        await ctx.db.delete(existing._id);
      } else {
        await ctx.db.patch(existing._id, {
          keys: args.keys,
          userAgent: args.userAgent,
          updatedAt: now,
        });
        return null;
      }
    }

    await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: args.endpoint,
      keys: args.keys,
      userAgent: args.userAgent,
      createdAt: now,
      updatedAt: now,
    });
    return null;
  },
});

export const remove = mutation({
  args: { endpoint: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing !== null && existing.userId === userId) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
