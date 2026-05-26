import type { Id } from "$convex/_generated/dataModel";

const LIVE_CLASS_ROOM_SEGMENT = "_liveClass_";

/**
 * Parse class id from a LiveKit room name (`{prefix}_liveClass_{id}`).
 * Prefix-agnostic so it works when only Convex knows `LIVEKIT_ROOM_PREFIX`.
 */
export function liveClassIdFromRoomName(roomName: string): Id<"liveClasses"> | null {
  const segmentIndex = roomName.lastIndexOf(LIVE_CLASS_ROOM_SEGMENT);
  if (segmentIndex < 0) return null;
  const id = roomName.slice(segmentIndex + LIVE_CLASS_ROOM_SEGMENT.length);
  if (id.length < 10 || id.length > 64 || !/^[a-z0-9]+$/.test(id)) return null;
  return id as Id<"liveClasses">;
}

export function roomNameIncludesClassId(roomName: string, liveClassId: Id<"liveClasses">): boolean {
  return roomName.endsWith(`${LIVE_CLASS_ROOM_SEGMENT}${liveClassId}`);
}
