<script lang="ts">
	import { RoomEvent, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
	import { roomCtx } from '../../contexts/room-context.svelte.js';
	import { Previous } from "runed";
	import { useMediaDeviceSelect } from '../../hooks/useMediaDeviceSelect.svelte';

	let {
		kind,
		initialSelection,
		onActiveDeviceChange,
		onDeviceListChange,
		onDeviceSelectError,
		exactMatch = true,
		track,
		requestPermissions,
		onError,
		disabled = false,
		class: className = '',
	}: {
		kind: MediaDeviceKind;
		initialSelection?: string;
		onActiveDeviceChange?: (deviceId: string) => void;
		onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
		onDeviceSelectError?: (e: Error) => void;
		exactMatch?: boolean;
		track?: LocalAudioTrack | LocalVideoTrack;
		requestPermissions?: boolean;
		onError?: (e: Error) => void;
		disabled?: boolean;
		class?: string;
	} = $props();

	const room = roomCtx.getOr(undefined);

	function handleError(e: Error) {
		if (room) {
			room.emit(RoomEvent.MediaDevicesError, e);
		}
		onError?.(e);
	}

	// svelte-ignore state_referenced_locally
	const { devices, activeDeviceId, setActiveMediaDevice, className: hookClassName } =
		useMediaDeviceSelect({
			kind,
			track,
			requestPermissions,
			onError: handleError,

		});

	const prevDeviceId = new Previous(() => activeDeviceId, 'default');

	$effect(() => {
		if (initialSelection !== undefined) {
			void setActiveMediaDevice(initialSelection);
		}
	});

	$effect(() => {
		onDeviceListChange?.(devices);
	});

	$effect(() => {
		if (activeDeviceId !== prevDeviceId.current) {
			onActiveDeviceChange?.(activeDeviceId);
		}
	});

	const hasDefault = $derived(
		devices.some((info) => info.label.toLowerCase().startsWith('default')),
	);

	function isActive(deviceId: string, activeId: string, index: number) {
		return deviceId === activeId || (!hasDefault && index === 0 && activeId === 'default');
	}

	async function handleActiveDeviceChange(deviceId: string) {
		try {
			await setActiveMediaDevice(deviceId, { exact: exactMatch });
		} catch (e) {
			if (e instanceof Error) {
				onDeviceSelectError?.(e);
			} else {
				throw e;
			}
		}
	}
</script>

<ul class="lk-list lk-media-device-select {hookClassName} {className}" role="listbox" aria-disabled={disabled}>
	{#each devices as device, index (device.deviceId)}
		<li
			id={device.deviceId}
			data-lk-active={isActive(device.deviceId, activeDeviceId, index)}
			aria-selected={isActive(device.deviceId, activeDeviceId, index)}
			role="option"
		>
			<button
				type="button"
				class="lk-button"
				{disabled}
				onclick={() => handleActiveDeviceChange(device.deviceId)}
			>
				{device.label || device.deviceId}
			</button>
		</li>
	{/each}
</ul>
