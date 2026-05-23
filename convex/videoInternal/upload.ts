import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const findByMuxId = internalQuery({
  args: { muxUploadId: v.string() },
  handler: async (ctx, args) => {
    const uploads = await ctx.db
      .query("videoUploads")
      .withIndex("by_muxUploadId", (q) => q.eq("muxUploadId", args.muxUploadId))
      .take(1);
    return uploads[0] ?? null;
  },
});

export const finalize = internalMutation({
  args: {
    uploadId: v.id("videoUploads"),
    muxAssetId: v.string(),
    durationSeconds: v.number(),
    thumbnailUrl: v.optional(v.string()),
    playbackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const upload = await ctx.db.get(args.uploadId);
    if (upload === null) return null;
    await ctx.db.patch(upload._id, { status: "ready", muxAssetId: args.muxAssetId, updatedAt: now });
    await ctx.db.patch(upload.videoId, {
      providerVideoId: args.muxAssetId,
      playbackId: args.playbackId,
      thumbnailUrl: args.thumbnailUrl,
      durationSeconds: Math.round(args.durationSeconds),
      status: "published",
      updatedAt: now,
    });
    return upload.videoId;
  },
});

export const markErrored = internalMutation({
  args: { uploadId: v.id("videoUploads"), errorMessage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const upload = await ctx.db.get(args.uploadId);
    if (upload === null) return null;
    await ctx.db.patch(upload._id, { status: "errored", errorMessage: args.errorMessage, updatedAt: now });
    await ctx.db.patch(upload.videoId, { status: "archived", updatedAt: now });
    return upload.videoId;
  },
});
