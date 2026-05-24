import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { equipmentListValidator } from "../lib/validators";

const accessKindValidator = v.union(v.literal("macroflow"), v.literal("microflow"));
const muxVideoQualityValidator = v.union(v.literal("basic"), v.literal("plus"), v.literal("premium"));
const muxMaxResolutionTierValidator = v.union(v.literal("1080p"), v.literal("1440p"), v.literal("2160p"));
const staticRenditionValidator = v.union(v.literal("none"), v.literal("audio-only"), v.literal("720p"), v.literal("1080p"));

export const create = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    requiredEquipment: equipmentListValidator,
    accessKind: accessKindValidator,
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
      requiredEquipment: args.requiredEquipment,
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


