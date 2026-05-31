import { Context } from "runed";
import type { Participant } from "livekit-client";
import { trackRefCtx } from "./track-ref-context.svelte.js";

export const participantCtx = new Context<Participant>("livekit-participant");

export function setParticipantContext(participant: Participant): void {
	participantCtx.set(participant);
}

export function getMaybeParticipantContext(): Participant | undefined {
	return participantCtx.getOr(undefined);
}

/**
 * Ensures that a participant is provided, either via context or explicitly as a parameter.
 * Falls back to the track reference context's participant if available.
 * Throws if no participant is found.
 * @public
 */
export function useEnsureParticipant(participant?: Participant): Participant {
	const context = getMaybeParticipantContext();
	const trackContext = trackRefCtx.getOr(undefined);
	const p = participant ?? context ?? trackContext?.participant;
	if (!p) {
		throw new Error(
			'No participant provided, make sure you are inside a participant context or pass the participant explicitly',
		);
	}
	return p;
}
