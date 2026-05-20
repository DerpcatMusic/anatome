"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

function requireLiveKitEnv() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL ?? process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit environment is not configured");
  }

  return { apiKey, apiSecret, wsUrl };
}

function httpUrlForLiveKit(wsUrl: string) {
  return wsUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}

export const validate = internalAction({
  args: {
    body: v.string(),
    authorization: v.string(),
  },
  handler: async (_ctx, args) => {
    const { apiKey, apiSecret } = requireLiveKitEnv();
    const { WebhookReceiver } = await import("livekit-server-sdk");
    const receiver = new WebhookReceiver(apiKey, apiSecret);
    const event = await receiver.receive(args.body, args.authorization);
    return {
      event: event.event,
      roomName: event.room?.name ?? "",
      identity: event.participant?.identity ?? "",
      participantName: event.participant?.name ?? "",
    };
  },
});

export const removeParticipant = internalAction({
  args: {
    roomName: v.string(),
    identity: v.string(),
  },
  handler: async (_ctx, args) => {
    const { apiKey, apiSecret, wsUrl } = requireLiveKitEnv();
    const { RoomServiceClient } = await import("livekit-server-sdk");
    const client = new RoomServiceClient(httpUrlForLiveKit(wsUrl), apiKey, apiSecret);
    try {
      await client.removeParticipant(args.roomName, args.identity);
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : String(reason);
      console.warn(`[LiveKit] Failed to remove participant ${args.identity} from ${args.roomName}:`, message);
    }
  },
});
