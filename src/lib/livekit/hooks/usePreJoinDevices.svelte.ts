import { Room } from "livekit-client";

/** Enumerate local media devices for standalone PreJoin (no LiveKitRoom context). */
export function usePreJoinDevices() {
	let audioInputDevices = $state<MediaDeviceInfo[]>([]);
	let videoInputDevices = $state<MediaDeviceInfo[]>([]);
	let audioOutputDevices = $state<MediaDeviceInfo[]>([]);

	async function refresh(requestPermissions: boolean) {
		if (typeof window === "undefined" || !navigator.mediaDevices) return;
		try {
			const [audio, video, output] = await Promise.all([
				Room.getLocalDevices("audioinput", requestPermissions),
				Room.getLocalDevices("videoinput", requestPermissions),
				Room.getLocalDevices("audiooutput", false),
			]);
			audioInputDevices = audio;
			videoInputDevices = video;
			audioOutputDevices = output;
		} catch {
			/* PreJoin surfaces errors via createLocalTracks / onError */
		}
	}

	$effect(() => {
		if (typeof window === "undefined" || !navigator.mediaDevices) return;

		void refresh(false);

		const onDeviceChange = () => {
			void refresh(true);
		};
		navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
		return () => {
			navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
		};
	});

	return {
		get audioInputDevices() {
			return audioInputDevices;
		},
		get videoInputDevices() {
			return videoInputDevices;
		},
		get audioOutputDevices() {
			return audioOutputDevices;
		},
		refresh,
	};
}
