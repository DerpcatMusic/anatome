"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { requireLiveKitEnv, httpUrlForLiveKit } from "../lib/livekitEnv";

const webhookValidatedEventValidator = v.object({
  event: v.string(),
  roomName: v.string(),
  identity: v.string(),
  participantName: v.string(),
});

export const validate = internalAction({
  args: {
    body: v.string(),
    authorization: v.string(),
  },
  returns: webhookValidatedEventValidator,
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
  returns: v.null(),
  handler: async (_ctx, args) => {
    const { apiKey, apiSecret, wsUrl } = requireLiveKitEnv();
    const { RoomServiceClient } = await import("livekit-server-sdk");
    const client = new RoomServiceClient(httpUrlForLiveKit(wsUrl), apiKey, apiSecret);
    try {
      await client.removeParticipant(args.roomName, args.identity);
    } catch {
      /* ignore */
    }
    return null;
  },
});
