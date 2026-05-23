import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    return profiles[0] ?? null;
  },
});
