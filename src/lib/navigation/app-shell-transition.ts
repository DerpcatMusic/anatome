import { onNavigate } from "$app/navigation";
import { browser } from "$app/environment";

/** In-app member / instructor shell (sidebar tabs). */
const SHELL_PATH = /^\/(u|i)\//;

const EXIT_MS = 260;
const ENTER_MS = 300;

function isShellTabNavigation(fromPath: string, toPath: string): boolean {
  if (fromPath === toPath) return false;
  return SHELL_PATH.test(fromPath) && SHELL_PATH.test(toPath);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getPageSurface(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".app-main__page");
}

function resetMainScroll() {
  const main = document.querySelector<HTMLElement>(".app-main");
  if (main) main.scrollTop = 0;
}

function waitForAnimation(el: HTMLElement, fallbackMs: number): Promise<void> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, fallbackMs + 80);
    const onEnd = (event: AnimationEvent) => {
      if (event.target !== el) return;
      window.clearTimeout(timeout);
      el.removeEventListener("animationend", onEnd);
      resolve();
    };
    el.addEventListener("animationend", onEnd);
  });
}

async function animateExit(el: HTMLElement): Promise<void> {
  el.classList.remove("app-route-enter");
  el.classList.add("app-route-exit");
  await waitForAnimation(el, EXIT_MS);
  el.classList.remove("app-route-exit");
}

async function animateEnter(el: HTMLElement): Promise<void> {
  el.classList.remove("app-route-exit");
  el.classList.add("app-route-enter");
  await waitForAnimation(el, ENTER_MS);
  el.classList.remove("app-route-enter");
}

/** Legacy cleanup — no longer sets inline opacity. */
export function clearStuckPageSurfaceStyles() {
  for (const el of document.querySelectorAll<HTMLElement>(".app-main__page, .app-main")) {
    el.style.removeProperty("opacity");
    el.style.removeProperty("transition");
    el.style.removeProperty("transform");
    el.classList.remove("app-route-exit", "app-route-enter");
  }
}

/**
 * Tab switch: shrink+fade out → swap route → grow+fade in (one page visible at a time).
 */
export function setupAppShellViewTransitions(): void {
  if (!browser) return;

  clearStuckPageSurfaceStyles();

  onNavigate((navigation) => {
    const from = navigation.from?.url;
    const to = navigation.to?.url;
    if (!from || !to) return;
    if (!isShellTabNavigation(from.pathname, to.pathname)) return;

    if (prefersReducedMotion()) {
      resetMainScroll();
      return;
    }

    return new Promise<void>((resolve) => {
      void (async () => {
        const leaving = getPageSurface();
        if (leaving) await animateExit(leaving);

        resetMainScroll();
        resolve();
        await navigation.complete;

        const entering = getPageSurface();
        if (entering) await animateEnter(entering);
      })();
    });
  });
}
