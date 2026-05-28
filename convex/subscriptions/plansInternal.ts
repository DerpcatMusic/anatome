import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getPlanSlugById = internalQuery({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    return plan?.slug ?? null;
  },
});
