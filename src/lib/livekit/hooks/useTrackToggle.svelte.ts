import type { ToggleSource, CaptureOptionsBySource } from "@livekit/components-core";
import { setupMediaToggle, setupManualToggle, log } from "@livekit/components-core";
import type { Room, TrackPublishOptions } from "livekit-client";
import { roomCtx } from "../contexts/room-context.svelte.js";
import { useObservableState } from "./internal/useObservableState.svelte";

export interface UseTrackToggleProps<T extends ToggleSource> {
	source: T;
	onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
	initialState?: boolean;
	captureOptions?: CaptureOptionsBySource<T>;
	publishOptions?: TrackPublishOptions;
	onDeviceError?: (error: Error) => void;
	room?: Room;
}

export function useTrackToggle<T extends ToggleSource>({
	source,
	onChange,
	initialState,
	captureOptions,
	publishOptions,
	onDeviceError,
	room,
	...rest
}: UseTrackToggleProps<T> & Record<string, unknown>) {
	const roomFromContext = roomCtx.getOr(undefined);
	const roomFallback = room ?? roomFromContext;
	const track = roomFallback?.localParticipant?.getTrackPublication(source);
	let userInteraction = $state(false);
	let appliedInitialState = $state(false);

	const { toggle, className, pendingObserver, enabledObserver } = roomFallback
		? setupMediaToggle(source, roomFallback, captureOptions, publishOptions, onDeviceError)
		: setupManualToggle();

	const pending = useObservableState(pendingObserver, false);
	const enabled = useObservableState(enabledObserver, initialState ?? !!track?.isEnabled);

	$effect(() => {
		const isEnabled = enabled;
		const wasUserInitiated = userInteraction;
		onChange?.(isEnabled, wasUserInitiated);
		if (wasUserInitiated) {
			userInteraction = false;
		}
	});

	$effect(() => {
		const state = initialState;
		if (appliedInitialState || state === undefined) return;
		appliedInitialState = true;
		log.debug("forcing initial toggle state", source, state);
		void toggle(state);
	});

	function clickHandler(evt: MouseEvent) {
		userInteraction = true;
		toggle().catch(() => {
			userInteraction = false;
		});
		if (typeof rest.onclick === "function") {
			(rest.onclick as (e: MouseEvent) => void)(evt);
		}
	}

	return {
		toggle,
		get enabled() {
			return enabled;
		},
		get pending() {
			return pending;
		},
		track,
		get buttonProps() {
			const mergedClass =
				`${(rest?.class as string) ?? ""} ${className}`.trim() || className;
			return {
				...rest,
				class: mergedClass,
				"aria-pressed": enabled,
				"data-lk-source": source,
				"data-lk-enabled": enabled,
				disabled: pending,
				onclick: clickHandler,
			};
		},
	};
}
