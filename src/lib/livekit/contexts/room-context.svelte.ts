import { getContext, setContext } from 'svelte';
import type { Room } from 'livekit-client';

const ROOM_CONTEXT_KEY = Symbol('livekit-room');

/**
 * Set the Room in the current Svelte component tree.
 * @public
 */
export function setRoomContext(room: Room): void {
	setContext(ROOM_CONTEXT_KEY, room);
}

/**
 * Get the Room from the current Svelte component tree.
 * Throws if no room is provided.
 * @public
 */
export function getRoomContext(): Room {
	const ctx = getContext<Room | undefined>(ROOM_CONTEXT_KEY);
	if (!ctx) {
		throw new Error('tried to access room context outside of livekit room component');
	}
	return ctx;
}

/**
 * Get the Room from the current Svelte component tree.
 * Returns `undefined` if not found.
 * @public
 */
export function getMaybeRoomContext(): Room | undefined {
	return getContext<Room | undefined>(ROOM_CONTEXT_KEY);
}

/**
 * Ensures that a room is provided, either via context or explicitly as a parameter.
 * Throws if no room is found.
 * @public
 */
export function useEnsureRoom(room?: Room): Room {
	const context = getMaybeRoomContext();
	const r = room ?? context;
	if (!r) {
		throw new Error(
			'No room provided, make sure you are inside a Room context or pass the room explicitly',
		);
	}
	return r;
}
