import { TrackSource, type VideoGrant } from "livekit-server-sdk";
import type { LiveParticipantRole } from "../live/joinContract";
import { isPrivilegedLiveParticipant } from "../live/joinPolicy";

export function buildLiveKitVideoGrant(
  roomName: string,
  participantRole: LiveParticipantRole,
): VideoGrant {
  if (isPrivilegedLiveParticipant(participantRole)) {
    return {
      room: roomName,
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
    };
  }

  return {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
  };
}
