<script lang="ts">
  import { Calendar, TimeGrid, Interaction } from "@event-calendar/core";
  import "@event-calendar/core/index.css";
  import "$features/live/styles/calendar-theme.css";

  import Button from "$components/ui/Button.svelte";
  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { durationLabel } from "$lib/labels";
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
  }

  let {
    classes,
    onStart,
    onEnd,
    actionId,
    onSelectSlot,
    onRefreshClasses,
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
      await client.mutation(api.instructorLive.rescheduleLiveClass, {
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
      await client.mutation(api.instructorLive.cancelLiveClass, {
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

  async function handleDragDropReschedule(liveClassId: Id<"liveClasses">, newStartsAt: number, newEndsAt: number) {
    const orig = classes.find(c => c._id === liveClassId);
    if (!orig) return;

    const durationMinutes = Math.round((newEndsAt - newStartsAt) / (1000 * 60));
    try {
      await client.mutation(api.instructorLive.rescheduleLiveClass, {
        liveClassId,
        startsAt: newStartsAt,
        durationMinutes,
        joinOpensMinutesBefore: orig.joinOpensMinutesBefore ?? 10,
        capacity: orig.capacity,
        requiredEquipment: orig.requiredEquipment,
        title: orig.title,
        description: orig.description,
      });
      await onRefreshClasses();
    } catch (err) {
      editError = err instanceof Error ? err.message : "לא הצלחנו לעדכן את השיעור.";
      await onRefreshClasses(); // Rollback local view
    }
  }

  // Calendar configuration with reactive states
  const plugins = [TimeGrid, Interaction];

  const calendarOptions = $derived({
    view: "timeGridWeek",
    locale: "he",
    direction: "rtl" as const,
    firstDay: 0, // Sunday first
    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    allDaySlot: false,
    headerToolbar: {
      start: "today prev,next",
      center: "title",
      end: ""
    },
    buttonText: {
      today: "היום"
    },
    height: "calc(100vh - 260px)",
    slotDuration: "00:30:00",
    slotLabelInterval: "01:00:00",
    slotEventOverlap: false,
    selectable: true,
    unselectAuto: true,
    editable: true,
    selectBackgroundColor: "rgba(59, 130, 246, 0.35)",

    // Reactive Convex classes array
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
        extendedProps: {
          originalClass: c
        }
      })),

    // Calendar Handlers
    select: function(info: { start: Date; end: Date }) {
      // Block scheduling in the past
      if (info.start.getTime() < Date.now() - 5 * 60 * 1000) {
        return;
      }
      const startsAtLocal = toDateTimeLocal(info.start);
      const durationMinutes = Math.round((info.end.getTime() - info.start.getTime()) / 60000);
      onSelectSlot(startsAtLocal, durationMinutes);
    },
    eventClick: function(info: { event: { extendedProps: { originalClass?: LiveClass } } }) {
      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass) return;
      editError = "";
      activeEditClass = liveClass;
    },
    eventDrop: function(info: { event: { extendedProps: { originalClass?: LiveClass }; start: Date; end: Date }; revert: () => void }) {
      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass || liveClass.status === "ended") {
        info.revert();
        return;
      }
      handleDragDropReschedule(liveClass._id, info.event.start.getTime(), info.event.end.getTime());
    },
    eventResize: function(info: { event: { extendedProps: { originalClass?: LiveClass }; start: Date; end: Date }; revert: () => void }) {
      const liveClass = info.event.extendedProps?.originalClass;
      if (!liveClass || liveClass.status === "ended") {
        info.revert();
        return;
      }
      handleDragDropReschedule(liveClass._id, info.event.start.getTime(), info.event.end.getTime());
    },

    // Clean minimal event card render
    eventContent: function(info: { event: { extendedProps: { originalClass?: LiveClass }; start: Date; end: Date } }) {
      const c = info.event.extendedProps?.originalClass;
      if (!c) {
        // This is a preview/selection event — render nothing custom
        return { html: "" };
      }

      const formattedTime = `${formatLocalTime(c.startsAt)} – ${formatLocalTime(c.endsAt)}`;

      let statusDot = "";
      if (c.status === "live") {
        statusDot = `<span class="pulse-indicator" aria-label="שידור חי"></span>`;
      }

      return {
        html: `
          <div class="calendar-class-event-body status-${c.status}" title="${escapeHtml(c.title)} • ${formattedTime}">
            <div class="event-title">${escapeHtml(c.title)}</div>
            <div class="event-meta">
              ${statusDot}
              <span class="meta-badge">${c.type === "one_on_one" ? "1:1" : "קבוצתי"}</span>
            </div>
          </div>
        `
      };
    }
  });
</script>

<div class="weekly-agenda-container">
  <div class="calendar-wrapper">
    <Calendar {plugins} options={calendarOptions} />
  </div>
</div>

<LiveClassModalShell
  bind:open={() => activeEditClass !== null, (v) => { if (!v) activeEditClass = null; }}
  title={activeEditClass?.status === "ended" ? "שיעור לייב שהסתיים" : "עריכת שיעור לייב"}
  icon={activeEditClass?.status === "ended" ? "task_alt" : "edit_calendar"}
  iconColor={activeEditClass?.status === "ended" ? "var(--muted)" : "var(--sky-strong)"}
  wide
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
    width: 100%;
    direction: rtl;
    contain: layout paint;
  }

  .calendar-wrapper {
    background: var(--white);
    border: 1px solid var(--line-light);
    padding: var(--space-2);
    border-radius: 8px;
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
