export type ParticipantRole = "instructor" | "customer" | "admin";
export type RoomStatus =
  | "checking"
  | "locked"
  | "missing"
  | "invalidClass"
  | "equipment"
  | "waiting"
  | "prep"
  | "ready"
  | "error";
export type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
export type ConnectionQualityLevel = "excellent" | "good" | "poor" | "lost" | "unknown";
export type LiveClassType = "group_live" | "one_on_one";
export type MediaSource = "camera" | "microphone" | "screen_share" | "screen_share_audio" | "unknown";
export type PreConnectStep = "idle" | "requesting" | "preview" | "denied" | "no-devices";
export type DeviceAccessState = "unknown" | "ready" | "denied" | "missing" | "failed";

export type MediaTile = {
  id: string;
  identity: string;
  name: string;
  element: HTMLElement;
  kind: "audio" | "video";
  source: MediaSource;
  isLocal: boolean;
  isInstructor: boolean;
};

export type ParticipantItem = {
  identity: string;
  name: string;
  isInstructor: boolean;
  isLocal: boolean;
  isSpeaking: boolean;
  hasCamera: boolean;
  hasMic: boolean;
};

export type StreamStats = {
  bitrateMbps: number | null;
  packetLoss: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  videoTracks: number;
  audioTracks: number;
};

export type PerTrackStat = {
  id: string;
  name: string;
  kind: "video" | "audio";
  source: MediaSource;
  bitrateKbps: number;
  packetLoss: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
};

export type MediaDevice = { deviceId: string; label: string };
export type VideoCodecChoice = "vp8" | "h264" | "vp9" | "av1";
/** LiveKit remote video layer: LOW ≈ 360p, MEDIUM ≈ 720p, HIGH ≈ 1080p (simulcast). */
export type SubscriberVideoQuality = 0 | 1 | 2;
export type SubscriberReceivePreset = "low" | "medium" | "high";

export function subscriberPresetToQuality(preset: SubscriberReceivePreset): SubscriberVideoQuality {
  if (preset === "low") return 0;
  if (preset === "high") return 2;
  return 1;
}

export function subscriberQualityToPreset(quality: SubscriberVideoQuality): SubscriberReceivePreset {
  if (quality === 0) return "low";
  if (quality === 2) return "high";
  return "medium";
}

/** Maps publish resolution to LiveKit simulcast layer (HIGH / MEDIUM / LOW). */
export function resolutionToSubscribeLayer(
  resolution: VideoResolutionChoice,
): SubscriberVideoQuality {
  if (resolution === "1080p") return 2;
  if (resolution === "720p") return 1;
  return 0;
}

export type VideoResolutionChoice = "1080p" | "720p" | "480p" | "360p";
export type VideoFramerateChoice = 24 | 30 | 60;
export type BitrateChoice = 2.5 | 4.5 | 6 | 8;
export type AudioPresetChoice = "speech" | "music" | "musicStereo" | "musicHighQuality" | "musicHighQualityStereo";
export type DegradationPreferenceChoice = "maintain-framerate" | "maintain-resolution" | "balanced";
export type ChatMessage = {
  id: string;
  identity: string;
  name: string;
  text: string;
  createdAt: number;
  isLocal: boolean;
};

type MountMediaTarget = HTMLElement | { element: HTMLElement };

function resolveMediaElement(target: MountMediaTarget): HTMLElement {
  return target instanceof HTMLElement ? target : target.element;
}

/** Svelte action that mounts a media element into a node and cleans up on destroy */
export function mountMedia(node: HTMLElement, target: MountMediaTarget) {
  const element = resolveMediaElement(target);
  node.replaceChildren(element);
  return {
    update(next: MountMediaTarget) {
      const nextElement = resolveMediaElement(next);
      if (nextElement !== element) {
        node.replaceChildren(nextElement);
      }
    },
    destroy() {
      element.remove();
    },
  };
}
