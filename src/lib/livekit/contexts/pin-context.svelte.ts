import { Context } from "runed";
import type { TrackReferenceOrPlaceholder, PinState } from "../types.js";

export const pinCtx = new Context<PinContext>("livekit-pin");

/** @internal */
export type PinAction =
	| {
			msg: "set_pin";
			trackReference: TrackReferenceOrPlaceholder;
		}
	| { msg: "clear_pin" };

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
