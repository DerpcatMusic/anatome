<script lang="ts">
	import type { TrackReference } from '@livekit/components-core';
	import { log } from '@livekit/components-core';
	import { RemoteAudioTrack, RemoteTrackPublication } from 'livekit-client';
	import { useEnsureTrackRef } from '../../contexts/track-ref-context.svelte.js';
	import { useMediaTrackBySourceOrName } from '../../hooks/useMediaTrackBySourceOrName.svelte';

	let {
		trackRef,
		onSubscriptionStatusChanged,
		volume,
		muted,
		class: className = '',
	}: {
		trackRef?: TrackReference;
		onSubscriptionStatusChanged?: (subscribed: boolean) => void;
		volume?: number;
		muted?: boolean;
		class?: string;
	} = $props();

	// svelte-ignore state_referenced_locally
	const trackReference = useEnsureTrackRef(trackRef);
	let mediaEl = $state<HTMLAudioElement | null>(null);

	const { publication, track, className: hookClassName } = useMediaTrackBySourceOrName(trackReference);

	$effect(() => {
		const t = track;
		const el = mediaEl;
		if (t && el && !(trackReference.participant.isLocal && t.kind === 'audio')) {
			t.attach(el);
		}
		return () => {
			if (t && el) {
				t.detach(el);
			}
		};
	});

	$effect(() => {
		onSubscriptionStatusChanged?.(!!publication?.isSubscribed);
	});

	$effect(() => {
		if (track === undefined || volume === undefined) {
			return;
		}
		if (track instanceof RemoteAudioTrack) {
			track.setVolume(volume);
		} else {
			log.warn('Volume can only be set on remote audio tracks.');
		}
	});

	$effect(() => {
		if (publication === undefined || muted === undefined) {
			return;
		}
		if (publication instanceof RemoteTrackPublication) {
			publication.setEnabled(!muted);
		} else {
			log.warn('Can only call setEnabled on remote track publications.');
		}
	});
</script>

<audio
	bind:this={mediaEl}
	class="{hookClassName} {className}"
	data-lk-local-participant={trackReference.participant.isLocal}
	data-lk-source={publication?.source}
></audio>

<style>
	audio {
		display: none;
	}
</style>
