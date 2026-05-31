import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

const CLEANUP_BATCH_SIZE = 50;

export const listPublishedWithoutThumbnail = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("videos"),
      playbackId: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(500);

    return videos
      .filter((v) => !v.thumbnailUrl && v.playbackId)
      .map((v) => ({
        _id: v._id,
        playbackId: v.playbackId,
      }));
  },
});

export const cleanupVideo = internalMutation({
  args: { videoId: v.id("videos") },
  returns: v.object({
    done: v.boolean(),
    deleted: v.number(),
  }),
  handler: async (ctx, args) => {
    const { videoId } = args;
    let deleted = 0;

    const entitlements = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
      .take(CLEANUP_BATCH_SIZE);
    for (const row of entitlements) {
      await ctx.db.delete(row._id);
      deleted += 1;
    }

    const categoryLinks = await ctx.db
      .query("videoCategoryVideos")
      .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
      .take(CLEANUP_BATCH_SIZE);
    for (const row of categoryLinks) {
      await ctx.db.delete(row._id);
      deleted += 1;
    }

    const tagLinks = await ctx.db
      .query("videoTagVideos")
      .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
      .take(CLEANUP_BATCH_SIZE);
    for (const row of tagLinks) {
      await ctx.db.delete(row._id);
      deleted += 1;
    }

    const progressRecords = await ctx.db
      .query("videoProgress")
      .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
      .take(CLEANUP_BATCH_SIZE);
    for (const row of progressRecords) {
      await ctx.db.delete(row._id);
      deleted += 1;
    }

    if (deleted > 0) {
      await ctx.scheduler.runAfter(0, internal.videoInternal.admin.cleanupVideo, {
        videoId,
      });
      return { done: false, deleted };
    }

    const video = await ctx.db.get(videoId);
    if (video !== null) {
      await ctx.db.delete(videoId);
      deleted += 1;
    }

    return { done: true, deleted };
  },
});
