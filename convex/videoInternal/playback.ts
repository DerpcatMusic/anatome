import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { isStaff } from "../lib/authz";

export const getAuthorizedVideo = internalQuery({
  args: { userId: v.id("users"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published") {
      return null;
    }
    const profile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (isStaff(profile)) return { video, access: { allowed: true as const, reason: "staff_preview" } };

    if (video.accessKind === "macroflow") {
      const entitlement = await ctx.db
        .query("videoEntitlements")
        .withIndex("by_userId_and_videoId", (q) => q.eq("userId", args.userId).eq("videoId", args.videoId))
        .unique();
      if (entitlement !== null) return { video, access: { allowed: true as const, reason: "macroflow" } };
      return null;
    }

    const buckets = await ctx.db
      .query("creditBuckets")
      .withIndex("by_user_period", (q) => q.eq("userId", args.userId))
      .take(50);
    const hasActiveSubscription = buckets.some((row) => row.periodStart <= Date.now() && row.periodEnd > Date.now());
    if (hasActiveSubscription) return { video, access: { allowed: true as const, reason: "microflow" } };
    return null;
  },
});
