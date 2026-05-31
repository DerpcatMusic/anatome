import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { getMaybeLayoutContext } from "$lib/livekit/contexts";
import type { LayoutContext } from "$lib/livekit/contexts";

/**
 * The `usePinnedTracks` hook returns an array of the pinned tracks of the current room.
 *
 * @public
 */
export function usePinnedTracks(layoutContext?: LayoutContext): TrackReferenceOrPlaceholder[] {
	const ctx = layoutContext ?? getMaybeLayoutContext();
	if (!ctx) {
		throw new Error(
			"No layout context provided, make sure you are inside a LayoutContext provider or pass the layout context explicitly",
		);
	}
	return ctx.pin.pinnedTracks ?? [];
}
