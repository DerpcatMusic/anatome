import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const copyProviderVideoIdToMuxAssetId = internalMutation({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").take(500);
    let updated = 0;
    for (const video of videos) {
      const legacyId = (video as unknown as Record<string, unknown>).providerVideoId;
      if (video.provider === "mux" && !video.muxAssetId && typeof legacyId === "string" && legacyId.length > 0) {
        await ctx.db.patch(video._id, {
          muxAssetId: legacyId,
        });
        updated++;
      }
    }
    return updated;
  },
});
