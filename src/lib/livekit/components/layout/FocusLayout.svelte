<script lang="ts">
	import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import ParticipantTile from '../participant/ParticipantTile.svelte';

	let {
		trackRef,
		onParticipantClick,
		class: className = '',
		...rest
	}: {
		trackRef?: TrackReferenceOrPlaceholder;
		onParticipantClick?: (evt: ParticipantClickEvent) => void;
		class?: string;
	} & Record<string, unknown> = $props();
</script>

<ParticipantTile {trackRef} {onParticipantClick} class="lk-focused-participant {className}" {...rest} />
