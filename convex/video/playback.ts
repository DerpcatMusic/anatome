import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

type PlaybackAccess = { allowed: true; reason: string };
type ViewerPlayback = { video: Doc<"videos">; access: PlaybackAccess };

export const getViewerPlayback = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args): Promise<ViewerPlayback> => {
    const userId = await requireUserId(ctx);
    const result: ViewerPlayback | null = await ctx.runQuery(internal.videoInternal.getAuthorizedPlaybackVideo, {
      videoId: args.videoId,
      userId,
    });
    if (result === null) throw new Error("Access denied");
    return result;
  },
});

export const updateProgress = mutation({
  args: { videoId: v.id("videos"), currentTimeSeconds: v.number(), durationSeconds: v.number() },
  handler: async (ctx, args): Promise<Id<"videoProgress">> => {
    const userId = await requireUserId(ctx);
    const access: ViewerPlayback | null = await ctx.runQuery(internal.videoInternal.getAuthorizedPlaybackVideo, { videoId: args.videoId, userId });
    if (access === null) throw new Error("Access denied");
    const durationSeconds = Math.max(0, args.durationSeconds);
    const currentTimeSeconds = Math.max(0, Math.min(args.currentTimeSeconds, durationSeconds || args.currentTimeSeconds));
    const percentWatched = durationSeconds > 0 ? Math.min(100, (currentTimeSeconds / durationSeconds) * 100) : 0;
    const completed = percentWatched >= 90;
    const now = Date.now();
    const existing = await ctx.db
      .query("videoProgress")
      .withIndex("by_userId_and_videoId", (q) => q.eq("userId", userId).eq("videoId", args.videoId))
      .unique();

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        currentTimeSeconds,
        durationSeconds,
        percentWatched,
        completed: existing.completed || completed,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("videoProgress", {
      videoId: args.videoId,
      userId,
      currentTimeSeconds,
      durationSeconds,
      percentWatched,
      completed,
      updatedAt: now,
    });
  },
});
