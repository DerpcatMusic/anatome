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

import { Mux } from "@mux/mux-node";

let muxClient: Mux | null = null;

export function getMuxClient(): Mux {
  if (muxClient !== null) return muxClient;
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("Mux is not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to Convex environment variables.");
  }
  muxClient = new Mux({
    tokenId,
    tokenSecret,
    jwtSigningKey: process.env.MUX_SIGNING_KEY_ID,
    jwtPrivateKey: process.env.MUX_SIGNING_KEY_PRIVATE_KEY,
  });
  return muxClient;
}

export function getCorsOrigin() {
  return process.env.CLIENT_ORIGIN ?? "*";
}

export function canSignPlayback() {
  return Boolean(process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_KEY_PRIVATE_KEY);
}

export async function signPlaybackId(playbackId: string) {
  if (!canSignPlayback()) {
    throw new Error("Mux signing is not configured.");
  }
  const mux = getMuxClient();
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: "video",
    expiration: "1h",
  });
  return {
    token,
    playbackUrl: `https://stream.mux.com/${playbackId}.m3u8?token=${token}`,
  };
}
