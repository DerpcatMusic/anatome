import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { log, sortTrackReferences, updatePages } from "@livekit/components-core";
import { untrack } from "svelte";

/** @public */
export interface UseVisualStableUpdateOptions {
  /** Overwrites the default sort function. */
  customSortFunction?: (
    trackReferences: TrackReferenceOrPlaceholder[],
  ) => TrackReferenceOrPlaceholder[];
}

/**
 * Prevent visually jarring jumps and shifts of tiles in an array.
 * Only starts updating when there are more items than visually fit on a page.
 *
 * @public
 */
export function useVisualStableUpdate(
  /** `TrackReference`s to display in the grid. */
  trackReferences: TrackReferenceOrPlaceholder[],
  maxItemsOnPage: number,
  options: UseVisualStableUpdateOptions = {},
): TrackReferenceOrPlaceholder[] {
  let lastTrackRefs = $state<TrackReferenceOrPlaceholder[]>([]);
  let lastMaxItemsOnPage = $state<number>(-1);

  const sortedTrackRefs = $derived(
    typeof options.customSortFunction === "function"
      ? options.customSortFunction(trackReferences)
      : sortTrackReferences(trackReferences),
  );

  const updatedTrackRefs = $derived.by<TrackReferenceOrPlaceholder[]>(() => {
    const layoutChanged = maxItemsOnPage !== untrack(() => lastMaxItemsOnPage);
    let result: TrackReferenceOrPlaceholder[] = [...sortedTrackRefs];

    if (layoutChanged === false) {
      try {
        result = updatePages(untrack(() => lastTrackRefs), sortedTrackRefs, maxItemsOnPage);
      } catch (error) {
        log.error("Error while running updatePages(): ", error);
      }
    }

    return result;
  });

  $effect(() => {
    lastTrackRefs = [...updatedTrackRefs];
    lastMaxItemsOnPage = maxItemsOnPage;
  });

  return updatedTrackRefs;
}
