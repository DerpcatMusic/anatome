"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { getMuxClient } from "../video/provider/mux";

export const finalizeFromMuxWebhook = internalAction({
  args: {
    videoId: v.id("videos"),
    muxAssetId: v.string(),
    duration: v.number(),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let playbackId: string;
    try {
      const playback = await getMuxClient().video.assets.createPlaybackId(args.muxAssetId, { policy: "signed" });
      playbackId = playback.id;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      await ctx.runMutation(internal.videoInternal.muxAssetMutations.markErrored, {
        videoId: args.videoId,
        errorMessage: message,
      });
      throw reason;
    }
    await ctx.runMutation(internal.videoInternal.muxAssetMutations.publish, {
      videoId: args.videoId,
      muxAssetId: args.muxAssetId,
      durationSeconds: args.duration,
      thumbnailUrl: args.thumbnailUrl,
      playbackId,
    });
  },
});
