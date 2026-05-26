import type { Id } from "$convex/_generated/dataModel";
import { liveClassIdFromRoomName, roomNameIncludesClassId } from "./room-name";

/** Client-visible slice of `issueJoin` used for mismatch checks. */
export type LiveIssueJoinPayload = {
  liveClassId?: Id<"liveClasses">;
  roomName: string;
};

/**
 * Reject tokens issued for a different class than the URL.
 * Tolerates older Convex deployments that omit `liveClassId` but return `roomName`.
 */
export function assertIssueJoinMatchesClass(
  liveClassId: Id<"liveClasses">,
  join: LiveIssueJoinPayload,
): void {
  if (join.liveClassId !== undefined && join.liveClassId !== liveClassId) {
    throw new Error("Live join response does not match selected class");
  }

  if (join.liveClassId === liveClassId) {
    return;
  }

  const parsedFromRoom = liveClassIdFromRoomName(join.roomName);
  if (parsedFromRoom !== null) {
    if (parsedFromRoom !== liveClassId) {
      throw new Error("Live join response does not match selected class");
    }
    return;
  }

  if (roomNameIncludesClassId(join.roomName, liveClassId)) {
    return;
  }

  if (join.liveClassId === undefined) {
    console.warn(
      "[LiveKit] issueJoin missing liveClassId; could not verify room name — deploy latest Convex",
    );
    return;
  }

  throw new Error("Live join response does not match selected class");
}
