import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getAppProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});
