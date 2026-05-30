import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { setupFocusToggle, isTrackReferencePinned } from '@livekit/components-core';
import { useEnsureTrackRef, layoutCtx } from '../contexts/index.js';

export interface UseFocusToggleProps {
	trackRef?: TrackReferenceOrPlaceholder;
	props?: {
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};
}

/**
 * Returns props and state for a focus toggle button.
 * @public
 */
export function useFocusToggle({ trackRef, props }: UseFocusToggleProps) {
	const trackReference = useEnsureTrackRef(trackRef);
	const layoutContext = layoutCtx.getOr(undefined);
	const { className } = setupFocusToggle();

	const inFocus = $derived(
		isTrackReferencePinned(trackReference, layoutContext?.pin.pinnedTracks),
	);

	function onClick(event: MouseEvent) {
		props?.onclick?.(event);
		if (inFocus) {
			layoutContext?.pin.clearPin();
		} else {
			layoutContext?.pin.setPin(trackReference);
		}
	}

	// svelte-ignore state_referenced_locally
	return {
		mergedProps: {
			class: `${className} ${props?.class ?? ''}`.trim(),
			onclick: onClick,
		},
		inFocus,
	};
}
