<script lang="ts">
	import { Track } from 'livekit-client';
	import { isTrackReference, isTrackReferencePinned } from '@livekit/components-core';
	import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { participantCtx, trackRefCtx, layoutCtx } from '../../contexts/index.js';
	import { useParticipantTile } from '../../hooks/useParticipantTile.svelte';
	import { useIsEncrypted } from '../../hooks/useIsEncrypted';
	import VideoTrack from './VideoTrack.svelte';
	import AudioTrack from './AudioTrack.svelte';
	import ParticipantPlaceholder from './ParticipantPlaceholder.svelte';
	import ParticipantName from './ParticipantName.svelte';
	import TrackMutedIndicator from './TrackMutedIndicator.svelte';
	import ConnectionQualityIndicator from './ConnectionQualityIndicator.svelte';
	import FocusToggle from '../controls/FocusToggle.svelte';

	let {
		trackRef,
		disableSpeakingIndicator = false,
		onParticipantClick,
		class: className = '',
		children,
	}: {
		trackRef?: TrackReferenceOrPlaceholder;
		disableSpeakingIndicator?: boolean;
		onParticipantClick?: (event: ParticipantClickEvent) => void;
		class?: string;
		children?: import('svelte').Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const maybeTrackRef = trackRef ?? trackRefCtx.getOr(undefined);
	if (!maybeTrackRef) {
		throw new Error('No trackRef provided, make sure you are inside a TrackRefContext or pass the trackRef explicitly');
	}
	// svelte-ignore state_referenced_locally
	const trackReference = maybeTrackRef;

	// Only set contexts if not already present in parent
	if (!trackRefCtx.getOr(undefined)) {
		// svelte-ignore state_referenced_locally
		trackRefCtx.set(trackReference);
	}
	if (!participantCtx.getOr(undefined)) {
		// svelte-ignore state_referenced_locally
		participantCtx.set(trackReference.participant);
	}

	// svelte-ignore state_referenced_locally
	const { elementProps } = useParticipantTile({
		trackRef: trackReference,
		disableSpeakingIndicator,
		onParticipantClick,
		htmlProps: { class: className },
	});

	const isEncrypted = useIsEncrypted(trackReference.participant);
	const layoutContext = layoutCtx.getOr(undefined);

	function handleSubscribe(subscribed: boolean) {
		if (
			trackReference.source &&
			!subscribed &&
			layoutContext &&
			isTrackReferencePinned(trackReference, layoutContext.pin.pinnedTracks)
		) {
			layoutContext.pin.clearPin();
		}
	}
</script>

<div
	class={elementProps.class}
	data-lk-audio-muted={elementProps['data-lk-audio-muted']}
	data-lk-video-muted={elementProps['data-lk-video-muted']}
	data-lk-speaking={elementProps['data-lk-speaking']}
	data-lk-local-participant={elementProps['data-lk-local-participant']}
	data-lk-source={elementProps['data-lk-source']}
	data-lk-facing-mode={elementProps['data-lk-facing-mode']}
	onclick={elementProps.onclick}
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			(e.currentTarget as HTMLDivElement).click();
		}
	}}
	role="button"
	tabindex="0"
	aria-label="Participant tile"
	style="position: relative;"
>
	{#if children}
		{@render children()}
	{:else}
		{#if isTrackReference(trackReference)}
			{#if trackReference.publication?.kind === 'video' || trackReference.source === Track.Source.Camera || trackReference.source === Track.Source.ScreenShare}
				<VideoTrack
					trackRef={trackReference}
					onSubscriptionStatusChanged={handleSubscribe}
				/>
			{:else}
				<AudioTrack
					trackRef={trackReference}
					onSubscriptionStatusChanged={handleSubscribe}
				/>
			{/if}
		{/if}

		<div class="lk-participant-placeholder">
			<ParticipantPlaceholder
				src={trackReference.participant.attributes?.avatar ?? ""}
				alt={trackReference.participant.name || trackReference.participant.identity}
			/>
		</div>

		<div class="lk-participant-metadata">
			<div class="lk-participant-metadata-item">
				{#if trackReference.source === Track.Source.Camera}
					{#if isEncrypted}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="none"
							aria-hidden="true"
							style="margin-inline-end: 0.25rem;"
						>
							<path
								fill="currentColor"
								fill-rule="evenodd"
								d="M4 6.104V4a4 4 0 1 1 8 0v2.104c1.154.326 2 1.387 2 2.646v4.5A2.75 2.75 0 0 1 11.25 16h-6.5A2.75 2.75 0 0 1 2 13.25v-4.5c0-1.259.846-2.32 2-2.646ZM5.5 4a2.5 2.5 0 0 1 5 0v2h-5V4Z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
					<TrackMutedIndicator
						trackRef={{
							participant: trackReference.participant,
							source: Track.Source.Microphone,
						}}
						show="muted"
					/>
					<ParticipantName />
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="16"
						fill="none"
						aria-hidden="true"
						style="margin-inline-end: 0.25rem;"
					>
						<path
							fill="currentColor"
							fill-rule="evenodd"
							d="M0 2.75A2.75 2.75 0 0 1 2.75 0h14.5A2.75 2.75 0 0 1 20 2.75v10.5A2.75 2.75 0 0 1 17.25 16H2.75A2.75 2.75 0 0 1 0 13.25V2.75ZM2.75 1.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25H2.75Z"
							clip-rule="evenodd"
						/>
						<path
							fill="currentColor"
							fill-rule="evenodd"
							d="M9.47 4.22a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v4.69a.75.75 0 0 1-1.5 0V6.56l-.97.97a.75.75 0 0 1-1.06-1.06l2.25-2.25Z"
							clip-rule="evenodd"
						/>
					</svg>
					<ParticipantName>&apos;s screen</ParticipantName>
				{/if}
			</div>
			<ConnectionQualityIndicator class="lk-participant-metadata-item" />
		</div>
	{/if}

	<FocusToggle trackRef={trackReference} />
</div>
