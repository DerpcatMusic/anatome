import { isInLiveJoinWindow, type LiveJoinWindowClass } from "./liveJoin";

type SidebarLiveClass = Pick<LiveJoinWindowClass, "joinOpensAt" | "joinClosesAt"> & {
  status: string;
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
