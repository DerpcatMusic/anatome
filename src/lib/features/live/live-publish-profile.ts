import type { ScreenShareCaptureOptions, TrackPublishDefaults, VideoEncoding } from "livekit-client";
import { effectivePublishInput } from "./live-performance-tuning";
import type {
  AudioPresetChoice,
  BitrateChoice,
  DegradationPreferenceChoice,
  VideoCodecChoice,
  VideoFramerateChoice,
  VideoResolutionChoice,
} from "./types";

export { effectivePublishInput, shouldEnableDynacast, publishPerformanceWarnings } from "./live-performance-tuning";

export type PublishProfileInput = {
  selectedResolution: VideoResolutionChoice;
  selectedFramerate: VideoFramerateChoice;
  selectedBitrateMbps: BitrateChoice;
  selectedCodec: VideoCodecChoice;
  simulcastEnabled: boolean;
  degradationPreference: DegradationPreferenceChoice;
  selectedAudioPreset: AudioPresetChoice;
  forceStereo: boolean;
  isInstructor: boolean;
};

/** Capture resolution for gUM / LiveKit videoCaptureDefaults. */
export function resolutionDimensions(
  input: Pick<PublishProfileInput, "selectedResolution" | "selectedFramerate"> & {
    isInstructor: boolean;
  },
): { width: number; height: number; frameRate: number } {
  const frameRate = input.selectedFramerate;
  if (input.selectedResolution === "1080p") {
    return { width: 1920, height: 1080, frameRate };
  }
  if (input.selectedResolution === "720p") {
    return { width: 1280, height: 720, frameRate };
  }
  if (input.selectedResolution === "480p") {
    return { width: 854, height: 480, frameRate: Math.min(frameRate, 30) };
  }
  if (input.selectedResolution === "360p") {
    return { width: 640, height: 360, frameRate: Math.min(frameRate, 30) };
  }
  if (input.isInstructor) {
    return { width: 1280, height: 720, frameRate };
  }
  return { width: 640, height: 360, frameRate: Math.min(frameRate, 30) };
}

/**
 * Simulcast layers are *below* the primary capture resolution (LiveKit docs).
 * Previously we always sent 720p + 360p layers, so "1080p high" never had a HIGH layer.
 */
export function buildVideoSimulcastLayers(
  input: PublishProfileInput,
  VideoPreset: typeof import("livekit-client").VideoPreset,
): import("livekit-client").VideoPreset[] | undefined {
  const effective = effectivePublishInput(input);
  if (!effective.simulcastEnabled) return undefined;
  if (input.selectedCodec === "vp9" || input.selectedCodec === "av1") return undefined;

  const targetBitrate = Math.round(input.selectedBitrateMbps * 1_000_000);
  const maxFps30 = Math.min(input.selectedFramerate, 30);

  if (input.selectedResolution === "1080p") {
    return [
      new VideoPreset(640, 360, Math.round(targetBitrate * 0.12), maxFps30),
      new VideoPreset(1280, 720, Math.round(targetBitrate * 0.35), maxFps30),
    ];
  }
  if (input.selectedResolution === "720p") {
    return [new VideoPreset(640, 360, Math.round(targetBitrate * 0.25), maxFps30)];
  }
  if (input.selectedResolution === "480p") {
    return [new VideoPreset(426, 240, Math.round(targetBitrate * 0.2), Math.min(input.selectedFramerate, 24))];
  }
  return undefined;
}

/** Encode budget for screen share (uses the same profile sliders as camera). */
export function screenShareEncoding(input: PublishProfileInput): VideoEncoding {
  const effective = effectivePublishInput(input);
  return {
    maxBitrate: Math.round(effective.selectedBitrateMbps * 1_000_000),
    maxFramerate: effective.selectedFramerate,
  };
}

export function screenShareCaptureOptions(
  input: PublishProfileInput,
  includeAudio: boolean,
): ScreenShareCaptureOptions {
  const dims = resolutionDimensions({
    selectedResolution: input.selectedResolution,
    selectedFramerate: input.selectedFramerate,
    isInstructor: input.isInstructor,
  });
  return {
    audio: includeAudio,
    resolution: {
      width: dims.width,
      height: dims.height,
      frameRate: dims.frameRate,
    },
    contentHint: "detail",
  };
}

export function buildTrackPublishDefaults(
  input: PublishProfileInput,
  VideoPreset: typeof import("livekit-client").VideoPreset,
  AudioPresets: typeof import("livekit-client").AudioPresets,
): TrackPublishDefaults {
  const effective = effectivePublishInput(input);
  const targetBitrate = Math.round(effective.selectedBitrateMbps * 1_000_000);
  const frameRate = effective.selectedFramerate;
  const isSvc = effective.selectedCodec === "vp9" || effective.selectedCodec === "av1";

  const audioPresets: Record<AudioPresetChoice, typeof AudioPresets.telephone> = {
    speech: AudioPresets.speech,
    music: AudioPresets.music,
    musicStereo: AudioPresets.musicStereo,
    musicHighQuality: AudioPresets.musicHighQuality,
    musicHighQualityStereo: AudioPresets.musicHighQualityStereo,
  };
  const audioPresetKey: AudioPresetChoice =
    effective.isInstructor && effective.selectedAudioPreset === "speech"
      ? "music"
      : effective.selectedAudioPreset;

  const scalabilityMode = isSvc
    ? ((effective.selectedResolution === "1080p"
        ? "L3T3_KEY"
        : "L2T3_KEY") as import("livekit-client").ScalabilityMode)
    : undefined;

  return {
    simulcast: effective.simulcastEnabled && !isSvc,
    videoCodec: effective.selectedCodec,
    videoEncoding: {
      maxBitrate: targetBitrate,
      maxFramerate: frameRate,
    },
    videoSimulcastLayers: buildVideoSimulcastLayers(effective, VideoPreset),
    screenShareEncoding: screenShareEncoding(effective),
    audioPreset: audioPresets[audioPresetKey],
    red: true,
    dtx: !effective.isInstructor && effective.selectedAudioPreset === "speech",
    forceStereo: effective.forceStereo,
    degradationPreference: effective.degradationPreference,
    scalabilityMode,
    // Dual-codec publish (primary + backup) doubles encoder CPU — disable; simulcast covers subscribers.
    backupCodec: false,
  };
}

/** Hint WebRTC to favor motion (fitness) over detail — reduces wasted bits on static scenes. */
export function applyMotionContentHint(track: MediaStreamTrack | undefined) {
  if (!track || track.kind !== "video") return;
  try {
    track.contentHint = "motion";
  } catch {
    /* unsupported browser */
  }
}
