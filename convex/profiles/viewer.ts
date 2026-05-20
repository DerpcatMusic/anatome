import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const get = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
