/**
 * Landing page photography — hosted under `/static/landing/`.
 * License: Unsplash License (https://unsplash.com/license) — free for commercial use, no attribution required.
 */
export const LANDING_IMAGES = {
  /** Wide reformer studio — calm environmental hero, not a face close-up */
  hero: {
    src: "/landing/hero.webp",
    width: 1920,
    height: 1080,
    credit: "Unsplash — photo-1518611012118 (Pilates reformer studio)",
  },
  aboutInstructor: {
    src: "/landing/about-instructor.webp",
    width: 800,
    height: 1000,
    credit: "Unsplash — photo-1571019613454 (guided stretching)",
  },
  previewLibrary: {
    src: "/landing/preview-library.webp",
    width: 1280,
    height: 720,
    credit: "Unsplash — photo-1574680096145 (guided mat work)",
  },
  sessions: {
    anatomy: {
      src: "/landing/session-anatomy.webp",
      width: 800,
      height: 600,
      credit: "Unsplash — photo-1544367567 (mat practice)",
    },
    adaptive: {
      src: "/landing/session-adaptive.webp",
      width: 800,
      height: 600,
      credit: "Unsplash — photo-1599901860904 (home mat session)",
    },
    pace: {
      src: "/landing/session-pace.webp",
      width: 800,
      height: 600,
      credit: "Unsplash — photo-1576678927484 (reformer movement)",
    },
  },
  pillars: {
    micro: {
      src: "/landing/pillar-micro.webp",
      width: 960,
      height: 720,
      credit: "Unsplash — photo-1517836357463 (focused training)",
    },
    live: {
      src: "/landing/pillar-live.webp",
      width: 960,
      height: 720,
      credit: "Unsplash — photo-1534438327276 (group studio session)",
    },
  },
} as const;
