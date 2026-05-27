import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrCreateAppProfile, requireUserId } from "../lib/authz";

/** Ensures appProfiles row exists for new sign-ups before onboarding UI needs it. */
export const ensureAppProfile = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await getOrCreateAppProfile(ctx, userId);
    return null;
  },
});
