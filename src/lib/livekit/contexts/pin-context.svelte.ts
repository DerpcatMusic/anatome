import { getContext, setContext } from 'svelte';
import type { TrackReferenceOrPlaceholder, PinState } from '../types.js';

const PIN_CONTEXT_KEY = Symbol('livekit-pin');

/** @internal */
export type PinAction =
	| {
			msg: 'set_pin';
			trackReference: TrackReferenceOrPlaceholder;
		}
	| { msg: 'clear_pin' };

/**
 * Manages the pinned track references state.
 * @public
 */
export class PinContext {
	/** Reactive list of pinned track references. */
	pinnedTracks: PinState = $state([]);

	/**
	 * Pin a specific track reference, replacing any existing pin.
	 */
	setPin(trackReference: TrackReferenceOrPlaceholder): void {
		this.pinnedTracks = [trackReference];
	}

	/**
	 * Clear all pinned tracks.
	 */
	clearPin(): void {
		this.pinnedTracks = [];
	}
}

/**
 * Set the PinContext in the current Svelte component tree.
 * @public
 */
export function setPinContext(ctx: PinContext): void {
	setContext(PIN_CONTEXT_KEY, ctx);
}

/**
 * Get the PinContext from the current Svelte component tree.
 * Returns `undefined` if not found.
 * @public
 */
export function getPinContext(): PinContext | undefined {
	return getContext<PinContext | undefined>(PIN_CONTEXT_KEY);
}
