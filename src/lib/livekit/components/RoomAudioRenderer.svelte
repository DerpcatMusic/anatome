<script lang="ts">
	import type { Room } from 'livekit-client';
	import { Track } from 'livekit-client';
	import { useTracks } from '../hooks/useTracks.svelte';
	import {
		applyAudioSink,
		isAudioOutputSelectionSupported,
		audioOutputPref,
	} from '$lib/media/audio-output';

	let { room }: { room?: Room } = $props();

	const tracks = useTracks([Track.Source.Microphone, Track.Source.ScreenShareAudio], {
		getRoom: () => room ?? undefined,
	});

	const sinkSupported = isAudioOutputSelectionSupported();

	function audioSinkAction(node: HTMLAudioElement, deviceId: string) {
		if (sinkSupported && deviceId) {
			void applyAudioSink(node, deviceId);
		}
		return {
			update(nextId: string) {
				if (sinkSupported && nextId) {
					void applyAudioSink(node, nextId);
				}
			},
		};
	}
</script>

{#each tracks as trackRef (trackRef.participant.identity + '_' + trackRef.source)}
	{#if trackRef.publication?.track}
		{@const outputId = audioOutputPref.current}
		<audio
			srcObject={trackRef.publication.track.mediaStream}
			autoplay
			muted={trackRef.participant.isLocal}
			use:audioSinkAction={outputId}
		></audio>
	{/if}
{/each}
