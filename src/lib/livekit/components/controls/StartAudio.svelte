<script lang="ts">
	import type { Room } from "livekit-client";
	import { useStartAudio } from "../../hooks/useStartAudio.svelte";

	let {
		room,
		label = 'Allow Audio',
		class: className = '',
	}: {
		room?: Room;
		label?: string;
		class?: string;
	} = $props();

	const { canPlayAudio, buttonProps } = useStartAudio({ room });
</script>

{#if !canPlayAudio}
	<button
		type="button"
		class="lk-button lk-start-audio {buttonProps.class} {className}"
		data-lk-audio-playback={buttonProps['data-lk-audio-playback']}
		onclick={buttonProps.onclick}
	>
		{label}
	</button>
{/if}
