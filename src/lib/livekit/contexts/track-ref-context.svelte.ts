import { Context } from "runed";
import type { TrackReferenceOrPlaceholder } from "../types.js";

export const trackRefCtx = new Context<TrackReferenceOrPlaceholder>("livekit-track-ref");

export function setTrackRefContext(trackRef: TrackReferenceOrPlaceholder): void {
	trackRefCtx.set(trackRef);
}

export function getMaybeTrackRefContext(): TrackReferenceOrPlaceholder | undefined {
	return trackRefCtx.getOr(undefined);
}

/**
 * Ensures that a track reference is provided, either via context or explicitly as a parameter.
 * Throws if no track reference is found.
 * @public
 */
export function useEnsureTrackRef(
	trackRef?: TrackReferenceOrPlaceholder,
): TrackReferenceOrPlaceholder {
	const context = getMaybeTrackRefContext();
	const ref = trackRef ?? context;
	if (!ref) {
		throw new Error(
			'No TrackRef, make sure you are inside a TrackRefContext or pass the TrackRef explicitly',
		);
	}
	return ref;
}
