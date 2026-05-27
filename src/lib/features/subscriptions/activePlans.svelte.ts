import { api } from "$convex/_generated/api";
import { useQuery } from "convex-svelte";

/** Active subscription plans from Convex (`plans` table or seeded defaults). */
export function useActivePlans() {
  const plansQuery = useQuery(api.subscriptions.customer.listPlans, () => ({}));

  const plans = $derived(plansQuery.data ?? []);
  const isLoading = $derived(plansQuery.isLoading);

  return {
    plans,
    isLoading,
  };
}
