const STORAGE_KEY = "hb-live-audio-output";

/** `HTMLMediaElement.setSinkId` — Chrome/Edge; limited Firefox; not Safari (2025). */
export function isAudioOutputSelectionSupported(): boolean {
  if (typeof HTMLMediaElement === "undefined") return false;
  return typeof HTMLMediaElement.prototype.setSinkId === "function";
}

export function readPersistedAudioOutputId(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function persistAudioOutputId(deviceId: string) {
  if (typeof localStorage === "undefined") return;
  try {
    if (!deviceId) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, deviceId);
  } catch {
    /* quota / private mode */
  }
}

export async function applyAudioSink(
  element: HTMLMediaElement,
  deviceId: string,
): Promise<void> {
  if (!deviceId || !isAudioOutputSelectionSupported()) return;
  await element.setSinkId(deviceId);
}
