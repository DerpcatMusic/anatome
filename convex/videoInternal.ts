import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { equipmentListValidator } from "./lib/validators";

const accessKindValidator = v.union(v.literal("macroflow"), v.literal("microflow"));
const muxVideoQualityValidator = v.union(v.literal("basic"), v.literal("plus"), v.literal("premium"));
const muxMaxResolutionTierValidator = v.union(v.literal("1080p"), v.literal("1440p"), v.literal("2160p"));
const staticRenditionValidator = v.union(v.literal("none"), v.literal("audio-only"), v.literal("720p"), v.literal("1080p"));

export const getAppProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const createDraft = internalMutation({
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
    const now = Date.now();
    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      provider: "mux",
      providerVideoId: "",
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

export const attachMuxUpload = internalMutation({
  args: {
    videoId: v.id("videos"),
    muxUploadId: v.string(),
    instructorUserId: v.id("users"),
    muxVideoQuality: muxVideoQualityValidator,
    muxMaxResolutionTier: muxMaxResolutionTierValidator,
    staticRendition: staticRenditionValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("videoUploads", {
      videoId: args.videoId,
      instructorUserId: args.instructorUserId,
      muxUploadId: args.muxUploadId,
      muxVideoQuality: args.muxVideoQuality,
      muxMaxResolutionTier: args.muxMaxResolutionTier,
      staticRendition: args.staticRendition,
      status: "waiting",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const findUploadByMuxId = internalQuery({
  args: { muxUploadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoUploads")
      .withIndex("by_muxUploadId", (q) => q.eq("muxUploadId", args.muxUploadId))
      .unique();
  },
});

export const finalizeUpload = internalMutation({
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

export const markUploadErrored = internalMutation({
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

export const getAuthorizedPlaybackVideo = internalQuery({
  args: { userId: v.id("users"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published") {
      return null;
    }
    const profile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const isStaff = profile !== null && (profile.role === "instructor" || profile.role === "admin");
    if (isStaff) return { video, access: { allowed: true as const, reason: "staff_preview" } };

    if (video.accessKind === "macroflow") {
      const entitlement = await ctx.db
        .query("videoEntitlements")
        .withIndex("by_userId_and_videoId", (q) => q.eq("userId", args.userId).eq("videoId", args.videoId))
        .unique();
      if (entitlement !== null) return { video, access: { allowed: true as const, reason: "macroflow" } };
      return null;
    }

    const buckets = await ctx.db
      .query("creditBuckets")
      .withIndex("by_user_period", (q) => q.eq("userId", args.userId))
      .take(50);
    const hasActiveSubscription = buckets.some((row) => row.periodStart <= Date.now() && row.periodEnd > Date.now());
    if (hasActiveSubscription) return { video, access: { allowed: true as const, reason: "microflow" } };
    return null;
  },
});
