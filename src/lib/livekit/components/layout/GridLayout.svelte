<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { useGridLayout } from '../../hooks/useGridLayout.svelte';
	import { usePagination } from '../../hooks/usePagination.svelte';
	import { useSwipe } from '../../hooks/useSwipe.svelte';
	import TrackLoop from '../TrackLoop.svelte';
	import PaginationControl from '../controls/PaginationControl.svelte';
	import PaginationIndicator from '../controls/PaginationIndicator.svelte';

	let {
		tracks,
		children,
		class: className = '',
		...rest
	}: {
		tracks: TrackReferenceOrPlaceholder[];
		children: Snippet;
		class?: string;
	} & Record<string, unknown> = $props();

	let gridEl: HTMLDivElement | null = null;

	const { layout } = useGridLayout(() => gridEl, () => tracks.length);
	const pagination = usePagination(() => layout.maxTiles, () => tracks);

	useSwipe(() => gridEl ?? undefined, {
		onLeftSwipe: pagination.nextPage,
		onRightSwipe: pagination.prevPage,
	});
</script>

<div
	bind:this={gridEl}
	class="lk-grid-layout {className}"
	data-lk-pagination={pagination.totalPageCount > 1}
	{...rest}
>
	<TrackLoop tracks={pagination.tracks}>
		{@render children()}
	</TrackLoop>
	{#if tracks.length > layout.maxTiles}
		<PaginationIndicator
			totalPageCount={pagination.totalPageCount}
			currentPage={pagination.currentPage}
		/>
		<PaginationControl
			pagesContainer={gridEl ?? undefined}
			currentPage={pagination.currentPage}
			totalPageCount={pagination.totalPageCount}
			nextPage={pagination.nextPage}
			prevPage={pagination.prevPage}
		/>
	{/if}
</div>
