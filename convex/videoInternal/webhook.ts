"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { getMuxClient } from "../video/provider/mux";

export const handleMux = internalAction({
  args: {
    muxUploadId: v.string(),
    muxAssetId: v.string(),
    duration: v.number(),
    thumbnailUrl: v.optional(v.string()),
    status: v.union(v.literal("ready"), v.literal("errored")),
  },
  handler: async (ctx, args) => {
    const upload = await ctx.runQuery(internal.videoInternal.upload.findByMuxId, { muxUploadId: args.muxUploadId });
    if (upload === null) return;
    if (args.status === "errored") {
      await ctx.runMutation(internal.videoInternal.upload.markErrored, { uploadId: upload._id });
      return;
    }
    let playbackId: string | undefined;
    try {
      const playback = await getMuxClient().video.assets.createPlaybackId(args.muxAssetId, { policy: "signed" });
      playbackId = playback.id;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      await ctx.runMutation(internal.videoInternal.upload.markErrored, { uploadId: upload._id, errorMessage: message });
      throw reason;
    }
    await ctx.runMutation(internal.videoInternal.upload.finalize, {
      uploadId: upload._id,
      muxAssetId: args.muxAssetId,
      durationSeconds: args.duration,
      thumbnailUrl: args.thumbnailUrl,
      playbackId,
    });
  },
});
