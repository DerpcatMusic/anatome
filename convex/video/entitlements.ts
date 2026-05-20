import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { getCurrentCreditBucket } from "../credits/lib";

export const listMyEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_kind", (q) => q.eq("userId", userId).eq("kind", "macroflow"))
      .take(500);
  },
});

export const purchaseMacroflow = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published" || video.accessKind !== "macroflow") {
      throw new Error("Macroflow video not found");
    }
    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null || bucket.vodGranted - bucket.vodUsed <= 0) throw new Error("No video credits remaining");
    const existing = await ctx.db.query("videoEntitlements").withIndex("by_userId_and_videoId", (q) => q.eq("userId", userId).eq("videoId", args.videoId)).unique();
    if (existing !== null) return existing._id;
    await ctx.db.patch(bucket._id, { vodUsed: bucket.vodUsed + 1 });
    return await ctx.db.insert("videoEntitlements", {
      videoId: args.videoId,
      userId,
      kind: "macroflow",
      source: "purchase",
      creditBucketId: bucket._id,
      purchasedAt: Date.now(),
    });
  },
});
