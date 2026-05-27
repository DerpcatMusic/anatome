<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { getTrackReferenceId } from '@livekit/components-core';
	import TrackLoopItem from './TrackLoopItem.svelte';

	let {
		tracks,
		children,
	}: {
		tracks: TrackReferenceOrPlaceholder[];
		children: Snippet;
	} = $props();
</script>

{#each tracks as trackReference (getTrackReferenceId(trackReference))}
	<TrackLoopItem {trackReference}>
		{@render children()}
	</TrackLoopItem>
{/each}
