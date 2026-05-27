import { connectedParticipantsObserver } from "@livekit/components-core";
import type { RemoteParticipant, Room } from "livekit-client";
import { getMaybeRoomContext } from "../contexts/room-context.svelte.js";

/**
 * Returns a reactive array of remote participants.
 *
 * @public
 */
export function useRemoteParticipants(explicitRoom?: Room): RemoteParticipant[] {
	let participants = $state<RemoteParticipant[]>([]);

	$effect(() => {
		const room = explicitRoom ?? getMaybeRoomContext();
		if (!room) {
			participants = [];
			return;
		}

		let active = true;
		const subscription = connectedParticipantsObserver(room).subscribe((next) => {
			if (active) participants = next;
		});

		return () => {
			active = false;
			subscription.unsubscribe();
		};
	});

	return participants;
}
