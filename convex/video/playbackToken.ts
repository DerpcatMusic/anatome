"use node";

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { signPlaybackId } from "./provider/mux";

type ViewerPlayback = { video: Doc<"videos">; access: { allowed: true; reason: string } };
type SignedPlayback = { token: string | null; playbackUrl: string | null };

export const getViewerPlaybackToken = action({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args): Promise<SignedPlayback> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");
    const result: ViewerPlayback | null = await ctx.runQuery(internal.videoInternal.playback.getAuthorizedVideo, {
      userId,
      videoId: args.videoId,
    });
    if (result === null) throw new Error("Access denied");
    if (!result.video.playbackId) return { token: null, playbackUrl: null };

    return await signPlaybackId(result.video.playbackId);
  },
});
