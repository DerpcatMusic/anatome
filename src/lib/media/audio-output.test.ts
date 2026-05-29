import { describe, expect, it } from "bun:test";
import { isAudioOutputSelectionSupported } from "./audio-output";

describe("isAudioOutputSelectionSupported", () => {
  it("returns false when setSinkId is missing", () => {
    expect(isAudioOutputSelectionSupported()).toBe(false);
  });
});
