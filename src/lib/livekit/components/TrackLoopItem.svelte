<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { trackRefCtx } from '../contexts/track-ref-context.svelte.js';
	import { participantCtx } from '../contexts/participant-context.svelte.js';

	let {
		trackReference,
		children,
	}: {
		trackReference: TrackReferenceOrPlaceholder;
		children: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	trackRefCtx.set(trackReference);
	// svelte-ignore state_referenced_locally
	participantCtx.set(trackReference.participant);
</script>

{@render children()}
