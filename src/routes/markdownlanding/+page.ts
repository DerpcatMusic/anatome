import { baselineLandingCopyValues } from "$lib/features/landing/copy/landing-copy-export";
import { allLandingCopyFields } from "$lib/features/landing/copy/landing-copy-manifest";
import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = () => {
  return {
    baseline: baselineLandingCopyValues(),
    fieldCount: allLandingCopyFields().length,
  };
};
