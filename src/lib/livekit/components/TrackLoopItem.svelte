<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { setTrackRefContext } from '../contexts/track-ref-context.svelte.js';
	import { setParticipantContext } from '../contexts/participant-context.svelte.js';

	let {
		trackReference,
		children,
	}: {
		trackReference: TrackReferenceOrPlaceholder;
		children: Snippet;
	} = $props();

	setTrackRefContext(trackReference);
	setParticipantContext(trackReference.participant);
</script>

{@render children()}
