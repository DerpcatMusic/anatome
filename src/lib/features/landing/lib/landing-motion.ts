/** Shared motion tokens for marketing scroll chapters (keep in sync with landing.css). */

/** Matches `.experience-bento__track { min-height }` desktop gate (56rem). */
export const LANDING_BENTO_DESKTOP_MQ = "(min-width: 56rem)";

/** Scroll runway for pinned bento — keep in sync with `landing.css` (--bento-track-scroll). */
export const BENTO_TRACK_SCROLL_VH = 240;

export const BENTO_FRAME_ROTATIONS = [-2.25, 1.75, -1.5, 2] as const;

export const BENTO_MOTION = {
  scrub: 0.65,
  anticipatePin: 1,
  hidden: { y: 28, scale: 0.92 },
  shown: { y: 0, scale: 1, ease: "power3.out" as const },
  snap: {
    duration: { min: 0.12, max: 0.28 },
    delay: 0.03,
  },
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
