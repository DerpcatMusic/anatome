import { browser } from "$app/environment";
import { CONCEPT_SECTION_COUNT } from "./concept-sections";
import { useIntersectionObserver } from "runed";

export interface SpineScrollObserverOptions {
  onSectionChange: (index: number) => void;
}

/**
 * Picks exactly one active story section (closest to snap center).
 * Spine camera + hotspot advance only when the active section index changes.
 */
export function createSpineScrollObserver({
  onSectionChange,
}: SpineScrollObserverOptions): () => void {
  if (!browser) return () => {};

  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-spine-section]"),
  ).sort(
    (a, b) =>
      Number(a.dataset.spineSection ?? 0) - Number(b.dataset.spineSection ?? 0),
  );

  if (sections.length === 0) return () => {};

  let currentIndex = -1;

  const pickActive = () => {
    const snapY = window.innerHeight * 0.5;
    let bestIndex = 0;
    let bestDist = Infinity;

    for (const section of sections) {
      const index = Number(section.dataset.spineSection ?? 0);
      const rect = section.getBoundingClientRect();
      const mid = rect.top + rect.height * 0.5;
      const dist = Math.abs(mid - snapY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = index;
      }
    }

    const clamped = Math.max(0, Math.min(CONCEPT_SECTION_COUNT - 1, bestIndex));
    if (clamped === currentIndex) return;
    currentIndex = clamped;
    onSectionChange(clamped);
  };

  useIntersectionObserver(
    () => sections,
    () => pickActive(),
    {
      root: null,
      rootMargin: "-42% 0px -42% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  );

  window.addEventListener("scroll", pickActive, { passive: true });
  window.addEventListener("resize", pickActive, { passive: true });
  pickActive();

  return () => {
    window.removeEventListener("scroll", pickActive);
    window.removeEventListener("resize", pickActive);
  };
}
