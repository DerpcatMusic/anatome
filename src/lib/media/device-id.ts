/** Omit invalid ids — `"default"` and stale ids break getUserMedia on Firefox. */
export function sanitizeMediaDeviceId(
  deviceId: string | undefined | null,
): string | undefined {
  if (!deviceId) return undefined;
  const trimmed = deviceId.trim();
  if (!trimmed || trimmed === "default") return undefined;
  return trimmed;
}
