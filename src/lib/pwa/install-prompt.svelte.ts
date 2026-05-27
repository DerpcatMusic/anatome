import { browser } from "$app/environment";
import { isIosSafari, isStandaloneDisplayMode } from "./platform";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

class InstallPromptState {
  deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
  installed = $state(false);
  dismissedAt = $state<number | null>(null);

  readonly showIosInstructions = $derived(isIosSafari() && !this.installed);
  readonly showChromiumInstall = $derived(
    browser && this.deferredPrompt !== null && !this.installed,
  );
  readonly canInstall = $derived(this.showChromiumInstall || this.showIosInstructions);

  init() {
    if (!browser) return () => {};

    this.installed = isStandaloneDisplayMode();

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
    };

    const onInstalled = () => {
      this.installed = true;
      this.deferredPrompt = null;
    };

    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const onDisplayMode = () => {
      this.installed = isStandaloneDisplayMode();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    displayModeQuery.addEventListener("change", onDisplayMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      displayModeQuery.removeEventListener("change", onDisplayMode);
    };
  }

  async promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
    const prompt = this.deferredPrompt;
    if (!prompt) return "unavailable";
    await prompt.prompt();
    const choice = await prompt.userChoice;
    this.deferredPrompt = null;
    if (choice.outcome === "accepted") {
      this.installed = true;
    }
    return choice.outcome;
  }

  dismissForSession() {
    this.dismissedAt = Date.now();
  }

  get shouldShowCard(): boolean {
    if (this.installed) return false;
    if (this.dismissedAt !== null) return false;
    return this.canInstall;
  }
}

export const installPrompt = new InstallPromptState();
