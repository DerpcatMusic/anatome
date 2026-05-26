import { browser } from "$app/environment";

export interface SpineBrandColors {
  base: string;
  muted: string;
  highlight: string;
  accent: string;
  emissive: string;
}

const FALLBACK: SpineBrandColors = {
  base: "#c8d4bc",
  muted: "#9aa88a",
  highlight: "#566342",
  accent: "#18241b",
  emissive: "#6b7f52",
};

/** Read semantic CSS tokens once for Three.js materials. */
export function readSpineBrandColors(root: HTMLElement = document.documentElement): SpineBrandColors {
  if (!browser) return FALLBACK;

  const style = getComputedStyle(root);
  const primary = style.getPropertyValue("--primary").trim() || FALLBACK.accent;
  const secondary = style.getPropertyValue("--secondary").trim() || FALLBACK.highlight;
  const muted = style.getPropertyValue("--foreground-muted").trim() || FALLBACK.muted;
  const card = style.getPropertyValue("--card").trim() || FALLBACK.base;

  return {
    base: card,
    muted,
    highlight: secondary,
    accent: primary,
    emissive: secondary,
  };
}
