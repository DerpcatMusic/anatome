import type { Id } from "../_generated/dataModel";

const DEFAULT_NAMESPACE = "homebody";
const LIVE_CLASS_ROOM_SEGMENT = "_liveClass_";

/** Sanitized namespace for LiveKit room names (env-specific separation on shared projects). */
export function liveKitRoomNamespace(): string {
  const raw = process.env.LIVEKIT_ROOM_PREFIX?.trim();
  if (!raw) return DEFAULT_NAMESPACE;
  const sanitized = raw.replace(/[^a-zA-Z0-9_-]/g, "_");
  return sanitized.length > 0 ? sanitized : DEFAULT_NAMESPACE;
}

/**
 * Canonical LiveKit room name for a class (1:1 with `liveClassId`).
 * @see https://docs.livekit.io/frontends/reference/tokens-grants/ — JWT `room` grant locks participants to this room.
 */
export function roomNameForClass(liveClassId: Id<"liveClasses">): string {
  return `${liveKitRoomNamespace()}${LIVE_CLASS_ROOM_SEGMENT}${liveClassId}`;
}

/** Parse `liveClassId` from a canonical room name, or null if the name is not ours. */
export function liveClassIdFromRoomName(roomName: string): Id<"liveClasses"> | null {
  const prefix = `${liveKitRoomNamespace()}${LIVE_CLASS_ROOM_SEGMENT}`;
  if (!roomName.startsWith(prefix)) return null;
  const id = roomName.slice(prefix.length);
  if (id.length < 10 || id.length > 64 || !/^[a-z0-9]+$/.test(id)) return null;
  return id as Id<"liveClasses">;
}

export function assertRoomNameForClass(
  liveClassId: Id<"liveClasses">,
  roomName: string,
): void {
  const expected = roomNameForClass(liveClassId);
  if (roomName !== expected) {
    throw new Error("LiveKit room name does not match class");
  }
}
