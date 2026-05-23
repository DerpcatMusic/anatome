type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "homebody-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && ["light", "dark", "system"].includes(stored)) return stored;
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);

  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

class ThemeStore {
  value = $state<Theme>("system");

  constructor() {
    if (typeof window !== "undefined") {
      this.value = getInitialTheme();
      applyTheme(this.value);

      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (this.value === "system") {
            applyTheme("system");
          }
        });
    }
  }

  set(theme: Theme) {
    this.value = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }

  toggle() {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isCurrentlyDark =
      this.value === "dark" || (this.value === "system" && prefersDark);

    this.set(isCurrentlyDark ? "light" : "dark");
  }
}

export const theme = new ThemeStore();
