import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const subscriptionsForUser = internalQuery({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return rows.map((row) => ({
      endpoint: row.endpoint,
      keys: row.keys,
    }));
  },
});
