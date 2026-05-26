import { getContext, setContext } from "svelte";
import {
  CONCEPT_SECTION_COUNT,
  CONCEPT_SECTIONS,
  type ConceptSection,
} from "./concept-sections";
import type { SpineRegion } from "./spine-regions";

const SPINE_LANDING_KEY = Symbol("spine-landing");

export interface SpineLandingContext {
  readonly activeRegion: SpineRegion;
  readonly activeSectionIndex: number;
  readonly activeSection: ConceptSection;
  /** 0 at skull … 1 at coccyx — discrete steps per section */
  readonly spineProgress: number;
  readonly reducedMotion: boolean;
  readonly webglEnabled: boolean;
  readonly sceneReady: boolean;
  setActiveSection: (index: number) => void;
  setWebglEnabled: (enabled: boolean) => void;
  setSceneReady: (ready: boolean) => void;
}

export function createSpineLandingContext(): SpineLandingContext {
  let activeSectionIndex = $state(0);
  let reducedMotion = $state(false);
  let webglEnabled = $state(true);
  let sceneReady = $state(false);

  if (typeof window !== "undefined") {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      reducedMotion = mq.matches;
    };
    mq.addEventListener("change", onChange);
  }

  const activeSection = $derived(
    CONCEPT_SECTIONS[activeSectionIndex] ?? CONCEPT_SECTIONS[0],
  );

  const activeRegion = $derived(activeSection.region);

  const spineProgress = $derived(
    CONCEPT_SECTION_COUNT <= 1
      ? 0
      : activeSectionIndex / (CONCEPT_SECTION_COUNT - 1),
  );

  return {
    get activeRegion() {
      return activeRegion;
    },
    get activeSectionIndex() {
      return activeSectionIndex;
    },
    get activeSection() {
      return activeSection;
    },
    get spineProgress() {
      return spineProgress;
    },
    get reducedMotion() {
      return reducedMotion;
    },
    get webglEnabled() {
      return webglEnabled;
    },
    get sceneReady() {
      return sceneReady;
    },
    setActiveSection(index) {
      const clamped = Math.max(0, Math.min(CONCEPT_SECTION_COUNT - 1, index));
      if (clamped === activeSectionIndex) return;
      activeSectionIndex = clamped;
    },
    setWebglEnabled(enabled) {
      webglEnabled = enabled;
    },
    setSceneReady(ready) {
      sceneReady = ready;
    },
  };
}

export function setSpineLandingContext(ctx: SpineLandingContext): void {
  setContext(SPINE_LANDING_KEY, ctx);
}

export function useSpineLanding(): SpineLandingContext {
  const ctx = getContext<SpineLandingContext | undefined>(SPINE_LANDING_KEY);
  if (!ctx) {
    throw new Error("useSpineLanding must be used within ConceptLanding");
  }
  return ctx;
}
