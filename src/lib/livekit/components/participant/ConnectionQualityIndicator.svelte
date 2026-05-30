<script lang="ts">
	import type { Participant } from 'livekit-client';
	import { ConnectionQuality } from 'livekit-client';
	import { useConnectionQualityIndicator } from '../../hooks/useConnectionQualityIndicator';

	let {
		participant,
		class: className = '',
	}: {
		participant?: Participant;
		class?: string;
	} = $props();

	const { className: hookClassName, quality } = useConnectionQualityIndicator({
		get participant() { return participant; }
	});
</script>

<div
	class="lk-connection-quality {hookClassName} {className}"
	data-lk-quality={quality}
	aria-label={`Connection quality: ${quality}`}
	role="img"
>
	{#if quality === ConnectionQuality.Excellent}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true">
			<path
				fill="currentColor"
				d="M0 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm6-5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm6-6a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5z"
			/>
		</svg>
	{:else if quality === ConnectionQuality.Good}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true">
			<path
				fill="currentColor"
				d="M0 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm6-5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5z"
			/>
			<g opacity="0.25">
				<path
					d="M12 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5z"
				/>
			</g>
		</svg>
	{:else if quality === ConnectionQuality.Poor}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true">
			<path
				fill="currentColor"
				d="M0 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5z"
			/>
			<g opacity="0.25">
				<path
					d="M6 6.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm6-6a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5z"
				/>
			</g>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true">
			<g opacity="0.25">
				<path
					fill="currentColor"
					d="M0 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-4Zm6-5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-9Zm6-6a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V.5Z"
				/>
			</g>
		</svg>
	{/if}
</div>

<style>
	.lk-connection-quality {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--foreground);
	}
</style>
