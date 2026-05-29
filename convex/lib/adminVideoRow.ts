import type { Doc } from "../_generated/dataModel";
import type { AdminVideoRow } from "../contracts/video";

export function toAdminVideoRow(video: Doc<"videos">): AdminVideoRow {
  return {
    _id: video._id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    durationSeconds: video.durationSeconds,
    accessKind: video.accessKind,
    muxVideoQuality: video.muxVideoQuality,
    muxMaxResolutionTier: video.muxMaxResolutionTier,
    requiredEquipment: video.requiredEquipment,
    status: video.status,
    processingError: video.processingError,
    canPreview: Boolean(video.playbackId),
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}
