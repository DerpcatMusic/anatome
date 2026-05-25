import { browser } from "$app/environment";

/** Hero CTAs/video are only interactive while the hero viewport is mostly visible. */
export function createHeroScrollActive(onChange: (active: boolean) => void) {
  if (!browser) return () => {};

  const evaluate = () => {
    const spacer = document.querySelector<HTMLElement>(".l-hero-spacer");
    const height = spacer?.offsetHeight ?? window.innerHeight;
    onChange(window.scrollY < height * 0.72);
  };

  evaluate();
  window.addEventListener("scroll", evaluate, { passive: true });
  window.addEventListener("resize", evaluate, { passive: true });

  return () => {
    window.removeEventListener("scroll", evaluate);
    window.removeEventListener("resize", evaluate);
  };
}
