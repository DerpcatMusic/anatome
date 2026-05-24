import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";

const sessionRole = v.union(
  v.literal("customer"),
  v.literal("instructor"),
  v.literal("admin"),
);

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

    const appProfiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const appProfile = appProfiles[0] ?? null;
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
