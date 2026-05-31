import { goto } from "$app/navigation";
import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
import type { TypeFilter } from "../lib/agenda";

export function setCalendarTypeFilter(next: TypeFilter, pathname: string, search: string) {
  const url = new URL(pathname + search, "http://localhost");
  if (next === "all") {
    url.searchParams.delete("type");
  } else {
    url.searchParams.set("type", next);
  }
  void goto(`${url.pathname}${url.search}`, { replaceState: true, keepFocus: true });
}

export function goBuyCredits(pool?: "vod" | "live" | "oneOnOne") {
  if (!CREDITS_PURCHASE_ENABLED) return;
  const query = pool ? `?pool=${pool}` : "";
  void goto(`/u/credits${query}`);
}
