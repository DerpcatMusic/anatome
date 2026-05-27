import { Room, RoomEvent } from "livekit-client";
import { getMaybeRoomContext } from "../contexts/room-context.svelte.js";

export interface UseStartAudioProps {
	room?: Room;
}

export function useStartAudio({ room }: UseStartAudioProps = {}) {
	const roomContext = getMaybeRoomContext();
	const roomFallback = room ?? roomContext;
	let canPlayAudio = $state(false);

	$effect(() => {
		if (!roomFallback) return;
		const updateAudioAbility = () => {
			canPlayAudio = roomFallback.canPlaybackAudio;
		};
		updateAudioAbility();
		roomFallback.on(RoomEvent.AudioPlaybackStatusChanged, updateAudioAbility);
		return () => {
			roomFallback.off(RoomEvent.AudioPlaybackStatusChanged, updateAudioAbility);
		};
	});

	async function startAudio() {
		await roomFallback?.startAudio();
	}

	return {
		canPlayAudio,
		buttonProps: {
			class: "lk-start-audio",
			"data-lk-audio-playback": canPlayAudio,
			onclick: startAudio,
		},
	};
}
