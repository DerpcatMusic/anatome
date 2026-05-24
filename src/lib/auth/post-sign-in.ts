export type AppRole = "customer" | "instructor" | "admin";

export function dashboardPathForRole(
  role: AppRole,
  needsOnboarding: boolean,
): string {
  if (needsOnboarding) return "/onboarding";
  if (role === "instructor" || role === "admin") return "/i/dashboard";
  return "/u/dashboard";
}

export function dashboardPathFromCachedRole(cachedRole: string | null): string {
  if (cachedRole === "instructor" || cachedRole === "admin") {
    return "/i/dashboard";
  }
  return "/u/dashboard";
}
