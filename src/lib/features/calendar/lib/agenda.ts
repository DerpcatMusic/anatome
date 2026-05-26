import type { FunctionReturnType } from "convex/server";
import { api } from "$convex/_generated/api";
import { isInLocalDay, startOfLocalDay } from "$lib/datetime/local";
import { CALENDAR_DAY_MS, ONE_ON_ONE_MAX_DAYS } from "./calendar-range";

export type CalendarClass = FunctionReturnType<typeof api.live.calendar.listRange>[number];
export type OpenSlot = FunctionReturnType<typeof api.oneOnOne.customer.listAvailableSlots>[number];
export type DayAvailability = FunctionReturnType<
  typeof api.oneOnOne.customer.listDayAvailability
>[number];
export type TypeFilter = "all" | "group_live" | "one_on_one";

export type AgendaEntry =
  | { kind: "class"; startsAt: number; item: CalendarClass }
  | { kind: "one_on_one_day"; startsAt: number; window: DayAvailability };

export type DayAgendaGroup = {
  dayStart: number;
  entries: AgendaEntry[];
};

const dayHeaderFormatter = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Asia/Jerusalem",
});

const dayShortFormatter = new Intl.DateTimeFormat("he-IL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jerusalem",
});

export function formatAgendaDayHeader(dayStart: number): string {
  const todayStart = startOfLocalDay();
  if (dayStart === todayStart) return `היום · ${dayShortFormatter.format(new Date(dayStart))}`;
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  if (dayStart === tomorrowStart) return `מחר · ${dayShortFormatter.format(new Date(dayStart))}`;
  return dayHeaderFormatter.format(new Date(dayStart));
}

export function filterClasses(classes: CalendarClass[], typeFilter: TypeFilter): CalendarClass[] {
  if (typeFilter === "all") return classes;
  return classes.filter((item) => item.liveClass.type === typeFilter);
}

export function filterDayAvailability(
  windows: DayAvailability[],
  typeFilter: TypeFilter,
): DayAvailability[] {
  if (typeFilter === "group_live") return [];
  return windows;
}

export function buildAgendaEntries(
  classes: CalendarClass[],
  dayWindows: DayAvailability[],
  typeFilter: TypeFilter,
): AgendaEntry[] {
  const entries: AgendaEntry[] = [];

  for (const item of filterClasses(classes, typeFilter)) {
    entries.push({ kind: "class", startsAt: item.liveClass.startsAt, item });
  }

  const seenDayInstructor = new Set<string>();
  for (const window of filterDayAvailability(dayWindows, typeFilter)) {
    const key = `${window.dayStart}-${window.instructorUserId}`;
    if (seenDayInstructor.has(key)) continue;
    seenDayInstructor.add(key);
    entries.push({ kind: "one_on_one_day", startsAt: window.dayStart, window });
  }

  return entries.sort((a, b) => a.startsAt - b.startsAt);
}

export function filterAgendaEntries(
  entries: AgendaEntry[],
  options: { dayStart?: number; todayOnly?: boolean },
): AgendaEntry[] {
  const todayStart = startOfLocalDay();

  return entries.filter((entry) => {
    if (options.todayOnly && !isInLocalDay(entry.startsAt, todayStart)) return false;
    if (options.dayStart !== undefined && !isInLocalDay(entry.startsAt, options.dayStart)) {
      return false;
    }
    return true;
  });
}

const ACTIVE_RESERVATION = new Set(["reserved", "joined"]);

function isUpcomingAvailableClass(item: CalendarClass, now: number): boolean {
  const lc = item.liveClass;
  if (lc.status === "cancelled" || lc.status === "draft" || lc.status === "ended") {
    return false;
  }
  if (lc.endsAt <= now) return false;

  const hasReservation =
    item.viewerReservationStatus !== null &&
    ACTIVE_RESERVATION.has(item.viewerReservationStatus);

  if (item.viewerCanReserve || item.viewerCanJoin) return true;
  if (hasReservation) return true;

  return false;
}

function isUpcomingAvailableDayWindow(window: DayAvailability, now: number): boolean {
  const todayStart = startOfLocalDay(now);
  const lastBookableDay = todayStart + ONE_ON_ONE_MAX_DAYS * CALENDAR_DAY_MS;
  if (window.dayStart < todayStart || window.dayStart > lastBookableDay) return false;
  return window.latestBookableStartAt >= window.earliestBookableAt;
}

/** Keep only future, actionable agenda rows (hide ended / closed / full-without-reservation). */
export function filterUpcomingAvailable(entries: AgendaEntry[], now: number): AgendaEntry[] {
  return entries.filter((entry) => {
    if (entry.kind === "class") return isUpcomingAvailableClass(entry.item, now);
    return isUpcomingAvailableDayWindow(entry.window, now);
  });
}

export type FlatAgendaRow = {
  entry: AgendaEntry;
  dayLabel: string | null;
};

/** Flatten day groups for a single-level pill list; date label on first row per day. */
export function flattenAgendaGroups(groups: DayAgendaGroup[]): FlatAgendaRow[] {
  const rows: FlatAgendaRow[] = [];
  for (const group of groups) {
    const dayLabel = formatAgendaDayHeader(group.dayStart);
    group.entries.forEach((entry, index) => {
      rows.push({ entry, dayLabel: index === 0 ? dayLabel : null });
    });
  }
  return rows;
}

export function partitionAgendaEntries(entries: AgendaEntry[]): {
  group: AgendaEntry[];
  oneOnOne: AgendaEntry[];
} {
  const group: AgendaEntry[] = [];
  const oneOnOne: AgendaEntry[] = [];

  for (const entry of entries) {
    if (entry.kind === "one_on_one_day") {
      oneOnOne.push(entry);
      continue;
    }
    if (entry.item.liveClass.type === "group_live") {
      group.push(entry);
    } else {
      oneOnOne.push(entry);
    }
  }

  return { group, oneOnOne };
}

export function groupAgendaByDay(entries: AgendaEntry[]): DayAgendaGroup[] {
  const groups = new Map<number, AgendaEntry[]>();

  for (const entry of entries) {
    const dayStart = startOfLocalDay(entry.startsAt);
    const bucket = groups.get(dayStart);
    if (bucket) bucket.push(entry);
    else groups.set(dayStart, [entry]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayStart, dayEntries]) => ({
      dayStart,
      entries: dayEntries.sort((a, b) => a.startsAt - b.startsAt),
    }));
}

