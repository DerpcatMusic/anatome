/**
 * v2 LiveKit connect — official client SDK only (no `$lib/livekit`).
 * @see https://docs.livekit.io/home/client/connect/
 */
import type { Room } from "livekit-client";
import type { JoinInfo } from "../join/types";
import type { ConnectionState } from "../join/types";
import { wireRoomSubscribePolicy, type SubscribePolicy } from "./subscribe";

export type ConnectHandlers = {
  onConnectionState: (state: ConnectionState) => void;
  onDisconnected: (reason?: number) => void;
};

export async function teardownV2Room(room: Room | null | undefined) {
  if (room === null || room === undefined) return;
  try {
    await room.disconnect();
  } catch {
    /* ignore */
  }
}

export async function connectV2Room(input: {
  joinInfo: JoinInfo;
  previousRoom: Room | null;
  handlers: ConnectHandlers;
}): Promise<Room> {
  const { joinInfo, previousRoom, handlers } = input;
  handlers.onConnectionState("connecting");
  await teardownV2Room(previousRoom);

  const { Room: LkRoom, RoomEvent } = await import("livekit-client");
  const isInstructorRoom =
    joinInfo.participantRole === "instructor" || joinInfo.participantRole === "admin";

  const room = new LkRoom({
    adaptiveStream: true,
    dynacast: true,
    disconnectOnPageLeave: false,
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const policy: SubscribePolicy = { isInstructorRoom };

  room
    .on(RoomEvent.Reconnecting, () => handlers.onConnectionState("reconnecting"))
    .on(RoomEvent.Reconnected, () => handlers.onConnectionState("connected"))
    .on(RoomEvent.Disconnected, (reason?: number) => {
      handlers.onConnectionState("disconnected");
      handlers.onDisconnected(reason);
    });

  await room.prepareConnection(joinInfo.wsUrl, joinInfo.token);
  await room.connect(joinInfo.wsUrl, joinInfo.token, {
    autoSubscribe: isInstructorRoom,
  });

  wireRoomSubscribePolicy(room, policy);
  handlers.onConnectionState("connected");
  return room;
}

/** Apply a refreshed JWT to an active room (official reconnect pattern). */
export async function refreshV2RoomToken(room: Room, joinInfo: JoinInfo) {
  await room.connect(joinInfo.wsUrl, joinInfo.token);
}
