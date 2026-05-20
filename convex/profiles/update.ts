import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireUserId, requireAppProfile, requireRole } from "../lib/authz";

export const instructorProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    credentials: v.optional(v.string()),
    certificateDocument: v.optional(v.string()),
    insuranceDocument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const patch: Partial<Doc<"appProfiles">> = { updatedAt: Date.now() };
    if (args.displayName !== undefined) patch.displayName = args.displayName;
    if (args.credentials !== undefined) patch.credentials = args.credentials;
    if (args.certificateDocument !== undefined) patch.certificateDocument = args.certificateDocument;
    if (args.insuranceDocument !== undefined) patch.insuranceDocument = args.insuranceDocument;

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});
