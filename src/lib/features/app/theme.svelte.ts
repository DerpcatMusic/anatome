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

function applyResolvedTheme(isDark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
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
      applyResolvedTheme(this.isDark);
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
