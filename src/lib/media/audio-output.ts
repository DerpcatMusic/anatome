import { PersistedState } from "runed";

export const audioOutputPref = new PersistedState<string>("homebody-audio-output", "");

/** `HTMLMediaElement.setSinkId` — Chrome/Edge; limited Firefox; not Safari (2025). */
export function isAudioOutputSelectionSupported(): boolean {
  if (typeof HTMLMediaElement === "undefined") return false;
  return typeof HTMLMediaElement.prototype.setSinkId === "function";
}

export async function applyAudioSink(
  element: HTMLMediaElement,
  deviceId: string,
): Promise<void> {
  if (!deviceId || !isAudioOutputSelectionSupported()) return;
  await element.setSinkId(deviceId);
}
