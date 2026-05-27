<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { Toggle, Tooltip } from 'bits-ui';
	import { getMaybeTrackRefContext } from '../../contexts/track-ref-context.svelte.js';
	import { getMaybeLayoutContext } from '../../contexts/layout-context.svelte.js';
	import { useFocusToggle } from '../../hooks/useFocusToggle.svelte';

	let {
		trackRef,
		class: className = '',
		children,
	}: {
		trackRef?: TrackReferenceOrPlaceholder;
		class?: string;
		children?: import('svelte').Snippet;
	} = $props();

	const trackRefFromContext = getMaybeTrackRefContext();
	const layoutContext = getMaybeLayoutContext();

	const { mergedProps, inFocus } = useFocusToggle({
		trackRef: trackRef ?? trackRefFromContext,
		props: { class: className },
	});

	const userChildren = children;
</script>

{#if layoutContext !== undefined}
	<Tooltip.Root delayDuration={0}>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Toggle.Root
					{...props}
					type="button"
					pressed={inFocus}
					onPressedChange={(_p) => mergedProps.onclick?.(new MouseEvent('click'))}
					class={mergedProps.class}
					aria-label={inFocus ? 'Unpin participant' : 'Pin participant'}
				>
					{#snippet children({ pressed })}
						{#if userChildren}
							{@render userChildren()}
						{:else if pressed}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="none"
								aria-hidden="true"
							>
								<g
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
								>
									<path d="M13.25 7H9m0 0V2.75M9 7l5.25-5.25M2.75 9H7m0 0v4.25M7 9l-5.25 5.25" />
								</g>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="none"
								aria-hidden="true"
							>
								<g
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
								>
									<path d="M10 1.75h4.25m0 0V6m0-4.25L9 7M6 14.25H1.75m0 0V10m0 4.25L7 9" />
								</g>
							</svg>
						{/if}
					{/snippet}
				</Toggle.Root>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content side="top" sideOffset={4}>
			{inFocus ? 'Unpin participant' : 'Pin participant'}
		</Tooltip.Content>
	</Tooltip.Root>
{/if}

<style>
	:global(.lk-focus-toggle-button) {
		display: inline-grid;
		place-items: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border: none;
		border-radius: var(--radius-md);
		background: var(--glass-bg, rgba(0, 0, 0, 0.4));
		color: var(--foreground);
		font: inherit;
		cursor: pointer;
		transition: background var(--duration-fast);
		backdrop-filter: blur(var(--glass-blur, 8px));
	}

	:global(.lk-focus-toggle-button:hover) {
		background: var(--muted);
	}
</style>
