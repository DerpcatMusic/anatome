import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const publish = internalMutation({
  args: {
    videoId: v.id("videos"),
    muxAssetId: v.string(),
    durationSeconds: v.number(),
    thumbnailUrl: v.optional(v.string()),
    playbackId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.videoId, {
      muxAssetId: args.muxAssetId,
      playbackId: args.playbackId,
      thumbnailUrl: args.thumbnailUrl,
      durationSeconds: Math.round(args.durationSeconds),
      status: "published",
      updatedAt: now,
    });
  },
});

export const markErrored = internalMutation({
  args: {
    videoId: v.id("videos"),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.videoId, {
      status: "archived",
      updatedAt: now,
    });
  },
});
