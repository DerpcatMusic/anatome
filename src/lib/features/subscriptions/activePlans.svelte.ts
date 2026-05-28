import type { FunctionReturnType } from "convex/server";
import { api } from "$convex/_generated/api";
import { useQuery } from "convex-svelte";
import { FALLBACK_PLANS, pickFeaturedPlan, type CatalogPlan } from "./plansCatalog";

export type ActivePlan = FunctionReturnType<typeof api.subscriptions.customer.listPlans>[number];

/** Active subscription plans from Convex (`plans` table or seeded defaults). */
export function useActivePlans() {
  const plansQuery = useQuery(api.subscriptions.customer.listPlans, () => ({}));

  const plans = $derived.by((): ActivePlan[] | CatalogPlan[] => {
    if (plansQuery.data && plansQuery.data.length > 0) {
      return plansQuery.data;
    }
    if (!plansQuery.isLoading) {
      return [...FALLBACK_PLANS];
    }
    return [];
  });

  const featured = $derived(pickFeaturedPlan(plans));
  const otherPlans = $derived(
    featured ? plans.filter((p) => p.slug !== featured.slug) : plans,
  );

  const isLoading = $derived(plansQuery.isLoading && plans.length === 0);
  const usingFallback = $derived(
    !plansQuery.isLoading && (plansQuery.data?.length ?? 0) === 0 && plans.length > 0,
  );
  const error = $derived(plansQuery.error);

  return {
    get plans() {
      return plans;
    },
    get featured() {
      return featured;
    },
    get otherPlans() {
      return otherPlans;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get usingFallback() {
      return usingFallback;
    },
  };
}
