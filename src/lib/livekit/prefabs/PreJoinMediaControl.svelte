<script lang="ts">
	import { DropdownMenu, Toggle } from 'bits-ui';

	let {
		kind,
		enabled,
		label,
		noDeviceLabel,
		devices = [],
		selectedDeviceId = '',
		onToggle,
		onSelectDevice,
		onEnableFailed,
	}: {
		kind: 'mic' | 'camera';
		enabled: boolean;
		label: string;
		noDeviceLabel: string;
		devices?: MediaDeviceInfo[];
		selectedDeviceId?: string;
		onToggle: (enabled: boolean) => void;
		onSelectDevice: (deviceId: string) => void;
		/** Called when user turns on but no input devices are available. */
		onEnableFailed?: () => void;
	} = $props();

	const icon = $derived(
		kind === 'mic' ? (enabled ? 'mic' : 'mic_off') : enabled ? 'videocam' : 'videocam_off',
	);

	const hasDevices = $derived(devices.length > 0);
	const activeDeviceId = $derived(
		devices.some((d) => d.deviceId === selectedDeviceId)
			? selectedDeviceId
			: (devices[0]?.deviceId ?? ''),
	);
	const activeLabel = $derived(
		hasDevices
			? (devices.find((d) => d.deviceId === activeDeviceId)?.label ?? label)
			: noDeviceLabel,
	);

	async function handleToggle(next: boolean) {
		if (next && !hasDevices) {
			onEnableFailed?.();
			return;
		}
		onToggle(next);
	}

	function handlePressedChange(v: boolean) {
		void handleToggle(v);
	}

	function handleValueChange(value: string) {
		if (value) onSelectDevice(value);
	}
</script>

<div class="lk-prejoin__media" class:lk-prejoin__media--on={enabled} data-kind={kind}>
	<Toggle.Root pressed={enabled} onPressedChange={handlePressedChange} aria-label={label}>
		{#snippet child({ props, pressed })}
			<button
				{...props}
				type="button"
				class="lk-button lk-track-toggle lk-prejoin__toggle"
				class:lk-prejoin__toggle--on={pressed}
				aria-pressed={pressed}
			>
				<span class="material-symbols-rounded lk-track-toggle__icon" aria-hidden="true">{icon}</span>
			</button>
		{/snippet}
	</Toggle.Root>

	{#if hasDevices}
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
						onValueChange={handleValueChange}
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
		<div class="lk-prejoin__device-static" aria-live="polite">
			<span class="lk-prejoin__device-kind">{label}</span>
			<span class="lk-prejoin__device-label">{activeLabel}</span>
		</div>
	{/if}
</div>

<style>
	.lk-prejoin__media {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		min-width: 0;
	}

	.lk-prejoin__toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border: var(--border);
		border-radius: var(--radius-pill);
		background: var(--muted);
		color: var(--foreground);
		cursor: pointer;
	}

	.lk-prejoin__toggle--on {
		background: var(--accent-subtle);
		border-color: color-mix(in oklch, var(--accent) 40%, var(--border-color));
		color: var(--primary);
	}

	.lk-prejoin__device-trigger--wide,
	.lk-prejoin__device-static {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 2.5rem;
		width: 100%;
		min-width: 0;
		padding-inline: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-md);
		background: var(--card);
		color: var(--foreground);
		font: inherit;
		font-size: var(--step--1);
	}

	.lk-prejoin__device-trigger--wide {
		cursor: pointer;
		justify-content: space-between;
	}

	.lk-prejoin__device-static {
		opacity: 0.85;
	}

	.lk-prejoin__device-kind {
		flex-shrink: 0;
		font-weight: 700;
		color: var(--foreground-muted);
	}

	.lk-prejoin__device-label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: start;
	}

	.lk-prejoin__device-trigger--wide .material-symbols-rounded {
		--icon-size: 1.125rem;
		flex-shrink: 0;
	}

	.lk-track-toggle__icon {
		--icon-size: 1.25rem;
	}
</style>
