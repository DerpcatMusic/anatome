import { Room, RoomEvent } from "livekit-client";
import { roomCtx } from "../contexts/room-context.svelte.js";

export interface UseStartAudioProps {
	room?: Room;
}

export function useStartAudio({ room }: UseStartAudioProps = {}) {
	const roomContext = roomCtx.getOr(undefined);
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
		get canPlayAudio() {
			return canPlayAudio;
		},
		buttonProps: {
			class: "lk-start-audio",
			get "data-lk-audio-playback"() {
				return canPlayAudio;
			},
			onclick: startAudio,
		},
	};
}
