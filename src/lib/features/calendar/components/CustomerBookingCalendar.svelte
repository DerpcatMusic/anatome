<script lang="ts">
  import { tick } from "svelte";
  import { Calendar, TimeGrid, DayGrid } from "@event-calendar/core";
  import "@event-calendar/core/index.css";
  import "$features/live/styles/calendar-theme.css";
  import "../styles/cal-time.css";

  import { theme } from "$features/app/theme.svelte";
  import type { CalendarClass, DayAvailability } from "../lib/agenda";
  import { formatWallMinutes, wallMinutesFromTimestamp } from "../lib/one-on-one-time";

  type CalendarView = "week" | "month";

  let {
    view,
    classes,
    dayWindows,
    typeFilter,
    onRangeChange,
    onClassClick,
    onDayClick,
  }: {
    view: CalendarView;
    classes: CalendarClass[];
    dayWindows: DayAvailability[];
    typeFilter: "all" | "group_live" | "one_on_one";
    onRangeChange: (from: number, to: number) => void;
    onClassClick?: (item: CalendarClass) => void;
    onDayClick?: (dayStart: number) => void;
  } = $props();

  type CalendarHandle = {
    getEvents: () => Array<{ id: string }>;
    addEvent: (event: Record<string, unknown>) => unknown;
    updateEvent: (event: Record<string, unknown>) => unknown;
    removeEventById: (id: string) => void;
  };

  type CalendarEventInput = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    classNames?: string[];
    extendedProps?: Record<string, unknown>;
  };

  let calendarRef = $state<CalendarHandle | undefined>();
  let calendarMounted = $state(false);
  /** Set only after week grid DOM exists — avoids scrollToTime on null mainEl. */
  let weekScrollTime = $state<string | undefined>(undefined);

  $effect(() => {
    view;
    calendarMounted = false;
    weekScrollTime = undefined;
    let cancelled = false;
    void tick().then(() => {
      if (cancelled) return;
      calendarMounted = true;
      if (view !== "week") return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          weekScrollTime = `${String(new Date().getHours()).padStart(2, "0")}:00:00`;
        });
      });
    });
    return () => {
      cancelled = true;
    };
  });

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatLocalTime(ts: number) {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function buildEvents(): CalendarEventInput[] {
    const events: CalendarEventInput[] = [];

    if (typeFilter !== "one_on_one") {
      for (const item of classes) {
        if (item.liveClass.status === "cancelled") continue;
        if (typeFilter === "group_live" && item.liveClass.type !== "group_live") continue;

        const reserved =
          item.viewerReservationStatus === "reserved" ||
          item.viewerReservationStatus === "joined";

        events.push({
          id: item.liveClass._id,
          title: item.liveClass.title,
          start: new Date(item.liveClass.startsAt),
          end: new Date(item.liveClass.endsAt),
          classNames: [
            `ec-event-status--${item.liveClass.status}`,
            `ec-event-type--${item.liveClass.type}`,
            reserved ? "ec-event--reserved" : "",
          ].filter(Boolean),
          extendedProps: { kind: "class", item },
        });
      }
    }

    if (typeFilter !== "group_live") {
      for (const window of dayWindows) {
        const range = `${formatWallMinutes(wallMinutesFromTimestamp(window.windowStartsAt, window.dayStart))}–${formatWallMinutes(wallMinutesFromTimestamp(window.windowEndsAt, window.dayStart))}`;
        events.push({
          id: `window-${window.dayStart}-${window.instructorUserId}`,
          title: `1:1 זמין · ${range}`,
          start: new Date(window.windowStartsAt),
          end: new Date(window.windowEndsAt),
          classNames: ["ec-event-type--one_on_one", "ec-event-type--availability-window"],
          extendedProps: { kind: "window", dayStart: window.dayStart, window },
        });
      }
    }

    return events;
  }

  const calendarEvents = $derived(buildEvents());

  function handleDatesSet(info: { start: Date; end: Date }) {
    onRangeChange(info.start.getTime(), info.end.getTime());
  }

  const plugins = $derived(view === "month" ? [DayGrid] : [TimeGrid]);

  const calendarOptions = $derived({
    view: view === "month" ? "dayGridMonth" : "timeGridWeek",
    locale: "he",
    direction: "rtl" as const,
    firstDay: 0,
    height: "auto",
    contentHeight: view === "month" ? 520 : 640,

    slotDuration: "00:30:00",
    slotLabelInterval: "01:00:00",
    slotHeight: 36,
    slotMinTime: "06:00:00",
    slotMaxTime: "23:00:00",
    ...(weekScrollTime !== undefined ? { scrollTime: weekScrollTime } : {}),

    selectable: false,
    editable: false,
    nowIndicator: true,

    headerToolbar: {
      start: "",
      center: "title",
      end: "today prev,next",
    },
    buttonText: {
      today: "היום",
    },

    events: [] as CalendarEventInput[],

    datesSet: handleDatesSet,

    eventClick: function (info: {
      event: {
        extendedProps?: {
          kind?: string;
          item?: CalendarClass;
          dayStart?: number;
        };
      };
    }) {
      const kind = info.event.extendedProps?.kind;
      if (kind === "class" && info.event.extendedProps?.item) {
        onClassClick?.(info.event.extendedProps.item);
      } else if (kind === "window" && info.event.extendedProps?.dayStart !== undefined) {
        onDayClick?.(info.event.extendedProps.dayStart);
      }
    },

    eventContent: function (info: {
      event: {
        title: string;
        extendedProps?: { kind?: string; item?: CalendarClass };
        start: Date;
        end: Date;
      };
    }) {
      const item = info.event.extendedProps?.item;
      if (item) {
        const formattedTime = `${formatLocalTime(item.liveClass.startsAt)} – ${formatLocalTime(item.liveClass.endsAt)}`;
        return {
          html: `
            <div class="calendar-class-event-body status-${item.liveClass.status}" title="${escapeHtml(item.liveClass.title)} · ${formattedTime}">
              <div class="event-title">${escapeHtml(item.liveClass.title)}</div>
            </div>
          `,
        };
      }

      if (info.event.extendedProps?.kind === "window") {
        return {
          html: `
            <div class="calendar-class-event-body ec-event-type--one_on_one ec-event-type--availability-window" title="${escapeHtml(info.event.title)}">
              <div class="event-title cal-time">${escapeHtml(info.event.title)}</div>
            </div>
          `,
        };
      }

      return { html: `<div class="event-title">${escapeHtml(info.event.title)}</div>` };
    },
  });

  $effect(() => {
    const cal = calendarRef;
    const nextEvents = calendarEvents;
    if (!cal) return;

    const existing = cal.getEvents();
    const existingById = new Map(existing.map((event) => [String(event.id), event]));
    const desiredIds = new Set(nextEvents.map((event) => String(event.id)));

    for (const event of nextEvents) {
      const id = String(event.id);
      if (!existingById.has(id)) {
        cal.addEvent(event);
      } else {
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
</script>

<div
  class="customer-booking-calendar"
  class:ec-dark={theme.isDark}
  data-view={view}
>
  {#if calendarMounted}
    {#key view}
      <Calendar bind:this={calendarRef} {plugins} options={calendarOptions} />
    {/key}
  {/if}
</div>

<style>
  .customer-booking-calendar {
    width: 100%;
    min-height: 480px;
    direction: rtl;
    border: var(--border);
    background: var(--elevated);
    padding: var(--space-3);
    border-radius: 4px;
  }

  :global(.customer-booking-calendar .ec-event-type--availability-window) {
    border-style: dashed !important;
    opacity: 0.88;
    background: var(--accent-soft) !important;
  }

  :global(.customer-booking-calendar .ec-event--reserved) {
    box-shadow: inset 0 0 0 2px var(--success);
  }
</style>
