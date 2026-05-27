import { useI18n } from "$lib/i18n/runes.svelte";
import type { MediaSource } from "./types";

const i18n = useI18n();

/** @see @livekit/protocol DisconnectReason — stable numeric codes */
export const LK_DISCONNECT = {
  DUPLICATE_IDENTITY: 2,
  PARTICIPANT_REMOVED: 4,
  ROOM_DELETED: 5,
  JOIN_FAILURE: 7,
  ROOM_CLOSED: 10,
  CONNECTION_TIMEOUT: 14,
  MEDIA_FAILURE: 15,
} as const;

export function participantName(participant: unknown) {
  const value = participant as { name?: string; identity?: string };
  return value.name || value.identity || i18n.t.live.room.fallbackName();
}

export function participantIdentity(participant: unknown) {
  return (participant as { identity?: string }).identity ?? "unknown";
}

export function participantIsLocal(participant: unknown) {
  return Boolean((participant as { isLocal?: boolean }).isLocal);
}

export { sanitizeMediaDeviceId } from "$lib/media/device-id";

export function publicationId(publication: unknown, track: unknown, fallback: string) {
  const pub = publication as { trackSid?: string; sid?: string };
  const value = track as { sid?: string; mediaStreamTrack?: { id?: string } };
  return pub.trackSid ?? pub.sid ?? value.sid ?? value.mediaStreamTrack?.id ?? fallback;
}

export function trackSource(publication: unknown): MediaSource {
  const source = String((publication as { source?: string }).source ?? "unknown");
  if (
    source === "camera" ||
    source === "microphone" ||
    source === "screen_share" ||
    source === "screen_share_audio"
  )
    return source;
  return "unknown";
}

export function isInstructorIdentity(identity: string) {
  return identity.startsWith("instructor_") || identity.startsWith("admin_");
}

/** Convex join/token paths throw this when profile equipment does not match the class. */
export function isEquipmentJoinError(message: string): boolean {
  return message.includes("חסר ציוד");
}

export function disconnectMessage(reason: number | undefined): string | null {
  if (reason === undefined) return null;
  if (reason === LK_DISCONNECT.DUPLICATE_IDENTITY) return i18n.t.live.room.disconnectDuplicate();
  if (reason === LK_DISCONNECT.PARTICIPANT_REMOVED) return i18n.t.live.room.disconnectRemoved();
  if (reason === LK_DISCONNECT.ROOM_DELETED || reason === LK_DISCONNECT.ROOM_CLOSED) {
    return i18n.t.live.room.disconnectRoomEnded();
  }
  if (reason === LK_DISCONNECT.JOIN_FAILURE) return i18n.t.live.room.disconnectJoinFailed();
  if (reason === LK_DISCONNECT.CONNECTION_TIMEOUT) return i18n.t.live.room.disconnectTimeout();
  if (reason === LK_DISCONNECT.MEDIA_FAILURE) return i18n.t.live.room.disconnectMediaFailed();
  return null;
}

export function isCameraNotFoundMediaError(message: string) {
  const trimmed = message.trim();
  if (!trimmed) return false;
  return trimmed === i18n.t.live.preConnect.cameraNotFound();
}

/** Suppress nagging "no camera" toasts when the user is not publishing video. */
export function shouldShowMediaErrorInRoom(message: string, cameraEnabled: boolean) {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (!cameraEnabled && isCameraNotFoundMediaError(trimmed)) return false;
  return true;
}

export function mediaErrorFromReason(
  kind: "camera" | "microphone",
  reason: unknown,
): string | null {
  const errName = reason instanceof DOMException ? reason.name : "";
  if (
    kind === "camera" &&
    (errName === "NotFoundError" || errName === "DevicesNotFoundError")
  ) {
    return null;
  }
  return getMediaErrorMessage(kind, reason);
}

export function getMediaErrorMessage(kind: "camera" | "microphone", reason: unknown) {
  const errName = reason instanceof DOMException ? reason.name : "";
  if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
    return kind === "camera"
      ? i18n.t.live.preConnect.cameraNotAllowed()
      : i18n.t.live.preConnect.micNotAllowed();
  }
  if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
    return kind === "camera"
      ? i18n.t.live.preConnect.cameraNotFound()
      : i18n.t.live.preConnect.micNotFound();
  }
  if (errName === "NotReadableError" || errName === "TrackStartError") {
    return kind === "camera"
      ? i18n.t.live.preConnect.cameraNotReadable()
      : i18n.t.live.preConnect.micNotReadable();
  }
  if (errName === "AbortError") {
    return kind === "camera"
      ? i18n.t.live.preConnect.cameraAborted()
      : i18n.t.live.preConnect.micAborted();
  }
  return kind === "camera"
    ? i18n.t.live.preConnect.cameraGeneric()
    : i18n.t.live.preConnect.micGeneric();
}

export function accessStateFromError(reason: unknown): import("./types").DeviceAccessState {
  const errName = reason instanceof DOMException ? reason.name : "";
  if (errName === "NotAllowedError" || errName === "PermissionDeniedError") return "denied";
  if (errName === "NotFoundError" || errName === "DevicesNotFoundError") return "missing";
  return "failed";
}

export { i18n };
