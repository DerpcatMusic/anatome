import { describe, expect, it } from "bun:test";
import { effectivePublishInput, publishPerformanceWarnings } from "./live-performance-tuning";
import type { PublishProfileInput } from "./live-publish-profile";

const base: PublishProfileInput = {
  selectedResolution: "720p",
  selectedFramerate: 60,
  selectedBitrateMbps: 4.5,
  selectedCodec: "h264",
  simulcastEnabled: true,
  degradationPreference: "maintain-framerate",
  selectedAudioPreset: "music",
  forceStereo: false,
  isInstructor: true,
};

describe("effectivePublishInput", () => {
  it("disables simulcast above 30fps", () => {
    expect(effectivePublishInput(base).simulcastEnabled).toBe(false);
  });

  it("keeps simulcast at 30fps when enabled", () => {
    expect(effectivePublishInput({ ...base, selectedFramerate: 30 }).simulcastEnabled).toBe(true);
  });
});

describe("publishPerformanceWarnings", () => {
  it("warns when user enabled simulcast at 60fps", () => {
    const warnings = publishPerformanceWarnings(base);
    expect(warnings.some((w) => w.includes("60fps"))).toBe(true);
  });
});
