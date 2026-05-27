import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BENTO_FRAME_ROTATIONS,
  BENTO_MOTION,
  LANDING_BENTO_DESKTOP_MQ,
} from "./landing-motion";

const FRAME_SELECTOR = "[data-experience-bento-frame]";

type BentoElements = {
  experience: HTMLElement;
  track: HTMLElement;
  pin: HTMLElement;
  frames: HTMLElement[];
};

function queryBento(root: HTMLElement): BentoElements | null {
  const experience = root.querySelector<HTMLElement>("[data-landing-experience]");
  const track = experience?.querySelector<HTMLElement>(".experience-bento__track");
  const pin = experience?.querySelector<HTMLElement>(".experience-bento__pin");
  const frames = experience?.querySelectorAll<HTMLElement>(FRAME_SELECTOR);

  if (!experience || !track || !pin || !frames?.length) return null;

  return { experience, track, pin, frames: [...frames] };
}

function frameHiddenState(index: number) {
  return {
    autoAlpha: 0,
    rotate: BENTO_FRAME_ROTATIONS[index % BENTO_FRAME_ROTATIONS.length],
    ...BENTO_MOTION.hidden,
    visibility: "hidden" as const,
  };
}

function frameShownState() {
  return {
    autoAlpha: 1,
    rotate: 0,
    ...BENTO_MOTION.shown,
    visibility: "visible" as const,
  };
}

function clearPinnedMode(experience: HTMLElement, frames: HTMLElement[]) {
  experience.removeAttribute("data-bento-pinned");
  experience.classList.remove("is-bento-scroll-active");
  gsap.set(frames, { clearProps: "all" });
}

function buildBentoTimeline(elements: BentoElements): ScrollTrigger | undefined {
  const { experience, track, pin, frames } = elements;
  const step = 1 / frames.length;

  experience.setAttribute("data-bento-pinned", "");
  gsap.set(frames, { force3D: true });
  frames.forEach((frame, index) => {
    gsap.set(frame, frameHiddenState(index));
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      pin,
      pinSpacing: true,
      scrub: BENTO_MOTION.scrub,
      anticipatePin: BENTO_MOTION.anticipatePin,
      invalidateOnRefresh: true,
      snap: {
        snapTo: (value: number) => {
          const snapStep = 1 / Math.max(frames.length - 1, 1);
          return Math.round(value / snapStep) * snapStep;
        },
        duration: BENTO_MOTION.snap.duration,
        delay: BENTO_MOTION.snap.delay,
      },
      onEnter: () => experience.classList.add("is-bento-scroll-active"),
      onEnterBack: () => experience.classList.add("is-bento-scroll-active"),
      onLeave: () => experience.classList.remove("is-bento-scroll-active"),
      onLeaveBack: () => experience.classList.remove("is-bento-scroll-active"),
    },
  });

  frames.forEach((frame, index) => {
    tl.fromTo(
      frame,
      frameHiddenState(index),
      {
        ...frameShownState(),
        duration: step * 0.85,
      },
      index * step,
    );
  });

  return tl.scrollTrigger;
}

/**
 * Desktop-only pinned bento chapter. Must run synchronously inside `gsap.context`.
 */
export function initExperienceBentoScroll(root: HTMLElement): (() => void) | undefined {
  const elements = queryBento(root);
  if (!elements) return undefined;

  const { experience, frames } = elements;
  const mm = gsap.matchMedia();

  mm.add(LANDING_BENTO_DESKTOP_MQ, () => {
    clearPinnedMode(experience, frames);
    const trigger = buildBentoTimeline(elements);
    ScrollTrigger.refresh();
    return () => {
      trigger?.kill();
      clearPinnedMode(experience, frames);
    };
  });

  return () => {
    mm.revert();
    clearPinnedMode(experience, frames);
  };
}
