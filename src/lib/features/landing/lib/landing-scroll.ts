import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DESKTOP_MQ = "(min-width: 900px)";

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
  const frames = experience?.querySelectorAll<HTMLElement>("[data-experience-bento-frame]");

  if (!experience || !track || !pin || !frames?.length) return;

  const rotations = [-2.25, 1.75, -1.5, 2];
  const step = 1 / frames.length;

  const hideAll = () => {
    frames.forEach((frame, i) => {
      gsap.set(frame, {
        autoAlpha: 0,
        rotate: rotations[i % rotations.length],
        scale: 0.92,
        y: 28,
        visibility: "hidden",
      });
    });
  };

  if (!window.matchMedia(DESKTOP_MQ).matches) {
    experience.removeAttribute("data-bento-pinned");
    gsap.set(frames, { clearProps: "all" });
    return;
  }

  experience.setAttribute("data-bento-pinned", "");
  hideAll();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      pin,
      pinSpacing: true,
      scrub: 0.65,
      anticipatePin: 1,
      snap: {
        snapTo: (value: number) => {
          const step = 1 / Math.max(frames.length - 1, 1);
          return Math.round(value / step) * step;
        },
        duration: { min: 0.12, max: 0.28 },
        delay: 0.03,
      },
    },
  });

  frames.forEach((frame, i) => {
    tl.fromTo(
      frame,
      {
        autoAlpha: 0,
        rotate: rotations[i % rotations.length],
        scale: 0.92,
        y: 28,
        visibility: "hidden",
      },
      {
        autoAlpha: 1,
        rotate: 0,
        scale: 1,
        y: 0,
        visibility: "visible",
        duration: step * 0.85,
        ease: "power3.out",
      },
      i * step,
    );
  });
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
