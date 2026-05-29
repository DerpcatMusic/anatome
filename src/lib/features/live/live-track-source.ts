import { Track } from "livekit-client";

/** Screen-share tracks must not use camera simulcast layers (breaks subscription/render). */
export function shouldApplySimulcastQuality(publication: unknown): boolean {
  const source = (publication as { source?: Track.Source }).source;
  return source !== Track.Source.ScreenShare;
}
