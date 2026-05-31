/** App wall clock is always Israel — independent of the viewer's OS timezone. */
export const LOCAL_TIMEZONE = "Asia/Jerusalem";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const zonedFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: LOCAL_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function zonedParts(instantMs: number): ZonedParts {
  const parts = Object.fromEntries(
    zonedFormatter
      .formatToParts(new Date(instantMs))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function appDateParts(instantMs: number = Date.now()): ZonedParts {
  return zonedParts(instantMs);
}

/** Offset of `timeZone` at `instantMs` from UTC, in milliseconds (positive east of UTC). */
export function getTimezoneOffsetMs(timeZone: string, instantMs: number): number {
  const parts =
    timeZone === LOCAL_TIMEZONE
      ? zonedParts(instantMs)
      : Object.fromEntries(
          new Intl.DateTimeFormat("en-GB", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
            .formatToParts(new Date(instantMs))
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, Number(part.value)]),
        ) as unknown as ZonedParts;
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - instantMs;
}

export function isAppTimezoneBrowserDefault(atMs: number = Date.now()): boolean {
  const browserOffsetMs = -new Date(atMs).getTimezoneOffset() * 60_000;
  return getTimezoneOffsetMs(LOCAL_TIMEZONE, atMs) === browserOffsetMs;
}

/** Start of calendar day in Israel for an instant (epoch ms). */
export function startOfLocalDay(instantMs: number = Date.now()): number {
  const parts = zonedParts(instantMs);
  return parseDateTimeLocal(`${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T00:00`);
}

/** Same as {@link startOfLocalDay} but requires an explicit timestamp (no default). */
export function startOfLocalDayPure(instantMs: number): number {
  const parts = zonedParts(instantMs);
  return parseDateTimeLocal(`${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T00:00`);
}

export function addAppDays(dayStartMs: number, days: number): number {
  const parts = zonedParts(dayStartMs);
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return parseDateTimeLocal(
    `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}T00:00`,
  );
}

export function endOfLocalDay(dayStartMs: number): number {
  return addAppDays(dayStartMs, 1);
}

export function isInLocalDay(instantMs: number, dayStartMs: number): boolean {
  return instantMs >= dayStartMs && instantMs < endOfLocalDay(dayStartMs);
}

/** `HH:mm` in Israel for a stored UTC instant. */
export function formatAppTime(instantMs: number): string {
  const parts = zonedParts(instantMs);
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

/** Hour slot label for EventCalendar `scrollTime` (Israel). */
export function formatAppScrollTime(instantMs: number = Date.now()): string {
  const parts = zonedParts(instantMs);
  return `${pad2(parts.hour)}:00:00`;
}

/** Minutes since midnight for a calendar `Date` (after {@link toCalendarEventDate}). */
export function wallMinutesFromCalendarDate(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** `YYYY-MM-DD` in Israel. */
export function formatAppDate(instantMs: number): string {
  const parts = zonedParts(instantMs);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

/** `YYYY-MM-DDTHH:mm` for datetime-local inputs (Israel wall time). */
export function toDateTimeLocalString(instantMs: number): string {
  const parts = zonedParts(instantMs);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

/** Default scheduler value: next hour in Israel wall time. */
export function nextAppHourDateTimeLocalString(instantMs: number = Date.now()): string {
  const parts = zonedParts(instantMs);
  const nextHour = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour + 1));
  return `${nextHour.getUTCFullYear()}-${pad2(nextHour.getUTCMonth() + 1)}-${pad2(nextHour.getUTCDate())}T${pad2(nextHour.getUTCHours())}:00`;
}

/**
 * Parse `YYYY-MM-DDTHH:mm` as Israel wall time → UTC epoch ms.
 * Do not use `new Date(value)` — that follows the browser timezone.
 */
export function parseDateTimeLocal(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid local datetime: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  let guess = Date.UTC(year, month - 1, day, hour, minute);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedParts(guess);
    const desiredLocal = Date.UTC(year, month - 1, day, hour, minute);
    const actualLocal = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    const delta = desiredLocal - actualLocal;
    if (delta === 0) return guess;
    guess += delta;
  }

  return guess;
}

/**
 * EventCalendar positions events from `Date` local fields, then converts them into
 * its own UTC-backed slots. Pass Israel wall-clock values as local fields so a
 * class at 18:00 Israel renders at 18:00 in every browser timezone.
 */
export function toCalendarEventDate(instantMs: number): Date {
  const parts = zonedParts(instantMs);
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

/** Inverse of {@link toCalendarEventDate} after select/drag on the calendar. */
export function fromCalendarEventDate(date: Date): number {
  const y = date.getFullYear();
  const mo = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const h = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  return parseDateTimeLocal(`${y}-${mo}-${d}T${h}:${mi}`);
}

/** Formats the wall time already encoded for EventCalendar display. */
export function formatEventCalendarWallTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
