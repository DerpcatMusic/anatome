import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { LocalTrackPublication, facingModeFromLocalTrack } from "livekit-client";

/**
 * Try to determine the `facingMode` of a local participant video track.
 *
 * @alpha
 */
export function useFacingMode(
	trackReference: TrackReferenceOrPlaceholder,
): "user" | "environment" | "left" | "right" | "undefined" {
	if (trackReference.publication instanceof LocalTrackPublication) {
		const localTrack = trackReference.publication.track;
		if (localTrack) {
			const { facingMode } = facingModeFromLocalTrack(localTrack);
			return facingMode;
		}
	}
	return "undefined";
}
