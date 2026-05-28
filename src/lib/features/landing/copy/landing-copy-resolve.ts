import he from "$lib/i18n/generated/he";
import { PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";
import { LANDING_COPY_STATIC_VALUES } from "./landing-copy-manifest";

function getNestedString(root: unknown, path: string[]): string {
  let cur: unknown = root;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === "string" ? cur : "";
}

/** Resolve current copy for a slug from live locale + static fallbacks. */
export function resolveLandingCopyValue(slug: string): string {
  if (slug in LANDING_COPY_STATIC_VALUES) {
    return LANDING_COPY_STATIC_VALUES[slug] ?? "";
  }

  if (slug.startsWith("landing.plans.")) {
    const planSlug = slug.slice("landing.plans.".length);
    return PLAN_DESCRIPTIONS[planSlug] ?? "";
  }

  if (slug.startsWith("auth.")) {
    const path = slug.slice("auth.".length).split(".");
    return getNestedString(he.auth, path);
  }

  if (!slug.startsWith("landing.")) return "";

  const path = slug.slice("landing.".length).split(".");
  return getNestedString(he.landing, path);
}
