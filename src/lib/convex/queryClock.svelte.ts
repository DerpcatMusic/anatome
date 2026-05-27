import { onMount } from "svelte";

/** Default tick for calendar/dashboard/sidebar (join windows use a shorter interval). */
export const QUERY_NOW_DEFAULT_MS = 90_000;
/** Live room join-access / expiry polling. */
export const QUERY_NOW_LIVE_ROOM_MS = 30_000;

/**
 * Stable client clock for Convex query `now` args.
 * Do not pass `Date.now()` inline in `useQuery` closures — each run changes args and
 * resubscribes, which can leave `isLoading` stuck true.
 */
export function useQueryNowMs(refreshMs: number = QUERY_NOW_DEFAULT_MS) {
  let nowMs = $state(Date.now());

  onMount(() => {
    const tick = () => {
      nowMs = Date.now();
    };
    if (refreshMs <= 0) return;

    const interval = setInterval(tick, refreshMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  });

  return {
    get nowMs() {
      return nowMs;
    },
  };
}
