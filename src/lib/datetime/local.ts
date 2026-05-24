/** Israel-local calendar helpers (browser TZ should match for members/instructors). */
export const LOCAL_TIMEZONE = "Asia/Jerusalem";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of local calendar day for an instant (ms). */
export function startOfLocalDay(instantMs: number = Date.now()): number {
  const d = new Date(instantMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function endOfLocalDay(dayStartMs: number): number {
  return dayStartMs + DAY_MS;
}

export function isInLocalDay(instantMs: number, dayStartMs: number): boolean {
  return instantMs >= dayStartMs && instantMs < dayStartMs + DAY_MS;
}

/** `YYYY-MM-DDTHH:mm` for datetime-local inputs and EventCalendar local Date inputs. */
export function toDateTimeLocalString(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse `YYYY-MM-DDTHH:mm` as local wall time. */
export function parseDateTimeLocal(value: string): number {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid local datetime: ${value}`);
  }
  return parsed.getTime();
}

/**
 * EventCalendar stores wall-clock fields in UTC slots; format for display in previews.
 */
export function formatEventCalendarWallTime(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
