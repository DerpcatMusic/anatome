<script lang="ts">
	import type { Room } from "livekit-client";
	import { Track } from "livekit-client";
	import { useTracks } from "../hooks/useTracks.svelte";

	let { room }: { room?: Room } = $props();

	const tracks = useTracks([Track.Source.Microphone, Track.Source.ScreenShareAudio], {
		getRoom: () => room ?? undefined,
	});
</script>

{#each tracks as trackRef (trackRef.participant.identity + '_' + trackRef.source)}
	{#if trackRef.publication?.track}
		<audio
			srcObject={trackRef.publication.track.mediaStream}
			autoplay
			muted={trackRef.participant.isLocal}
		></audio>
	{/if}
{/each}
