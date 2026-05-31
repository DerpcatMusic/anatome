<script lang="ts">
	import type { TrackIdentifier } from '@livekit/components-core';
	import { Track } from 'livekit-client';
	import { useTrackMutedIndicator } from '../../hooks/useTrackMutedIndicator.svelte';

	let {
		trackRef,
		show = 'always',
		class: className = '',
	}: {
		trackRef?: TrackIdentifier;
		show?: 'always' | 'muted' | 'unmuted';
		class?: string;
	} = $props();

	const { isMuted, className: hookClassName } = useTrackMutedIndicator(trackRef as Parameters<typeof useTrackMutedIndicator>[0]);

	const showIndicator = $derived(
		show === 'always' || (show === 'muted' && isMuted) || (show === 'unmuted' && !isMuted),
	);
</script>

{#snippet microphoneIcon()}
	{#if isMuted}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path d="M12.227 11.52a5.477 5.477 0 0 0 1.246-2.97.5.5 0 0 0-.995-.1 4.478 4.478 0 0 1-.962 2.359l-1.07-1.07C10.794 9.247 11 8.647 11 8V3a3 3 0 0 0-6 0v1.293L1.354.646a.5.5 0 1 0-.708.708l14 14a.5.5 0 0 0 .708-.708zM8 12.5c.683 0 1.33-.152 1.911-.425l.743.743c-.649.359-1.378.59-2.154.66V15h2a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h2v-1.522a5.502 5.502 0 0 1-4.973-4.929.5.5 0 0 1 .995-.098A4.5 4.5 0 0 0 8 12.5z" />
			<path d="M8.743 10.907 5 7.164V8a3 3 0 0 0 3.743 2.907z" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M2.975 8.002a.5.5 0 0 1 .547.449 4.5 4.5 0 0 0 8.956 0 .5.5 0 1 1 .995.098A5.502 5.502 0 0 1 8.5 13.478V15h2a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h2v-1.522a5.502 5.502 0 0 1-4.973-4.929.5.5 0 0 1 .448-.547z" clip-rule="evenodd" />
			<path d="M5 3a3 3 0 1 1 6 0v5a3 3 0 0 1-6 0z" />
		</svg>
	{/if}
{/snippet}

{#snippet cameraIcon()}
	{#if isMuted}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path d="M1.354.646a.5.5 0 1 0-.708.708l14 14a.5.5 0 0 0 .708-.708L11 10.293V4.5A1.5 1.5 0 0 0 9.5 3H3.707zM0 4.5a1.5 1.5 0 0 1 .943-1.393l9.532 9.533c-.262.224-.603.36-.975.36h-8A1.5 1.5 0 0 1 0 11.5z" />
			<path d="m15.2 3.6-2.8 2.1a1 1 0 0 0-.4.8v3a1 1 0 0 0 .4.8l2.8 2.1a.5.5 0 0 0 .8-.4V4a.5.5 0 0 0-.8-.4z" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h8A1.5 1.5 0 0 1 11 4.5v7A1.5 1.5 0 0 1 9.5 13h-8A1.5 1.5 0 0 1 0 11.5zM15.2 3.6l-2.8 2.1a1 1 0 0 0-.4.8v3a1 1 0 0 0 .4.8l2.8 2.1a.5.5 0 0 0 .8-.4V4a.5.5 0 0 0-.8-.4z" />
		</svg>
	{/if}
{/snippet}

{#snippet screenShareIcon()}
	{#if isMuted}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="none" aria-hidden="true">
			<path fill="currentColor" fill-rule="evenodd" d="M0 2.75A2.75 2.75 0 0 1 2.75 0h14.5A2.75 2.75 0 0 1 20 2.75v10.5A2.75 2.75 0 0 1 17.25 16H2.75A2.75 2.75 0 0 1 0 13.25V2.75ZM2.75 1.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25H2.75Z" clip-rule="evenodd" />
			<path fill="currentColor" fill-rule="evenodd" d="M10.53 11.78a.75.75 0 0 0 1.06 0l2.25-2.25a.75.75 0 0 0-1.06-1.06l-.97.97V4.75a.75.75 0 0 0-1.5 0v4.69l-.97-.97a.75.75 0 0 0-1.06 1.06l2.25 2.25Z" clip-rule="evenodd" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="none" aria-hidden="true">
			<path fill="currentColor" fill-rule="evenodd" d="M0 2.75A2.75 2.75 0 0 1 2.75 0h14.5A2.75 2.75 0 0 1 20 2.75v10.5A2.75 2.75 0 0 1 17.25 16H2.75A2.75 2.75 0 0 1 0 13.25V2.75ZM2.75 1.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25H2.75Z" clip-rule="evenodd" />
			<path fill="currentColor" fill-rule="evenodd" d="M9.47 4.22a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v4.69a.75.75 0 0 1-1.5 0V6.56l-.97.97a.75.75 0 0 1-1.06-1.06l2.25-2.25Z" clip-rule="evenodd" />
		</svg>
	{/if}
{/snippet}

{#if showIndicator}
	<div
		class="lk-track-muted-indicator {hookClassName} {className}"
		data-lk-muted={isMuted}
		aria-label={isMuted ? 'Muted' : 'Unmuted'}
		role="img"
	>
		{#if trackRef && 'source' in trackRef}
			{#if trackRef.source === Track.Source.Microphone}
				{@render microphoneIcon()}
			{:else if trackRef.source === Track.Source.Camera}
				{@render cameraIcon()}
			{:else if trackRef.source === Track.Source.ScreenShare}
				{@render screenShareIcon()}
			{/if}
		{/if}
	</div>
{/if}

<style>
	.lk-track-muted-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--foreground);
	}
</style>
