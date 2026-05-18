"use node";

declare const process: {
  env: {
    MUX_TOKEN_ID?: string;
    MUX_TOKEN_SECRET?: string;
    CLIENT_ORIGIN?: string;
  };
};

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { equipmentListValidator } from "./lib/validators";
import { Mux } from "@mux/mux-node";

// ─────────────────────────────────────────────
// Mux client (Node.js runtime)
// ─────────────────────────────────────────────
let muxClient: Mux | null = null;

function getMuxClient(): Mux {
  if (muxClient !== null) return muxClient;
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("Mux is not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to Convex environment variables.");
  }
  muxClient = new Mux({ tokenId, tokenSecret });
  return muxClient;
}

function getCorsOrigin() {
  return process.env.CLIENT_ORIGIN ?? "*";
}

// ─────────────────────────────────────────────
// Upload request (called by instructor)
// ─────────────────────────────────────────────

export const requestUpload = action({
  args: {
    title: v.string(),
    description: v.string(),
    requiredEquipment: equipmentListValidator,
    availableFrom: v.number(),
    availableUntil: v.number(),
  },
  handler: async (ctx, args) => {
    // Auth via identity (actions can't use ctx.db)
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Authentication required");
    const userId = identity.subject as Id<"users">;

    // Verify instructor/admin role via query
    const profile = await ctx.runQuery(internal.videos._getAppProfile, { userId });
    if (profile === null) throw new Error("Profile required");
    if (profile.role !== "instructor" && profile.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (args.title.trim().length < 3) throw new Error("Title is too short");
    if (args.availableFrom >= args.availableUntil) throw new Error("Availability window is invalid");

    // Create draft video
    const videoId: Id<"videos"> = await ctx.runMutation(internal.videos._createDraftInternal, {
      title: args.title.trim(),
      description: args.description.trim(),
      requiredEquipment: args.requiredEquipment,
      availableFrom: args.availableFrom,
      availableUntil: args.availableUntil,
      instructorUserId: userId,
    });

    // Create Mux direct upload
    const mux = getMuxClient();
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough: videoId,
      },
      cors_origin: getCorsOrigin(),
    });

    await ctx.runMutation(internal.videos._attachMuxUploadInternal, {
      videoId,
      muxUploadId: upload.id,
      instructorUserId: userId,
    });

    return { videoId, uploadUrl: upload.url };
  },
});

// ─────────────────────────────────────────────
// Webhook handler (called by Mux)
// ─────────────────────────────────────────────

export const handleMuxWebhook = action({
  args: {
    muxUploadId: v.string(),
    muxAssetId: v.string(),
    duration: v.number(),
    thumbnailUrl: v.optional(v.string()),
    status: v.union(v.literal("ready"), v.literal("errored")),
  },
  handler: async (ctx, args) => {
    const upload = await ctx.runQuery(internal.videos._findUploadByMuxId, {
      muxUploadId: args.muxUploadId,
    });

    if (upload === null) {
      console.error("Mux webhook: upload not found", args.muxUploadId);
      return;
    }

    if (args.status === "errored") {
      await ctx.runMutation(internal.videos._markUploadErrored, { uploadId: upload._id });
      return;
    }

    // Create playback ID for the asset
    let playbackId: string | undefined;
    try {
      const mux = getMuxClient();
      const playback = await mux.video.assets.createPlaybackId(args.muxAssetId, {
        policy: "public",
      });
      playbackId = playback.id;
    } catch (err) {
      console.error("Failed to create playback ID", err);
    }

    await ctx.runMutation(internal.videos._finalizeUpload, {
      uploadId: upload._id,
      muxAssetId: args.muxAssetId,
      durationSeconds: args.duration,
      thumbnailUrl: args.thumbnailUrl,
      playbackId,
    });
  },
});
