<script lang="ts">
	import type { TrackReference } from '@livekit/components-core';
	import { isTrackReference } from '@livekit/components-core';
	import type { ParticipantClickEvent } from '@livekit/components-core';
	import { RemoteTrackPublication } from 'livekit-client';
	import { useEnsureTrackRef } from '../../contexts/track-ref-context.svelte.js';
	import { useMediaTrackBySourceOrName } from '../../hooks/useMediaTrackBySourceOrName.svelte';

	let {
		trackRef,
		onTrackClick,
		onSubscriptionStatusChanged,
		manageSubscription = false,
		class: className = '',
	}: {
		trackRef?: TrackReference;
		onTrackClick?: (evt: ParticipantClickEvent) => void;
		onSubscriptionStatusChanged?: (subscribed: boolean) => void;
		manageSubscription?: boolean;
		class?: string;
	} = $props();

	const trackReference = useEnsureTrackRef(trackRef);
	let mediaEl = $state<HTMLVideoElement | null>(null);

	const { publication, track, className: hookClassName, orientation } = useMediaTrackBySourceOrName(trackReference);

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

	let isIntersecting = $state(false);
	let debouncedIsIntersecting = $state(false);

	$effect(() => {
		const el = mediaEl;
		if (!el || !manageSubscription) return;

		let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

		const observer = new IntersectionObserver(
			([entry]) => {
				const intersecting = entry?.isIntersecting ?? false;
				isIntersecting = intersecting;
				if (debounceTimeout) {
					clearTimeout(debounceTimeout);
					debounceTimeout = null;
				}
				if (intersecting) {
					debouncedIsIntersecting = true;
				} else {
					debounceTimeout = setTimeout(() => {
						debouncedIsIntersecting = false;
						debounceTimeout = null;
					}, 3000);
				}
			},
			{ threshold: 0 },
		);
		observer.observe(el);

		return () => {
			observer.disconnect();
			if (debounceTimeout) clearTimeout(debounceTimeout);
		};
	});

	$effect(() => {
		if (!manageSubscription) return;
		const pub = trackReference.publication;
		if (!(pub instanceof RemoteTrackPublication)) return;

		if (isIntersecting) {
			pub.setSubscribed(true);
			return;
		}
		if (!debouncedIsIntersecting && !isIntersecting) {
			pub.setSubscribed(false);
		}
	});

	function clickHandler(evt: MouseEvent) {
		onTrackClick?.({ participant: trackReference.participant, track: publication });
	}
</script>

<video
	bind:this={mediaEl}
	class="{hookClassName} {className}"
	muted={true}
	onclick={clickHandler}
	data-lk-local-participant={trackReference.participant.isLocal}
	data-lk-source={publication?.source}
	data-lk-orientation={orientation}
></video>

<style>
	video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: var(--muted);
	}
</style>
