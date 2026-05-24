import type { Id } from "$convex/_generated/dataModel";

export const AVAILABILITY_SLOT_STEP = 30;

export type AvailabilityRule = {
  _id: Id<"oneOnOneAvailabilityRules">;
  weekday: number;
  startMinute: number;
  endMinute: number;
  slotMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
};

export type PaintedSlots = Record<number, Set<number>>;

export type AvailabilityCalendarEvent = {
  id: string;
  start: Date;
  end: Date;
  display: "background";
  editable: false;
  classNames: string[];
};

export function createEmptyPainted(): PaintedSlots {
  const next: PaintedSlots = {};
  for (let d = 0; d < 7; d += 1) next[d] = new Set();
  return next;
}

export function minuteFromSlotIndex(index: number): number {
  return index * AVAILABILITY_SLOT_STEP;
}

export function slotIndexFromMinute(minute: number): number {
  return Math.floor(minute / AVAILABILITY_SLOT_STEP);
}

export function rulesToPainted(activeRules: AvailabilityRule[]): PaintedSlots {
  const next = createEmptyPainted();
  for (const rule of activeRules) {
    if (!rule.isActive) continue;
    const startIdx = slotIndexFromMinute(rule.startMinute);
    const endIdx = slotIndexFromMinute(rule.endMinute);
    for (let i = startIdx; i < endIdx; i += 1) {
      next[rule.weekday].add(i);
    }
  }
  return next;
}

export function mergeRanges(indices: number[]): { startMinute: number; endMinute: number }[] {
  if (indices.length === 0) return [];
  const sorted = [...indices].sort((a, b) => a - b);
  const ranges: { startMinute: number; endMinute: number }[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0] + 1;

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === rangeEnd) {
      rangeEnd += 1;
    } else {
      ranges.push({
        startMinute: minuteFromSlotIndex(rangeStart),
        endMinute: minuteFromSlotIndex(rangeEnd),
      });
      rangeStart = sorted[i];
      rangeEnd = sorted[i] + 1;
    }
  }
  ranges.push({
    startMinute: minuteFromSlotIndex(rangeStart),
    endMinute: minuteFromSlotIndex(rangeEnd),
  });
  return ranges;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateAtMinutes(dayStart: Date, minute: number): Date {
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;
  return new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), hours, mins);
}

function expandPaintedDay(
  weekday: number,
  indices: Iterable<number>,
  viewStart: Date,
  viewEnd: Date,
  classNames: string[],
  idPrefix: string,
): AvailabilityCalendarEvent[] {
  const events: AvailabilityCalendarEvent[] = [];
  const sorted = [...indices].sort((a, b) => a - b);
  const ranges = mergeRanges(sorted);

  for (let day = startOfLocalDay(viewStart); day < viewEnd; day = new Date(day.getTime() + 86_400_000)) {
    if (day.getDay() !== weekday) continue;
    for (const range of ranges) {
      events.push({
        id: `${idPrefix}-${weekday}-${day.getTime()}-${range.startMinute}`,
        start: dateAtMinutes(day, range.startMinute),
        end: dateAtMinutes(day, range.endMinute),
        display: "background",
        editable: false,
        classNames,
      });
    }
  }
  return events;
}

export function expandPaintedToEvents(
  painted: PaintedSlots,
  viewStart: Date,
  viewEnd: Date,
  paintMode: boolean,
): AvailabilityCalendarEvent[] {
  const classNames = paintMode
    ? ["ec-availability-block", "ec-availability-block--paint"]
    : ["ec-availability-block"];
  const events: AvailabilityCalendarEvent[] = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const indices = painted[weekday];
    if (!indices?.size) continue;
    events.push(
      ...expandPaintedDay(weekday, indices, viewStart, viewEnd, classNames, "avail-draft"),
    );
  }
  return events;
}

export function selectionTouchesPainted(
  painted: PaintedSlots,
  start: Date,
  end: Date,
): boolean {
  const cursor = new Date(start);
  while (cursor < end) {
    const weekday = cursor.getDay();
    const minute = cursor.getHours() * 60 + cursor.getMinutes();
    const idx = slotIndexFromMinute(minute);
    if (painted[weekday]?.has(idx)) return true;
    cursor.setMinutes(cursor.getMinutes() + AVAILABILITY_SLOT_STEP);
  }
  return false;
}

export function applySelectionToPainted(
  painted: PaintedSlots,
  start: Date,
  end: Date,
  mode: "add" | "remove",
): PaintedSlots {
  const next: PaintedSlots = {};
  for (let d = 0; d < 7; d += 1) {
    next[d] = new Set(painted[d]);
  }

  const cursor = new Date(start);
  while (cursor < end) {
    const weekday = cursor.getDay();
    const minute = cursor.getHours() * 60 + cursor.getMinutes();
    const idx = slotIndexFromMinute(minute);
    if (mode === "add") next[weekday].add(idx);
    else next[weekday].delete(idx);
    cursor.setMinutes(cursor.getMinutes() + AVAILABILITY_SLOT_STEP);
  }
  return next;
}

export function paintedEquals(a: PaintedSlots, b: PaintedSlots): boolean {
  for (let d = 0; d < 7; d += 1) {
    const setA = a[d] ?? new Set();
    const setB = b[d] ?? new Set();
    if (setA.size !== setB.size) return false;
    for (const idx of setA) {
      if (!setB.has(idx)) return false;
    }
  }
  return true;
}

export function hasAnyPaintedSlots(painted: PaintedSlots): boolean {
  return Object.values(painted).some((set) => (set?.size ?? 0) > 0);
}
