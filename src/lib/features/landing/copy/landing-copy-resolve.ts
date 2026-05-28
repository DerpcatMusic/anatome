import he from "$lib/i18n/generated/he";
import { PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";
import { FALLBACK_PLANS } from "$lib/features/subscriptions/plansCatalog";
import { LANDING_COPY_STATIC_VALUES } from "./landing-copy-manifest";

function getNestedString(root: unknown, path: string[]): string {
  let cur: unknown = root;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === "string" ? cur : "";
}

function resolvePlanSlug(slug: string): string {
  const match = /^landing\.plans\.([a-z]+)\.(name|description)$/.exec(slug);
  if (!match) return "";
  const [, planSlug, field] = match;
  const plan = FALLBACK_PLANS.find((p) => p.slug === planSlug);
  if (!plan) return "";
  if (field === "name") return plan.nameHe;
  return PLAN_DESCRIPTIONS[planSlug] ?? "";
}

/** Resolve current on-screen copy for a slug. */
export function resolveLandingCopyValue(slug: string): string {
  if (slug in LANDING_COPY_STATIC_VALUES) {
    return LANDING_COPY_STATIC_VALUES[slug] ?? "";
  }

  const planValue = resolvePlanSlug(slug);
  if (planValue) return planValue;

  if (slug.startsWith("seo.site.")) return LANDING_COPY_STATIC_VALUES[slug] ?? "";

  if (slug.startsWith("site.")) {
    return getNestedString(he.site, slug.slice("site.".length).split("."));
  }

  if (slug.startsWith("nav.")) {
    return getNestedString(he.nav, slug.slice("nav.".length).split("."));
  }

  if (slug.startsWith("auth.")) {
    return getNestedString(he.auth, slug.slice("auth.".length).split("."));
  }

  if (slug.startsWith("overlay.")) {
    return LANDING_COPY_STATIC_VALUES[slug] ?? "";
  }

  if (slug.startsWith("chrome.")) {
    return LANDING_COPY_STATIC_VALUES[slug] ?? "";
  }

  if (slug.startsWith("landing.footer.")) {
    return LANDING_COPY_STATIC_VALUES[slug] ?? "";
  }

  if (slug.startsWith("landing.pricing.ui.")) {
    return LANDING_COPY_STATIC_VALUES[slug] ?? "";
  }

  if (!slug.startsWith("landing.")) return "";

  const path = slug.slice("landing.".length).split(".");
  return getNestedString(he.landing, path);
}
