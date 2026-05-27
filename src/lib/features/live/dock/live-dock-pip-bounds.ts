const STORAGE_KEY = "hb-live-pip-bounds";

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

export function readPipBounds(): PipBounds {
  if (typeof window === "undefined") return DEFAULT_PIP_BOUNDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PIP_BOUNDS;
    const parsed = JSON.parse(raw) as PipBounds;
    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      typeof parsed.width !== "number" ||
      typeof parsed.height !== "number"
    ) {
      return DEFAULT_PIP_BOUNDS;
    }
    return clampPipBounds(parsed);
  } catch {
    return DEFAULT_PIP_BOUNDS;
  }
}

export function writePipBounds(bounds: PipBounds) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clampPipBounds(bounds)));
  } catch {
    /* ignore quota */
  }
}
