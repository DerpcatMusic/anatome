import { browser } from "$app/environment";
import { registerSW } from "virtual:pwa-register";
import { installPrompt } from "./install-prompt.svelte";

let unregisterInstall: (() => void) | null = null;

export function registerPwaClient(): () => void {
  if (!browser) return () => {};

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      const banner = document.getElementById("pwa-update-banner");
      if (banner) {
        banner.hidden = false;
        return;
      }
      if (window.confirm("גרסה חדשה זמינה. לרענן את האפליקציה?")) {
        void updateSW(true);
      }
    },
    onOfflineReady() {
      /* shell cached */
    },
  });

  const syncStandaloneClass = () => {
    document.documentElement.classList.toggle(
      "pwa-standalone",
      window.matchMedia("(display-mode: standalone)").matches,
    );
  };
  syncStandaloneClass();
  const displayModeQuery = window.matchMedia("(display-mode: standalone)");
  displayModeQuery.addEventListener("change", syncStandaloneClass);

  const reloadBtn = document.getElementById("pwa-update-reload");
  const onReloadClick = () => {
    void updateSW(true);
  };
  reloadBtn?.addEventListener("click", onReloadClick);

  unregisterInstall = installPrompt.init();

  return () => {
    displayModeQuery.removeEventListener("change", syncStandaloneClass);
    reloadBtn?.removeEventListener("click", onReloadClick);
    unregisterInstall?.();
    unregisterInstall = null;
  };
}
