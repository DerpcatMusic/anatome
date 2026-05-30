import { Context } from "runed";
import type { Room } from "livekit-client";

export const roomCtx = new Context<Room>("livekit-room");

/**
 * Ensures that a room is provided, either via context or explicitly as a parameter.
 * Throws if no room is found.
 * @public
 */
export function useEnsureRoom(room?: Room): Room {
	const r = room ?? roomCtx.getOr(undefined);
	if (!r) {
		throw new Error(
			'No room provided, make sure you are inside a Room context or pass the room explicitly',
		);
	}
	return r;
}
