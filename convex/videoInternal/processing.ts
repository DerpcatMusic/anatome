import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { internalAction, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { getMuxClient } from "../video/provider/mux";

type MuxAssetLike = {
  id?: unknown;
  status?: unknown;
  duration?: unknown;
  thumbnail?: unknown;
  passthrough?: unknown;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseAppPassthrough(passthrough: unknown): { videoId?: string } {
  const raw = asString(passthrough);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return {
      videoId:
        asString((parsed as Record<string, unknown>).videoId) ??
        asString((parsed as Record<string, unknown>).video_id),
    };
  } catch {
    return {};
  }
}

export const getOwnedVideo = internalQuery({
  args: {
    videoId: v.id("videos"),
    instructorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (video === null || video.instructorUserId !== args.instructorUserId) {
      return null;
    }
    return {
      status: video.status,
      processingError: video.processingError,
      muxUploadId: video.muxUploadId,
      muxAssetId: video.muxAssetId,
      playbackId: video.playbackId,
      title: video.title,
    };
  },
});

export const getVideoForMuxRepair = internalQuery({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (video === null) return null;
    return {
      _id: video._id,
      status: video.status,
      processingError: video.processingError,
      muxUploadId: video.muxUploadId,
      muxAssetId: video.muxAssetId,
      playbackId: video.playbackId,
      title: video.title,
      instructorUserId: video.instructorUserId,
      durationSeconds: video.durationSeconds,
      thumbnailUrl: video.thumbnailUrl,
    } satisfies Pick<
      Doc<"videos">,
      | "_id"
      | "status"
      | "processingError"
      | "muxUploadId"
      | "muxAssetId"
      | "playbackId"
      | "title"
      | "instructorUserId"
      | "durationSeconds"
      | "thumbnailUrl"
    >;
  },
});

export const reconcileMuxUploads = internalAction({
  args: { maxAssets: v.optional(v.number()) },
  returns: v.object({
    scanned: v.number(),
    linked: v.number(),
    published: v.number(),
    ignored: v.number(),
  }),
  handler: async (ctx, args) => {
    const mux = getMuxClient();
    const maxAssets = Math.max(1, Math.floor(args.maxAssets ?? 100));
    let scanned = 0;
    let linked = 0;
    let published = 0;
    let ignored = 0;

    for await (const asset of mux.video.assets.list({ limit: 100 })) {
      if (scanned >= maxAssets) break;
      scanned += 1;

      const assetId = asString((asset as MuxAssetLike).id);
      if (!assetId) {
        ignored += 1;
        continue;
      }

      const passthroughVideoId = parseAppPassthrough((asset as MuxAssetLike).passthrough).videoId;
      if (!passthroughVideoId) {
        ignored += 1;
        continue;
      }

      const video = await ctx.runQuery(internal.videoInternal.processing.getVideoForMuxRepair, {
        videoId: passthroughVideoId as Id<"videos">,
      });
      if (video === null) {
        ignored += 1;
        continue;
      }

      await ctx.runMutation(internal.videoInternal.muxAssetMutations.linkMuxAsset, {
        videoId: passthroughVideoId as Id<"videos">,
        muxAssetId: assetId,
      });
      linked += 1;

      const status = asString((asset as MuxAssetLike).status);
      if (status === "ready") {
        const duration =
          typeof (asset as MuxAssetLike).duration === "number"
            ? (asset as MuxAssetLike).duration
            : 0;
        const thumbnailUrl = asString((asset as MuxAssetLike).thumbnail);
        await ctx.runAction(internal.videoInternal.muxAssetAction.finalizeFromMuxWebhook, {
          videoId: passthroughVideoId as Id<"videos">,
          muxAssetId: assetId,
          duration: duration as number,
          thumbnailUrl,
        });
        published += 1;
      }
    }

    return { scanned, linked, published, ignored };
  },
});
