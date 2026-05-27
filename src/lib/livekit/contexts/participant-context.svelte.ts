import { getContext, setContext } from 'svelte';
import type { Participant } from 'livekit-client';
import { getMaybeTrackRefContext } from './track-ref-context.svelte.js';

const PARTICIPANT_CONTEXT_KEY = Symbol('livekit-participant');

/**
 * Set a Participant in the current Svelte component tree.
 * @public
 */
export function setParticipantContext(participant: Participant): void {
	setContext(PARTICIPANT_CONTEXT_KEY, participant);
}

/**
 * Get the Participant from the current Svelte component tree.
 * Throws if not found.
 * @public
 */
export function getParticipantContext(): Participant {
	const ctx = getContext<Participant | undefined>(PARTICIPANT_CONTEXT_KEY);
	if (!ctx) {
		throw new Error('tried to access participant context outside of participant context provider');
	}
	return ctx;
}

/**
 * Get the Participant from the current Svelte component tree.
 * Returns `undefined` if not found.
 * @public
 */
export function getMaybeParticipantContext(): Participant | undefined {
	return getContext<Participant | undefined>(PARTICIPANT_CONTEXT_KEY);
}

/**
 * Ensures that a participant is provided, either via context or explicitly as a parameter.
 * Falls back to the track reference context's participant if available.
 * Throws if no participant is found.
 * @public
 */
export function useEnsureParticipant(participant?: Participant): Participant {
	const context = getMaybeParticipantContext();
	const trackContext = getMaybeTrackRefContext();
	const p = participant ?? context ?? trackContext?.participant;
	if (!p) {
		throw new Error(
			'No participant provided, make sure you are inside a participant context or pass the participant explicitly',
		);
	}
	return p;
}
