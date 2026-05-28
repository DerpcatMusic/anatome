import { v } from "convex/values";
import type { Infer } from "convex/values";

export const profileRoleValidator = v.union(
  v.literal("customer"),
  v.literal("instructor"),
  v.literal("admin"),
);

/** Client-safe profile row (no storage ids, no compliance blobs unless staff). */
export const viewerProfileBaseValidator = v.object({
  _id: v.id("appProfiles"),
  userId: v.id("users"),
  email: v.string(),
  displayName: v.string(),
  role: profileRoleValidator,
  avatarUrl: v.union(v.string(), v.null()),
  credentials: v.optional(v.string()),
});

export const viewerProfileReturns = v.union(
  v.null(),
  v.object({
    ...viewerProfileBaseValidator.fields,
    certificateDocument: v.optional(v.string()),
    insuranceDocument: v.optional(v.string()),
  }),
);

export type ViewerProfile = Infer<typeof viewerProfileReturns>;
