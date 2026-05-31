<script lang="ts">
  import { tick } from "svelte";
  import {
    loadEventCalendar,
    type EventCalendarModule,
  } from "../lib/event-calendar-load";
  import "$features/live/styles/calendar-theme.css";
  import "../styles/cal-time.css";

  import { theme } from "$features/app/theme.svelte";
  import type { CalendarClass, DayAvailability } from "../lib/agenda";
  import { formatAppScrollTime, formatAppTime, toCalendarEventDate } from "$lib/datetime/local";
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

  let eventCalendar = $state<EventCalendarModule | null>(null);
  let calendarRef: CalendarHandle | undefined = undefined;
  let calendarMounted = $state(false);

  $effect(() => {
    void loadEventCalendar().then((mod) => {
      eventCalendar = mod;
    });
  });
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
          weekScrollTime = formatAppScrollTime();
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
          start: toCalendarEventDate(item.liveClass.startsAt),
          end: toCalendarEventDate(item.liveClass.endsAt),
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
          start: toCalendarEventDate(window.windowStartsAt),
          end: toCalendarEventDate(window.windowEndsAt),
          classNames: ["ec-event-type--one_on_one", "ec-event-type--availability-window"],
          extendedProps: { kind: "window", dayStart: window.dayStart, window },
        });
      }
    }

    return events;
  }

  const calendarEvents = $derived(buildEvents());

  function resolvePlugins(eventCalendar: EventCalendarModule | null, view: CalendarView): unknown[] {
    if (!eventCalendar) return [];
    return view === "month" ? [eventCalendar.DayGrid] : [eventCalendar.TimeGrid];
  }

  function buildCalendarOptions(
    view: CalendarView,
    weekScrollTime: string | undefined,
    onClassClick: ((item: CalendarClass) => void) | undefined,
    onDayClick: ((dayStart: number) => void) | undefined,
    onRangeChange: ((from: number, to: number) => void) | undefined,
  ) {
    return {
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

      datesSet: function (info: { start: Date; end: Date }) {
        onRangeChange?.(info.start.getTime(), info.end.getTime());
      },

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
          const formattedTime = `${formatAppTime(item.liveClass.startsAt)} – ${formatAppTime(item.liveClass.endsAt)}`;
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
    };
  }

  const plugins = $derived(resolvePlugins(eventCalendar, view));

  const calendarOptions = $derived(buildCalendarOptions(view, weekScrollTime, onClassClick, onDayClick, onRangeChange));

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

{#snippet calendarView()}
  {#key view}
    {@const EcCalendar = eventCalendar!.Calendar}
    <EcCalendar bind:this={calendarRef} {plugins} options={calendarOptions} />
  {/key}
{/snippet}

<div
  class="customer-booking-calendar"
  class:ec-dark={theme.isDark}
  data-view={view}
>
  {#if calendarMounted && eventCalendar}
    {@render calendarView()}
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

  :global(.customer-booking-calendar .ec-event-type--availability-window.ec-event-type--availability-window) {
    border-style: dashed;
    opacity: 0.88;
    background: var(--accent-soft);
  }

  :global(.customer-booking-calendar .ec-event--reserved) {
    box-shadow: inset 0 0 0 2px var(--success);
  }
</style>
