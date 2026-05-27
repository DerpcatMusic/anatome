import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { useVisualStableUpdate } from "./useVisualStableUpdate.svelte";

export type Pagination = {
  currentPage: number;
  totalPageCount: number;
  tracks: TrackReferenceOrPlaceholder[];
  nextPage: () => void;
  prevPage: () => void;
  setPage: (n: number) => void;
  firstItemIndex: number;
  lastItemIndex: number;
};

/**
 * Simple pagination logic for track arrays.
 * Integrates with `useVisualStableUpdate` to prevent tile reordering jitter.
 *
 * @alpha
 */
type TrackListGetter = () => TrackReferenceOrPlaceholder[];
type ItemsPerPageGetter = () => number;

export function usePagination(
  itemsPerPage: ItemsPerPageGetter | number,
  trackReferences: TrackListGetter | TrackReferenceOrPlaceholder[],
): Pagination {
  const itemsPerPageGetter =
    typeof itemsPerPage === "function" ? itemsPerPage : () => itemsPerPage;
  const trackReferencesGetter =
    typeof trackReferences === "function" ? trackReferences : () => trackReferences;

  let currentPage = $state(1);

  const totalPageCount = $derived(
    Math.max(
      Math.ceil(trackReferencesGetter().length / itemsPerPageGetter()),
      1,
    ),
  );

  $effect(() => {
    if (currentPage > totalPageCount) {
      currentPage = totalPageCount;
    }
  });

  const lastItemIndex = $derived(currentPage * itemsPerPageGetter());
  const firstItemIndex = $derived(lastItemIndex - itemsPerPageGetter());

  function changePage(direction: "next" | "previous") {
    if (direction === "next") {
      if (currentPage === totalPageCount) return;
      currentPage += 1;
    } else {
      if (currentPage === 1) return;
      currentPage -= 1;
    }
  }

  function goToPage(num: number) {
    if (num > totalPageCount) {
      currentPage = totalPageCount;
    } else if (num < 1) {
      currentPage = 1;
    } else {
      currentPage = num;
    }
  }

  const trackRefs = $derived(trackReferencesGetter());
  const pageSize = $derived(itemsPerPageGetter());
  const updatedTrackReferences = useVisualStableUpdate(trackRefs, pageSize);

  const tracksOnPage = $derived(updatedTrackReferences.slice(firstItemIndex, lastItemIndex));

  return {
    get currentPage() {
      return currentPage;
    },
    get totalPageCount() {
      return totalPageCount;
    },
    get tracks() {
      return tracksOnPage;
    },
    nextPage: () => changePage("next"),
    prevPage: () => changePage("previous"),
    setPage: goToPage,
    get firstItemIndex() {
      return firstItemIndex;
    },
    get lastItemIndex() {
      return lastItemIndex;
    },
  };
}
