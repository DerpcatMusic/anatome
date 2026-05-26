/** App wall clock is always Israel — independent of the viewer's OS timezone. */
export const LOCAL_TIMEZONE = "Asia/Jerusalem";

const DAY_MS = 24 * 60 * 60 * 1000;

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

/** Offset of `timeZone` at `instantMs` from UTC, in milliseconds (positive east of UTC). */
export function getTimezoneOffsetMs(timeZone: string, instantMs: number): number {
  const parts = zonedParts(instantMs);
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

export function endOfLocalDay(dayStartMs: number): number {
  return dayStartMs + DAY_MS;
}

export function isInLocalDay(instantMs: number, dayStartMs: number): boolean {
  return instantMs >= dayStartMs && instantMs < dayStartMs + DAY_MS;
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
  if (isAppTimezoneBrowserDefault(date.getTime())) {
    return date.getHours() * 60 + date.getMinutes();
  }
  return date.getUTCHours() * 60 + date.getUTCMinutes();
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
 * EventCalendar positions events using the Date's local fields in the viewer's TZ.
 * When the browser is not on Asia/Jerusalem, store Israel wall time in UTC slots.
 */
export function toCalendarEventDate(instantMs: number): Date {
  if (isAppTimezoneBrowserDefault(instantMs)) {
    return new Date(instantMs);
  }
  const parts = zonedParts(instantMs);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute));
}

/** Inverse of {@link toCalendarEventDate} after select/drag on the calendar. */
export function fromCalendarEventDate(date: Date): number {
  if (isAppTimezoneBrowserDefault(date.getTime())) {
    return date.getTime();
  }
  const y = date.getUTCFullYear();
  const mo = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const h = pad2(date.getUTCHours());
  const mi = pad2(date.getUTCMinutes());
  return parseDateTimeLocal(`${y}-${mo}-${d}T${h}:${mi}`);
}

/**
 * @deprecated Use {@link formatAppTime}. Kept for EventCalendar preview nodes that
 * already store wall time in UTC fields when the browser TZ ≠ Israel.
 */
export function formatEventCalendarWallTime(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
