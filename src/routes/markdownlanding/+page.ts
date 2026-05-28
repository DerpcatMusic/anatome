import { baselineLandingCopyValues } from "$lib/features/landing/copy/landing-copy-export";
import { allLandingCopyFields } from "$lib/features/landing/copy/landing-copy-manifest";

export const prerender = false;

export function load() {
  return {
    baseline: baselineLandingCopyValues(),
    fieldCount: allLandingCopyFields().length,
  };
}
