"use node";

import { AccessToken, TrackSource, type VideoGrant } from "livekit-server-sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

declare const process: {
  env: {
    LIVEKIT_API_KEY?: string;
    LIVEKIT_API_SECRET?: string;
    LIVEKIT_URL?: string;
    LIVEKIT_WS_URL?: string;
  };
};

function requireLiveKitEnv() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL ?? process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit environment is not configured");
  }

  return { apiKey, apiSecret, wsUrl };
}

export const issueJoinToken = action({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    wsUrl: string;
    token: string;
    roomName: string;
    participantRole: "instructor" | "customer";
  }> => {
    const { apiKey, apiSecret, wsUrl } = requireLiveKitEnv();
    const join: {
      userId: Id<"users">;
      displayName: string;
      roomName: string;
      participantRole: "instructor" | "customer";
    } = await ctx.runMutation(internal.liveClasses.prepareJoin, {
      liveClassId: args.liveClassId,
    });

    const identity: string = `${join.participantRole}_${join.userId}`;
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: join.displayName,
      ttl: "10m",
    });

    const grant: VideoGrant =
      join.participantRole === "instructor"
        ? {
            room: join.roomName,
            roomJoin: true,
            roomAdmin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            canPublishSources: [
              TrackSource.CAMERA,
              TrackSource.MICROPHONE,
              TrackSource.SCREEN_SHARE,
              TrackSource.SCREEN_SHARE_AUDIO,
            ],
          }
        : {
            room: join.roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
          };

    token.addGrant(grant);

    return {
      wsUrl,
      token: await token.toJwt(),
      roomName: join.roomName,
      participantRole: join.participantRole,
    };
  },
});
