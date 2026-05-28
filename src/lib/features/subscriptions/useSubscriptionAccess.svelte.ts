import { api } from "$convex/_generated/api";
import { useQuery } from "convex-svelte";
import { initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";

/** Customer-only self-serve billing (instructors/admins blocked). */
export function useSubscriptionAccess() {
  const auth = initAuth();
  const accessQuery = useQuery(api.subscriptions.customer.getSubscriptionAccess, () =>
    auth.isAuthenticated && canRunAuthenticatedQuery() ? {} : "skip",
  );

  const canSubscribe = $derived(accessQuery.data?.canSubscribe ?? true);
  const role = $derived(accessQuery.data?.role ?? null);
  const isStaffRole = $derived(role === "instructor" || role === "admin");

  const isLoading = $derived(accessQuery.isLoading);

  return {
    get canSubscribe() {
      return canSubscribe;
    },
    get role() {
      return role;
    },
    get isStaffRole() {
      return isStaffRole;
    },
    get isLoading() {
      return isLoading;
    },
  };
}
