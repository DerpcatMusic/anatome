import { createMediaDeviceObserver } from "@livekit/components-core";
import type { MediaDevice } from "./types";
import { i18n } from "./live-room-shared";

function mapDeviceList(
  infos: MediaDeviceInfo[],
  kind: MediaDeviceKind,
  fallbackLabel: () => string,
): MediaDevice[] {
  return infos
    .filter((device) => device.kind === kind && device.deviceId !== "")
    .map((device) => ({
      deviceId: device.deviceId,
      label: device.label || fallbackLabel(),
    }));
}

export type LiveKitDeviceListsOptions = {
  /** When false, observers tear down and lists clear. */
  active: () => boolean;
  /** Request camera/mic permission so device labels populate (pre-connect preview). */
  requestPermissions?: () => boolean;
};

/**
 * Reactive device lists via `@livekit/components-core` `createMediaDeviceObserver`.
 * Works before a LiveKit `Room` exists (pre-connect).
 */
export function createLiveKitDeviceLists(options: LiveKitDeviceListsOptions) {
  let videoDevices = $state<MediaDevice[]>([]);
  let audioDevices = $state<MediaDevice[]>([]);

  $effect(() => {
    if (!options.active()) {
      videoDevices = [];
      audioDevices = [];
      return;
    }

    const requestPermissions = options.requestPermissions?.() ?? false;

    const videoSub = createMediaDeviceObserver(
      "videoinput",
      (error) => console.warn("[LiveKit] Video device observer:", error),
      requestPermissions,
    ).subscribe((infos) => {
      videoDevices = mapDeviceList(infos, "videoinput", () =>
        i18n.t.live.preConnect.cameraLabel(),
      );
    });

    const audioSub = createMediaDeviceObserver(
      "audioinput",
      (error) => console.warn("[LiveKit] Audio device observer:", error),
      requestPermissions,
    ).subscribe((infos) => {
      audioDevices = mapDeviceList(infos, "audioinput", () => i18n.t.live.preConnect.micLabel());
    });

    return () => {
      videoSub.unsubscribe();
      audioSub.unsubscribe();
    };
  });

  return {
    get videoDevices() {
      return videoDevices;
    },
    get audioDevices() {
      return audioDevices;
    },
  };
}
