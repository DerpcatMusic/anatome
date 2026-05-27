<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getScrollBarWidth } from '@livekit/components-core';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { useResizeObserver } from '../../hooks/internal/useResizeObserver.svelte';
	import { useVisualStableUpdate } from '../../hooks/useVisualStableUpdate.svelte';
	import TrackLoop from '../TrackLoop.svelte';

	const MIN_HEIGHT = 130;
	const MIN_WIDTH = 140;
	const MIN_VISIBLE_TILES = 1;
	const ASPECT_RATIO = 16 / 10;
	const ASPECT_RATIO_INVERT = (1 - ASPECT_RATIO) * -1;

	let {
		tracks,
		orientation,
		children,
		class: className = '',
		...rest
	}: {
		tracks: TrackReferenceOrPlaceholder[];
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
		class?: string;
	} & Record<string, unknown> = $props();

	let asideEl = $state<HTMLElement | null>(null);
	let prevTiles = $state(0);

	const { width, height } = useResizeObserver(() => asideEl);

	const carouselOrientation = $derived(
		orientation ?? (height >= width ? 'vertical' : 'horizontal'),
	);

	const tileSpan = $derived(
		carouselOrientation === 'vertical'
			? Math.max(width * ASPECT_RATIO_INVERT, MIN_HEIGHT)
			: Math.max(height * ASPECT_RATIO, MIN_WIDTH),
	);

	const scrollBarWidth = getScrollBarWidth();

	const tilesThatFit = $derived(
		carouselOrientation === 'vertical'
			? Math.max((height - scrollBarWidth) / tileSpan, MIN_VISIBLE_TILES)
			: Math.max((width - scrollBarWidth) / tileSpan, MIN_VISIBLE_TILES),
	);

	let maxVisibleTiles = $state(MIN_VISIBLE_TILES);

	$effect(() => {
		let count = Math.round(tilesThatFit);
		if (Math.abs(tilesThatFit - prevTiles) < 0.5) {
			count = Math.round(prevTiles);
		} else if (prevTiles !== tilesThatFit) {
			prevTiles = tilesThatFit;
		}
		maxVisibleTiles = count;
	});

	const sortedTiles = useVisualStableUpdate(tracks, maxVisibleTiles);

	$effect(() => {
		if (!asideEl) return;
		asideEl.dataset.lkOrientation = carouselOrientation;
		asideEl.style.setProperty('--lk-max-visible-tiles', String(maxVisibleTiles));
	});
</script>

<aside
	bind:this={asideEl}
	class="lk-carousel {className}"
	data-lk-orientation={carouselOrientation}
	{...rest}
>
	<TrackLoop tracks={sortedTiles}>
		{@render children()}
	</TrackLoop>
</aside>
