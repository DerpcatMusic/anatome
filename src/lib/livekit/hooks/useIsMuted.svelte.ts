import { mutedObserver } from "@livekit/components-core";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { useEnsureParticipant } from "$lib/livekit/contexts";
import { useObservableState } from "./internal/useObservableState.svelte";

/**
 * The `useIsMuted` hook returns a boolean that indicates if the track is muted.
 *
 * @public
 */
export function useIsMuted(trackRef: TrackReferenceOrPlaceholder): boolean {
	const p = useEnsureParticipant(trackRef.participant);
	const ref = trackRef;
	const initial = !!(ref.publication?.isMuted || p.getTrackPublication(ref.source)?.isMuted);
	return useObservableState(mutedObserver(ref), initial);
}
