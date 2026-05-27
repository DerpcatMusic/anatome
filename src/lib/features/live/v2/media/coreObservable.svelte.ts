import { onDestroy } from "svelte";

type Unsubscribe = () => void;

/**
 * Bridge LiveKit / components-core observables to Svelte 5 state.
 * Keep this file small — do not grow into a framework.
 */
export function subscribeObservable<T>(
  subscribe: (listener: (value: T) => void) => Unsubscribe,
  onValue: (value: T) => void,
) {
  let stopped = false;
  const unsub = subscribe((value) => {
    if (!stopped) onValue(value);
  });

  onDestroy(() => {
    stopped = true;
    unsub();
  });

  return unsub;
}
