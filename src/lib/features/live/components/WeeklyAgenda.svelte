<script lang="ts">
  import { Calendar, TimeGrid, Interaction } from "@event-calendar/core";
  import "@event-calendar/core/index.css";
  import "$features/live/styles/calendar-theme.css";

  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import type { Equipment } from "$lib/labels";
  import { formatEventCalendarWallTime, toDateTimeLocalString } from "$lib/datetime/local";
  import { theme } from "$features/app/theme.svelte";
  import type { SelectionAnchor } from "$features/live/types/selection-anchor";
  import {
    anchorFromCalendarSelection,
    CALENDAR_SLOT_HEIGHT_PX,
  } from "$features/live/types/selection-anchor";
  import {
    applySelectionToPainted,
    eraseAvailabilityRange,
    expandPaintedToEvents,
    selectionTouchesPainted,
    type PaintedSlots,
  } from "$features/studio/lib/one-on-one-availability";

  const QUICK_CREATE_PREVIEW_ID = "__quick_create_preview__";
  const AVAILABILITY_DOUBLE_CLICK_MS = 400;

  let lastAvailabilityClick = { eventId: "", at: 0 };

  function startOfWeek(date: Date, firstDay = 0): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - firstDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];
  type ClassTypeFilter = "all" | "group_live" | "one_on_one";

  interface Props {
    classes: LiveClass[];
    /** Live-class rows only; availability blocks always show in every mode. */
    typeFilter?: ClassTypeFilter;
    onStart: (id: Id<"liveClasses">) => void;
    onEnd: (id: Id<"liveClasses">) => void;
    actionId: string | null;
    onSelectSlot: (timeLocalString: string, durationMinutes: number, anchor: SelectionAnchor) => void;
    onEventClick: (liveClass: LiveClass, anchor: SelectionAnchor) => void;
    createPreview?: { startsAt: number; endsAt: number } | null;
    onCreatePreviewChange?: (startsAt: number, endsAt: number) => void;
    availabilityPaintMode?: boolean;
    availabilityPainted?: PaintedSlots;
    onAvailabilityPaintChange?: (painted: PaintedSlots) => void;
  }

  let {
    classes,
    typeFilter = "all",
    onStart,
    onEnd,
    actionId,
    onSelectSlot,
    onEventClick,
    createPreview = null,
    onCreatePreviewChange,
    availabilityPaintMode = false,
    availabilityPainted,
    onAvailabilityPaintChange,
  }: Props = $props();

  const client = useConvexClient();

  let submitting = $state(false);
  let dragError = $state("");
  type CalendarHandle = {
    unselect: () => void;
    getEvents: () => Array<{
      id: string;
      start: Date;
      end: Date;
      title: string;
      classNames?: string[];
      extendedProps?: { originalClass?: { type?: string }; kind?: string };
    }>;
    updateEvent: (event: Record<string, unknown>) => unknown;
    addEvent: (event: Record<string, unknown>) => unknown;
    removeEventById: (id: string) => void;
  };

  type CalendarEventInput = {
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
  };

  let calendarRef = $state<CalendarHandle | undefined>();
  let containerEl = $state<HTMLElement | undefined>();

  const weekStart = startOfWeek(new Date(), 0);
  let viewStart = $state(new Date(weekStart));
  let viewEnd = $state(new Date(weekStart.getTime() + 7 * 86_400_000));

  const availabilityEvents = $derived.by(() => {
    if (!availabilityPainted) return [];
    return expandPaintedToEvents(
      availabilityPainted,
      viewStart,
      viewEnd,
      availabilityPaintMode,
    );
  });

  const isCoarsePointer = $derived(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );

  function formatLocalTime(ts: number) {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

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

  /** Clears drag selection highlight and quick-create preview chrome on the grid. */
  export function clearCalendarSelection() {
    calendarRef?.unselect();
    const container = document.querySelector(".weekly-agenda-container");
    if (!container) return;
    for (const el of container.querySelectorAll(".ec-highlight, .ec-selecting")) {
      el.classList.remove("ec-highlight", "ec-selecting");
    }
  }

  function emitSelectSlot(start: Date, end: Date, jsEvent?: MouseEvent) {
    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      clearCalendarSelection();
      return;
    }
    const durationMinutes = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
    const startsAtLocal = toDateTimeLocalString(start);
    const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
    const anchor = resolveSelectAnchor(container, start, end, jsEvent);
    onSelectSlot(startsAtLocal, durationMinutes, anchor);
  }

  function isQuickCreatePreview(eventId: string | undefined): boolean {
    return eventId === QUICK_CREATE_PREVIEW_ID;
  }

  function emitPreviewChange(start: Date, end: Date) {
    onCreatePreviewChange?.(start.getTime(), end.getTime());
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
      dragError = err instanceof Error ? err.message : "לא הצלחנו לתזמן מחדש את השיעור.";
      throw err;
    } finally {
      submitting = false;
    }
  }

  const calendarLiveClasses = $derived(
    typeFilter === "all" ? classes : classes.filter((c) => c.type === typeFilter),
  );

  function buildCalendarEvents(
    paintMode: boolean,
    liveClasses: LiveClass[],
  ): CalendarEventInput[] {
    return [
      ...availabilityEvents,
      ...liveClasses
        .filter((c) => c.status !== "cancelled")
        .map((c) => ({
          id: c._id,
          title: c.title,
          start: new Date(c.startsAt),
          end: new Date(c.endsAt),
          editable: !paintMode && c.status === "scheduled",
          startEditable: !paintMode && c.status === "scheduled",
          durationEditable: !paintMode && c.status === "scheduled",
          classNames: [`ec-event-status--${c.status}`, `ec-event-type--${c.type}`],
          extendedProps: { originalClass: c },
        })),
      ...(createPreview
        ? [
            {
              id: QUICK_CREATE_PREVIEW_ID,
              title: "שיעור חדש",
              start: new Date(createPreview.startsAt),
              end: new Date(createPreview.endsAt),
              display: "preview",
              editable: true,
              startEditable: true,
              durationEditable: true,
              classNames: ["ec-preview", "ec-quick-create-preview"],
            },
          ]
        : []),
    ];
  }

  function sameEventTimes(
    a: { start: Date; end: Date },
    b: { start: Date; end: Date },
  ): boolean {
    return a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime();
  }

  function eventClassNamesKey(event: {
    classNames?: string[];
    extendedProps?: { originalClass?: { type?: string } };
  }): string {
    const names = event.classNames ?? [];
    const type = event.extendedProps?.originalClass?.type ?? "";
    return `${names.join(",")}|${type}`;
  }

  function handleAvailabilitySelect(start: Date, end: Date) {
    if (!availabilityPainted || !onAvailabilityPaintChange) return;
    const touches = selectionTouchesPainted(availabilityPainted, start, end);
    const mode = touches ? "remove" : "add";
    onAvailabilityPaintChange(applySelectionToPainted(availabilityPainted, start, end, mode));
    clearCalendarSelection();
  }

  const plugins = [TimeGrid, Interaction];

  $effect(() => {
    const cal = calendarRef;
    const liveClasses = calendarLiveClasses;
    const nextEvents = buildCalendarEvents(availabilityPaintMode, liveClasses);
    if (!cal) return;

    const existing = cal.getEvents();
    const existingById = new Map(existing.map((event) => [String(event.id), event]));
    const desiredIds = new Set(nextEvents.map((event) => String(event.id)));

    for (const event of nextEvents) {
      const id = String(event.id);
      const current = existingById.get(id);
      if (!current) {
        cal.addEvent(event);
        continue;
      }
      if (
        !sameEventTimes(current, event) ||
        current.title !== event.title ||
        eventClassNamesKey(current) !== eventClassNamesKey(event)
      ) {
        cal.updateEvent({ ...event, id });
      }
    }

    for (const event of existing) {
      const id = String(event.id);
      if (!desiredIds.has(id)) {
        cal.removeEventById(id);
      }
    }
  });

  function handleDatesSet(info: { start: Date; end: Date }) {
    const nextStartMs = info.start.getTime();
    const nextEndMs = info.end.getTime();
    if (nextStartMs === viewStart.getTime() && nextEndMs === viewEnd.getTime()) {
      return;
    }
    viewStart = info.start;
    viewEnd = info.end;
  }

  const calendarOptions = $derived({
    view: "timeGridWeek",
    locale: "he",
    direction: "rtl" as const,
    firstDay: 0,
    height: "100%",

    slotDuration: "00:30:00",
    snapDuration: "00:15:00",
    slotLabelInterval: "01:00:00",
    slotEventOverlap: true,
    slotHeight: 36,

    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    flexibleSlotTimeLimits: true,

    scrollTime: `${String(new Date().getHours()).padStart(2, "0")}:00:00`,

    selectable: true,
    unselectAuto: true,
    unselectCancel: availabilityPaintMode
      ? ".live-event-popover, .live-event-popover *"
      : ".live-event-popover, .live-event-popover *, .ec-quick-create-preview",
    selectMinDistance: 8,
    editable: !availabilityPaintMode,
    eventStartEditable: !availabilityPaintMode,
    eventDurationEditable: !availabilityPaintMode,
    pointer: availabilityPaintMode,
    nowIndicator: true,
    customScrollbars: true,
    selectBackgroundColor: "var(--secondary)",
    longPressDelay: isCoarsePointer ? 450 : 600,

    headerToolbar: {
      start: "",
      center: "title",
      end: "today prev,next",
    },
    buttonText: {
      today: "היום",
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

    events: [],

    datesSet: handleDatesSet,

    select: function (info: { start: Date; end: Date; jsEvent?: MouseEvent }) {
      if (availabilityPaintMode) {
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
        if (!availabilityPaintMode) return;

        const eventId = String(info.event.id);
        const now = Date.now();
        const isDoubleClick =
          lastAvailabilityClick.eventId === eventId &&
          now - lastAvailabilityClick.at <= AVAILABILITY_DOUBLE_CLICK_MS;
        lastAvailabilityClick = { eventId, at: now };

        if (
          isDoubleClick &&
          availabilityPainted &&
          onAvailabilityPaintChange &&
          info.event.extendedProps.weekday !== undefined &&
          info.event.extendedProps.startMinute !== undefined &&
          info.event.extendedProps.endMinute !== undefined
        ) {
          lastAvailabilityClick = { eventId: "", at: 0 };
          onAvailabilityPaintChange(
            eraseAvailabilityRange(
              availabilityPainted,
              info.event.extendedProps.weekday,
              info.event.extendedProps.startMinute,
              info.event.extendedProps.endMinute,
            ),
          );
        }
        return;
      }

      if (availabilityPaintMode) return;

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
      onEventClick(liveClass, anchor);
    },

    eventDrop: function (info: {
      event: { id: string; start: Date; end: Date; extendedProps: { originalClass?: LiveClass } };
      revert: () => void;
    }) {
      if (availabilityPaintMode) {
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
      void rescheduleFromDrag(liveClass, info.event.start.getTime(), durationMinutes).catch(() => {
        info.revert();
      });
    },

    eventResize: function (info: {
      event: { id: string; start: Date; end: Date; extendedProps: { originalClass?: LiveClass } };
      revert: () => void;
    }) {
      if (availabilityPaintMode) {
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
      void rescheduleFromDrag(liveClass, info.event.start.getTime(), durationMinutes).catch(() => {
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
        };
        start: Date;
        end: Date;
      };
    }) {
      if (info.event.extendedProps?.kind === "availability") {
        return {
          html: `<div class="calendar-class-event-body calendar-availability-event"><div class="event-title">${escapeHtml(info.event.title)}</div></div>`,
        };
      }

      const c = info.event.extendedProps?.originalClass;

      if (info.event.display === "preview") {
        const start = formatEventCalendarWallTime(info.event.start);
        const end = formatEventCalendarWallTime(info.event.end);
        const duration = Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000);
        return {
          html: `
            <div class="calendar-preview-event">
              <span class="preview-start">${start}</span>
              <span class="preview-divider">${duration} דק׳</span>
              <span class="preview-end">${end}</span>
            </div>
          `,
        };
      }

      if (!c) {
        return { html: "" };
      }

      const formattedTime = `${formatLocalTime(c.startsAt)} \u2013 ${formatLocalTime(c.endsAt)}`;

      return {
        html: `
          <div class="calendar-class-event-body status-${c.status}" title="${escapeHtml(c.title)} \u2022 ${formattedTime}">
            <div class="event-title">${escapeHtml(c.title)}</div>
            ${c.status === "live" ? `<div class="event-meta"><span class="pulse-indicator" aria-label="\u05e9\u05d9\u05d3\u05d5\u05e8 \u05d7\u05d9"></span></div>` : ""}
          </div>
        `,
      };
    },
  });
</script>

<div
  bind:this={containerEl}
  class="weekly-agenda-container"
  class:ec-dark={theme.isDark}
  class:weekly-agenda-container--availability-paint={availabilityPaintMode}
>
  {#if dragError}
    <div class="drag-error" role="alert">
      <span class="material-symbols-rounded">error</span>
      {dragError}
    </div>
  {/if}
  <Calendar bind:this={calendarRef} {plugins} options={calendarOptions} />
</div>

<style>
  .weekly-agenda-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    direction: rtl;
    contain: layout;
  }

  .drag-error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 var(--space-3) var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--surface);
    color: var(--danger);
    border: 1px solid var(--danger);
    font-weight: 800;
    font-size: var(--step--1);
    flex-shrink: 0;
  }

  .drag-error .material-symbols-rounded {
    font-size: var(--step-1);
    flex-shrink: 0;
  }

  :global(.weekly-agenda-container .ec-highlight) {
    outline: 2px solid var(--secondary);
    outline-offset: -1px;
  }

  :global(.weekly-agenda-container .ec-selecting .ec-day) {
    outline: 2px dashed var(--secondary);
    outline-offset: -1px;
  }

  :global(.weekly-agenda-container--availability-paint) {
    cursor: crosshair;
  }

  :global(.weekly-agenda-container--availability-paint .ec-body) {
    cursor: crosshair;
  }

  /* 70/30 when availability overlaps a live class in the same column */
  :global(
    .weekly-agenda-container
      .ec-day:has(.ec-event-type--availability):has(.ec-event-type--group_live, .ec-event-type--one_on_one:not(.ec-event-type--availability))
      .ec-event-type--availability
  ) {
    inline-size: 30% !important;
    inset-inline-start: 0 !important;
    z-index: 1 !important;
  }

  :global(
    .weekly-agenda-container
      .ec-day:has(.ec-event-type--availability):has(.ec-event-type--group_live, .ec-event-type--one_on_one:not(.ec-event-type--availability))
      .ec-event-type--one_on_one
  ) {
    inline-size: 70% !important;
    inset-inline-start: 30% !important;
    z-index: 2 !important;
  }

  :global(
    .weekly-agenda-container
      .ec-day:has(.ec-event-type--availability):has(.ec-event-type--group_live, .ec-event-type--one_on_one:not(.ec-event-type--availability))
      .ec-event-type--group_live
  ) {
    inline-size: 70% !important;
    inset-inline-start: 30% !important;
    z-index: 3 !important;
  }
</style>
