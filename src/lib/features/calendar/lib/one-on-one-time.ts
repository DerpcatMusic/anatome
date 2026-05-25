const minuteMs = 60 * 1000;

export function wallMinutesFromTimestamp(ts: number, dayStart: number): number {
  return Math.floor((ts - dayStart) / minuteMs);
}

export function timestampFromWallMinutes(dayStart: number, minutes: number): number {
  return dayStart + minutes * minuteMs;
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
