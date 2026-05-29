import { createIsSpeakingObserver } from "@livekit/components-core";
import type { Participant } from "livekit-client";
import { useEnsureParticipant } from "$lib/livekit/contexts";

/**
 * The `useIsSpeaking` hook returns a boolean that indicates if the participant is speaking.
 *
 * @public
 */
type ParticipantSource = Participant | (() => Participant);

function resolveParticipant(source: ParticipantSource | undefined): Participant {
	if (source === undefined) {
		return useEnsureParticipant();
	}
	return typeof source === "function" ? source() : source;
}

export function useIsSpeaking(explicitParticipant?: ParticipantSource): boolean {
	let isSpeaking = $state(false);

	$effect(() => {
		const participant = resolveParticipant(explicitParticipant);
		isSpeaking = participant.isSpeaking;
		const subscription = createIsSpeakingObserver(participant).subscribe((next) => {
			isSpeaking = next;
		});
		return () => subscription.unsubscribe();
	});

	return isSpeaking;
}
