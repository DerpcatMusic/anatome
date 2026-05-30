<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import {
		isAudioOutputSelectionSupported,
		audioOutputPref,
	} from '$lib/media/audio-output';

	let {
		label,
		speakerHintSupported,
		speakerHintUnsupported,
		devices = [],
	}: {
		label: string;
		speakerHintSupported: string;
		speakerHintUnsupported: string;
		devices?: MediaDeviceInfo[];
	} = $props();

	const supported = isAudioOutputSelectionSupported();
	let selectedDeviceId = $state(audioOutputPref.current);

	const activeDeviceId = $derived(
		devices.some((d) => d.deviceId === selectedDeviceId)
			? selectedDeviceId
			: (devices[0]?.deviceId ?? ''),
	);

	const activeLabel = $derived(
		devices.find((d) => d.deviceId === activeDeviceId)?.label || label,
	);

	const hasMenu = $derived(supported && devices.length > 0);

	function selectDevice(deviceId: string) {
		selectedDeviceId = deviceId;
		audioOutputPref.current = deviceId;
	}
</script>

<div class="lk-prejoin__media lk-prejoin__media--speaker" data-kind="speaker">
	<div class="lk-prejoin__speaker-icon" aria-hidden="true">
		<span class="material-symbols-rounded">volume_up</span>
	</div>

	{#if hasMenu}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class="lk-button lk-prejoin__device-trigger lk-prejoin__device-trigger--wide"
						aria-label={`${label} — בחירת מכשיר`}
					>
						<span class="lk-prejoin__device-kind">{label}</span>
						<span class="lk-prejoin__device-label">{activeLabel}</span>
						<span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					class="hb-dropdown-content lk-prejoin__device-menu"
					side="bottom"
					align="start"
					sideOffset={6}
				>
					<DropdownMenu.RadioGroup
						value={activeDeviceId}
						onValueChange={(value) => {
							if (value) selectDevice(value);
						}}
					>
						{#each devices as device (device.deviceId)}
							<DropdownMenu.RadioItem
								class="hb-dropdown-item"
								value={device.deviceId}
								textValue={device.label || device.deviceId}
							>
								{device.label || device.deviceId}
							</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	{:else}
		<p class="lk-prejoin__speaker-hint" role="note">
			{supported ? speakerHintSupported : speakerHintUnsupported}
		</p>
	{/if}
</div>

<style>
	.lk-prejoin__media--speaker {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-2);
		width: 100%;
	}

	.lk-prejoin__speaker-icon {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-pill);
		background: var(--muted);
		border: var(--border);
		color: var(--foreground-muted);
	}

	.lk-prejoin__speaker-icon .material-symbols-rounded {
		--icon-size: 1.25rem;
	}

	.lk-prejoin__device-trigger--wide {
		width: 100%;
		max-width: none;
		justify-content: space-between;
	}

	.lk-prejoin__device-kind {
		font-weight: 700;
		color: var(--foreground-muted);
		flex-shrink: 0;
	}

	.lk-prejoin__speaker-hint {
		margin: 0;
		font-size: var(--step--2);
		line-height: 1.45;
		color: var(--foreground-muted);
	}
</style>
