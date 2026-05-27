import type { JoinAccessSnapshot } from "../join-token";
import type { RoomStatus } from "../types";

/** Host can press “start live” (class not broadcasting yet). */
export function canHostStartBroadcast(
  isClassHost: boolean,
  isInstructorRoom: boolean,
  joinAccess: JoinAccessSnapshot | null,
  sessionStatus: RoomStatus,
): boolean {
  if (!isClassHost && !isInstructorRoom) return false;
  if (!joinAccess) return sessionStatus === "prep";
  if (joinAccess.status === "scheduled") return true;
  if (joinAccess.status === "live" && !joinAccess.isBroadcastLive) return true;
  return false;
}

/** Instructor publish settings only before the broadcast has started. */
export function showHostPublishSettings(
  isInstructorRoom: boolean,
  canStart: boolean,
): boolean {
  return isInstructorRoom && canStart;
}

export function isBroadcastActive(joinAccess: JoinAccessSnapshot | null): boolean {
  return joinAccess?.status === "live" && joinAccess.isBroadcastLive === true;
}
