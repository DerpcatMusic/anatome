import { v } from "convex/values";
import type { Infer } from "convex/values";
import { equipmentListValidator } from "../lib/validators";
import { videoStatusValidator } from "../lib/videoStatus";

/** Instructor admin list row — no Mux asset / playback identifiers. */
export const adminVideoRowValidator = v.object({
  _id: v.id("videos"),
  title: v.string(),
  description: v.string(),
  thumbnailUrl: v.optional(v.string()),
  durationSeconds: v.optional(v.number()),
  accessKind: v.union(v.literal("macroflow"), v.literal("microflow")),
  muxVideoQuality: v.union(v.literal("basic"), v.literal("plus"), v.literal("premium")),
  muxMaxResolutionTier: v.union(v.literal("1080p"), v.literal("1440p"), v.literal("2160p")),
  requiredEquipment: equipmentListValidator,
  status: videoStatusValidator,
  processingError: v.optional(v.string()),
  canPreview: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export type AdminVideoRow = Infer<typeof adminVideoRowValidator>;

export const adminVideoListReturns = v.object({
  published: v.array(adminVideoRowValidator),
  processing: v.array(adminVideoRowValidator),
  drafts: v.array(adminVideoRowValidator),
  failed: v.array(adminVideoRowValidator),
  archived: v.array(adminVideoRowValidator),
});

export const adminVideoPaginatedReturns = v.object({
  page: v.array(adminVideoRowValidator),
  isDone: v.boolean(),
  continueCursor: v.string(),
});
