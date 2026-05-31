import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { getAppProfile, isStaff } from "../lib/authz";
import { getActiveSubscription } from "../subscriptions/lib";

export const getAuthorizedVideo = internalQuery({
  args: { userId: v.id("users"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (video === null) {
      return null;
    }
    const profile = await getAppProfile(ctx, args.userId);
    const ownsVideo = video.instructorUserId === args.userId;
    if (isStaff(profile) && ownsVideo && video.playbackId) {
      return { video, access: { allowed: true as const, reason: "staff_preview" } };
    }

    if (video.status !== "published") {
      return null;
    }

    if (video.accessKind === "macroflow") {
      const entitlements = await ctx.db
        .query("videoEntitlements")
        .withIndex("by_userId_and_videoId", (q) => q.eq("userId", args.userId).eq("videoId", args.videoId))
        .take(1);
      if (entitlements[0] !== undefined) return { video, access: { allowed: true as const, reason: "macroflow" } };
      return null;
    }

    const subscription = await getActiveSubscription(ctx, args.userId);
    if (subscription !== null) return { video, access: { allowed: true as const, reason: "microflow" } };
    return null;
  },
});
