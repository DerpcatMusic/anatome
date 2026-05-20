"use node";

import { AccessToken, RoomServiceClient, TrackSource, type VideoGrant } from "livekit-server-sdk";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
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
  joinClosesAt: number,
) {
  const roomClient = new RoomServiceClient(httpUrlForLiveKit(wsUrl), apiKey, apiSecret);
  const existing = await roomClient.listRooms([roomName]);
  if (existing.length > 0) return;

  const emptyTimeout = Math.max(3600, Math.ceil((joinClosesAt - Date.now()) / 1000) + 600);

  try {
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout,
      departureTimeout: 20,
      maxParticipants,
      metadata: JSON.stringify(metadata),
    });
  } catch (reason: unknown) {
    const message = reason instanceof Error ? reason.message : String(reason);
    if (message.includes("already exists") || message.includes("Room already exists")) {
      return;
    }
    throw reason;
  }
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
      join.joinClosesAt,
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

export const expireDueRooms = internalAction({
  args: {},
  handler: async (ctx): Promise<{ expiredClasses: number; deletedRooms: number }> => {
    const result: { expiredRoomNames: string[] } = await ctx.runMutation(
      internal.liveClasses.expireDueLiveClasses,
      { now: Date.now() },
    );

    if (result.expiredRoomNames.length === 0) {
      return { expiredClasses: 0, deletedRooms: 0 };
    }

    let env: ReturnType<typeof requireLiveKitEnv>;
    try {
      env = requireLiveKitEnv();
    } catch {
      return { expiredClasses: result.expiredRoomNames.length, deletedRooms: 0 };
    }

    const roomClient = new RoomServiceClient(httpUrlForLiveKit(env.wsUrl), env.apiKey, env.apiSecret);
    let deletedRooms = 0;

    for (const roomName of result.expiredRoomNames) {
      try {
        await roomClient.deleteRoom(roomName);
        deletedRooms += 1;
      } catch (reason) {
        console.warn(`[LiveKit] Failed to delete expired room ${roomName}:`, reason);
      }
    }

    return { expiredClasses: result.expiredRoomNames.length, deletedRooms };
  },
});
