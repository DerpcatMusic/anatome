/** Client-supplied clock for query handlers (avoids Date.now() in queries). */
export function requireQueryNow(now: number | undefined): number {
  if (now === undefined || !Number.isFinite(now)) {
    throw new Error("now timestamp is required");
  }
  return now;
}
