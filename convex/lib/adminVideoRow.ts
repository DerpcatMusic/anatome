import type { Doc } from "../_generated/dataModel";
import type { AdminVideoRow } from "../contracts/video";

/** Strip provider-internal fields from video docs for admin list UIs. */
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
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}
