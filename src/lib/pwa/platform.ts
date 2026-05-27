import { browser } from "$app/environment";

export function isIosSafari(): boolean {
  if (!browser) return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

export function isStandaloneDisplayMode(): boolean {
  if (!browser) return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS legacy
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function supportsWebPush(): boolean {
  if (!browser) return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function canPromptForPushOnThisPlatform(): boolean {
  if (!supportsWebPush()) return false;
  if (isIosSafari() && !isStandaloneDisplayMode()) return false;
  return true;
}

export function isMobileViewport(): boolean {
  if (!browser) return false;
  return window.matchMedia("(max-width: 860px)").matches;
}
