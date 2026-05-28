import { api } from "$convex/_generated/api";
import { useQuery } from "convex-svelte";
import { dev } from "$app/environment";
import { env as publicEnv } from "$env/dynamic/public";
function clientSandboxFallback() {
  const flag = publicEnv.PUBLIC_BILLING_SANDBOX_ENABLED?.trim().toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return dev;
}

/** Billing flags from Convex (preferred) with vite-dev fallback when offline. */
export function useBillingFlags() {
  const flagsQuery = useQuery(api.subscriptions.customer.getBillingFlags, () => ({}));

  const subscriptionsEnabled = $derived(
    flagsQuery.data?.subscriptionsEnabled ?? clientSandboxFallback(),
  );
  const checkoutEnabled = $derived(
    flagsQuery.data?.checkoutEnabled ?? clientSandboxFallback(),
  );
  const sandbox = $derived(flagsQuery.data?.sandbox ?? clientSandboxFallback());
  const creditsPurchaseEnabled = $derived(
    flagsQuery.data?.creditsPurchaseEnabled ??
      (clientSandboxFallback() && checkoutEnabled),
  );
  const isLoading = $derived(flagsQuery.isLoading);
  const error = $derived(flagsQuery.error);

  return {
    get subscriptionsEnabled() {
      return subscriptionsEnabled;
    },
    get checkoutEnabled() {
      return checkoutEnabled;
    },
    get creditsPurchaseEnabled() {
      return creditsPurchaseEnabled;
    },
    get sandbox() {
      return sandbox;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
  };
}
