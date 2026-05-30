<script lang="ts">
	import type { Participant } from 'livekit-client';
	import { useParticipantInfo } from '../../hooks/useParticipantInfo';
	import { participantCtx } from '../../contexts/participant-context.svelte.js';

	let {
		participant,
		class: className = '',
		children,
	}: {
		participant?: Participant;
		class?: string;
		children?: import('svelte').Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const p = participant ?? participantCtx.getOr(undefined);
	const { name, identity } = useParticipantInfo({ participant: p });
</script>

<span class="lk-participant-name {className}" data-lk-participant-name={name}>
	{name !== '' ? name : identity}
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	.lk-participant-name {
		color: inherit;
		font-weight: 500;
	}
</style>
