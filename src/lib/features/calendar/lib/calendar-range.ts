import type { TypeFilter } from "./agenda";

export const CALENDAR_DAY_MS = 24 * 60 * 60 * 1000;
export const CALENDAR_INITIAL_DAYS = 14;
export const CALENDAR_LOAD_MORE_DAYS = 14;
export const CALENDAR_MAX_DAYS = 90;
export const ONE_ON_ONE_MAX_DAYS = 30;

export function maxAgendaDays(typeFilter: TypeFilter): number {
  if (typeFilter === "one_on_one") return ONE_ON_ONE_MAX_DAYS;
  return CALENDAR_MAX_DAYS;
}

export function initialAgendaRangeEnd(rangeStart: number, typeFilter: TypeFilter): number {
  const days = Math.min(CALENDAR_INITIAL_DAYS, maxAgendaDays(typeFilter));
  return rangeStart + days * CALENDAR_DAY_MS;
}

export function nextAgendaRangeEnd(
  currentEnd: number,
  rangeStart: number,
  typeFilter: TypeFilter,
): number {
  const maxEnd = maxAgendaRangeEnd(rangeStart, typeFilter);
  const next = currentEnd + CALENDAR_LOAD_MORE_DAYS * CALENDAR_DAY_MS;
  return Math.min(next, maxEnd);
}

export function canLoadMoreAgendaRange(
  rangeEnd: number,
  rangeStart: number,
  typeFilter: TypeFilter,
): boolean {
  return rangeEnd < maxAgendaRangeEnd(rangeStart, typeFilter);
}

/** Exclusive end timestamp for queries (`to` arg). */
export function maxAgendaRangeEnd(rangeStart: number, typeFilter: TypeFilter): number {
  return rangeStart + (maxAgendaDays(typeFilter) + 1) * CALENDAR_DAY_MS;
}

export function clampAgendaRangeEnd(
  rangeEnd: number,
  rangeStart: number,
  typeFilter: TypeFilter,
): number {
  return Math.min(rangeEnd, maxAgendaRangeEnd(rangeStart, typeFilter));
}
