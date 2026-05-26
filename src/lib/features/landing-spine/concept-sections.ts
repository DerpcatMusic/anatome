import type { SpineRegion } from "./spine-regions";
import type { CameraFrame } from "./spine-regions";

/** One scroll chapter — drives hotspot, camera step, and connector. */
export interface ConceptSection {
  id: string;
  region: SpineRegion;
  /** Hotspot position along spine column, 0 = top (skull) … 1 = base */
  anchorY: number;
  camera: CameraFrame;
}

/** Ordered narrative — index must match StoryCard `sectionIndex`. */
export const CONCEPT_SECTIONS: readonly ConceptSection[] = [
  {
    id: "hero",
    region: "skull",
    anchorY: 0.1,
    camera: { position: [2.4, 9.4, 4.2], lookAt: [0, 9.2, 0] },
  },
  {
    id: "about",
    region: "cervical",
    anchorY: 0.22,
    camera: { position: [2.5, 7.8, 4.1], lookAt: [0, 7.6, 0] },
  },
  {
    id: "philosophy",
    region: "thoracic",
    anchorY: 0.36,
    camera: { position: [2.55, 6.2, 4.25], lookAt: [0, 6, 0] },
  },
  {
    id: "steps",
    region: "thoracic",
    anchorY: 0.46,
    camera: { position: [2.6, 5.1, 4.35], lookAt: [0, 4.9, 0] },
  },
  {
    id: "experience",
    region: "lumbar",
    anchorY: 0.58,
    camera: { position: [2.7, 3.2, 4.8], lookAt: [0, 3, 0] },
  },
  {
    id: "pricing",
    region: "sacrum",
    anchorY: 0.72,
    camera: { position: [2.8, 1.6, 5], lookAt: [0, 1.4, 0] },
  },
  {
    id: "faq",
    region: "coccyx",
    anchorY: 0.84,
    camera: { position: [2.9, 0.6, 5.2], lookAt: [0, 0.5, 0] },
  },
  {
    id: "cta",
    region: "cta",
    anchorY: 0.62,
    camera: { position: [3.2, 4, 5.5], lookAt: [0, 4, 0] },
  },
] as const;

export const CONCEPT_SECTION_COUNT = CONCEPT_SECTIONS.length;
