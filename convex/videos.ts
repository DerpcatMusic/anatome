import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { requireAppProfile, requireRole, requireUserId } from "./lib/authz";
import { equipmentListValidator } from "./lib/validators";
import { getCurrentCreditBucket } from "./lib/credits";
import { missingRequiredEquipment } from "./lib/equipment";

// ─────────────────────────────────────────────
// Customer queries
// ─────────────────────────────────────────────

export const get = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, { videoId }) => {
    return await ctx.db.get("videos", videoId);
  },
});

export const getViewerPlayback = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published") {
      throw new Error("Video not found");
    }

    // Staff can preview any published video
    const appProfile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const isStaff = appProfile !== null && (appProfile.role === "instructor" || appProfile.role === "admin");

    if (!isStaff) {
      const selection = await ctx.db
        .query("videoSelections")
        .withIndex("by_userId_and_videoId", (q) => q.eq("userId", userId).eq("videoId", args.videoId))
        .unique();

      if (selection === null || selection.accessEndsAt <= now) {
        throw new Error("Access denied");
      }
    }

    const playbackUrl = video.playbackId
      ? `https://stream.mux.com/${video.playbackId}.m3u8`
      : null;

    return {
      video,
      playbackUrl,
      isStaff,
    };
  },
});

export const listWeekly = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_status_and_availableUntil", (q) => q.eq("status", "published").gt("availableUntil", now))
      .order("asc")
      .take(100);

    const activeVideos = videos.filter((video) => video.availableFrom <= now);
    const profile = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const bucket = await getCurrentCreditBucket(ctx, userId);
    const selections =
      bucket === null
        ? []
        : await ctx.db
            .query("videoSelections")
            .withIndex("by_creditBucketId", (q) => q.eq("creditBucketId", bucket._id))
            .collect();
    const selectedIds = new Set(selections.map((selection) => selection.videoId));
    const remainingCredits = bucket === null ? 0 : Math.max(0, bucket.vodGranted - bucket.vodUsed);

    return {
      remainingCredits,
      selectedCount: selections.length,
      accessEndsAt: bucket?.periodEnd ?? null,
      videos: activeVideos.map((video) => {
        const selected = selectedIds.has(video._id);
        const missingEquipment = missingRequiredEquipment(profile?.equipment ?? [], video.requiredEquipment);
        return {
          video,
          selected,
          locked: !selected && (remainingCredits <= 0 || missingEquipment.length > 0),
          canSelect: !selected && remainingCredits > 0 && missingEquipment.length === 0,
          missingEquipment,
        };
      }),
    };
  },
});

export const selectForWeek = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.status !== "published") throw new Error("Video not found");
    if (video.availableFrom > now || video.availableUntil <= now) throw new Error("Video is not available this week");

    const profile = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile === null) throw new Error("Pilates profile required");
    if (missingRequiredEquipment(profile.equipment, video.requiredEquipment).length > 0) {
      throw new Error("Required equipment missing");
    }

    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null) throw new Error("No active credit bucket");

    const existing = await ctx.db
      .query("videoSelections")
      .withIndex("by_userId_and_creditBucketId_and_videoId", (q) =>
        q.eq("userId", userId).eq("creditBucketId", bucket._id).eq("videoId", args.videoId),
      )
      .unique();
    if (existing !== null) return existing._id;

    if (bucket.vodGranted - bucket.vodUsed <= 0) throw new Error("No video credits remaining");

    await ctx.db.patch(bucket._id, {
      vodUsed: bucket.vodUsed + 1,
    });

    return await ctx.db.insert("videoSelections", {
      videoId: args.videoId,
      userId,
      creditBucketId: bucket._id,
      selectedAt: now,
      accessEndsAt: Math.min(bucket.periodEnd, video.availableUntil),
    });
  },
});

// ─────────────────────────────────────────────
// Instructor / Admin queries & mutations
// ─────────────────────────────────────────────

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const videos = await ctx.db
      .query("videos")
      .withIndex("by_status_and_availableFrom", (q) => q.eq("status", "published"))
      .order("desc")
      .take(100);

    const drafts = await ctx.db
      .query("videos")
      .withIndex("by_status_and_availableFrom", (q) => q.eq("status", "draft"))
      .order("desc")
      .take(50);

    const archived = await ctx.db
      .query("videos")
      .withIndex("by_status_and_availableFrom", (q) => q.eq("status", "archived"))
      .order("desc")
      .take(50);

    return { published: videos, drafts, archived };
  },
});

export const updateMetadata = mutation({
  args: {
    videoId: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredEquipment: v.optional(equipmentListValidator),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const video = await ctx.db.get(args.videoId);
    if (video === null) throw new Error("Video not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.requiredEquipment !== undefined) patch.requiredEquipment = args.requiredEquipment;
    if (args.availableFrom !== undefined) patch.availableFrom = args.availableFrom;
    if (args.availableUntil !== undefined) patch.availableUntil = args.availableUntil;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.videoId, patch);
    return args.videoId;
  },
});

export const deleteVideo = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const video = await ctx.db.get(args.videoId);
    if (video === null) throw new Error("Video not found");

    await ctx.db.patch(args.videoId, { status: "archived", updatedAt: Date.now() });
    return args.videoId;
  },
});

// ─────────────────────────────────────────────
// Internal queries & mutations (called by actions)
// ─────────────────────────────────────────────

export const _getAppProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const _createDraftInternal = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    requiredEquipment: equipmentListValidator,
    availableFrom: v.number(),
    availableUntil: v.number(),
    instructorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      provider: "mux",
      providerVideoId: "",
      durationSeconds: 0,
      requiredEquipment: args.requiredEquipment,
      availableFrom: args.availableFrom,
      availableUntil: args.availableUntil,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const _attachMuxUploadInternal = internalMutation({
  args: {
    videoId: v.id("videos"),
    muxUploadId: v.string(),
    instructorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("videoUploads", {
      videoId: args.videoId,
      instructorUserId: args.instructorUserId,
      muxUploadId: args.muxUploadId,
      status: "waiting",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const _findUploadByMuxId = internalQuery({
  args: { muxUploadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoUploads")
      .withIndex("by_muxUploadId", (q) => q.eq("muxUploadId", args.muxUploadId))
      .unique();
  },
});

export const _finalizeUpload = internalMutation({
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
    if (upload === null) return;

    await ctx.db.patch(upload._id, {
      status: "ready",
      muxAssetId: args.muxAssetId,
      updatedAt: now,
    });

    await ctx.db.patch(upload.videoId, {
      providerVideoId: args.muxAssetId,
      playbackId: args.playbackId ?? undefined,
      thumbnailUrl: args.thumbnailUrl,
      durationSeconds: Math.round(args.durationSeconds),
      status: "published",
      updatedAt: now,
    });
  },
});

export const _markUploadErrored = internalMutation({
  args: {
    uploadId: v.id("videoUploads"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const upload = await ctx.db.get(args.uploadId);
    if (upload === null) return;

    await ctx.db.patch(upload._id, { status: "errored", updatedAt: now });
    await ctx.db.patch(upload.videoId, { status: "archived", updatedAt: now });
  },
});
