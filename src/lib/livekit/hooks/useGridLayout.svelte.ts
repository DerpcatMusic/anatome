import { GRID_LAYOUTS, selectGridLayout } from "@livekit/components-core";
import type { GridLayoutDefinition, GridLayoutInfo } from "@livekit/components-core";
import { useResizeObserver } from "./internal/useResizeObserver.svelte";

export type UseGridLayoutOptions = {
  gridLayouts?: GridLayoutDefinition[];
};

/**
 * Calculate the optimal grid layout for a given container and track count.
 * Watches the container size reactively.
 *
 * @public
 */
type ElementGetter = () => HTMLElement | null | undefined;
type CountGetter = () => number;

export function useGridLayout(
  /** HTML element that contains the grid. */
  gridElement: ElementGetter | HTMLElement | undefined,
  /** Count of tracks that should get laid out */
  trackCount: CountGetter | number,
  options: UseGridLayoutOptions = {},
): { layout: GridLayoutInfo; containerWidth: number; containerHeight: number } {
  const gridLayouts = options.gridLayouts ?? GRID_LAYOUTS;
  const elementGetter =
    typeof gridElement === "function" ? gridElement : () => gridElement ?? null;
  const countGetter = typeof trackCount === "function" ? trackCount : () => trackCount;
  const { width, height } = useResizeObserver(elementGetter);

  const layout = $derived(
    selectGridLayout(gridLayouts, countGetter(), width, height),
  );

  $effect(() => {
    const el = elementGetter();
    if (el && layout) {
      el.style.setProperty("--lk-col-count", layout.columns.toString());
      el.style.setProperty("--lk-row-count", layout.rows.toString());
    }
  });

  return {
    get layout() {
      return layout;
    },
    get containerWidth() {
      return width;
    },
    get containerHeight() {
      return height;
    },
  };
}
