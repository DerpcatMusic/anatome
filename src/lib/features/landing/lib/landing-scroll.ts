import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initExperienceBentoScroll } from "./experience-bento-scroll";
import { prefersReducedMotion } from "./landing-motion";

export { prefersReducedMotion };

/** Registers ScrollTrigger chapters for the marketing landing. No-op when reduced motion. */
export function initLandingScroll(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });

  let cleanupBento: (() => void) | undefined;

  const ctx = gsap.context(() => {
    initHeroFade(root);
    initAboutParallax(root);
    cleanupBento = initExperienceBentoScroll(root);
    initStepsTimeline(root);
    initPricingGlow(root);
    ScrollTrigger.refresh();
  }, root);

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    window.removeEventListener("resize", onResize);
    cleanupBento?.();
    ctx.revert();
  };
}

function initHeroFade(root: HTMLElement) {
  const spacer = root.querySelector<HTMLElement>(".l-hero-spacer");
  const heroFixed = root.querySelector<HTMLElement>(".l-hero-fixed");
  if (!spacer || !heroFixed) return;

  const targets = [
    heroFixed.querySelector(".hero-bg"),
  ].filter((el): el is Element => el != null);

  if (targets.length === 0) return;

  gsap.to(targets, {
    opacity: 0.35,
    ease: "none",
    scrollTrigger: {
      trigger: spacer,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
    },
  });
}

function initAboutParallax(root: HTMLElement) {
  const about = root.querySelector<HTMLElement>("#about");
  const photo = root.querySelector<HTMLElement>("[data-landing-about-photo]");
  if (!about || !photo) return;

  gsap.fromTo(
    photo,
    { y: 28 },
    {
      y: -28,
      ease: "none",
      scrollTrigger: {
        trigger: about,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    },
  );
}

function initStepsTimeline(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".section--steps");
  const line = section?.querySelector<HTMLElement>(".steps__progress");
  const steps = section?.querySelectorAll<HTMLElement>(".step");
  if (!section || !line || !steps?.length) return;

  gsap.set(line, { scaleY: 0, transformOrigin: "top center" });

  gsap.to(line, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      end: "bottom 40%",
      scrub: 0.6,
    },
  });

  steps.forEach((step, index) => {
    gsap.fromTo(
      step,
      { opacity: 0.55 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: step,
          start: "top 85%",
          end: "top 55%",
          scrub: 0.5,
          onEnter: () => step.classList.add("is-highlighted"),
          onLeaveBack: () => step.classList.remove("is-highlighted"),
        },
      },
    );

    if (index === 0) step.classList.add("is-highlighted");
  });
}

function initPricingGlow(root: HTMLElement) {
  const featured = root.querySelector<HTMLElement>(".pricing__featured");
  if (!featured) return;

  ScrollTrigger.create({
    trigger: featured,
    start: "top 80%",
    once: true,
    onEnter: () => featured.classList.add("pricing__featured--glow"),
  });
}
