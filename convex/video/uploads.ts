"use node";

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getMuxClient, getCorsOrigin } from "./provider/mux";
import { equipmentListValidator } from "../lib/validators";
import type { Id } from "../_generated/dataModel";
import {
  muxMaxResolutionTierValidator,
  muxVideoQualityValidator,
  staticRenditionValidator,
  videoAccessKindValidator,
} from "../lib/domainValidators";

export const requestUpload = action({
  args: {
    title: v.string(),
    description: v.string(),
    requiredEquipment: equipmentListValidator,
    accessKind: videoAccessKindValidator,
    categoryIds: v.array(v.id("videoCategories")),
    muxVideoQuality: muxVideoQualityValidator,
    muxMaxResolutionTier: muxMaxResolutionTierValidator,
    staticRendition: staticRenditionValidator,
  },
  handler: async (ctx, args): Promise<{ videoId: Id<"videos">; uploadUrl: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");
    const profile = await ctx.runQuery(internal.videoInternal.profile.getAppProfile, { userId });
    if (profile === null || (profile.role !== "instructor" && profile.role !== "admin")) throw new Error("Unauthorized");
    if (args.title.trim().length < 3) throw new Error("Title is too short");
    if (args.categoryIds.length === 0) throw new Error("At least one category is required");

    const videoId: Id<"videos"> = await ctx.runMutation(internal.videoInternal.draft.create, {
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
    const passthroughPayload = JSON.stringify({
      videoId,
      instructorUserId: userId,
      title: args.title.trim(),
    });
    const upload = await getMuxClient().video.uploads.create({
      new_asset_settings: {
        playback_policies: ["signed"],
        passthrough: passthroughPayload,
        video_quality: args.muxVideoQuality,
        max_resolution_tier: args.muxMaxResolutionTier,
        static_renditions: staticRenditions,
      },
      cors_origin: getCorsOrigin(),
    });
    if (!upload.url) throw new Error("Mux did not return an upload URL");
    return { videoId, uploadUrl: upload.url };
  },
});
