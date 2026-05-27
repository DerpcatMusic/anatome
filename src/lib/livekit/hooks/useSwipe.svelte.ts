import { useEventListener } from "runed";

export type UseSwipeOptions = {
  minSwipeDistance?: number;
  onLeftSwipe?: () => void;
  onRightSwipe?: () => void;
};

/**
 * Simple implementation to detect horizontal swipe actions on an element.
 *
 * @alpha
 */
type SwipeElement = HTMLElement | null | undefined;
type SwipeElementGetter = () => SwipeElement;

export function useSwipe(
  element: SwipeElementGetter | SwipeElement,
  options: UseSwipeOptions = {},
): void {
  const elementGetter: SwipeElementGetter =
    typeof element === "function" ? element : () => element;
  let touchStartX = $state<number | null>(null);
  let touchEndX = $state<number | null>(null);

  const minSwipeDistance = options.minSwipeDistance ?? 50;

  useEventListener(
    () => elementGetter() ?? undefined,
    ["touchstart", "touchmove", "touchend"],
    (e) => {
      switch (e.type) {
        case "touchstart":
          touchEndX = null;
          touchStartX = e.targetTouches[0].clientX;
          break;
        case "touchmove":
          touchEndX = e.targetTouches[0].clientX;
          break;
        case "touchend":
          if (touchStartX === null || touchEndX === null) return;
          const distance = touchStartX - touchEndX;
          const isLeftSwipe = distance > minSwipeDistance;
          const isRightSwipe = distance < -minSwipeDistance;

          if (isLeftSwipe && options.onLeftSwipe) options.onLeftSwipe();
          if (isRightSwipe && options.onRightSwipe) options.onRightSwipe();
          break;
      }
    },
    { passive: true },
  );
}
