import { v } from "convex/values";
import type { Infer } from "convex/values";
import { videoStatusValidator } from "./domainValidators";

export type VideoStatus = Infer<typeof videoStatusValidator>;

export const videoStatusPatchValidator = v.optional(videoStatusValidator);
export { videoStatusValidator };
