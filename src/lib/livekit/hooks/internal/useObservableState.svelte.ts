import type { Observable } from "rxjs";

/**
 * Subscribe to an RxJS Observable and return a reactive state value.
 * Automatically subscribes on mount and unsubscribes on cleanup.
 *
 * @internal
 */
export function useObservableState<T>(
  observable: Observable<T> | undefined,
  startWith: T,
): T {
  let state = $state<T>(startWith);

  $effect(() => {
    if (typeof window === "undefined" || !observable) return;

    let active = true;
    const subscription = observable.subscribe((next) => {
      if (active) state = next;
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  });

  // svelte-ignore state_referenced_locally
  return state;
}
