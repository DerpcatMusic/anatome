import { getContext, setContext } from 'svelte';
import type { TrackReferenceOrPlaceholder } from '../types.js';

const TRACK_REF_CONTEXT_KEY = Symbol('livekit-track-ref');

/**
 * Set a TrackReferenceOrPlaceholder in the current Svelte component tree.
 * @public
 */
export function setTrackRefContext(trackRef: TrackReferenceOrPlaceholder): void {
	setContext(TRACK_REF_CONTEXT_KEY, trackRef);
}

/**
 * Get the TrackReferenceOrPlaceholder from the current Svelte component tree.
 * Throws if not found.
 * @public
 */
export function getTrackRefContext(): TrackReferenceOrPlaceholder {
	const ctx = getContext<TrackReferenceOrPlaceholder | undefined>(TRACK_REF_CONTEXT_KEY);
	if (!ctx) {
		throw new Error('tried to access track context outside of track context provider');
	}
	return ctx;
}

/**
 * Get the TrackReferenceOrPlaceholder from the current Svelte component tree.
 * Returns `undefined` if not found.
 * @public
 */
export function getMaybeTrackRefContext(): TrackReferenceOrPlaceholder | undefined {
	return getContext<TrackReferenceOrPlaceholder | undefined>(TRACK_REF_CONTEXT_KEY);
}

/**
 * Ensures that a track reference is provided, either via context or explicitly as a parameter.
 * Throws if no track reference is found.
 * @public
 */
export function useEnsureTrackRef(trackRef?: TrackReferenceOrPlaceholder): TrackReferenceOrPlaceholder {
	const context = getMaybeTrackRefContext();
	const ref = trackRef ?? context;
	if (!ref) {
		throw new Error(
			'No TrackRef, make sure you are inside a TrackRefContext or pass the TrackRef explicitly',
		);
	}
	return ref;
}
