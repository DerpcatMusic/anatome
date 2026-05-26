import type { SpineRegion } from "../spine-regions";

export interface VertebraSpec {
  region: SpineRegion;
  y: number;
  height: number;
  radius: number;
}

/** Hybrid procedural spine: accurate silhouette, segmented for emissive highlights. */
export function buildVertebraSpecs(): VertebraSpec[] {
  const specs: VertebraSpec[] = [];

  const addStack = (
    region: SpineRegion,
    count: number,
    startY: number,
    spacing: number,
    baseRadius: number,
    height: number,
    taper = 0.92,
  ) => {
    let r = baseRadius;
    for (let i = 0; i < count; i++) {
      specs.push({
        region,
        y: startY - i * spacing,
        height,
        radius: r,
      });
      r *= taper;
    }
  };

  addStack("coccyx", 2, 0.55, 0.2, 0.14, 0.12, 0.88);
  addStack("sacrum", 3, 1.1, 0.22, 0.38, 0.18, 0.95);
  addStack("lumbar", 5, 2.05, 0.28, 0.42, 0.22, 0.96);
  addStack("thoracic", 12, 3.85, 0.24, 0.36, 0.2, 0.97);
  addStack("cervical", 7, 6.95, 0.22, 0.28, 0.16, 0.96);

  return specs;
}

export const SKULL_SPEC = {
  region: "skull" as const,
  y: 8.35,
  radius: 0.55,
};

export const SPINE_ROTATION_SPEED = (2 * Math.PI) / (8 * 60); // ~8 min per revolution at 60fps
