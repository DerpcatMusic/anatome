import { appDateParts, parseDateTimeLocal } from "$lib/datetime/local";

export function wallMinutesFromTimestamp(ts: number, _dayStart: number): number {
  const parts = appDateParts(ts);
  return parts.hour * 60 + parts.minute;
}

export function timestampFromWallMinutes(dayStart: number, minutes: number): number {
  const parts = appDateParts(dayStart);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return parseDateTimeLocal(
    `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  );
}

export function formatWallMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseWallTimeInput(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}
