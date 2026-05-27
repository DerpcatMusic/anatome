import type { Room } from "livekit-client";
import { LivePersistentDevices } from "../../live-persistent-devices";
import { sanitizeMediaDeviceId } from "$lib/media/device-id";
import { getMediaErrorMessage } from "../../live-room-shared";

export type PublishResult = {
  cameraEnabled: boolean;
  micEnabled: boolean;
  mediaError: string;
};

/**
 * Publish local tracks after connect — official `localParticipant` APIs.
 * @see https://docs.livekit.io/home/client/tracks/publish/
 */
export async function publishLocalMedia(
  room: Room,
  input: {
    isInstructor: boolean;
    devices?: LivePersistentDevices;
    publishCamera?: boolean;
    publishMic?: boolean;
  },
): Promise<PublishResult> {
  const devices = input.devices ?? new LivePersistentDevices();
  const prefs = {
    selectedAudioDevice: "",
    selectedVideoDevice: "",
    wantsMicOnJoin: input.isInstructor,
    wantsCameraOnJoin: true,
  };
  devices.loadInto(prefs);

  const publishCamera = input.publishCamera ?? prefs.wantsCameraOnJoin;
  const publishMic = input.publishMic ?? prefs.wantsMicOnJoin;

  let cameraEnabled = false;
  let micEnabled = false;
  let mediaError = "";

  const videoDeviceId = sanitizeMediaDeviceId(prefs.selectedVideoDevice);
  const audioDeviceId = sanitizeMediaDeviceId(prefs.selectedAudioDevice);

  if (publishCamera) {
    try {
      await room.localParticipant.setCameraEnabled(true, {
        ...(videoDeviceId ? { deviceId: videoDeviceId } : {}),
      });
      cameraEnabled = true;
    } catch (reason) {
      mediaError = getMediaErrorMessage("camera", reason);
    }
  }

  if (publishMic) {
    try {
      await room.localParticipant.setMicrophoneEnabled(true, {
        ...(audioDeviceId ? { deviceId: audioDeviceId } : {}),
      });
      micEnabled = true;
    } catch (reason) {
      const micMsg = getMediaErrorMessage("microphone", reason);
      mediaError = [mediaError, micMsg].filter(Boolean).join(" ");
    }
  }

  if (input.isInstructor && !micEnabled && publishMic) {
    try {
      await room.localParticipant.setMicrophoneEnabled(true, {
        ...(audioDeviceId ? { deviceId: audioDeviceId } : {}),
      });
      micEnabled = true;
    } catch (reason) {
      mediaError = getMediaErrorMessage("microphone", reason);
    }
  }

  try {
    await room.startAudio();
  } catch {
    /* browser may require gesture — Stage shows start-audio if needed */
  }

  devices.saveFrom({
    ...prefs,
    wantsCameraOnJoin: cameraEnabled,
    wantsMicOnJoin: micEnabled,
  });

  return { cameraEnabled, micEnabled, mediaError };
}
