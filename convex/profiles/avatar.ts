import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { getOrCreateAppProfile, requireUserId } from "../lib/authz";

const MAX_AVATAR_BYTES = 512 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setFromStorage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await getOrCreateAppProfile(ctx, userId);

    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (metadata === null) {
      throw new Error("קובץ לא נמצא");
    }
    if (metadata.size > MAX_AVATAR_BYTES) {
      await ctx.storage.delete(args.storageId);
      throw new Error("גודל תמונת פרופיל לא תקין");
    }
    if (!ALLOWED_CONTENT_TYPES.has(metadata.contentType ?? "")) {
      await ctx.storage.delete(args.storageId);
      throw new Error("סוג קובץ לא נתמך");
    }

    const previousId = profile.avatarStorageId;
    const patch: Partial<Doc<"appProfiles">> = {
      avatarStorageId: args.storageId,
      updatedAt: Date.now(),
    };
    await ctx.db.patch(profile._id, patch);

    if (previousId && previousId !== args.storageId) {
      await ctx.storage.delete(previousId);
    }

    return args.storageId;
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await getOrCreateAppProfile(ctx, userId);
    const previousId = profile.avatarStorageId;
    if (!previousId) return null;

    await ctx.db.patch(profile._id, {
      avatarStorageId: undefined,
      updatedAt: Date.now(),
    });
    await ctx.storage.delete(previousId);
    return null;
  },
});
