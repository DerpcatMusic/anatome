import { formatAppTime } from "$lib/datetime/local";

/** Show mm:ss (or h:mm:ss) countdown when this much time remains in the lesson. */
export const LIVE_CLASS_COUNTDOWN_THRESHOLD_MS = 30 * 60_000;

export type LiveClassSchedulePhase = "before" | "during" | "ended";

export type LiveClassScheduleView = {
  phase: LiveClassSchedulePhase;
  /** Short Hebrew cue, e.g. מתחיל ב־19:15 or עד 20:30 */
  label: string;
  /** Compact mono range, e.g. 19:15–20:30 */
  timeRange: string;
  /** Elapsed fraction 0–1 while the lesson is in progress */
  progress: number | null;
  /** Tabular countdown when near the end of an active lesson */
  countdown: string | null;
  ariaLabel: string;
};

export function getLiveClassSchedulePhase(
  startsAt: number,
  endsAt: number,
  nowMs: number,
): LiveClassSchedulePhase {
  if (nowMs >= endsAt) return "ended";
  if (nowMs < startsAt) return "before";
  return "during";
}

export function formatLessonRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function buildLiveClassScheduleView(
  startsAt: number,
  endsAt: number,
  nowMs: number,
): LiveClassScheduleView | null {
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt <= startsAt) {
    return null;
  }

  const phase = getLiveClassSchedulePhase(startsAt, endsAt, nowMs);
  if (phase === "ended") return null;

  const startTime = formatAppTime(startsAt);
  const endTime = formatAppTime(endsAt);
  const timeRange = `${startTime}–${endTime}`;

  if (phase === "before") {
    const label = `מתחיל ב־${startTime}`;
    return {
      phase,
      label,
      timeRange,
      progress: null,
      countdown: null,
      ariaLabel: `השיעור ${timeRange}, מתחיל בשעה ${startTime}`,
    };
  }

  const remainingMs = endsAt - nowMs;
  const progress = Math.min(1, Math.max(0, (nowMs - startsAt) / (endsAt - startsAt)));
  const label = `עד ${endTime}`;
  const countdown =
    remainingMs <= LIVE_CLASS_COUNTDOWN_THRESHOLD_MS
      ? formatLessonRemaining(remainingMs)
      : null;

  return {
    phase,
    label,
    timeRange,
    progress,
    countdown,
    ariaLabel: countdown
      ? `השיעור מסתיים בשעה ${endTime}, נותר ${countdown}`
      : `השיעור פעיל ${timeRange}, מסתיים בשעה ${endTime}`,
  };
}
