import type { Id } from "$convex/_generated/dataModel";

/** Client-visible slice of `issueJoin` used for mismatch checks. */
export type LiveIssueJoinPayload = {
  liveClassId: Id<"liveClasses">;
  roomName: string;
};

/**
 * Reject tokens issued for a different class than the URL (defense in depth;
 * server already scopes JWT `room` to one LiveKit room).
 */
export function assertIssueJoinMatchesClass(
  liveClassId: Id<"liveClasses">,
  join: LiveIssueJoinPayload,
): void {
  if (join.liveClassId !== liveClassId) {
    throw new Error("Live join response does not match selected class");
  }
}
