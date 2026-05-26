import { api } from "$convex/_generated/api";
import {
  authQuery,
  dashboardPathForRole,
  dashboardPathFromCachedRole,
  getCachedRole,
  type AppRole,
} from "$lib/auth/session.svelte";

/** Resolve where /dashboard (and aliases) should send an authenticated user. */
export async function resolveDashboardRedirectPath(): Promise<string> {
  const cached = getCachedRole();
  if (cached === "instructor" || cached === "admin") {
    return dashboardPathFromCachedRole(cached);
  }

  const session = await authQuery(api.users.session.resolve, {});
  if (session === null) {
    return dashboardPathFromCachedRole(null);
  }

  return dashboardPathForRole(session.role as AppRole, session.needsOnboarding);
}
