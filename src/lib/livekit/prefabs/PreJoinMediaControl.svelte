<script lang="ts">
	import { DropdownMenu, Toggle } from "bits-ui";

	let {
		kind,
		enabled,
		label,
		devices = [],
		selectedDeviceId = "",
		onToggle,
		onSelectDevice,
	}: {
		kind: "mic" | "camera";
		enabled: boolean;
		label: string;
		devices?: MediaDeviceInfo[];
		selectedDeviceId?: string;
		onToggle: (enabled: boolean) => void;
		onSelectDevice: (deviceId: string) => void;
	} = $props();

	const icon = $derived(
		kind === "mic" ? (enabled ? "mic" : "mic_off") : enabled ? "videocam" : "videocam_off",
	);

	const hasDeviceMenu = $derived(devices.length > 1);
	const activeDeviceId = $derived(
		devices.some((d) => d.deviceId === selectedDeviceId)
			? selectedDeviceId
			: (devices[0]?.deviceId ?? ""),
	);
</script>

<div class="lk-prejoin__media" class:lk-prejoin__media--on={enabled} data-kind={kind}>
	<Toggle.Root pressed={enabled} onPressedChange={onToggle} aria-label={label}>
		{#snippet child({ props, pressed })}
			<button
				{...props}
				type="button"
				class="lk-button lk-track-toggle lk-prejoin__toggle"
				class:lk-prejoin__toggle--on={pressed}
				aria-pressed={pressed}
			>
				<span class="material-symbols-rounded lk-track-toggle__icon" aria-hidden="true">{icon}</span>
				<span class="lk-prejoin__toggle-label">{label}</span>
			</button>
		{/snippet}
	</Toggle.Root>

	{#if hasDeviceMenu}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class="lk-button lk-prejoin__device-trigger"
						aria-label={`${label} — בחירת מכשיר`}
					>
						<span class="lk-prejoin__device-label">
							{devices.find((d) => d.deviceId === activeDeviceId)?.label ?? label}
						</span>
						<span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content class="hb-dropdown-content lk-prejoin__device-menu" side="bottom" align="start" sideOffset={6}>
					<DropdownMenu.RadioGroup
						value={activeDeviceId}
						onValueChange={(value) => {
							if (value) onSelectDevice(value);
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
	{/if}
</div>

<style>
	.lk-prejoin__media {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.lk-prejoin__toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 2.5rem;
		padding-inline: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-pill);
		background: var(--muted);
		color: var(--foreground);
		font: inherit;
		font-size: var(--step--1);
		font-weight: 600;
		cursor: pointer;
	}

	.lk-prejoin__toggle--on {
		background: var(--accent-subtle);
		border-color: color-mix(in oklch, var(--accent) 40%, var(--border-color));
		color: var(--primary);
	}

	.lk-prejoin__toggle-label {
		white-space: nowrap;
	}

	.lk-prejoin__device-trigger {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 2.5rem;
		max-width: min(16rem, 42vw);
		padding-inline: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-pill);
		background: var(--card);
		color: var(--foreground);
		font: inherit;
		font-size: var(--step--1);
		cursor: pointer;
	}

	.lk-prejoin__device-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.lk-prejoin__device-trigger .material-symbols-rounded {
		--icon-size: 1.125rem;
		flex-shrink: 0;
	}

	.lk-track-toggle__icon {
		--icon-size: 1.25rem;
	}
</style>
