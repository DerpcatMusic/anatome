import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { normalizeEquipmentList } from "../lib/equipmentCatalog";
import { equipmentListValidator } from "../lib/validators";
import {
  muxMaxResolutionTierValidator,
  muxVideoQualityValidator,
  staticRenditionValidator,
  videoAccessKindValidator,
} from "../lib/domainValidators";

export const create = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    requiredEquipment: equipmentListValidator,
    accessKind: videoAccessKindValidator,
    muxVideoQuality: muxVideoQualityValidator,
    muxMaxResolutionTier: muxMaxResolutionTierValidator,
    staticRendition: staticRenditionValidator,
    categoryIds: v.array(v.id("videoCategories")),
    instructorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.categoryIds.length > 20) throw new Error("Too many categories");
    const now = Date.now();
    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      provider: "mux",
      durationSeconds: 0,
      requiredEquipment: normalizeEquipmentList(args.requiredEquipment),
      accessKind: args.accessKind,
      muxVideoQuality: args.muxVideoQuality,
      muxMaxResolutionTier: args.muxMaxResolutionTier,
      staticRendition: args.staticRendition,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      instructorUserId: args.instructorUserId,
    });
    for (let index = 0; index < args.categoryIds.length; index += 1) {
      await ctx.db.insert("videoCategoryVideos", {
        categoryId: args.categoryIds[index],
        videoId,
        sortOrder: now + index,
        createdAt: now,
        updatedAt: now,
      });
    }
    return videoId;
  },
});

