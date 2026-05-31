"use node";

import { v, type Infer } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getMuxClient } from "./provider/mux";
import { videoStatusValidator } from "../lib/videoStatus";

const muxUploadStatusValidator = v.union(
  v.literal("waiting"),
  v.literal("asset_created"),
  v.literal("errored"),
  v.literal("cancelled"),
  v.literal("timed_out"),
  v.literal("unknown"),
);

const muxAssetStatusValidator = v.union(
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("errored"),
  v.literal("unknown"),
);

const pipelineStatusReturns = v.object({
  videoStatus: videoStatusValidator,
  processingError: v.optional(v.string()),
  muxUploadStatus: v.optional(muxUploadStatusValidator),
  muxAssetStatus: v.optional(muxAssetStatusValidator),
  pipelinePhase: v.union(
    v.literal("uploading"),
    v.literal("waiting_mux"),
    v.literal("encoding"),
    v.literal("ready"),
    v.literal("failed"),
  ),
  pipelineLabel: v.string(),
});

type PipelineStatus = Infer<typeof pipelineStatusReturns>;

type OwnedVideoRow = {
  status: Infer<typeof videoStatusValidator>;
  processingError?: string;
  muxUploadId?: string;
  muxAssetId?: string;
  playbackId?: string;
  title?: string;
};

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

export function parseAppPassthrough(passthrough: unknown): { videoId?: string } {
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

export function readAssetVideoId(asset: MuxAssetLike): string | undefined {
  return parseAppPassthrough(asset.passthrough).videoId;
}

async function findMuxAssetForVideo(video: OwnedVideoRow, videoId: string) {
  const mux = getMuxClient();
  for await (const asset of mux.video.assets.list({ limit: 100 })) {
    const assetId = asString((asset as MuxAssetLike).id);
    if (!assetId) continue;
    const passthroughVideoId = readAssetVideoId(asset as MuxAssetLike);
    if (passthroughVideoId !== videoId) continue;
    const status = asString((asset as MuxAssetLike).status);
    const duration =
      typeof (asset as MuxAssetLike).duration === "number" ? (asset as MuxAssetLike).duration : 0;
    const thumbnailUrl = asString((asset as MuxAssetLike).thumbnail);
    return {
      assetId,
      status: status === "preparing" || status === "ready" || status === "errored" ? status : "unknown",
      duration: duration as number,
      thumbnailUrl,
    } as const;
  }
  return null;
}

export const getMuxPipelineStatus = action({
  args: { videoId: v.id("videos") },
  returns: pipelineStatusReturns,
  handler: async (ctx, args): Promise<PipelineStatus> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");

    const video: OwnedVideoRow | null = await ctx.runQuery(
      internal.videoInternal.processing.getOwnedVideo,
      {
        videoId: args.videoId,
        instructorUserId: userId,
      },
    );
    if (video === null) throw new Error("Unauthorized");

    if (video.status === "published") {
      return {
        videoStatus: video.status,
        processingError: video.processingError,
        pipelinePhase: "ready" as const,
        pipelineLabel: "השיעור מוכן בספרייה",
      };
    }
    if (video.status === "failed") {
      return {
        videoStatus: video.status,
        processingError: video.processingError,
        pipelinePhase: "failed" as const,
        pipelineLabel: video.processingError ?? "העיבוד נכשל",
      };
    }

    let muxUploadStatus:
      | "waiting"
      | "asset_created"
      | "errored"
      | "cancelled"
      | "timed_out"
      | "unknown"
      | undefined;
    let muxAssetStatus: "preparing" | "ready" | "errored" | "unknown" | undefined;

    const mux = getMuxClient();

    if (video.muxUploadId) {
      try {
        const upload = await mux.video.uploads.retrieve(video.muxUploadId);
        const raw = upload.status;
        muxUploadStatus =
          raw === "waiting" ||
          raw === "asset_created" ||
          raw === "errored" ||
          raw === "cancelled" ||
          raw === "timed_out"
            ? raw
            : "unknown";
      } catch {
        muxUploadStatus = "unknown";
      }
    }

    const assetId = video.muxAssetId;
    if (assetId) {
      try {
        const asset = await mux.video.assets.retrieve(assetId);
        const raw = asset.status;
        muxAssetStatus =
          raw === "preparing" || raw === "ready" || raw === "errored" ? raw : "unknown";
      } catch {
        muxAssetStatus = "unknown";
      }
    }

    if (
      !assetId &&
      !video.muxUploadId &&
      video.status === "processing" &&
      (muxUploadStatus === undefined || muxUploadStatus === "unknown")
    ) {
      const discovered = await findMuxAssetForVideo(video, String(args.videoId));
      if (discovered !== null) {
        muxAssetStatus = discovered.status;
        await ctx.runMutation(internal.videoInternal.muxAssetMutations.linkMuxAsset, {
          videoId: args.videoId,
          muxAssetId: discovered.assetId,
        });
        if (discovered.status === "ready") {
          if (video.playbackId) {
            return {
              videoStatus: video.status,
              processingError: video.processingError,
              muxUploadStatus,
              muxAssetStatus: "ready",
              pipelinePhase: "ready" as const,
              pipelineLabel: "הקידוד ב-Mux הסתיים, מפרסמים בספרייה…",
            };
          }
          await ctx.runAction(internal.videoInternal.muxAssetAction.finalizeFromMuxWebhook, {
            videoId: args.videoId,
            muxAssetId: discovered.assetId,
            duration: discovered.duration,
            thumbnailUrl: discovered.thumbnailUrl,
          });
          return {
            videoStatus: "published",
            processingError: video.processingError,
            muxUploadStatus,
            muxAssetStatus: "ready",
            pipelinePhase: "ready" as const,
            pipelineLabel: "הקידוד ב-Mux הסתיים, מפרסמים בספרייה…",
          };
        }
      }
    }

    if (muxAssetStatus === "ready") {
      return {
        videoStatus: video.status,
        processingError: video.processingError,
        muxUploadStatus,
        muxAssetStatus: "ready",
        pipelinePhase: "ready" as const,
        pipelineLabel: "הקידוד ב-Mux הסתיים, מפרסמים בספרייה…",
      };
    }

    if (muxAssetStatus === "errored" || muxUploadStatus === "errored") {
      return {
        videoStatus: video.status,
        processingError: video.processingError,
        muxUploadStatus,
        muxAssetStatus,
        pipelinePhase: "failed" as const,
        pipelineLabel: video.processingError ?? "Mux דיווח על שגיאה בעיבוד",
      };
    }

    if (muxAssetStatus === "preparing" || video.muxAssetId) {
      return {
        videoStatus: video.status,
        processingError: video.processingError,
        muxUploadStatus,
        muxAssetStatus: muxAssetStatus ?? "preparing",
        pipelinePhase: "encoding" as const,
        pipelineLabel: "Mux מקודד את הווידאו (אין אחוז רשמי, בדרך כלל 2–5 דקות)",
      };
    }

    if (muxUploadStatus === "asset_created") {
      return {
        videoStatus: video.status,
        processingError: video.processingError,
        muxUploadStatus,
        muxAssetStatus,
        pipelinePhase: "encoding" as const,
        pipelineLabel: "הקובץ התקבל, מתחיל עיבוד…",
      };
    }

    return {
      videoStatus: video.status,
      processingError: video.processingError,
      muxUploadStatus,
      muxAssetStatus,
      pipelinePhase: "waiting_mux" as const,
      pipelineLabel: "ממתינה לאישור מ-Mux…",
    };
  },
});
