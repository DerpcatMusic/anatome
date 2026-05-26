import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const DESKTOP_MQ = "(min-width: 56rem)";

/** Registers ScrollTrigger chapters for the marketing landing. No-op when reduced motion. */
export function initLandingScroll(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};

  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    initHeroFade(root);
    initAboutParallax(root);
    initExperienceBento(root);
    initStepsTimeline(root);
    initPricingGlow(root);
  }, root);

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    window.removeEventListener("resize", onResize);
    ctx.revert();
  };
}

function initHeroFade(root: HTMLElement) {
  const spacer = root.querySelector<HTMLElement>(".l-hero-spacer");
  const heroFixed = root.querySelector<HTMLElement>(".l-hero-fixed");
  if (!spacer || !heroFixed) return;

  const targets = [
    heroFixed.querySelector(".hero-bg__media"),
    heroFixed.querySelector(".hero-bg__scrim"),
    heroFixed.querySelector(".hero-bg__filter"),
    root.querySelector(".landing-page__mesh"),
  ].filter((el): el is Element => el != null);

  if (targets.length === 0) return;

  gsap.to(targets, {
    opacity: 0.2,
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

function initExperienceBento(root: HTMLElement) {
  const experience = root.querySelector<HTMLElement>("[data-landing-experience]");
  const track = experience?.querySelector<HTMLElement>(".experience-bento__track");
  const pin = experience?.querySelector<HTMLElement>(".experience-bento__pin");
  const cells = experience?.querySelectorAll<HTMLElement>("[data-experience-bento-cell]");
  const frames = experience?.querySelectorAll<HTMLElement>("[data-experience-bento-frame]");

  if (!experience || !track || !pin || !cells?.length) return;

  const rotations = [-2.25, 1.75, -1.5, 2];
  const setActiveCell = (index: number) => {
    cells.forEach((cell, i) => {
      const active = i === index;
      cell.classList.toggle("is-active", active);
      cell.setAttribute("aria-selected", active ? "true" : "false");
      cell.tabIndex = active ? 0 : -1;
    });
  };

  gsap.set(frames, {
    rotate: (i) => rotations[i % rotations.length],
    scale: 0.94,
    opacity: 0,
  });

  gsap.to(frames, {
    rotate: 0,
    scale: 1,
    opacity: 1,
    duration: 0.85,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: {
      trigger: experience,
      start: "top 78%",
      toggleActions: "play none none reverse",
    },
  });

  if (!window.matchMedia(DESKTOP_MQ).matches) {
    setActiveCell(0);
    return;
  }

  gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: "top 12%",
      end: "bottom bottom",
      pin,
      pinSpacing: true,
      scrub: 0.75,
      snap: {
        snapTo: (value: number) => {
          const step = 1 / Math.max(cells.length - 1, 1);
          return Math.round(value / step) * step;
        },
        duration: { min: 0.12, max: 0.3 },
        delay: 0.04,
      },
      onUpdate(self) {
        const index = Math.min(
          cells.length - 1,
          Math.round(self.progress * (cells.length - 1)),
        );
        setActiveCell(index);
      },
    },
  });

  setActiveCell(0);
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
