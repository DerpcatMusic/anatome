import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { profileRoleValidator } from "../lib/domainValidators";
import { getAppProfile } from "../lib/authz";

const sessionRole = profileRoleValidator;

/** Lightweight post-login resolver: role + onboarding without dashboard payload. */
export const resolve = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      role: sessionRole,
      needsOnboarding: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const appProfile = await getAppProfile(ctx, userId);
    const role = appProfile?.role ?? "customer";

    if (role !== "customer") {
      return { role, needsOnboarding: false };
    }

    const memberProfiles = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);

    return {
      role,
      needsOnboarding: memberProfiles[0] === undefined,
    };
  },
});
