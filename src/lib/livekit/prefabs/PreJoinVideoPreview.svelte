<script lang="ts">
	import ParticipantPlaceholder from '../components/participant/ParticipantPlaceholder.svelte';
	import type { LocalVideoTrack } from 'livekit-client';

	interface Props {
		videoEnabled: boolean;
		videoTrack: LocalVideoTrack | undefined;
		centerToast: string;
		videoEl?: HTMLVideoElement | null;
	}

	let {
		videoEnabled,
		videoTrack,
		centerToast,
		videoEl = $bindable(null),
	}: Props = $props();
</script>

<div class="lk-prejoin__video">
	{#if videoEnabled}
		<video bind:this={videoEl} width="1280" height="720" autoplay playsinline muted></video>
	{/if}
	{#if !videoEnabled || !videoTrack}
		<div class="lk-prejoin__placeholder">
			<ParticipantPlaceholder />
		</div>
	{/if}
	{#if centerToast}
		<div class="lk-prejoin__center-toast" role="alert">
			<p>{centerToast}</p>
		</div>
	{/if}
</div>

<style>
	.lk-prejoin__video {
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
		aspect-ratio: 16 / 9;
		background: var(--muted);
		border-radius: var(--radius-lg);
		overflow: hidden;
		position: relative;
	}

	.lk-prejoin__video video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scaleX(-1);
	}

	.lk-prejoin__placeholder {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.lk-prejoin__center-toast {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: grid;
		place-items: center;
		padding: var(--space-4);
		pointer-events: none;
	}

	.lk-prejoin__center-toast p {
		margin: 0;
		max-width: 26ch;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--foreground) 88%, transparent);
		color: var(--background);
		font-size: var(--step--1);
		font-weight: 700;
		text-align: center;
		line-height: 1.45;
		box-shadow: var(--shadow-md);
		direction: rtl;
	}
</style>
