"use node";

import { AccessToken, RoomServiceClient, TrackSource, type VideoGrant } from "livekit-server-sdk";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { requireLiveKitEnv, httpUrlForLiveKit } from "../lib/livekitEnv";
import { TTL } from "../lib/constants";

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
  const serializedMetadata = JSON.stringify(metadata);
  if (existing.length > 0) {
    if (existing[0]?.metadata !== serializedMetadata) {
      await roomClient.updateRoomMetadata(roomName, serializedMetadata);
    }
    return;
  }

  const emptyTimeout = Math.max(TTL.MIN_EMPTY_TIMEOUT_SECONDS, Math.ceil((joinClosesAt - Date.now()) / 1000) + TTL.EMPTY_ROOM_BUFFER_SECONDS);

  try {
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout,
      departureTimeout: TTL.DEPARTURE_TIMEOUT_SECONDS,
      maxParticipants,
      metadata: serializedMetadata,
    });
  } catch (reason: unknown) {
    const message = reason instanceof Error ? reason.message : String(reason);
    if (message.includes("already exists") || message.includes("Room already exists")) {
      return;
    }
    throw reason;
  }
}

export const issueJoin = action({
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
      maxParticipants: number;
    } = await ctx.runMutation(internal.live.room.prepareJoin, {
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
      join.maxParticipants,
      join.joinClosesAt,
    );

    const identity: string = `${join.participantRole}_${join.userId}`;
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: join.displayName,
      ttl: TTL.JOIN_TOKEN,
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
