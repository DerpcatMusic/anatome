import type { LocalParticipant, Room } from "livekit-client";
import { getMaybeRoomContext } from "../contexts/room-context.svelte.js";

/**
 * Returns the local participant from the room context.
 *
 * @public
 */
export function useLocalParticipant(explicitRoom?: Room): LocalParticipant {
	const room = explicitRoom ?? getMaybeRoomContext();
	if (!room) {
		throw new Error("useLocalParticipant: no room found in context");
	}
	return room.localParticipant;
}
