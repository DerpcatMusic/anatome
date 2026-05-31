import { DayGrid, TimeGrid, Interaction } from "@event-calendar/core";
import { useConvexClient } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import {
  formatAppScrollTime,
  formatEventCalendarWallTime,
  fromCalendarEventDate,
  toCalendarEventDate,
  toDateTimeLocalString,
} from "$lib/datetime/local";
import { useI18n } from "$lib/i18n/runes.svelte";
import type { SelectionAnchor } from "$features/live/types/selection-anchor";
import { CALENDAR_SLOT_HEIGHT_PX } from "$features/live/types/selection-anchor";
import {
  applySelectionToPainted,
  eraseAvailabilityRange,
  expandPaintedToEvents,
  selectionTouchesPainted,
  type PaintedSlots,
} from "$features/studio/lib/one-on-one-availability";
import {
  anchorFromCalendarSelection,
} from "$features/live/types/selection-anchor";
import {
  buildLiveClassEventHtml,
  buildPreviewEventHtml,
  escapeCalendarHtml,
} from "$features/live/lib/calendar-event-html";

const QUICK_CREATE_PREVIEW_ID = "__quick_create_preview__";
const AVAILABILITY_DOUBLE_CLICK_MS = 400;
const CALENDAR_SLOT_HEIGHT_MIN = 24;
const CALENDAR_SLOT_HEIGHT_MAX = 72;

export type CalendarViewMode = "week" | "month";

export type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];
export type ClassTypeFilter = "all" | "group_live" | "one_on_one";

export interface CalendarEventInput {
  id: string;
  title: string;
  start: Date;
  end: Date;
  editable?: boolean;
  startEditable?: boolean;
  durationEditable?: boolean;
  display?: string;
  classNames?: string[];
  extendedProps?: Record<string, unknown>;
}

export interface CreatePreview {
  startsAt: number;
  endsAt: number;
  requiredEquipment?: string[];
}

export type CalendarHandle = {
  unselect: () => void;
  next: () => CalendarHandle;
  prev: () => CalendarHandle;
};

export interface WeeklyAgendaCalendarOptions {
  get classes(): LiveClass[];
  get typeFilter(): ClassTypeFilter;
  get onSelectSlot(): (timeLocalString: string, durationMinutes: number, anchor: SelectionAnchor) => void;
  get onEventClick(): (liveClass: LiveClass, anchor: SelectionAnchor) => void;
  get createPreview(): CreatePreview | null;
  get onCreatePreviewChange(): ((startsAt: number, endsAt: number) => void) | undefined;
  get availabilityPaintMode(): boolean;
  get availabilityPainted(): PaintedSlots | undefined;
  get onAvailabilityPaintChange(): ((painted: PaintedSlots) => void) | undefined;
  get onViewRangeChange(): ((start: Date, end: Date) => void) | undefined;
  getContainerEl: () => HTMLElement | undefined;
  getCalendarRef: () => CalendarHandle | undefined;
}

export function startOfWeek(date: Date, firstDay = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isQuickCreatePreview(eventId: string | undefined): boolean {
  return eventId === QUICK_CREATE_PREVIEW_ID;
}

export function filterByTypeFilter(classes: LiveClass[], typeFilter: ClassTypeFilter) {
  return typeFilter === "all" ? classes : classes.filter((c) => c.type === typeFilter);
}

export function useWeeklyAgendaCalendar(options: WeeklyAgendaCalendarOptions) {
  const { t } = useI18n();
  const client = useConvexClient();

  let submitting = $state(false);
  let dragError = $state("");
  let calendarViewMode = $state<CalendarViewMode>("week");
  let calendarSlotHeight = $state(36);
  let panGesture = $state<{
    pointerId: number;
    anchorX: number;
    threshold: number;
  } | null>(null);

  const weekStart = startOfWeek(toCalendarEventDate(Date.now()), 0);
  let viewStart = $state(new Date(weekStart));
  let viewEnd = $state(new Date(weekStart.getTime() + 7 * 86_400_000));

  const EMPTY_AVAILABILITY_EVENTS: CalendarEventInput[] = [];

  const availabilityEvents = $derived.by(() => {
    if (!options.availabilityPainted) return EMPTY_AVAILABILITY_EVENTS;
    return expandPaintedToEvents(
      options.availabilityPainted,
      viewStart,
      viewEnd,
      options.availabilityPaintMode,
    );
  });

  let isCoarsePointer = $state(false);
  $effect(() => {
    isCoarsePointer = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  });

  let lastAvailabilityClick = { eventId: "", at: 0 };

  const calendarLiveClasses = $derived(filterByTypeFilter(options.classes, options.typeFilter));

  function readSelectionAnchor(container: HTMLElement | null): SelectionAnchor | undefined {
    if (!container) return undefined;

    const nodes = container.querySelectorAll(
      ".ec-highlight, .ec-selecting, .ec-quick-create-preview",
    );
    if (nodes.length > 0) {
      let top = Infinity;
      let left = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 && rect.height <= 0) continue;
        top = Math.min(top, rect.top);
        left = Math.min(left, rect.left);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }
      if (top !== Infinity) {
        return { top, left, width: right - left, height: bottom - top };
      }
    }

    const highlight =
      container.querySelector(".ec-highlight") ??
      container.querySelector(".ec-selecting .ec-day");
    if (!highlight) return undefined;
    const rect = highlight.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return undefined;
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  function resolveSelectAnchor(
    container: HTMLElement | null,
    start: Date,
    end: Date,
    jsEvent?: MouseEvent,
  ): SelectionAnchor {
    return (
      readSelectionAnchor(container) ??
      anchorFromCalendarSelection(container, start, end, jsEvent)
    );
  }

  function calendarMainEl(): HTMLElement | null {
    return options.getContainerEl()?.querySelector(".ec-main") ?? null;
  }

  function setCalendarSlotHeight(nextHeight: number, anchorY?: number) {
    const main = calendarMainEl();
    const oldHeight = calendarSlotHeight;
    const next = Math.round(clamp(nextHeight, CALENDAR_SLOT_HEIGHT_MIN, CALENDAR_SLOT_HEIGHT_MAX));
    if (next === oldHeight) return;

    const rect = main?.getBoundingClientRect();
    const y = rect ? clamp(anchorY ?? rect.height / 2, 0, rect.height) : 0;
    const scrollTop = main?.scrollTop ?? 0;
    calendarSlotHeight = next;

    if (main) {
      requestAnimationFrame(() => {
        main.scrollTop = ((scrollTop + y) * next) / oldHeight - y;
      });
    }
  }

  function zoomCalendar(direction: "in" | "out") {
    setCalendarSlotHeight(calendarSlotHeight + (direction === "in" ? 6 : -6));
  }

  function resetCalendarZoom() {
    setCalendarSlotHeight(36);
  }

  function handleCalendarWheel(event: WheelEvent) {
    if (event.shiftKey) {
      event.preventDefault();
      const main = calendarMainEl();
      const rect = main?.getBoundingClientRect();
      setCalendarSlotHeight(
        calendarSlotHeight * Math.exp(-event.deltaY * 0.0025),
        rect ? event.clientY - rect.top : undefined,
      );
      return;
    }
  }

  function handleCalendarPointerDown(event: PointerEvent) {
    if (event.button !== 1 || !(event.currentTarget instanceof HTMLElement)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panGesture = {
      pointerId: event.pointerId,
      anchorX: event.clientX,
      threshold: 160,
    };
  }

  function handleCalendarPointerMove(event: PointerEvent) {
    if (!panGesture || event.pointerId !== panGesture.pointerId) return;
    event.preventDefault();
    const delta = panGesture.anchorX - event.clientX;
    const days = Math.trunc(delta / panGesture.threshold);
    if (days === 0) return;
    panGesture = {
      ...panGesture,
      anchorX: panGesture.anchorX - days * panGesture.threshold,
    };
    options.getCalendarRef()?.unselect();
    if (days > 0) {
      options.getCalendarRef()?.next();
    } else {
      options.getCalendarRef()?.prev();
    }
  }

  function clearPanGesture(event?: PointerEvent) {
    if (event && panGesture && event.pointerId !== panGesture.pointerId) return;
    panGesture = null;
  }

  function clearCalendarSelection() {
    options.getCalendarRef()?.unselect();
    const container = document.querySelector(".weekly-agenda-container");
    if (!container) return;
    for (const el of container.querySelectorAll(".ec-highlight, .ec-selecting")) {
      el.classList.remove("ec-highlight", "ec-selecting");
    }
  }

  function emitSelectSlot(start: Date, end: Date, jsEvent?: MouseEvent) {
    const startMs = fromCalendarEventDate(start);
    const endMs = fromCalendarEventDate(end);
    if (startMs < Date.now() - 5 * 60 * 1000) {
      clearCalendarSelection();
      return;
    }
    const durationMinutes = Math.max(15, Math.round((endMs - startMs) / 60000));
    const startsAtLocal = toDateTimeLocalString(startMs);
    const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
    const anchor = resolveSelectAnchor(container, start, end, jsEvent);
    options.onSelectSlot(startsAtLocal, durationMinutes, anchor);
  }

  function emitPreviewChange(start: Date, end: Date) {
    options.onCreatePreviewChange?.(fromCalendarEventDate(start), fromCalendarEventDate(end));
  }

  async function rescheduleFromDrag(
    liveClass: LiveClass,
    startsAt: number,
    durationMinutes: number,
  ) {
    dragError = "";
    submitting = true;
    try {
      await client.mutation(api.live.class.reschedule, {
        liveClassId: liveClass._id,
        startsAt,
        durationMinutes,
        joinOpensMinutesBefore: 15,
        capacity: liveClass.capacity,
        requiredEquipment: liveClass.requiredEquipment,
        title: liveClass.title,
        description: liveClass.description,
      });
    } catch (err) {
      dragError = err instanceof Error ? err.message : t.studio.live.rescheduleError();
      throw err;
    } finally {
      submitting = false;
    }
  }

  function buildCalendarEvents(
    paintMode: boolean,
    liveClasses: LiveClass[],
    availEvents: CalendarEventInput[],
    preview: CreatePreview | null,
  ): CalendarEventInput[] {
    return [
      ...availEvents,
      ...liveClasses
        .filter((c) => c.status !== "cancelled")
        .map((c) => ({
          id: c._id,
          title: c.title,
          start: toCalendarEventDate(c.startsAt),
          end: toCalendarEventDate(c.endsAt),
          editable: !paintMode && c.status === "scheduled",
          startEditable: !paintMode && c.status === "scheduled",
          durationEditable: !paintMode && c.status === "scheduled",
          classNames: [`ec-event-status--${c.status}`, `ec-event-type--${c.type}`],
          extendedProps: { originalClass: c },
        })),
      ...(preview
        ? [
            {
              id: QUICK_CREATE_PREVIEW_ID,
              title: t.studio.live.newClassPreview(),
              start: toCalendarEventDate(preview.startsAt),
              end: toCalendarEventDate(preview.endsAt),
              editable: true,
              startEditable: true,
              durationEditable: true,
              classNames: ["ec-preview", "ec-quick-create-preview"],
              extendedProps: {
                previewEquipment: preview.requiredEquipment ?? [],
              },
            },
          ]
        : []),
    ];
  }

  function handleAvailabilitySelect(start: Date, end: Date) {
    if (!options.availabilityPainted || !options.onAvailabilityPaintChange) return;
    const touches = selectionTouchesPainted(options.availabilityPainted, start, end);
    const mode = touches ? "remove" : "add";
    options.onAvailabilityPaintChange(
      applySelectionToPainted(options.availabilityPainted, start, end, mode),
    );
    clearCalendarSelection();
  }

  function handleDatesSet(info: { start: Date; end: Date; view?: { type?: string } }) {
    const nextStartMs = info.start.getTime();
    const nextEndMs = info.end.getTime();
    options.onViewRangeChange?.(info.start, info.end);

    const nextMode = info.view?.type === "dayGridMonth" ? "month" : "week";
    if (calendarViewMode !== nextMode) {
      calendarViewMode = nextMode;
    }

    if (nextStartMs === viewStart.getTime() && nextEndMs === viewEnd.getTime()) {
      return;
    }
    viewStart = info.start;
    viewEnd = info.end;
  }

  const plugins = [DayGrid, TimeGrid, Interaction];

  let calendarOptions = $state({
    view: "timeGridWeek",
    date: new Date(weekStart),
    locale: "he",
    direction: "rtl" as const,
    firstDay: 0,
    height: "100%",

    slotDuration: "00:30:00",
    snapDuration: "00:15:00",
    slotLabelInterval: "01:00:00",
    slotEventOverlap: false,
    slotHeight: 36,

    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    flexibleSlotTimeLimits: true,

    scrollTime: formatAppScrollTime(),

    selectable: true,
    unselectAuto: true,
    unselectCancel: ".live-event-popover, .live-event-popover *, .ec-quick-create-preview",
    selectMinDistance: 8,
    editable: true,
    eventStartEditable: true,
    eventDurationEditable: true,
    pointer: false,
    nowIndicator: true,
    customScrollbars: true,
    selectBackgroundColor: "var(--accent)",
    longPressDelay: 600,
    customButtons: {
      zoomOut: {
        text: "-",
        click: () => zoomCalendar("out"),
      },
      zoomReset: {
        text: "100%",
        click: resetCalendarZoom,
      },
      zoomIn: {
        text: "+",
        click: () => zoomCalendar("in"),
      },
    },

    headerToolbar: {
      start: "timeGridWeek,dayGridMonth zoomOut,zoomReset,zoomIn",
      center: "title",
      end: "today prev,next",
    },
    buttonText: {
      today: t.studio.live.today(),
      timeGridWeek: "שבוע",
      dayGridMonth: "חודש",
    },

    eventOrder(
      a: {
        extendedProps?: { kind?: string; originalClass?: { type?: string } };
        start: Date;
      },
      b: {
        extendedProps?: { kind?: string; originalClass?: { type?: string } };
        start: Date;
      },
    ) {
      const stackRank = (e: (typeof a)["extendedProps"]) => {
        if (e?.kind === "availability") return 0;
        if (e?.originalClass?.type === "group_live") return 2;
        if (e?.originalClass?.type === "one_on_one") return 2;
        return 1;
      };
      const rankDiff = stackRank(a.extendedProps) - stackRank(b.extendedProps);
      if (rankDiff !== 0) return rankDiff;
      return a.start.getTime() - b.start.getTime();
    },

    events: [] as CalendarEventInput[],

    datesSet: handleDatesSet,

    select: function (info: { start: Date; end: Date; jsEvent?: MouseEvent }) {
      if (options.availabilityPaintMode) {
        handleAvailabilitySelect(info.start, info.end);
        return;
      }
      emitSelectSlot(info.start, info.end, info.jsEvent);
    },

    eventClick: function (info: {
      event: {
        id: string;
        start: Date;
        end: Date;
        extendedProps: {
          originalClass?: LiveClass;
          kind?: string;
          weekday?: number;
          startMinute?: number;
          endMinute?: number;
        };
      };
      el?: HTMLElement;
      jsEvent?: MouseEvent;
    }) {
      if (isQuickCreatePreview(info.event.id)) return;

      if (info.event.extendedProps?.kind === "availability") {
        if (!options.availabilityPaintMode) return;

        const eventId = String(info.event.id);
        const now = Date.now();
        const isDoubleClick =
          lastAvailabilityClick.eventId === eventId &&
          now - lastAvailabilityClick.at <= AVAILABILITY_DOUBLE_CLICK_MS;
        lastAvailabilityClick = { eventId, at: now };

        if (
          isDoubleClick &&
          options.availabilityPainted &&
          options.onAvailabilityPaintChange &&
          info.event.extendedProps.weekday !== undefined &&
          info.event.extendedProps.startMinute !== undefined &&
          info.event.extendedProps.endMinute !== undefined
        ) {
          lastAvailabilityClick = { eventId: "", at: 0 };
          options.onAvailabilityPaintChange(
            eraseAvailabilityRange(
              options.availabilityPainted,
              info.event.extendedProps.weekday,
              info.event.extendedProps.startMinute,
              info.event.extendedProps.endMinute,
            ),
          );
        }
        return;
      }

      if (options.availabilityPaintMode) return;

      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass) return;
      dragError = "";

      const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
      let anchor: SelectionAnchor;
      if (info.el instanceof HTMLElement) {
        const rect = info.el.getBoundingClientRect();
        anchor = {
          top: rect.top,
          left: rect.left,
          width: Math.max(rect.width, 24),
          height: Math.max(rect.height, CALENDAR_SLOT_HEIGHT_PX / 2),
        };
      } else {
        anchor = anchorFromCalendarSelection(
          container,
          info.event.start,
          info.event.end,
          info.jsEvent,
        );
      }
      options.onEventClick(liveClass, anchor);
    },

    eventDrop: function (info: {
      event: { id: string; start: Date; end: Date; extendedProps: { originalClass?: LiveClass } };
      revert: () => void;
    }) {
      if (options.availabilityPaintMode) {
        info.revert();
        return;
      }
      if (isQuickCreatePreview(info.event.id)) {
        emitPreviewChange(info.event.start, info.event.end);
        return;
      }

      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass || liveClass.status !== "scheduled") {
        info.revert();
        return;
      }
      const durationMinutes = Math.max(
        15,
        Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000),
      );
      void rescheduleFromDrag(liveClass, fromCalendarEventDate(info.event.start), durationMinutes).catch(() => {
        info.revert();
      });
    },

    eventResize: function (info: {
      event: { id: string; start: Date; end: Date; extendedProps: { originalClass?: LiveClass } };
      revert: () => void;
    }) {
      if (options.availabilityPaintMode) {
        info.revert();
        return;
      }
      if (isQuickCreatePreview(info.event.id)) {
        emitPreviewChange(info.event.start, info.event.end);
        return;
      }

      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass || liveClass.status !== "scheduled") {
        info.revert();
        return;
      }
      const durationMinutes = Math.max(
        15,
        Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000),
      );
      void rescheduleFromDrag(liveClass, fromCalendarEventDate(info.event.start), durationMinutes).catch(() => {
        info.revert();
      });
    },

    eventContent: function (info: {
      event: {
        display: string;
        title: string;
        extendedProps: {
          originalClass?: LiveClass;
          kind?: string;
          previewEquipment?: string[];
        };
        start: Date;
        end: Date;
        id?: string;
      };
    }) {
      if (info.event.extendedProps?.kind === "availability") {
        return {
          html: `<div class="calendar-class-event-body calendar-availability-event"><div class="event-title">${escapeCalendarHtml(info.event.title)}</div></div>`,
        };
      }

      const c = info.event.extendedProps?.originalClass;

      if (isQuickCreatePreview(info.event.id)) {
        const start = formatEventCalendarWallTime(info.event.start);
        const end = formatEventCalendarWallTime(info.event.end);
        const duration = Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000);
        const equipment = info.event.extendedProps?.previewEquipment ?? [];
        return {
          html: buildPreviewEventHtml({
            startLabel: start,
            endLabel: end,
            durationMinutes: duration,
            requiredEquipment: equipment,
          }),
        };
      }

      if (!c) {
        return { html: "" };
      }

      return {
        html: buildLiveClassEventHtml({
          title: c.title,
          startsAt: c.startsAt,
          endsAt: c.endsAt,
          status: c.status,
          requiredEquipment: c.requiredEquipment,
          seatsTaken: c.rosterSummary?.seatsTaken,
          capacity: c.rosterSummary?.capacity,
          lobbyWaitingCount: c.rosterSummary?.lobbyWaitingCount,
        }),
      };
    },
  });

  $effect(() => {
    const isWeekView = calendarViewMode === "week";
    calendarOptions.events = buildCalendarEvents(
      options.availabilityPaintMode,
      calendarLiveClasses,
      availabilityEvents,
      options.createPreview,
    );
    calendarOptions.slotHeight = calendarSlotHeight;
    calendarOptions.selectable = isWeekView;
    calendarOptions.editable = isWeekView && !options.availabilityPaintMode;
    calendarOptions.eventStartEditable = isWeekView && !options.availabilityPaintMode;
    calendarOptions.eventDurationEditable = isWeekView && !options.availabilityPaintMode;
    calendarOptions.pointer = isWeekView && options.availabilityPaintMode;
    calendarOptions.unselectCancel = options.availabilityPaintMode
      ? ".live-event-popover, .live-event-popover *"
      : ".live-event-popover, .live-event-popover *, .ec-quick-create-preview";
    calendarOptions.longPressDelay = isCoarsePointer ? 450 : 600;
    calendarOptions.customButtons = {
      zoomOut: {
        text: "-",
        click: () => zoomCalendar("out"),
      },
      zoomReset: {
        text: `${Math.round((calendarSlotHeight / 36) * 100)}%`,
        click: resetCalendarZoom,
      },
      zoomIn: {
        text: "+",
        click: () => zoomCalendar("in"),
      },
    };
  });

  return {
    get dragError() {
      return dragError;
    },
    get calendarSlotHeight() {
      return calendarSlotHeight;
    },
    get calendarViewMode() {
      return calendarViewMode;
    },
    get panGesture() {
      return panGesture;
    },
    get calendarOptions() {
      return calendarOptions;
    },
    get plugins() {
      return plugins;
    },
    handleCalendarWheel,
    handleCalendarPointerDown,
    handleCalendarPointerMove,
    clearPanGesture,
    clearCalendarSelection,
  };
}
