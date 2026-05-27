import type { ConvexClient } from "convex/browser";
import type { Room } from "livekit-client";
import type { JoinInfo } from "../join/types";
import type { ConnectionState } from "../join/types";
import { connectV2Room, refreshV2RoomToken, teardownV2Room } from "./connect";
import { mintJoinCredentials } from "../join/mintJoin";
import { publishLocalMedia } from "./publish";
import { LivePersistentDevices } from "../../live-persistent-devices";
import type { Id } from "$convex/_generated/dataModel";

/** Refresh JWT before typical 10m expiry (server mint policy). */
export const JOIN_TOKEN_REFRESH_MS = 7 * 60 * 1000;

/**
 * Flat v2 session — no inheritance chain, no `$lib/livekit`.
 */
export class LiveSessionV2 {
  joinInfo = $state<JoinInfo | null>(null);
  room = $state<Room | null>(null);
  connectionState = $state<ConnectionState>("idle");
  mediaError = $state("");
  inRoom = $state(false);
  cameraEnabled = $state(false);
  micEnabled = $state(false);

  readonly devices = new LivePersistentDevices();

  constructor(private readonly client: ConvexClient) {}

  get isInstructorRoom(): boolean {
    const role = this.joinInfo?.participantRole;
    return role === "instructor" || role === "admin";
  }

  async mintAndConnect(liveClassId: Id<"liveClasses">) {
    this.mediaError = "";
    const info = await mintJoinCredentials(this.client, liveClassId);
    this.joinInfo = info;
    await this.connect();
    return info;
  }

  async connect() {
    const info = this.joinInfo;
    if (info === null) return;

    try {
      const next = await connectV2Room({
        joinInfo: info,
        previousRoom: this.room,
        handlers: {
          onConnectionState: (state) => {
            this.connectionState = state;
          },
          onDisconnected: () => {
            this.inRoom = false;
          },
        },
      });
      this.room = next;
      this.inRoom = true;

      const published = await publishLocalMedia(next, {
        isInstructor: this.isInstructorRoom,
        devices: this.devices,
      });
      this.cameraEnabled = published.cameraEnabled;
      this.micEnabled = published.micEnabled;
      if (published.mediaError) {
        this.mediaError = published.mediaError;
      }
    } catch (reason) {
      this.connectionState = "disconnected";
      this.inRoom = false;
      this.mediaError = reason instanceof Error ? reason.message : String(reason);
      throw reason;
    }
  }

  async refreshToken(liveClassId: Id<"liveClasses">) {
    const info = await mintJoinCredentials(this.client, liveClassId);
    this.joinInfo = info;
    if (this.room !== null) {
      await refreshV2RoomToken(this.room, info);
    }
    return info;
  }

  async leave() {
    this.inRoom = false;
    this.connectionState = "disconnected";
    this.cameraEnabled = false;
    this.micEnabled = false;
    await teardownV2Room(this.room);
    this.room = null;
  }
}

export function createLiveSessionV2(client: ConvexClient) {
  return new LiveSessionV2(client);
}
