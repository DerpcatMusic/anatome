"use node";

import { RoomServiceClient } from "livekit-server-sdk";
import { TTL } from "../lib/constants";
import { httpUrlForLiveKit } from "../lib/livekitEnv";
import { liveKitRoomLayout } from "../live/joinPolicy";
import type { PrepareJoinResult } from "../live/joinContract";

export async function ensureLiveKitRoom(
  apiKey: string,
  apiSecret: string,
  wsUrl: string,
  join: PrepareJoinResult,
) {
  const roomClient = new RoomServiceClient(httpUrlForLiveKit(wsUrl), apiKey, apiSecret);
  const roomName = join.roomName;
  const metadata = {
    liveClassId: join.liveClassId,
    type: join.liveClassType,
    startsAt: join.startsAt,
    endsAt: join.endsAt,
    joinClosesAt: join.joinClosesAt,
    layout: liveKitRoomLayout(join.liveClassType),
    instructorPriority: true,
  };
  const serializedMetadata = JSON.stringify(metadata);
  const existing = await roomClient.listRooms([roomName]);

  if (existing.length > 0) {
    if (existing[0]?.metadata !== serializedMetadata) {
      await roomClient.updateRoomMetadata(roomName, serializedMetadata);
    }
    return;
  }

  const emptyTimeout = Math.max(
    TTL.MIN_EMPTY_TIMEOUT_SECONDS,
    Math.ceil((join.joinClosesAt - Date.now()) / 1000) + TTL.EMPTY_ROOM_BUFFER_SECONDS,
  );

  try {
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout,
      departureTimeout: TTL.DEPARTURE_TIMEOUT_SECONDS,
      maxParticipants: join.maxParticipants,
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
