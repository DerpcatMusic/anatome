import { syncFavicon } from "$lib/components/brand/syncFavicon";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "homebody-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && ["light", "dark", "system"].includes(stored)) return stored;
  return "system";
}

function resolveIsDark(theme: Theme, systemPrefersDark: boolean): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark);
}

const THEME_TRANSITION_MS = 320;

let themeTransitionsEnabled = false;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function applyResolvedTheme(isDark: boolean, options?: { instant?: boolean }) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  const next = isDark ? "dark" : "light";
  if (html.getAttribute("data-theme") === next) return;

  const apply = () => {
    html.setAttribute("data-theme", next);
    html.style.colorScheme = next;
    syncFavicon(isDark);
  };

  const instant = options?.instant === true || !themeTransitionsEnabled || prefersReducedMotion();

  if (instant) {
    apply();
    return;
  }

  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(apply);
    return;
  }

  html.classList.add("is-theme-transitioning");
  apply();
  window.setTimeout(() => html.classList.remove("is-theme-transitioning"), THEME_TRANSITION_MS);
}

function enableThemeTransitionsAfterPaint() {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      themeTransitionsEnabled = true;
    });
  });
}

class ThemeStore {
  value = $state<Theme>("system");
  systemPrefersDark = $state(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );

  readonly isDark = $derived(resolveIsDark(this.value, this.systemPrefersDark));

  constructor() {
    if (typeof window !== "undefined") {
      this.value = getInitialTheme();
      applyResolvedTheme(this.isDark, { instant: true });
      enableThemeTransitionsAfterPaint();
    }
  }

  setSystemPrefersDark(matches: boolean) {
    this.systemPrefersDark = matches;
    if (this.value === "system") {
      applyResolvedTheme(this.isDark);
    }
  }

  set(theme: Theme) {
    this.value = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    applyResolvedTheme(resolveIsDark(theme, this.systemPrefersDark));
  }

  toggle() {
    this.set(this.isDark ? "light" : "dark");
  }
}

export const theme = new ThemeStore();
