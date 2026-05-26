/** Vertebral / narrative regions for scroll-driven spine storytelling. */
export type SpineRegion =
  | "skull"
  | "cervical"
  | "thoracic"
  | "lumbar"
  | "sacrum"
  | "coccyx"
  | "cta";

export const SPINE_REGIONS: readonly SpineRegion[] = [
  "skull",
  "cervical",
  "thoracic",
  "lumbar",
  "sacrum",
  "coccyx",
  "cta",
] as const;

export interface CameraFrame {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/** Camera keyframes per region — spine runs +Y, camera on +Z. */
export const CAMERA_FRAMES: Record<SpineRegion, CameraFrame> = {
  skull: { position: [2.4, 9.4, 4.2], lookAt: [0, 9.2, 0] },
  cervical: { position: [2.5, 7.8, 4.1], lookAt: [0, 7.6, 0] },
  thoracic: { position: [2.6, 5.6, 4.4], lookAt: [0, 5.4, 0] },
  lumbar: { position: [2.7, 3.2, 4.8], lookAt: [0, 3, 0] },
  sacrum: { position: [2.8, 1.6, 5], lookAt: [0, 1.4, 0] },
  coccyx: { position: [2.9, 0.6, 5.2], lookAt: [0, 0.5, 0] },
  cta: { position: [3.2, 4, 5.5], lookAt: [0, 4, 0] },
};

/** Map `data-spine-region` on story sections to 3D highlight targets. */
export function isSpineRegion(value: string): value is SpineRegion {
  return (SPINE_REGIONS as readonly string[]).includes(value);
}
