"use node";

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { getMuxClient, getCorsOrigin } from "./provider/mux";
import { equipmentListValidator } from "../lib/validators";
import type { Id } from "../_generated/dataModel";

const accessKindValidator = v.union(v.literal("macroflow"), v.literal("microflow"));
const muxVideoQualityValidator = v.union(v.literal("basic"), v.literal("plus"), v.literal("premium"));
const muxMaxResolutionTierValidator = v.union(v.literal("1080p"), v.literal("1440p"), v.literal("2160p"));
const staticRenditionValidator = v.union(v.literal("none"), v.literal("audio-only"), v.literal("720p"), v.literal("1080p"));

export const requestUpload = action({
  args: {
    title: v.string(),
    description: v.string(),
    requiredEquipment: equipmentListValidator,
    accessKind: accessKindValidator,
    categoryIds: v.array(v.id("videoCategories")),
    muxVideoQuality: muxVideoQualityValidator,
    muxMaxResolutionTier: muxMaxResolutionTierValidator,
    staticRendition: staticRenditionValidator,
  },
  handler: async (ctx, args): Promise<{ videoId: Id<"videos">; uploadUrl: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");
    const profile = await ctx.runQuery(internal.videoInternal.getAppProfile, { userId });
    if (profile === null || (profile.role !== "instructor" && profile.role !== "admin")) throw new Error("Unauthorized");
    if (args.title.trim().length < 3) throw new Error("Title is too short");
    if (args.categoryIds.length === 0) throw new Error("At least one category is required");

    const videoId: Id<"videos"> = await ctx.runMutation(internal.videoInternal.createDraft, {
      title: args.title.trim(),
      description: args.description.trim(),
      requiredEquipment: args.requiredEquipment,
      accessKind: args.accessKind,
      categoryIds: args.categoryIds,
      muxVideoQuality: args.muxVideoQuality,
      muxMaxResolutionTier: args.muxMaxResolutionTier,
      staticRendition: args.staticRendition,
      instructorUserId: userId,
    });
    const staticRenditions =
      args.staticRendition === "none" ? undefined : [{ resolution: args.staticRendition, passthrough: videoId }];
    const upload = await getMuxClient().video.uploads.create({
      new_asset_settings: {
        playback_policies: ["signed"],
        passthrough: videoId,
        video_quality: args.muxVideoQuality,
        max_resolution_tier: args.muxMaxResolutionTier,
        static_renditions: staticRenditions,
      },
      cors_origin: getCorsOrigin(),
    });
    if (!upload.url) throw new Error("Mux did not return an upload URL");
    await ctx.runMutation(internal.videoInternal.attachMuxUpload, {
      videoId,
      muxUploadId: upload.id,
      instructorUserId: userId,
      muxVideoQuality: args.muxVideoQuality,
      muxMaxResolutionTier: args.muxMaxResolutionTier,
      staticRendition: args.staticRendition,
    });
    return { videoId, uploadUrl: upload.url };
  },
});

export const handleMuxWebhook = internalAction({
  args: { muxUploadId: v.string(), muxAssetId: v.string(), duration: v.number(), thumbnailUrl: v.optional(v.string()), status: v.union(v.literal("ready"), v.literal("errored")) },
  handler: async (ctx, args) => {
    const upload = await ctx.runQuery(internal.videoInternal.findUploadByMuxId, { muxUploadId: args.muxUploadId });
    if (upload === null) return;
    if (args.status === "errored") {
      await ctx.runMutation(internal.videoInternal.markUploadErrored, { uploadId: upload._id });
      return;
    }
    let playbackId: string | undefined;
    try {
      const playback = await getMuxClient().video.assets.createPlaybackId(args.muxAssetId, { policy: "signed" });
      playbackId = playback.id;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      await ctx.runMutation(internal.videoInternal.markUploadErrored, { uploadId: upload._id, errorMessage: message });
      throw reason;
    }
    await ctx.runMutation(internal.videoInternal.finalizeUpload, {
      uploadId: upload._id,
      muxAssetId: args.muxAssetId,
      durationSeconds: args.duration,
      thumbnailUrl: args.thumbnailUrl,
      playbackId,
    });
  },
});
