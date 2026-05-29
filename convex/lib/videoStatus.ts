import { v } from "convex/values";
import type { Infer } from "convex/values";

/** Lifecycle: draft → processing → published | failed; archived = manual takedown. */
export const videoStatusValidator = v.union(
  v.literal("draft"),
  v.literal("processing"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("archived"),
);

export type VideoStatus = Infer<typeof videoStatusValidator>;

export const videoStatusPatchValidator = v.optional(videoStatusValidator);
