<script lang="ts">
	import type { ToggleSource } from "@livekit/components-core";
	import type { Snippet } from "svelte";
	import { Toggle, Tooltip } from "bits-ui";
	import { useTrackToggle } from "../../hooks/useTrackToggle.svelte";

	let {
		source,
		showIcon = true,
		initialState,
		onChange,
		captureOptions,
		publishOptions,
		onDeviceError,
		class: className = '',
		children,
	}: {
		source: ToggleSource;
		showIcon?: boolean;
		initialState?: boolean;
		onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
		captureOptions?: Record<string, unknown>;
		publishOptions?: Record<string, unknown>;
		onDeviceError?: (error: Error) => void;
		class?: string;
		children?: Snippet;
	} = $props();

	const { enabled, pending, buttonProps } = useTrackToggle({
		source,
		initialState,
		onChange,
		captureOptions,
		publishOptions,
		onDeviceError,
	});

	const userChildren = children;

	const iconName = $derived.by(() => {
		if (source === "microphone") return enabled ? "mic" : "mic_off";
		if (source === "camera") return enabled ? "videocam" : "videocam_off";
		if (source === "screen_share") return enabled ? "stop_screen_share" : "present_to_all";
		return "tune";
	});

	const sourceLabelMap: Record<ToggleSource, string> = {
		microphone: 'מיקרופון',
		camera: 'מצלמה',
		screen_share: 'שיתוף מסך',
	};
</script>

<Tooltip.Root delayDuration={0}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Toggle.Root
				{...props}
				type="button"
				pressed={enabled}
				onPressedChange={(_p) => buttonProps.onclick?.(new MouseEvent('click'))}
				disabled={buttonProps.disabled}
				class="lk-button lk-track-toggle {buttonProps.class} {className}"
				data-lk-source={buttonProps['data-lk-source']}
				data-lk-enabled={buttonProps['data-lk-enabled']}
				aria-busy={pending}
			>
				{#snippet children()}
					{#if showIcon}
						<span class="material-symbols-rounded lk-track-toggle__icon" aria-hidden="true">
							{iconName}
						</span>
					{/if}
					{#if userChildren}
						{@render userChildren()}
					{/if}
				{/snippet}
			</Toggle.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content side="top" sideOffset={4}>
		{enabled ? `כיבוי ${sourceLabelMap[source]}` : `הפעלת ${sourceLabelMap[source]}`}
	</Tooltip.Content>
</Tooltip.Root>

<style>
	.lk-track-toggle__icon {
		--icon-size: 1.25rem;
		--icon-opsz: 24;
	}
</style>
