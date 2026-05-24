import { MS, RULES } from "./constants";

export type LiveJoinWindowClass = {
  joinOpensAt: number;
  joinClosesAt: number;
  startsAt: number;
  status: string;
};

/** Whether `now` is inside [joinOpensAt, joinClosesAt]. */
export function isInLiveJoinWindow(
  liveClass: Pick<LiveJoinWindowClass, "joinOpensAt" | "joinClosesAt">,
  now: number,
): boolean {
  return now >= liveClass.joinOpensAt && now <= liveClass.joinClosesAt;
}

export function minutesUntilJoinOpens(
  liveClass: Pick<LiveJoinWindowClass, "joinOpensAt">,
  now: number,
): number | null {
  if (now >= liveClass.joinOpensAt) return null;
  return Math.max(1, Math.ceil((liveClass.joinOpensAt - now) / MS.MINUTE));
}

export function minutesUntilJoinCloses(
  liveClass: Pick<LiveJoinWindowClass, "joinClosesAt">,
  now: number,
): number | null {
  if (now > liveClass.joinClosesAt) return null;
  return Math.max(1, Math.ceil((liveClass.joinClosesAt - now) / MS.MINUTE));
}

/** Throws when outside the join window (all roles, including instructor). */
export function assertInLiveJoinWindow(
  liveClass: Pick<LiveJoinWindowClass, "joinOpensAt" | "joinClosesAt">,
  now: number,
): void {
  if (now < liveClass.joinOpensAt) {
    throw new Error(
      `ההצטרפות תיפתח ${RULES.LIVE_JOIN_OPENS_MINUTES_BEFORE} דקות לפני תחילת השיעור`,
    );
  }
  if (now > liveClass.joinClosesAt) {
    throw new Error("חלון ההצטרפות נסגר");
  }
}
