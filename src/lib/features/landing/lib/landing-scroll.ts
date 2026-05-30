import { initExperienceBentoScroll } from "./experience-bento-scroll";
import { prefersReducedMotion } from "./landing-motion";

export { prefersReducedMotion };

/**
 * Registers ScrollTrigger chapters for the marketing landing.
 * GSAP is lazy-loaded when the function runs — no top-level import.
 */
export function initLandingScroll(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};

  let cleanupBento: (() => void) | undefined;
  let ctx: { revert(): void } | undefined;
  let cleanupCalled = false;

  void import("gsap").then(({ default: gsapDefault, gsap: gsapExported }) => {
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cleanupCalled) return;

      const gsap = gsapDefault ?? gsapExported;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ limitCallbacks: true });

      ctx = gsap.context(() => {
        const spacer = root.querySelector<HTMLElement>(".l-hero-spacer");
        const heroFixed = root.querySelector<HTMLElement>(".l-hero-fixed");
        if (spacer && heroFixed) {
          const targets = [heroFixed.querySelector(".hero-bg")].filter(
            (el): el is Element => el != null,
          );
          if (targets.length > 0) {
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
        }

        const about = root.querySelector<HTMLElement>("#about");
        const photo = root.querySelector<HTMLElement>("[data-landing-about-photo]");
        if (about && photo) {
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

        const featured = root.querySelector<HTMLElement>(".pricing__featured");
        if (featured) {
          ScrollTrigger.create({
            trigger: featured,
            start: "top 80%",
            once: true,
            onEnter: () => featured.classList.add("pricing__featured--glow"),
          });
        }

        cleanupBento = initExperienceBentoScroll(root, gsap, ScrollTrigger);
        ScrollTrigger.refresh();
      }, root);
    });
  });

  const onResize = () => {};
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    cleanupCalled = true;
    window.removeEventListener("resize", onResize);
    cleanupBento?.();
    ctx?.revert();
  };
}
