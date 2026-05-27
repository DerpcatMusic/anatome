<script lang="ts">
  import { Calendar, TimeGrid, Interaction } from "@event-calendar/core";
  import "@event-calendar/core/index.css";
  import "$features/live/styles/calendar-theme.css";

  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import type { Equipment } from "$lib/labels";
  import {
    formatAppScrollTime,
    formatAppTime,
    formatEventCalendarWallTime,
    fromCalendarEventDate,
    toCalendarEventDate,
    toDateTimeLocalString,
  } from "$lib/datetime/local";
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
  import { useI18n } from "$lib/i18n/runes.svelte";

  const QUICK_CREATE_PREVIEW_ID = "__quick_create_preview__";
  const AVAILABILITY_DOUBLE_CLICK_MS = 400;
  const CALENDAR_SLOT_HEIGHT_MIN = 24;
  const CALENDAR_SLOT_HEIGHT_MAX = 72;
  const CALENDAR_WHEEL_DAY_THRESHOLD_PX = 180;
  const { t } = useI18n();

  let lastAvailabilityClick = { eventId: "", at: 0 };
  let wheelDayRemainder = 0;

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
    onViewRangeChange?: (start: Date, end: Date) => void;
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
    onViewRangeChange,
  }: Props = $props();

  const client = useConvexClient();

  let submitting = $state(false);
  let dragError = $state("");
  let calendarSlotHeight = $state(36);
  let panGesture = $state<{
    pointerId: number;
    anchorX: number;
    threshold: number;
  } | null>(null);
  type CalendarHandle = {
    unselect: () => void;
    setOption: (name: string, value: unknown) => CalendarHandle;
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

  const weekStart = startOfWeek(toCalendarEventDate(Date.now()), 0);
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

  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function calendarMainEl(): HTMLElement | null {
    return containerEl?.querySelector(".ec-main") ?? null;
  }

  function shiftCalendarDate(days: number) {
    if (days === 0) return;
    clearCalendarSelection();
    const next = new Date(viewStart);
    next.setDate(next.getDate() + days);
    calendarRef?.setOption("date", next);
  }

  function dayPanThreshold(): number {
    const day = containerEl?.querySelector(".ec-time-grid .ec-body .ec-day");
    if (!(day instanceof HTMLElement)) return CALENDAR_WHEEL_DAY_THRESHOLD_PX;
    return Math.max(90, day.getBoundingClientRect().width * 0.55);
  }

  function handleCalendarWheel(event: WheelEvent) {
    if (event.shiftKey) {
      event.preventDefault();
      const main = calendarMainEl();
      const oldHeight = calendarSlotHeight;
      const nextHeight = Math.round(
        clamp(
          oldHeight * Math.exp(-event.deltaY * 0.0025),
          CALENDAR_SLOT_HEIGHT_MIN,
          CALENDAR_SLOT_HEIGHT_MAX,
        ),
      );
      if (nextHeight === oldHeight) return;

      const rect = main?.getBoundingClientRect();
      const y = rect ? clamp(event.clientY - rect.top, 0, rect.height) : 0;
      const scrollTop = main?.scrollTop ?? 0;
      calendarSlotHeight = nextHeight;

      if (main) {
        requestAnimationFrame(() => {
          main.scrollTop = ((scrollTop + y) * nextHeight) / oldHeight - y;
        });
      }
      return;
    }

    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.35) return;
    event.preventDefault();
    wheelDayRemainder += event.deltaX;
    const days = Math.trunc(wheelDayRemainder / CALENDAR_WHEEL_DAY_THRESHOLD_PX);
    if (days === 0) return;
    wheelDayRemainder -= days * CALENDAR_WHEEL_DAY_THRESHOLD_PX;
    shiftCalendarDate(days);
  }

  function handleCalendarPointerDown(event: PointerEvent) {
    if (event.button !== 1 || !(event.currentTarget instanceof HTMLElement)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panGesture = {
      pointerId: event.pointerId,
      anchorX: event.clientX,
      threshold: dayPanThreshold(),
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
    shiftCalendarDate(days);
  }

  function clearPanGesture(event?: PointerEvent) {
    if (event && panGesture && event.pointerId !== panGesture.pointerId) return;
    panGesture = null;
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
    onSelectSlot(startsAtLocal, durationMinutes, anchor);
  }

  function isQuickCreatePreview(eventId: string | undefined): boolean {
    return eventId === QUICK_CREATE_PREVIEW_ID;
  }

  function emitPreviewChange(start: Date, end: Date) {
    onCreatePreviewChange?.(fromCalendarEventDate(start), fromCalendarEventDate(end));
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
          start: toCalendarEventDate(c.startsAt),
          end: toCalendarEventDate(c.endsAt),
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
              title: t.studio.live.newClassPreview(),
              start: toCalendarEventDate(createPreview.startsAt),
              end: toCalendarEventDate(createPreview.endsAt),
              editable: true,
              startEditable: true,
              durationEditable: true,
              classNames: ["ec-preview", "ec-quick-create-preview"],
            },
          ]
        : []),
    ];
  }

  function handleAvailabilitySelect(start: Date, end: Date) {
    if (!availabilityPainted || !onAvailabilityPaintChange) return;
    const touches = selectionTouchesPainted(availabilityPainted, start, end);
    const mode = touches ? "remove" : "add";
    onAvailabilityPaintChange(applySelectionToPainted(availabilityPainted, start, end, mode));
    clearCalendarSelection();
  }

  const plugins = [TimeGrid, Interaction];

  function handleDatesSet(info: { start: Date; end: Date }) {
    const nextStartMs = info.start.getTime();
    const nextEndMs = info.end.getTime();
    onViewRangeChange?.(info.start, info.end);
    if (nextStartMs === viewStart.getTime() && nextEndMs === viewEnd.getTime()) {
      return;
    }
    viewStart = info.start;
    viewEnd = info.end;
  }

  const calendarOptions = $derived({
    view: "timeGridRollingWeek",
    views: {
      timeGridRollingWeek: {
        type: "timeGridWeek",
        duration: { days: 7 },
        dateIncrement: { days: 1 },
        buttonText: "שבוע",
      },
    },
    locale: "he",
    direction: "rtl" as const,
    firstDay: 0,
    height: "100%",

    slotDuration: "00:30:00",
    snapDuration: "00:15:00",
    slotLabelInterval: "01:00:00",
    slotEventOverlap: false,
    slotHeight: calendarSlotHeight,

    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    flexibleSlotTimeLimits: true,

    scrollTime: formatAppScrollTime(),

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
    selectBackgroundColor: "var(--accent)",
    longPressDelay: isCoarsePointer ? 450 : 600,

    headerToolbar: {
      start: "",
      center: "title",
      end: "today prev,next",
    },
    buttonText: {
      today: t.studio.live.today(),
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

    events: buildCalendarEvents(availabilityPaintMode, calendarLiveClasses),

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
      void rescheduleFromDrag(liveClass, fromCalendarEventDate(info.event.start), durationMinutes).catch(() => {
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
        };
        start: Date;
        end: Date;
        id?: string;
      };
    }) {
      if (info.event.extendedProps?.kind === "availability") {
        return {
          html: `<div class="calendar-class-event-body calendar-availability-event"><div class="event-title">${escapeHtml(info.event.title)}</div></div>`,
        };
      }

      const c = info.event.extendedProps?.originalClass;

      if (isQuickCreatePreview(info.event.id)) {
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

      const formattedTime = `${formatAppTime(c.startsAt)} \u2013 ${formatAppTime(c.endsAt)}`;

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
  class:weekly-agenda-container--panning={panGesture !== null}
  role="region"
  aria-label="לוח שיעורי לייב"
  onwheel={handleCalendarWheel}
  onpointerdown={handleCalendarPointerDown}
  onpointermove={handleCalendarPointerMove}
  onpointerup={clearPanGesture}
  onpointercancel={clearPanGesture}
  onlostpointercapture={() => clearPanGesture()}
>
  {#if availabilityPaintMode}
    <div class="availability-paint-strip" role="status">
      <span class="material-symbols-rounded" aria-hidden="true">gesture</span>
      <span>סימון זמינות 1:1</span>
    </div>
  {/if}
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
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }

  :global(.weekly-agenda-container .ec-selecting .ec-day) {
    outline: 2px dashed var(--accent);
    outline-offset: -1px;
  }

  :global(.weekly-agenda-container--availability-paint) {
    cursor: crosshair;
  }

  :global(.weekly-agenda-container--availability-paint .ec-body) {
    cursor: crosshair;
  }

  :global(.weekly-agenda-container--panning),
  :global(.weekly-agenda-container--panning .ec),
  :global(.weekly-agenda-container--panning .ec-body) {
    cursor: grabbing;
    user-select: none;
  }

  .availability-paint-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 32px;
    padding: 0 var(--space-3);
    border-bottom: 1px solid color-mix(in oklch, var(--primary) 30%, var(--line-light));
    background: var(--primary);
    color: var(--paper);
    font-size: var(--step--1);
    font-weight: 900;
    letter-spacing: 0;
    flex-shrink: 0;
  }

  .availability-paint-strip .material-symbols-rounded {
    font-size: 1rem;
  }

  :global(.weekly-agenda-container--availability-paint .ec) {
    box-shadow: inset 0 0 0 2px var(--primary);
  }

  :global(.weekly-agenda-container--availability-paint .ec-toolbar),
  :global(.weekly-agenda-container--availability-paint .ec-header) {
    background: color-mix(in oklch, var(--primary) 5%, var(--ec-bg-color));
  }

  :global(.weekly-agenda-container--availability-paint .ec-highlight) {
    outline-color: var(--primary);
    background: color-mix(in oklch, var(--primary) 16%, transparent);
  }

  :global(.weekly-agenda-container--availability-paint .ec-selecting .ec-day) {
    outline-color: var(--primary);
  }

</style>
