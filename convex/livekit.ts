"use node";

import { AccessToken, RoomServiceClient, TrackSource, type VideoGrant } from "livekit-server-sdk";
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

function httpUrlForLiveKit(wsUrl: string) {
  return wsUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}

async function ensureLiveKitRoom(
  apiKey: string,
  apiSecret: string,
  wsUrl: string,
  roomName: string,
  metadata: Record<string, unknown>,
  maxParticipants: number,
) {
  const roomClient = new RoomServiceClient(httpUrlForLiveKit(wsUrl), apiKey, apiSecret);
  const existing = await roomClient.listRooms([roomName]);
  if (existing.length > 0) return;

  await roomClient.createRoom({
    name: roomName,
    emptyTimeout: 60,
    departureTimeout: 20,
    maxParticipants,
    metadata: JSON.stringify(metadata),
  });
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
    participantRole: "instructor" | "customer" | "admin";
    joinClosesAt: number;
  }> => {
    const { apiKey, apiSecret, wsUrl } = requireLiveKitEnv();
    const join: {
      userId: Id<"users">;
      displayName: string;
      roomName: string;
      participantRole: "instructor" | "customer" | "admin";
      liveClassId: Id<"liveClasses">;
      liveClassType: "group_live" | "one_on_one";
      startsAt: number;
      endsAt: number;
      joinClosesAt: number;
      capacity: number;
    } = await ctx.runMutation(internal.liveClasses.prepareJoin, {
      liveClassId: args.liveClassId,
    });
    const isInstructor = join.participantRole === "instructor" || join.participantRole === "admin";

    await ensureLiveKitRoom(
      apiKey,
      apiSecret,
      wsUrl,
      join.roomName,
      {
        liveClassId: join.liveClassId,
        type: join.liveClassType,
        startsAt: join.startsAt,
        endsAt: join.endsAt,
        joinClosesAt: join.joinClosesAt,
        layout: join.liveClassType === "one_on_one" ? "one_on_one" : "instructor_spotlight",
        instructorPriority: true,
      },
      Math.max(2, join.capacity + 1),
    );

    const identity: string = `${join.participantRole}_${join.userId}`;
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: join.displayName,
      ttl: "10m",
    });

    const grant: VideoGrant =
      isInstructor
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
      joinClosesAt: join.joinClosesAt,
    };
  },
});
