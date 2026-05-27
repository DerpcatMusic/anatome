import type { Room, RoomEvent, Participant } from "livekit-client";
import { useLocalParticipant } from "./useLocalParticipant.svelte";
import { useRemoteParticipants } from "./useRemoteParticipants.svelte";

export interface UseParticipantsOptions {
	/**
	 * To optimize performance, you can use the `updateOnlyOn` property to decide on what RoomEvents the hook updates.
	 * By default it updates on all relevant RoomEvents to keep the returned participants array up to date.
	 * The minimal set of non-overwriteable `RoomEvents` is:
	 * `[RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.ConnectionStateChanged]`
	 */
	updateOnlyOn?: RoomEvent[];
	/**
	 * The room to use. If not provided, the hook will use the room from the context.
	 */
	room?: Room;
}

/**
 * The `useParticipants` hook returns all participants (local and remote) of the current room.
 *
 * @example
 * ```svelte
 * const participants = useParticipants();
 * <ParticipantLoop {participants}>
 *   <ParticipantName />
 * </ParticipantLoop>
 * ```
 * @public
 */
export function useParticipants(options: UseParticipantsOptions = {}): Participant[] {
	const localParticipant = useLocalParticipant(options.room);
	const remoteParticipants = useRemoteParticipants(options.room);

	let participants = $state<Participant[]>([localParticipant]);

	$effect(() => {
		participants = [localParticipant, ...remoteParticipants];
	});

	return participants;
}
