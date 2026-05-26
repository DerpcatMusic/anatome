import { wallMinutesFromCalendarDate } from "$lib/datetime/local";

/** Viewport rect for anchoring quick-create popovers to calendar selections. */
export type SelectionAnchor = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type PopoverSide = "left" | "right";

/** Must match WeeklyAgenda calendarOptions slotHeight / slotDuration. */
export const CALENDAR_SLOT_HEIGHT_PX = 36;
export const CALENDAR_SLOT_DURATION_MIN = 30;

export function centerOfAnchor(anchor: SelectionAnchor): { x: number; y: number } {
  return {
    x: anchor.left + anchor.width / 2,
    y: anchor.top + anchor.height / 2,
  };
}

/** @deprecated Use anchorBesideSelection for quick-create popovers. */
export function anchorBelowSelection(anchor: SelectionAnchor): { top: number; left: number } {
  const { x } = centerOfAnchor(anchor);
  return {
    top: anchor.top + anchor.height + 8,
    left: x,
  };
}

/**
 * Google Calendar–style placement: popover beside the selection (not covering it),
 * vertically centered, on the side with more viewport space.
 */
export function anchorBesideSelection(anchor: SelectionAnchor): {
  trigger: { top: number; left: number };
  side: PopoverSide;
} {
  const centerY = anchor.top + anchor.height / 2;
  const spaceLeft = anchor.left;
  const spaceRight =
    typeof window !== "undefined"
      ? window.innerWidth - (anchor.left + anchor.width)
      : spaceLeft;

  const side: PopoverSide = spaceRight >= spaceLeft ? "right" : "left";
  const triggerLeft = side === "right" ? anchor.left + anchor.width : anchor.left;

  return {
    trigger: { top: centerY, left: triggerLeft },
    side,
  };
}

/**
 * Build anchor from selection times + pointer. EventCalendar clears `.ec-highlight`
 * before the select callback runs (unselect on pointerup precedes selectFn), so DOM
 * highlight reads are unreliable — compute geometry from the day column instead.
 */
export function anchorFromCalendarSelection(
  container: HTMLElement | null,
  start: Date,
  end: Date,
  jsEvent?: MouseEvent,
): SelectionAnchor {
  const durationMin = Math.max(
    CALENDAR_SLOT_DURATION_MIN,
    (end.getTime() - start.getTime()) / 60000,
  );

  if (!container) {
    return viewportFallbackAnchor(durationMin);
  }

  let dayEl: Element | null = null;
  if (jsEvent) {
    dayEl = document.elementFromPoint(jsEvent.clientX, jsEvent.clientY)?.closest(".ec-day") ?? null;
  }

  if (!(dayEl instanceof HTMLElement)) {
    const columns = container.querySelectorAll(".ec-time-grid .ec-body .ec-day");
    const startDay = start.getDate();
    const startMonth = start.getMonth();
    for (const col of columns) {
      if (!(col instanceof HTMLElement)) continue;
      const payload = (col as HTMLElement & { __ec_payload?: { date?: Date } }).__ec_payload;
      const colDate = payload?.date;
      if (colDate && colDate.getDate() === startDay && colDate.getMonth() === startMonth) {
        dayEl = col;
        break;
      }
    }
    if (!dayEl && columns.length > 0) {
      dayEl = columns[Math.min(columns.length - 1, start.getDay())] ?? columns[0];
    }
  }

  if (dayEl instanceof HTMLElement) {
    const colRect = dayEl.getBoundingClientRect();
    const startMin = wallMinutesFromCalendarDate(start);
    const top = colRect.top + (startMin / CALENDAR_SLOT_DURATION_MIN) * CALENDAR_SLOT_HEIGHT_PX;
    const height = Math.max(
      (durationMin / CALENDAR_SLOT_DURATION_MIN) * CALENDAR_SLOT_HEIGHT_PX,
      CALENDAR_SLOT_HEIGHT_PX / 2,
    );
    return {
      top,
      left: colRect.left,
      width: Math.max(colRect.width, 24),
      height,
    };
  }

  const bodyRect =
    container.querySelector(".ec-body")?.getBoundingClientRect() ?? container.getBoundingClientRect();
  const startMin = wallMinutesFromCalendarDate(start);
  const top = bodyRect.top + (startMin / CALENDAR_SLOT_DURATION_MIN) * CALENDAR_SLOT_HEIGHT_PX;
  const height = Math.max(
    (durationMin / CALENDAR_SLOT_DURATION_MIN) * CALENDAR_SLOT_HEIGHT_PX,
    CALENDAR_SLOT_HEIGHT_PX / 2,
  );
  return {
    top,
    left: bodyRect.left + bodyRect.width * 0.35,
    width: Math.max(bodyRect.width / 7, 48),
    height,
  };
}

function viewportFallbackAnchor(durationMin: number): SelectionAnchor {
  const height = Math.max(
    (durationMin / CALENDAR_SLOT_DURATION_MIN) * CALENDAR_SLOT_HEIGHT_PX,
    CALENDAR_SLOT_HEIGHT_PX,
  );
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  return {
    top: vh * 0.35,
    left: vw * 0.45,
    width: 80,
    height,
  };
}
