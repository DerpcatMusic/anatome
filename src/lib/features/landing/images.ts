/**
 * Landing page photography — hosted under `/static/landing/`.
 * Hero: Yuval (proprietary). Other sections: Unsplash License.
 */
export const LANDING_IMAGES = {
  /** Instructor hero — full-bleed background */
  hero: {
    src: "/landing/hero.webp",
    width: 1025,
    height: 895,
    credit: "Yuval — AnatoMe",
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
