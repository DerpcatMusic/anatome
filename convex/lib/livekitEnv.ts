"use node";

declare const process: {
  env: {
    LIVEKIT_API_KEY?: string;
    LIVEKIT_API_SECRET?: string;
    LIVEKIT_URL?: string;
    LIVEKIT_WS_URL?: string;
  };
};

export function requireLiveKitEnv() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL ?? process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit environment is not configured");
  }

  return { apiKey, apiSecret, wsUrl };
}

export function httpUrlForLiveKit(wsUrl: string) {
  return wsUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}
