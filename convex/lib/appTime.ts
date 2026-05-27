export const APP_TIMEZONE = "Asia/Jerusalem";
export const MINUTE_MS = 60 * 1000;

type IsraelParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const israelFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function israelParts(instantMs: number): IsraelParts {
  const parts = Object.fromEntries(
    israelFormatter
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

export function parseIsraelDateTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = israelParts(guess);
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

export function startOfIsraelDay(instantMs: number): number {
  const parts = israelParts(instantMs);
  return parseIsraelDateTime(parts.year, parts.month, parts.day, 0, 0);
}

export function addIsraelDays(dayStartMs: number, days: number): number {
  const parts = israelParts(dayStartMs);
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return parseIsraelDateTime(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    0,
    0,
  );
}

export function israelWeekday(instantMs: number): number {
  const parts = israelParts(instantMs);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

export function israelDateTimeOnDay(dayStartMs: number, minuteOfDay: number): number {
  const parts = israelParts(dayStartMs);
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return parseIsraelDateTime(parts.year, parts.month, parts.day, hour, minute);
}

export function israelDateString(instantMs: number): string {
  const parts = israelParts(instantMs);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}
