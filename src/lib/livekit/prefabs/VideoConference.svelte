<script lang="ts">
	import { Track, RoomEvent } from 'livekit-client';
	import {
		isEqualTrackRef,
		isTrackReference,
		log,
	} from "@livekit/components-core";
	import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
	import { useTracks } from "../hooks/useTracks.svelte";
	import { layoutCtx } from "../contexts/layout-context.svelte.js";
	import GridLayout from "../components/layout/GridLayout.svelte";
	import FocusLayoutContainer from "../components/layout/FocusLayoutContainer.svelte";
	import FocusLayout from "../components/layout/FocusLayout.svelte";
	import CarouselLayout from "../components/layout/CarouselLayout.svelte";
	import ParticipantTile from "../components/participant/ParticipantTile.svelte";
	import RoomAudioRenderer from "../components/RoomAudioRenderer.svelte";

	let {
		class: className = '',
	}: {
		class?: string;
	} = $props();

	const layoutContext = layoutCtx.get();

	const trackUpdateEvents = [
		RoomEvent.ActiveSpeakersChanged,
		RoomEvent.TrackPublished,
		RoomEvent.TrackUnpublished,
		RoomEvent.TrackSubscribed,
		RoomEvent.TrackUnsubscribed,
		RoomEvent.LocalTrackPublished,
		RoomEvent.LocalTrackUnpublished,
	] as const;

	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ updateOnlyOn: [...trackUpdateEvents], onlySubscribed: false },
	);

	const screenShareTracks = $derived(
		(tracks as TrackReferenceOrPlaceholder[])
			.filter(isTrackReference)
			.filter((t) => t.publication.source === Track.Source.ScreenShare),
	);

	const focusTrack = $derived(layoutContext.pin.pinnedTracks[0]);
	const carouselTracks = $derived(
		(tracks as TrackReferenceOrPlaceholder[]).filter((t) => !isEqualTrackRef(t, focusTrack)),
	);

	let lastAutoFocusedScreenShareTrack = $state<TrackReferenceOrPlaceholder | null>(null);

	function screenShareIsVisible(track: TrackReferenceOrPlaceholder) {
		return (
			isTrackReference(track) &&
			(track.publication.isSubscribed || track.participant.isLocal)
		);
	}

	$effect(() => {
		if (
			screenShareTracks.some(screenShareIsVisible) &&
			lastAutoFocusedScreenShareTrack === null
		) {
			log.debug("Auto set screen share focus:", { newScreenShareTrack: screenShareTracks[0] });
			layoutContext.pin.setPin(screenShareTracks[0]);
			lastAutoFocusedScreenShareTrack = screenShareTracks[0];
		} else if (
			lastAutoFocusedScreenShareTrack &&
			!screenShareTracks.some(
				(t) => t.publication.trackSid === lastAutoFocusedScreenShareTrack?.publication?.trackSid,
			)
		) {
			log.debug("Auto clearing screen share focus.");
			layoutContext.pin.clearPin();
			lastAutoFocusedScreenShareTrack = null;
		}
		if (focusTrack && !isTrackReference(focusTrack)) {
			const updatedFocusTrack = (tracks as TrackReferenceOrPlaceholder[]).find(
				(tr) =>
					tr.participant.identity === focusTrack.participant.identity &&
					tr.source === focusTrack.source,
			);
			if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
				layoutContext.pin.setPin(updatedFocusTrack);
			}
		}
	});
</script>

<div class="lk-video-conference {className}">
	<div class="lk-video-conference-inner">
		{#if !focusTrack}
			<div class="lk-grid-layout-wrapper">
				<GridLayout tracks={tracks as TrackReferenceOrPlaceholder[]}>
					<ParticipantTile />
				</GridLayout>
			</div>
		{:else}
			<div class="lk-focus-layout-wrapper">
				<FocusLayoutContainer>
					<CarouselLayout tracks={carouselTracks}>
						<ParticipantTile />
					</CarouselLayout>
					<FocusLayout trackRef={focusTrack} />
				</FocusLayoutContainer>
			</div>
		{/if}
	</div>

	<RoomAudioRenderer />
</div>

<style>
	.lk-video-conference {
		--lk-control-bar-height: 0px;
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		min-height: 0;
		background: var(--video-bg, var(--background));
		color: var(--foreground);
	}

	.lk-video-conference-inner {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		align-items: stretch;
		min-height: 0;
		width: 100%;
	}

	.lk-grid-layout-wrapper,
	.lk-focus-layout-wrapper {
		position: relative;
		display: flex;
		flex: 1 1 auto;
		justify-content: center;
		width: 100%;
		min-height: 0;
		height: 100%;
	}

	.lk-grid-layout-wrapper {
		flex-direction: column;
		align-items: center;
	}

	.lk-focus-layout-wrapper {
		align-items: stretch;
	}
</style>
