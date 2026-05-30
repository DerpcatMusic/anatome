import { encryptionStatusObservable } from "@livekit/components-core";
import { LocalParticipant } from "livekit-client";
import type { Participant, Room } from "livekit-client";
import { useEnsureParticipant, useEnsureRoom } from "$lib/livekit/contexts";
import { useObservableState } from "./internal/useObservableState.svelte";

export interface UseIsEncryptedOptions {
	room?: Room;
}

/**
 * @alpha
 */
export function useIsEncrypted(
	participant?: Participant,
	options: UseIsEncryptedOptions = {},
): boolean {
	const p = useEnsureParticipant(participant);
	const room = useEnsureRoom(options.room);
	const observer = encryptionStatusObservable(room, p);
	const initial = p.isLocal
		? (p as LocalParticipant).isE2EEEnabled
		: !!p?.isEncrypted;
	return useObservableState(observer, initial);
}
