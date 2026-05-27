import {
	setupTrackMutedIndicator,
	getTrackReferenceId,
} from '@livekit/components-core';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useEnsureTrackRef } from '../contexts/track-ref-context.svelte.js';
import { useObservableState } from './internal/useObservableState.svelte';

export interface TrackMutedIndicatorReturnType {
	isMuted: boolean;
	className: string;
}

/**
 * Returns the muted state and className for a track muted indicator.
 * @public
 */
export function useTrackMutedIndicator(
	trackRef?: TrackReferenceOrPlaceholder,
): TrackMutedIndicatorReturnType {
	const trackReference = useEnsureTrackRef(trackRef);
	const { className, mediaMutedObserver } = setupTrackMutedIndicator(trackReference);
	const initialMuted = !!(
		trackReference.publication?.isMuted ||
		trackReference.participant.getTrackPublication(trackReference.source)?.isMuted
	);
	const isMuted = useObservableState(mediaMutedObserver, initialMuted);
	return { isMuted, className };
}
