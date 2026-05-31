import { describe, expect, it } from "bun:test";
import { parseAppPassthrough, readAssetVideoId } from "./processing";

describe("Mux video processing helpers", () => {
  it("extracts a video id from direct passthrough JSON", () => {
    expect(readAssetVideoId({ passthrough: JSON.stringify({ videoId: "video_123" }) })).toBe(
      "video_123",
    );
  });

  it("accepts legacy passthrough keys and ignores invalid payloads", () => {
    expect(readAssetVideoId({ passthrough: JSON.stringify({ video_id: "video_456" }) })).toBe(
      "video_456",
    );
    expect(readAssetVideoId({ passthrough: "not-json" })).toBeUndefined();
    expect(parseAppPassthrough(null)).toEqual({});
  });
});
