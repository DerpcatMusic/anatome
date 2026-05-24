<script lang="ts">
  import { Calendar, TimeGrid, Interaction } from "@event-calendar/core";
  import "@event-calendar/core/index.css";
  import "$features/live/styles/calendar-theme.css";

  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import LiveClassModalShell from "./LiveClassModalShell.svelte";
  import EditLiveClassForm from "./EditLiveClassForm.svelte";

  type LiveClass = {
    _id: Id<"liveClasses">;
    title: string;
    description: string;
    status: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    startsAt: number;
    endsAt: number;
    capacity: number;
    type: "group_live" | "one_on_one";
    requiredEquipment: Equipment[];
    joinOpensMinutesBefore?: number;
  };

  interface Props {
    classes: LiveClass[];
    onStart: (id: Id<"liveClasses">) => void;
    onEnd: (id: Id<"liveClasses">) => void;
    actionId: string | null;
    onSelectSlot: (timeLocalString: string, durationMinutes: number) => void;
    onRefreshClasses: () => Promise<void>;
    onCreateButtonClick: () => void;
  }

  let {
    classes,
    onStart,
    onEnd,
    actionId,
    onSelectSlot,
    onRefreshClasses,
    onCreateButtonClick,
  }: Props = $props();

  const client = useConvexClient();

  // Edit modal state
  let activeEditClass = $state<LiveClass | null>(null);
  let submitting = $state(false);
  let editError = $state("");

  function formatLocalTime(ts: number) {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function toDateTimeLocal(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function submitReschedule(data: {
    title: string;
    description: string;
    startsAt: number;
    durationMinutes: number;
    joinOpensMinutesBefore: number;
    capacity: number;
    requiredEquipment: Equipment[];
  }) {
    if (!activeEditClass) return;
    editError = "";
    submitting = true;
    try {
      await client.mutation(api.live.class.reschedule, {
        liveClassId: activeEditClass._id,
        startsAt: data.startsAt,
        durationMinutes: data.durationMinutes,
        joinOpensMinutesBefore: data.joinOpensMinutesBefore,
        capacity: data.capacity,
        requiredEquipment: data.requiredEquipment,
        title: data.title,
        description: data.description,
      });
      activeEditClass = null;
      await onRefreshClasses();
    } catch (err) {
      editError = err instanceof Error ? err.message : "לא הצלחנו לעדכן את השיעור.";
    } finally {
      submitting = false;
    }
  }

  async function submitCancellation() {
    if (!activeEditClass) return;
    if (!confirm("האם את בטוחה שברצונך לבטל שיעור זה? כל הרשמות המנויות יבוטלו ויזוכו בקרדיט באופן אוטומטי.")) return;
    editError = "";
    submitting = true;
    try {
      await client.mutation(api.live.class.cancel, {
        liveClassId: activeEditClass._id,
      });
      activeEditClass = null;
      await onRefreshClasses();
    } catch (err) {
      editError = err instanceof Error ? err.message : "לא הצלחנו לבטל את השיעור.";
    } finally {
      submitting = false;
    }
  }

  // Calendar plugins
  const plugins = [TimeGrid, Interaction];

  const calendarOptions = $derived({
    view: "timeGridWeek",
    locale: "he",
    direction: "rtl" as const,
    firstDay: 0,
    height: "100%",

    // Density
    slotDuration: "00:30:00",
    snapDuration: "00:15:00",
    slotLabelInterval: "01:00:00",
    slotEventOverlap: false,
    slotHeight: 36,

    // Time range: wide defaults, auto-expand when events are out of bounds
    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    flexibleSlotTimeLimits: true,

    // Scroll to current time on load
    scrollTime: `${String(new Date().getHours()).padStart(2, "0")}:00:00`,

    // Interactions: click to edit, select range to create
    selectable: true,
    unselectAuto: true,
    editable: false,
    eventStartEditable: false,
    eventDurationEditable: false,
    pointer: true,
    nowIndicator: true,
    customScrollbars: true,
    selectBackgroundColor: "rgba(59, 130, 246, 0.25)",
    longPressDelay: 600,

    // Toolbar: create button integrated
    headerToolbar: {
      start: "customCreate",
      center: "title",
      end: "today prev,next",
    },
    customButtons: {
      customCreate: {
        text: "שיעור לייב חדש",
        click: onCreateButtonClick,
      },
    },
    buttonText: {
      today: "היום",
    },

    // Events
    events: classes
      .filter((c) => c.status !== "cancelled")
      .map((c) => ({
        id: c._id,
        title: c.title,
        start: new Date(c.startsAt).toISOString(),
        end: new Date(c.endsAt).toISOString(),
        editable: c.status === "scheduled" || c.status === "live",
        startEditable: c.status === "scheduled" || c.status === "live",
        durationEditable: c.status === "scheduled" || c.status === "live",
        className: `ec-event-status--${c.status}`,
        extendedProps: { originalClass: c },
      })),

    // Click empty slot → quick create
    dateClick: function(info: { date: Date; dateStr: string }) {
      if (info.date.getTime() < Date.now() - 5 * 60 * 1000) return;
      const startsAtLocal = toDateTimeLocal(info.date);
      onSelectSlot(startsAtLocal, 50);
    },

    // Select range → create
    select: function(info: { start: Date; end: Date }) {
      if (info.start.getTime() < Date.now() - 5 * 60 * 1000) return;
      const startsAtLocal = toDateTimeLocal(info.start);
      const durationMinutes = Math.round((info.end.getTime() - info.start.getTime()) / 60000);
      onSelectSlot(startsAtLocal, durationMinutes);
    },

    // Click event → edit
    eventClick: function(info: { event: { extendedProps: { originalClass?: LiveClass } } }) {
      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass) return;
      editError = "";
      activeEditClass = liveClass;
    },



    // Event content renderer
    eventContent: function(info: { event: { display: string; extendedProps: { originalClass?: LiveClass }; start: Date; end: Date } }) {
      const c = info.event.extendedProps?.originalClass;

      if (info.event.display === "preview") {
        const start = formatLocalTime(info.event.start.getTime());
        const end = formatLocalTime(info.event.end.getTime());
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
      const statusDot = c.status === "live"
        ? `<span class="pulse-indicator" aria-label="\u05e9\u05d9\u05d3\u05d5\u05e8 \u05d7\u05d9"></span>`
        : "";

      return {
        html: `
          <div class="calendar-class-event-body status-${c.status}" title="${escapeHtml(c.title)} \u2022 ${formattedTime}">
            <div class="event-title">${escapeHtml(c.title)}</div>
            <div class="event-meta">
              ${statusDot}
              <span class="meta-badge">${c.type === "one_on_one" ? "1:1" : "\u05e7\u05d1\u05d5\u05e6\u05ea\u05d9"}</span>
            </div>
          </div>
        `,
      };
    },
  });
</script>

<div class="weekly-agenda-container ec-auto-dark">
  <Calendar {plugins} options={calendarOptions} />
</div>

<LiveClassModalShell
  bind:open={() => activeEditClass !== null, (v) => { if (!v) activeEditClass = null; }}
  title={activeEditClass?.status === "ended" ? "שיעור לייב שהסתיים" : "עריכת שיעור לייב"}
  icon={activeEditClass?.status === "ended" ? "task_alt" : "edit_calendar"}
  iconColor={activeEditClass?.status === "ended" ? "var(--muted)" : "var(--sky-strong)"}

>
  {#if activeEditClass}
    <EditLiveClassForm
      liveClass={activeEditClass}
      onSubmit={(data) => void submitReschedule(data)}
      onCancel={() => { activeEditClass = null; editError = ""; }}
      onDelete={submitCancellation}
      onEndLive={() => {
        if (activeEditClass) onEnd(activeEditClass._id);
      }}
      {submitting}
    />
    {#if editError}
      <div class="form-error" role="alert">
        <span class="material-symbols-rounded">error</span>
        {editError}
      </div>
    {/if}
  {/if}
</LiveClassModalShell>

<style>
  .weekly-agenda-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    direction: rtl;
    contain: layout paint;
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--danger-soft);
    color: var(--danger-text);
    border: 1px solid var(--danger);
    padding: var(--space-3);
    font-weight: 800;
    font-size: var(--step--1);
    margin-block-start: var(--space-3);
  }

  .form-error .material-symbols-rounded {
    font-size: var(--step-1);
    flex-shrink: 0;
  }
</style>
