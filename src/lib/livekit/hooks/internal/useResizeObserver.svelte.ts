import { ElementSize } from "runed";

export type Size = { width: number; height: number };

type ElementGetter = (() => HTMLElement | null | undefined) | HTMLElement | null | undefined;

/**
 * Observe the size of an element using Runed's ElementSize utility.
 * Returns reactive `{ width, height }`.
 *
 * @internal
 */
export function useResizeObserver(target: ElementGetter): Size {
  const getter = typeof target === "function" ? target : () => target;
  const size = new ElementSize(getter, { box: "content-box" });

  return {
    get width() {
      return size.width;
    },
    get height() {
      return size.height;
    },
  };
}
