/** Whether a class should appear in calendar listRange for [from, to) at `now`. */
export function classOverlapsCalendarRange(
  liveClass: { startsAt: number; endsAt: number; status: string },
  from: number,
  to: number,
  now: number,
): boolean {
  if (liveClass.endsAt <= now) return false;
  if (liveClass.startsAt >= to) return false;
  if (liveClass.startsAt >= from && liveClass.startsAt < to) return true;
  return liveClass.status === "live" && liveClass.startsAt < from;
}
