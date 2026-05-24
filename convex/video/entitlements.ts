import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import {
  ensureUserWallet,
  consumeVodCredit,
  refundVodCredit,
  availableVodCredits,
} from "../credits/lib";
import { LIMITS } from "../lib/constants";
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
    const existing = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_videoId", (q) =>
        q.eq("userId", userId).eq("videoId", args.videoId),
      )
      .take(1);
    if (existing[0] !== undefined) return existing[0]._id;

    const wallet = await ensureUserWallet(ctx, userId);
    const vodBalanceBefore = wallet.vodBalance;
    if (availableVodCredits(wallet) < 1) {
      throw new Error("אין נקודות וידאו נותרות");
    }

    await consumeVodCredit(ctx, wallet._id);
    const entitlementId = await ctx.db.insert("videoEntitlements", {
      videoId: args.videoId,
      userId,
      kind: "macroflow",
      source: "purchase",
      walletId: wallet._id,
      purchasedAt: Date.now(),
    });

    const postCheck = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_videoId", (q) =>
        q.eq("userId", userId).eq("videoId", args.videoId),
      )
      .take(2);
    if (postCheck.length > 1) {
      const ours = postCheck.find((e) => e._id === entitlementId);
      if (ours) {
        await ctx.db.delete(entitlementId);
        await refundVodCredit(ctx, wallet._id, vodBalanceBefore);
      }
      const winner = postCheck.find((e) => e._id !== entitlementId);
      return winner?._id ?? entitlementId;
    }

    return entitlementId;
  },
});
