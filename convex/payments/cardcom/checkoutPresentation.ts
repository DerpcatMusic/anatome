const SUBSCRIPTION_CSS_BY_SLUG: Record<string, string> = {
  starter: "/cardcom/checkout-starter.css",
  steady: "/cardcom/checkout-steady.css",
  guided: "/cardcom/checkout-guided.css",
  intensive: "/cardcom/checkout-intensive.css",
};

const CREDIT_CSS_BY_POOL: Record<string, string> = {
  vod: "/cardcom/checkout-credits-vod.css",
  live: "/cardcom/checkout-credits-live.css",
  oneOnOne: "/cardcom/checkout-credits-private.css",
};

function pathWithAuditedFallback(
  paths: Record<string, string>,
  key: string,
  fallbackKey: string,
  label: string,
) {
  const path = paths[key];
  if (path !== undefined) return path;
  console.warn(`Unknown CardCom ${label} "${key}", using "${fallbackKey}" checkout CSS`);
  return paths[fallbackKey]!;
}

export function subscriptionCheckoutCssPath(planSlug: string) {
  return pathWithAuditedFallback(
    SUBSCRIPTION_CSS_BY_SLUG,
    planSlug,
    "guided",
    "plan slug",
  );
}

export function creditCheckoutCssPath(pool: string) {
  return pathWithAuditedFallback(CREDIT_CSS_BY_POOL, pool, "vod", "credit pool");
}
