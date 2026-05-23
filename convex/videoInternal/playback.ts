import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { isStaff } from "../lib/authz";
import { getEntitledSubscription } from "../subscriptions/lib";

export const getAuthorizedVideo = internalQuery({
  args: { userId: v.id("users"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published") {
      return null;
    }
    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(1);
    const profile = profiles[0] ?? null;
    if (isStaff(profile)) return { video, access: { allowed: true as const, reason: "staff_preview" } };

    if (video.accessKind === "macroflow") {
      const entitlements = await ctx.db
        .query("videoEntitlements")
        .withIndex("by_userId_and_videoId", (q) => q.eq("userId", args.userId).eq("videoId", args.videoId))
        .take(1);
      if (entitlements[0] !== undefined) return { video, access: { allowed: true as const, reason: "macroflow" } };
      return null;
    }

    const subscription = await getEntitledSubscription(ctx, args.userId);
    if (subscription !== null) return { video, access: { allowed: true as const, reason: "microflow" } };
    return null;
  },
});
