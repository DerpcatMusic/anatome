import { createIsSpeakingObserver } from "@livekit/components-core";
import type { Participant } from "livekit-client";
import { useEnsureParticipant } from "$lib/livekit/contexts";

/**
 * The `useIsSpeaking` hook returns a boolean that indicates if the participant is speaking.
 *
 * @public
 */
export function useIsSpeaking(explicitParticipant?: Participant): boolean {
	let isSpeaking = $state(false);

	$effect(() => {
		const participant = explicitParticipant ?? useEnsureParticipant();
		isSpeaking = participant.isSpeaking;
		const subscription = createIsSpeakingObserver(participant).subscribe((next) => {
			isSpeaking = next;
		});
		return () => subscription.unsubscribe();
	});

	return isSpeaking;
}
