import { setupParticipantTile } from "@livekit/components-core";
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { Track } from "livekit-client";
import { useEnsureTrackRef } from "$lib/livekit/contexts";
import { useFacingMode } from "./useFacingMode.svelte";
import { useIsMuted } from "./useIsMuted.svelte";
import { useIsSpeaking } from "./useIsSpeaking.svelte";

export interface UseParticipantTileProps {
	/** The track reference to display. */
	trackRef?: TrackReferenceOrPlaceholder;
	disableSpeakingIndicator?: boolean;
	onParticipantClick?: (event: ParticipantClickEvent) => void;
	htmlProps?: Record<string, unknown>;
}

/**
 * The `useParticipantTile` hook returns the props needed to render the tile.
 *
 * @public
 */
export function useParticipantTile({
	trackRef,
	onParticipantClick,
	disableSpeakingIndicator,
	htmlProps,
}: UseParticipantTileProps) {
	const trackReference = useEnsureTrackRef(trackRef);
	const { className } = setupParticipantTile();

	const micTrack = trackReference.participant.getTrackPublication(Track.Source.Microphone);
	const micRef: TrackReferenceOrPlaceholder = {
		participant: trackReference.participant,
		source: Track.Source.Microphone,
		publication: micTrack,
	};

	const isVideoMuted = useIsMuted(trackReference);
	const isAudioMuted = useIsMuted(micRef);
	const isSpeaking = useIsSpeaking(trackReference.participant);
	const facingMode = useFacingMode(trackReference);

	const mergedClass = $derived(
		`${(htmlProps?.class as string) ?? ""} ${className}`.trim(),
	);

	const elementProps = $derived.by(() => ({
		...htmlProps,
		class: mergedClass,
		"data-lk-audio-muted": isAudioMuted,
		"data-lk-video-muted": isVideoMuted,
		"data-lk-speaking": disableSpeakingIndicator === true ? false : isSpeaking,
		"data-lk-local-participant": trackReference.participant.isLocal,
		"data-lk-source": trackReference.source,
		"data-lk-facing-mode": facingMode,
		onclick: (event: MouseEvent) => {
			if (typeof htmlProps?.onclick === "function") {
				(htmlProps.onclick as (e: MouseEvent) => void)(event);
			}
			const handler = onParticipantClick;
			if (typeof handler === "function") {
				const track =
					trackReference.publication ??
					trackReference.participant.getTrackPublication(trackReference.source);
				handler({ participant: trackReference.participant, track });
			}
		},
	}));

	return {
		get elementProps() {
			return elementProps;
		},
	};
}
