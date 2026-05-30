import { useInterval } from "runed";

/** Default tick for calendar/dashboard/sidebar (join windows use a shorter interval). */
export const QUERY_NOW_DEFAULT_MS = 90_000;
/** Live room join-access / expiry polling. */
export const QUERY_NOW_LIVE_ROOM_MS = 30_000;
export { bucketQueryNowMs, QUERY_NOW_CALENDAR_BUCKET_MS } from "./queryClockBucket";

/**
 * Stable client clock for Convex query `now` args.
 * Do not pass `Date.now()` inline in `useQuery` closures — each run changes args and
 * resubscribes, which can leave `isLoading` stuck true.
 */
export function useQueryNowMs(refreshMs: number = QUERY_NOW_DEFAULT_MS) {
  let nowMs = $state(Date.now());

  $effect(() => {
    const tick = () => {
      nowMs = Date.now();
    };
    if (refreshMs <= 0) return;

    useInterval(refreshMs, { callback: tick });

    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  });

  return {
    get nowMs() {
      return nowMs;
    },
  };
}
