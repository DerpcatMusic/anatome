import { PersistedState } from "runed";
import { sanitizeMediaDeviceId } from "$lib/media/device-id";

const PREFIX = "hb-live";

/**
 * Reference: `usePersistentUserChoices` (PreJoin localStorage keys).
 * Usable from {@link LiveSessionMedia} without Svelte component context.
 */
export class LivePersistentDevices {
  private readonly audioEnabled = new PersistedState(`${PREFIX}-audio-enabled`, true, {
    storage: "local",
  });
  private readonly videoEnabled = new PersistedState(`${PREFIX}-video-enabled`, true, {
    storage: "local",
  });
  private readonly audioDeviceId = new PersistedState(`${PREFIX}-audio-device`, "", {
    storage: "local",
  });
  private readonly videoDeviceId = new PersistedState(`${PREFIX}-video-device`, "", {
    storage: "local",
  });

  loadInto(room: {
    selectedAudioDevice: string;
    selectedVideoDevice: string;
    wantsMicOnJoin: boolean;
    wantsCameraOnJoin: boolean;
  }) {
    const audioId = sanitizeMediaDeviceId(this.audioDeviceId.current);
    const videoId = sanitizeMediaDeviceId(this.videoDeviceId.current);
    if (audioId) room.selectedAudioDevice = audioId;
    if (videoId) room.selectedVideoDevice = videoId;
    room.wantsMicOnJoin = this.audioEnabled.current;
    room.wantsCameraOnJoin = this.videoEnabled.current;
  }

  saveFrom(room: {
    selectedAudioDevice: string;
    selectedVideoDevice: string;
    wantsMicOnJoin: boolean;
    wantsCameraOnJoin: boolean;
  }) {
    this.audioEnabled.current = room.wantsMicOnJoin;
    this.videoEnabled.current = room.wantsCameraOnJoin;
    if (room.selectedAudioDevice) {
      this.audioDeviceId.current = room.selectedAudioDevice;
    }
    if (room.selectedVideoDevice) {
      this.videoDeviceId.current = room.selectedVideoDevice;
    }
  }
}
