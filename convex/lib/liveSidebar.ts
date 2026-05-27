import { isInLiveJoinWindow, type LiveJoinWindowClass } from "./liveJoin";
import type { Doc } from "../_generated/dataModel";

type SidebarLiveClass = Pick<LiveJoinWindowClass, "joinOpensAt" | "joinClosesAt"> & {
  status: string;
  startsAt?: number;
};

/** Sidebar LIVE / room entry only when join window is open or class is actively live. */
export function isLiveSidebarEligible(liveClass: SidebarLiveClass, now: number): boolean {
  if (
    liveClass.status === "ended" ||
    liveClass.status === "cancelled" ||
    liveClass.status === "draft"
  ) {
    return false;
  }
  if (liveClass.status === "live") return true;
  if (liveClass.status === "scheduled") {
    return isInLiveJoinWindow(liveClass, now);
  }
  return false;
}

type NextLivePick = Pick<
  Doc<"liveClasses">,
  "_id" | "title" | "status" | "startsAt" | "joinOpensAt" | "joinClosesAt" | "type"
>;

/** Members only see sidebar entry once the instructor has started the broadcast. */
export function isMemberLiveSidebarEligible(
  liveClass: SidebarLiveClass,
  now: number,
): boolean {
  if (liveClass.status !== "live") return false;
  return isInLiveJoinWindow(liveClass, now);
}

/** Prefer actively live classes, then soonest start among eligible sidebar targets. */
export function pickBestSidebarLiveClass<T extends NextLivePick>(
  candidates: T[],
  now: number,
  options?: { memberView?: boolean },
): T | null {
  const eligible = candidates.filter((row) =>
    options?.memberView
      ? isMemberLiveSidebarEligible(row, now)
      : isLiveSidebarEligible(row, now),
  );
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => {
    const aLive = a.status === "live" ? 1 : 0;
    const bLive = b.status === "live" ? 1 : 0;
    if (aLive !== bLive) return bLive - aLive;
    return (a.startsAt ?? 0) - (b.startsAt ?? 0);
  });
  return eligible[0] ?? null;
}
