import { setupConnectionQualityIndicator } from "@livekit/components-core";
import type { Participant, ConnectionQuality } from "livekit-client";
import { useEnsureParticipant } from "$lib/livekit/contexts";
import { useObservableState } from "./internal/useObservableState.svelte";

/**
 * The `useConnectionQualityIndicator` hook provides props for the `ConnectionQualityIndicator`.
 *
 * @public
 */
export interface ConnectionQualityIndicatorOptions {
	participant?: Participant;
}

export function useConnectionQualityIndicator(options: ConnectionQualityIndicatorOptions = {}): {
	className: string;
	quality: ConnectionQuality;
} {
	const p = useEnsureParticipant(options.participant);
	const { className, connectionQualityObserver } = setupConnectionQualityIndicator(p);
	const quality = useObservableState(connectionQualityObserver, p.connectionQuality);
	return { className, quality };
}
