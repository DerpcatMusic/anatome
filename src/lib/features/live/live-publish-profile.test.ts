import { describe, expect, it } from "bun:test";
import { AudioPresets, VideoPreset } from "livekit-client";
import {
  buildTrackPublishDefaults,
  buildVideoSimulcastLayers,
  resolutionDimensions,
  screenShareEncoding,
} from "./live-publish-profile";

const baseInput = {
  selectedResolution: "1080p" as const,
  selectedFramerate: 30 as const,
  selectedBitrateMbps: 6 as const,
  selectedCodec: "h264" as const,
  simulcastEnabled: true,
  degradationPreference: "maintain-framerate" as const,
  selectedAudioPreset: "musicHighQuality" as const,
  forceStereo: false,
  isInstructor: true,
};

describe("resolutionDimensions", () => {
  it("maps 1080p to full HD capture", () => {
    expect(resolutionDimensions({ ...baseInput, selectedResolution: "1080p" })).toEqual({
      width: 1920,
      height: 1080,
      frameRate: 30,
    });
  });
});

describe("buildVideoSimulcastLayers", () => {
  it("adds 360p and 720p layers under a 1080p primary", () => {
    const layers = buildVideoSimulcastLayers(baseInput, VideoPreset);
    expect(layers?.length).toBe(2);
    expect(layers?.[0]?.width).toBe(640);
    expect(layers?.[1]?.width).toBe(1280);
  });

  it("uses a single 360p layer under 720p primary", () => {
    const layers = buildVideoSimulcastLayers(
      { ...baseInput, selectedResolution: "720p", selectedBitrateMbps: 4.5 },
      VideoPreset,
    );
    expect(layers?.length).toBe(1);
    expect(layers?.[0]?.width).toBe(640);
  });

  it("returns undefined when simulcast is off", () => {
    expect(buildVideoSimulcastLayers({ ...baseInput, simulcastEnabled: false }, VideoPreset)).toBeUndefined();
  });
});

describe("buildTrackPublishDefaults", () => {
  it("sets primary encoding from bitrate and fps", () => {
    const profile = buildTrackPublishDefaults(baseInput, VideoPreset, AudioPresets);
    expect(profile.videoEncoding?.maxBitrate).toBe(6_000_000);
    expect(profile.videoEncoding?.maxFramerate).toBe(30);
    expect(profile.videoSimulcastLayers?.length).toBe(2);
  });

  it("disables backup codec to avoid dual encoders", () => {
    const profile = buildTrackPublishDefaults(baseInput, VideoPreset, AudioPresets);
    expect(profile.backupCodec).toBe(false);
  });

  it("uses publish bitrate for screen share encoding", () => {
    expect(screenShareEncoding({ ...baseInput, selectedBitrateMbps: 8 }).maxBitrate).toBe(8_000_000);
    expect(screenShareEncoding({ ...baseInput, selectedFramerate: 60 }).maxFramerate).toBe(60);
  });

  it("skips simulcast layers at 60fps", () => {
    const profile = buildTrackPublishDefaults(
      { ...baseInput, selectedResolution: "720p", selectedFramerate: 60, simulcastEnabled: true },
      VideoPreset,
      AudioPresets,
    );
    expect(profile.simulcast).toBe(false);
    expect(profile.videoSimulcastLayers).toBeUndefined();
  });
});
