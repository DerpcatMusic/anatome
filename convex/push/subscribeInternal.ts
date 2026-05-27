import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const removeByEndpoint = internalMutation({
  args: { endpoint: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing !== null) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
