import { ALL_CREDIT_POOLS, type CreditPool } from "./types";

/** All pools for persistent sidebar chrome. */
export function poolsForSidebar(): CreditPool[] {
  return [...ALL_CREDIT_POOLS];
}

/** Route-driven subset for page headers (null = no header strip). */
export function poolsForAppRoute(pathname: string): CreditPool[] | null {
  if (pathname.startsWith("/i/")) return null;

  const isVideo =
    pathname.startsWith("/u/library") ||
    pathname.startsWith("/u/videos") ||
    pathname.startsWith("/library") ||
    pathname.includes("/וידאו") ||
    pathname.startsWith("/videos");

  if (isVideo) return ["vod"];

  if (pathname.startsWith("/u/calendar")) return ["live", "oneOnOne"];

  return null;
}

export function poolsForLiveClass(
  type: "group_live" | "one_on_one" | string | undefined | null,
): CreditPool[] {
  if (type === "one_on_one") return ["oneOnOne"];
  return ["live"];
}
