import {
	createMediaDeviceObserver,
	setupDeviceSelector,
	log,
} from "@livekit/components-core";
import { Room, type LocalAudioTrack, type LocalVideoTrack } from "livekit-client";
import { roomCtx } from "../contexts/room-context.svelte.js";
import { useObservableState } from "./internal/useObservableState.svelte";

export interface UseMediaDeviceSelectProps {
	kind: MediaDeviceKind;
	room?: Room;
	track?: LocalAudioTrack | LocalVideoTrack;
	requestPermissions?: boolean;
	onError?: (e: Error) => void;
}

export function useMediaDeviceSelect({
	kind,
	room,
	track,
	requestPermissions,
	onError,
}: UseMediaDeviceSelectProps) {
	const roomContext = roomCtx.getOr(undefined);
	const roomForSelector = room ?? roomContext ?? new Room();

	const deviceObserver = createMediaDeviceObserver(kind, onError, requestPermissions);
	const devices = useObservableState(deviceObserver, [] as MediaDeviceInfo[]);

	let activeDeviceId = $state("default");

	const { className, activeDeviceObservable, setActiveMediaDevice } = setupDeviceSelector(
		kind,
		roomForSelector,
		track,
	);

	$effect(() => {
		const id = roomForSelector.getActiveDevice(kind);
		if (id) activeDeviceId = id;
	});

	$effect(() => {
		let active = true;
		const listener = activeDeviceObservable.subscribe((deviceId) => {
			if (!active || !deviceId) return;
			activeDeviceId = deviceId;
			log.info("setCurrentDeviceId", deviceId);
		});
		return () => {
			active = false;
			listener?.unsubscribe();
		};
	});

	return {
		devices,
		className,
		get activeDeviceId() {
			return activeDeviceId;
		},
		setActiveMediaDevice,
	};
}
