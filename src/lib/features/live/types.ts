export type ParticipantRole = "instructor" | "customer" | "admin";
export type RoomStatus = "checking" | "locked" | "missing" | "ready" | "error";
export type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
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
export type VideoCodecChoice = "vp8" | "h264" | "vp9";
export type VideoResolutionChoice = "1080p" | "720p" | "360p";
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
