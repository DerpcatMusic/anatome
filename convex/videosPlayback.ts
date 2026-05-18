"use node";

declare const process: {
  env: {
    MUX_TOKEN_ID?: string;
    MUX_TOKEN_SECRET?: string;
    MUX_SIGNING_KEY_ID?: string;
    MUX_SIGNING_KEY_PRIVATE_KEY?: string;
    CLIENT_ORIGIN?: string;
  };
};

import { v } from "convex/values";
import { action } from "./_generated/server";
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

// ─────────────────────────────────────────────
// Signed playback token
// ─────────────────────────────────────────────

export const getSignedPlaybackToken = action({
  args: {
    playbackId: v.string(),
  },
  handler: async (_ctx, args) => {
    const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
    const privateKey = process.env.MUX_SIGNING_KEY_PRIVATE_KEY;

    if (signingKeyId && privateKey) {
      try {
        const mux = getMuxClient();
        const token = mux.jwt.signPlaybackId(args.playbackId, {
          type: "video",
          expiration: "1h",
        });
        return {
          token,
          signed: true as const,
          playbackUrl: `https://stream.mux.com/${args.playbackId}.m3u8?token=${token}`,
        };
      } catch (err) {
        console.error("Failed to sign playback URL", err);
        // Fall through to public URL fallback
      }
    }

    // Fallback to public URL when signed URLs are not configured.
    // TODO: Remove fallback once MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_PRIVATE_KEY
    // are added to Convex environment variables and playback_policy is switched to signed.
    return {
      token: null,
      signed: false as const,
      playbackUrl: `https://stream.mux.com/${args.playbackId}.m3u8`,
    };
  },
});
