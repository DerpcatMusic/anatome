import { observeParticipantMedia } from "@livekit/components-core";
import type { ParticipantMedia } from "@livekit/components-core";
import type { Participant } from "livekit-client";
import { useEnsureParticipant } from "$lib/livekit/contexts";

/**
 * Returns reactive media state (camera, microphone, screen share tracks) for a participant.
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

export function useParticipantMedia(explicitParticipant?: ParticipantSource): ParticipantMedia {
	let media = $state<ParticipantMedia>({
		isCameraEnabled: false,
		isMicrophoneEnabled: false,
		isScreenShareEnabled: false,
		participant: {} as Participant,
	});

	$effect(() => {
		const participant = resolveParticipant(explicitParticipant);
		const subscription = observeParticipantMedia(participant).subscribe((next) => {
			media = next;
		});
		return () => subscription.unsubscribe();
	});

	return media;
}
