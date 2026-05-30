import { participantInfoObserver } from "@livekit/components-core";
import type { Participant } from "livekit-client";
import { participantCtx } from "$lib/livekit/contexts";
import { useObservableState } from "./internal/useObservableState.svelte";

export interface UseParticipantInfoOptions {
	participant?: Participant;
}

export type ParticipantInfo = {
	name: string | undefined;
	identity: string;
	metadata: string | undefined;
};

/**
 * The `useParticipantInfo` hook returns the identity, name, and metadata of a given participant.
 *
 * @public
 */
export function useParticipantInfo(options: UseParticipantInfoOptions = {}): ParticipantInfo {
	const context = participantCtx.getOr(undefined);
	const p = options.participant ?? context;
	const infoObserver = p ? participantInfoObserver(p) : undefined;
	const initial: ParticipantInfo = {
		name: p?.name,
		identity: p?.identity ?? "",
		metadata: p?.metadata,
	};
	return useObservableState(infoObserver, initial);
}
