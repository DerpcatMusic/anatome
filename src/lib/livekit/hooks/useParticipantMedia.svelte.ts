import { observeParticipantMedia } from "@livekit/components-core";
import type { ParticipantMedia } from "@livekit/components-core";
import type { Participant } from "livekit-client";
import { useEnsureParticipant } from "$lib/livekit/contexts";

/**
 * Returns reactive media state (camera, microphone, screen share tracks) for a participant.
 *
 * @public
 */
export function useParticipantMedia(explicitParticipant?: Participant): ParticipantMedia {
	let media = $state<ParticipantMedia>({
		isCameraEnabled: false,
		isMicrophoneEnabled: false,
		isScreenShareEnabled: false,
		participant: explicitParticipant ?? ({} as Participant),
	});

	$effect(() => {
		const participant = explicitParticipant ?? useEnsureParticipant();
		const subscription = observeParticipantMedia(participant).subscribe((next) => {
			media = next;
		});
		return () => subscription.unsubscribe();
	});

	return media;
}
