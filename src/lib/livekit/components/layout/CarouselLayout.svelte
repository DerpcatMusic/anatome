<script lang="ts">
import type { Snippet } from 'svelte';
	import { ElementSize, Previous } from "runed";
	import { getScrollBarWidth } from '@livekit/components-core';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
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

	const asideSize = new ElementSize(() => asideEl, { box: "content-box" });

	const carouselOrientation = $derived(
		orientation ?? (asideSize.height >= asideSize.width ? 'vertical' : 'horizontal'),
	);

	const tileSpan = $derived(
		carouselOrientation === 'vertical'
			? Math.max(asideSize.width * ASPECT_RATIO_INVERT, MIN_HEIGHT)
			: Math.max(asideSize.height * ASPECT_RATIO, MIN_WIDTH),
	);

	const scrollBarWidth = getScrollBarWidth();

	const tilesThatFit = $derived(
		carouselOrientation === 'vertical'
			? Math.max((asideSize.height - scrollBarWidth) / tileSpan, MIN_VISIBLE_TILES)
			: Math.max((asideSize.width - scrollBarWidth) / tileSpan, MIN_VISIBLE_TILES),
	);

	const prevTilesFit = new Previous(() => tilesThatFit, MIN_VISIBLE_TILES);

	let maxVisibleTiles = $state(MIN_VISIBLE_TILES);

	$effect(() => {
		let count = Math.round(tilesThatFit);
		const prev = prevTilesFit.current ?? MIN_VISIBLE_TILES;
		if (Math.abs(tilesThatFit - prev) < 0.5) {
			count = Math.round(prev);
		}
		maxVisibleTiles = count;
	});

	// svelte-ignore state_referenced_locally
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
