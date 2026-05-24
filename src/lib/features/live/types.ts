export type ParticipantRole = "instructor" | "customer" | "admin";
export type RoomStatus = "checking" | "locked" | "missing" | "waiting" | "prep" | "ready" | "error";
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
export type VideoResolutionChoice = "1080p" | "720p" | "360p";
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

/** Svelte action that mounts a media element into a node and cleans up on destroy */
export function mountMedia(node: HTMLElement, element: HTMLElement) {
  node.replaceChildren(element);
  return {
    destroy() {
      element.remove();
    },
  };
}
