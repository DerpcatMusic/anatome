import { PersistedState } from "runed";

export type PipBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const DEFAULT_PIP_BOUNDS: PipBounds = {
  x: 16,
  y: 96,
  width: 320,
  height: 180,
};

export const pipBoundsPref = new PersistedState<PipBounds>("pip-bounds", DEFAULT_PIP_BOUNDS);

const MIN_WIDTH = 240;
const MIN_HEIGHT = 135;
const MAX_WIDTH_RATIO = 0.45;
const MAX_HEIGHT_RATIO = 0.4;

export function clampPipBounds(bounds: PipBounds): PipBounds {
  if (typeof window === "undefined") return bounds;
  const maxW = Math.floor(window.innerWidth * MAX_WIDTH_RATIO);
  const maxH = Math.floor(window.innerHeight * MAX_HEIGHT_RATIO);
  const width = Math.min(maxW, Math.max(MIN_WIDTH, bounds.width));
  const height = Math.min(maxH, Math.max(MIN_HEIGHT, bounds.height));
  const x = Math.min(
    Math.max(8, bounds.x),
    window.innerWidth - width - 8,
  );
  const y = Math.min(
    Math.max(8, bounds.y),
    window.innerHeight - height - 8,
  );
  return { x, y, width, height };
}
