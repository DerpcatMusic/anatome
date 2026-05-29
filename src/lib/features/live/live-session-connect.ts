/**
 * LiveKit connect/disconnect only — no UI, no Convex.
 * LiveKit connect/disconnect for {@link ./live-session.svelte.ts}.
 */
import type { Room, TrackPublishDefaults } from "livekit-client";
import { sanitizeMediaDeviceId } from "$lib/media/device-id";
import {
  getMediaErrorMessage,
  mediaErrorFromReason,
  participantIdentity,
  participantIsLocal,
} from "./live-room-shared";
import { shouldSubscribeToRemoteParticipant } from "./live-subscribe-policy";
import type { JoinInfo } from "./join-token";
import type { ConnectionState } from "./types";
import { applyMotionContentHint, shouldEnableDynacast } from "./live-publish-profile";
import type { PublishProfileInput } from "./live-publish-profile";
import {
  remoteVideoQualityForParticipant,
  shouldApplySimulcastQuality,
  type SessionSubscribePolicy,
} from "./live-subscribe-policy";

export type { SessionSubscribePolicy } from "./live-subscribe-policy";

export type SessionDeviceSelection = {
  selectedVideoDevice: string;
  selectedAudioDevice: string;
};

export type SessionCaptureOptions = {
  cameraCaptureOptions: (isInstructor: boolean) => Record<string, unknown>;
  microphoneCaptureOptions: () => Record<string, unknown>;
  resolutionDimensions: (isInstructor: boolean) => {
    width: number;
    height: number;
    frameRate: number;
  };
  publishProfile: (
    isInstructor: boolean,
    VideoPreset: typeof import("livekit-client").VideoPreset,
    AudioPresets: typeof import("livekit-client").AudioPresets,
  ) => TrackPublishDefaults;
  publishProfileInput: (isInstructor: boolean) => PublishProfileInput;
};

export type SessionPublishIntent = {
  publishCamera: boolean;
  publishMic: boolean;
};

export type SessionConnectHandlers = {
  onConnectionState: (state: ConnectionState) => void;
  onDisconnected: (reason?: number) => void;
  onReconnected?: () => void;
  /** Fires after signal connect — before camera/mic publish (fast room entry). */
  onRoomReady?: (room: Room) => void;
};

export type ConnectLiveSessionInput = {
  joinInfo: JoinInfo;
  previousRoom: Room | null;
  devices: SessionDeviceSelection;
  capture: SessionCaptureOptions;
  publish: SessionPublishIntent;
  subscribe: SessionSubscribePolicy;
  handlers: SessionConnectHandlers;
  /** Skip when {@link prepareJoinConnection} already warmed this URL. */
  skipPrepareConnection?: boolean;
};

/** Cap gUM/publish stalls (Firefox can hang tens of seconds before NotFoundError). */
const MEDIA_PUBLISH_TIMEOUT_MS = 10_000;

async function withMediaPublishTimeout<T>(label: string, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new DOMException(`${label} timed out after ${MEDIA_PUBLISH_TIMEOUT_MS}ms`, "TimeoutError"));
        }, MEDIA_PUBLISH_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export type ConnectLiveSessionResult = {
  room: Room;
  cameraEnabled: boolean;
  micEnabled: boolean;
  mediaError: string;
};

function shouldSubscribeToPublication(
  policy: SessionSubscribePolicy,
  participant: unknown,
): boolean {
  return shouldSubscribeToRemoteParticipant(policy, participantIdentity(participant));
}

function subscribeIfAllowed(
  policy: SessionSubscribePolicy,
  publication: unknown,
  participant: unknown,
) {
  const pub = publication as {
    setSubscribed?: (subscribed: boolean) => void;
    setVideoQuality?: (quality: number) => void;
    kind?: string;
  };
  if (typeof pub.setSubscribed !== "function") return;
  if (participantIsLocal(participant)) return;
  const shouldSubscribe = shouldSubscribeToPublication(policy, participant);
  pub.setSubscribed(shouldSubscribe);
  if (
    shouldSubscribe &&
    pub.kind === "video" &&
    typeof pub.setVideoQuality === "function" &&
    shouldApplySimulcastQuality(publication)
  ) {
    pub.setVideoQuality(
      remoteVideoQualityForParticipant(policy, participantIdentity(participant)),
    );
  }
}

function attachParticipantListeners(
  policy: SessionSubscribePolicy,
  participant: unknown,
) {
  const value = participant as { trackPublications?: Map<string, unknown> };
  value.trackPublications?.forEach((publication) => {
    subscribeIfAllowed(policy, publication, participant);
  });
}

/** Re-apply simulcast layer caps after instructor updates receive quality. */
export function applySessionSubscribePolicy(room: Room, policy: SessionSubscribePolicy) {
  room.remoteParticipants.forEach((participant) => {
    attachParticipantListeners(policy, participant);
  });
}

function clearPersistedDevice(storageKey: string) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

async function publishCameraWithFallback(
  lkRoom: Room,
  isInstructor: boolean,
  devices: SessionDeviceSelection,
  capture: SessionCaptureOptions,
): Promise<void> {
  const enable = () =>
    lkRoom.localParticipant.setCameraEnabled(true, capture.cameraCaptureOptions(isInstructor));
  try {
    await withMediaPublishTimeout("Camera", enable());
    return;
  } catch (reason) {
    if (!sanitizeMediaDeviceId(devices.selectedVideoDevice)) throw reason;
    console.warn("[LiveSession] Camera selected device failed, retrying default:", reason);
  }

  const previousDevice = devices.selectedVideoDevice;
  devices.selectedVideoDevice = "";
  clearPersistedDevice("lk-video-device");
  clearPersistedDevice("hb-live-video-device");
  try {
    await withMediaPublishTimeout("Camera (default device)", enable());
  } catch (reason) {
    devices.selectedVideoDevice = previousDevice;
    throw reason;
  }
}

async function publishMicrophoneWithFallback(
  lkRoom: Room,
  devices: SessionDeviceSelection,
  capture: SessionCaptureOptions,
): Promise<void> {
  const enable = () =>
    lkRoom.localParticipant.setMicrophoneEnabled(true, capture.microphoneCaptureOptions());
  try {
    await withMediaPublishTimeout("Microphone", enable());
    return;
  } catch (reason) {
    if (!sanitizeMediaDeviceId(devices.selectedAudioDevice)) throw reason;
    console.warn("[LiveSession] Microphone selected device failed, retrying default:", reason);
  }

  const previousDevice = devices.selectedAudioDevice;
  devices.selectedAudioDevice = "";
  clearPersistedDevice("lk-audio-device");
  clearPersistedDevice("hb-live-audio-device");
  try {
    await withMediaPublishTimeout("Microphone (default device)", enable());
  } catch (reason) {
    devices.selectedAudioDevice = previousDevice;
    throw reason;
  }
}

async function publishLocalSessionMedia(
  lkRoom: Room,
  isInstructor: boolean,
  devices: SessionDeviceSelection,
  capture: SessionCaptureOptions,
  publish: SessionPublishIntent,
): Promise<{ cameraEnabled: boolean; micEnabled: boolean; mediaError: string }> {
  let cameraEnabled = false;
  let micEnabled = false;
  let mediaError = "";

  const cameraWork = publish.publishCamera
    ? publishCameraWithFallback(lkRoom, isInstructor, devices, capture)
        .then(() => {
          cameraEnabled = true;
        })
        .catch((cameraReason) => {
          cameraEnabled = false;
          console.warn("[LiveSession] Camera failed:", cameraReason);
          const cameraMsg = mediaErrorFromReason("camera", cameraReason);
          if (cameraMsg) mediaError = cameraMsg;
        })
    : Promise.resolve();

  const micWork = publish.publishMic
    ? publishMicrophoneWithFallback(lkRoom, devices, capture)
        .then(() => {
          micEnabled = true;
        })
        .catch((micReason) => {
          micEnabled = false;
          console.warn("[LiveSession] Microphone failed:", micReason);
          const micMsg = getMediaErrorMessage("microphone", micReason);
          mediaError = [mediaError, micMsg].filter(Boolean).join(" ");
        })
    : Promise.resolve();

  await Promise.all([cameraWork, micWork]);

  if (cameraEnabled) {
    const { Track } = await import("livekit-client");
    const camPub = lkRoom.localParticipant.getTrackPublication(Track.Source.Camera);
    applyMotionContentHint(camPub?.track?.mediaStreamTrack);
  }

  if (isInstructor && !micEnabled && publish.publishMic) {
    try {
      await publishMicrophoneWithFallback(lkRoom, devices, capture);
      micEnabled = true;
      if (mediaError) {
        const parts = mediaError.split(" ").filter(Boolean);
        mediaError = parts.length > 1 ? parts.slice(1).join(" ") : "";
      }
    } catch (micReason) {
      console.warn("[LiveSession] Instructor mic failed:", micReason);
      mediaError = getMediaErrorMessage("microphone", micReason);
    }
  }

  return { cameraEnabled, micEnabled, mediaError };
}

/** Warm DNS/TLS before PreJoin connect. */
export async function prepareJoinConnection(info: JoinInfo): Promise<void> {
  const { Room } = await import("livekit-client");
  const warm = new Room({ adaptiveStream: true, dynacast: true });
  try {
    await warm.prepareConnection(info.wsUrl, info.token);
  } catch (reason) {
    console.warn("[LiveSession] prepareConnection failed:", reason);
  } finally {
    try {
      await warm.disconnect();
    } catch (reason) {
      console.warn("[LiveSession] prepareConnection warm room disconnect failed:", reason);
    }
  }
}

/** Disconnect and unregister handlers; safe if connect failed early. */
export async function teardownLiveSessionRoom(room: Room | null): Promise<void> {
  if (room === null) return;
  try {
    room.unregisterTextStreamHandler("homebody.chat");
  } catch {
    // Handler may not be registered.
  }
  try {
    await room.disconnect();
  } catch (reason) {
    console.warn("[LiveSession] Room disconnect failed:", reason);
  }
}

/**
 * Connect to LiveKit, publish local tracks, and apply member subscribe rules.
 */
export async function connectLiveSessionRoom(
  input: ConnectLiveSessionInput,
): Promise<ConnectLiveSessionResult> {
  const {
    joinInfo,
    previousRoom,
    devices,
    capture,
    publish,
    subscribe,
    handlers,
    skipPrepareConnection = false,
  } = input;
  handlers.onConnectionState("connecting");
  await teardownLiveSessionRoom(previousRoom);

  let lkRoom: Room | null = null;

  try {
    const { Room, RoomEvent, VideoPreset, AudioPresets } = await import("livekit-client");
    const isInstructor =
      joinInfo.participantRole === "instructor" || joinInfo.participantRole === "admin";

    const dynacast = shouldEnableDynacast(capture.publishProfileInput(isInstructor));

    lkRoom = new Room({
      // We set simulcast layers explicitly via setVideoQuality; avoid auto-downgrade.
      adaptiveStream: false,
      dynacast,
      disconnectOnPageLeave: false,
      stopLocalTrackOnUnpublish: false,
      reconnectPolicy: {
        nextRetryDelayInMs(ctx) {
          if (ctx.retryCount >= 10) return null;
          return Math.min(3_000 * (ctx.retryCount + 1), 15_000);
        },
      },
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      videoCaptureDefaults: { resolution: capture.resolutionDimensions(isInstructor) },
      publishDefaults: capture.publishProfile(isInstructor, VideoPreset, AudioPresets),
    });

    lkRoom
      .on(RoomEvent.Reconnecting, () => {
        handlers.onConnectionState("reconnecting");
      })
      .on(RoomEvent.Reconnected, () => {
        handlers.onConnectionState("connected");
        handlers.onReconnected?.();
      })
      .on(RoomEvent.Disconnected, (reason?: number) => {
        handlers.onConnectionState("disconnected");
        handlers.onDisconnected(reason);
      })
      .on(RoomEvent.ParticipantConnected, (participant: unknown) => {
        attachParticipantListeners(subscribe, participant);
      })
      .on(RoomEvent.TrackPublished, (publication: unknown, participant: unknown) => {
        subscribeIfAllowed(subscribe, publication, participant);
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        void track;
        subscribeIfAllowed(subscribe, publication, participant);
      });

    if (!skipPrepareConnection) {
      await lkRoom.prepareConnection(joinInfo.wsUrl, joinInfo.token);
    }
    await lkRoom.connect(joinInfo.wsUrl, joinInfo.token, {
      autoSubscribe: subscribe.isInstructorRoom,
    });

    handlers.onConnectionState("connected");
    lkRoom.remoteParticipants.forEach((participant) =>
      attachParticipantListeners(subscribe, participant),
    );
    handlers.onRoomReady?.(lkRoom);

    const { cameraEnabled, micEnabled, mediaError } = await publishLocalSessionMedia(
      lkRoom,
      isInstructor,
      devices,
      capture,
      publish,
    );

    return { room: lkRoom, cameraEnabled, micEnabled, mediaError };
  } catch (reason) {
    handlers.onConnectionState("disconnected");
    if (lkRoom !== null) {
      await teardownLiveSessionRoom(lkRoom);
    }
    throw reason;
  }
}
