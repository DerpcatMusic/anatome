/** Bucket width for calendar `now` args — limits query resubscribes between client clock ticks. */
export const QUERY_NOW_CALENDAR_BUCKET_MS = 120_000;

/** Snap `now` so Convex query args stay stable between client clock ticks. */
export function bucketQueryNowMs(
  nowMs: number,
  bucketMs: number = QUERY_NOW_CALENDAR_BUCKET_MS,
): number {
  if (bucketMs <= 0) return nowMs;
  return Math.floor(nowMs / bucketMs) * bucketMs;
}
