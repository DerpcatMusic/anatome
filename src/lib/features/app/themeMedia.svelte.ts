import { useEventListener } from "runed";
import { theme } from "./theme.svelte";

const darkMq = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : undefined;

/** Call once from the root layout — keeps `theme.isDark` in sync with OS preference. */
export function useThemeMedia() {
  const mq = darkMq();
  if (mq) {
    theme.setSystemPrefersDark(mq.matches);
  }

  useEventListener(darkMq, "change", (event) => {
    theme.setSystemPrefersDark((event as MediaQueryListEvent).matches);
  });
}
