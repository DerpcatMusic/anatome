import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { getCurrentCreditBucket } from "../credits/lib";
import { RULES, LIMITS } from "../lib/constants";
import { checkRateLimit } from "../lib/rateLimit";

export const listMyEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_kind", (q) => q.eq("userId", userId).eq("kind", "macroflow"))
      .take(LIMITS.CATALOG_PAGE_SIZE);
  },
});

export const purchaseMacroflow = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await checkRateLimit(ctx, userId, "purchase");
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published" || video.accessKind !== "macroflow") {
      throw new Error("הסרטון לא נמצא");
    }
    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null || bucket.vodGranted - bucket.vodUsed <= 0) throw new Error("אין נקודות וידאו נותרות");
    const existing = await ctx.db.query("videoEntitlements").withIndex("by_userId_and_videoId", (q) => q.eq("userId", userId).eq("videoId", args.videoId)).unique();
    if (existing !== null) return existing._id;
    await ctx.db.patch(bucket._id, { vodUsed: bucket.vodUsed + 1 });
    const entitlementId = await ctx.db.insert("videoEntitlements", {
      videoId: args.videoId,
      userId,
      kind: "macroflow",
      source: "purchase",
      creditBucketId: bucket._id,
      purchasedAt: Date.now(),
    });

    // Idempotency / race-condition defence: re-verify no duplicates exist
    const postCheck = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_videoId", (q) => q.eq("userId", userId).eq("videoId", args.videoId))
      .collect();
    if (postCheck.length > 1) {
      // Rollback: we lost the race — delete our insert and refund
      const ours = postCheck.find((e) => e._id === entitlementId);
      if (ours) {
        await ctx.db.delete(entitlementId);
        await ctx.db.patch(bucket._id, { vodUsed: Math.max(0, bucket.vodUsed) });
      }
      const winner = postCheck.find((e) => e._id !== entitlementId);
      return winner?._id ?? entitlementId;
    }

    return entitlementId;
  },
});
