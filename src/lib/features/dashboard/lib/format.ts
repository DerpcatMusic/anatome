import { LOCAL_TIMEZONE, startOfLocalDay } from "$lib/datetime/local";

const startOfAppDay = startOfLocalDay;

const liveWhenFormatter = new Intl.DateTimeFormat("he-IL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: LOCAL_TIMEZONE,
});

const liveTimeFormatter = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: LOCAL_TIMEZONE,
});

export function formatLiveWindow(startsAt: number, endsAt: number, now = Date.now()): string {
  const dayStart = startOfAppDay(now);
  const targetDay = startOfAppDay(startsAt);
  const diffDays = Math.round((targetDay - dayStart) / 86_400_000);
  const range = `${liveTimeFormatter.format(startsAt)}–${liveTimeFormatter.format(endsAt)}`;
  if (diffDays === 0) return `היום · ${range}`;
  if (diffDays === 1) return `מחר · ${range}`;
  return `${liveWhenFormatter.format(startsAt)} · ${range}`;
}

export function formatLiveStartsAt(startsAt: number, now = Date.now()): string {
  const dayStart = startOfAppDay(now);
  const targetDay = startOfAppDay(startsAt);
  const diffDays = Math.round((targetDay - dayStart) / 86_400_000);

  if (diffDays === 0) return `היום · ${liveTimeFormatter.format(startsAt)}`;
  if (diffDays === 1) return `מחר · ${liveTimeFormatter.format(startsAt)}`;
  return liveWhenFormatter.format(startsAt);
}

export function formatProgressLabel(currentSeconds: number, durationSeconds: number | null): string {
  const format = (total: number) => {
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  if (durationSeconds && durationSeconds > 0) {
    return `${format(currentSeconds)} / ${format(durationSeconds)}`;
  }
  return format(currentSeconds);
}
