import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { getAppProfile as getStoredAppProfile } from "../lib/authz";

export const getAppProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await getStoredAppProfile(ctx, args.userId);
  },
});
