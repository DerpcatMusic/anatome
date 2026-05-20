<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import Slider from "$components/ui/Slider.svelte";
  import DatePicker from "$components/ui/DatePicker.svelte";
  import NativeTimePicker from "$components/ui/NativeTimePicker.svelte";
  import { parseDate } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";
  import { durationLabel } from "$lib/labels";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import { TextareaAutosize } from "runed";

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
    liveClass: LiveClass;
    onSubmit: (data: {
      title: string;
      description: string;
      startsAt: number;
      durationMinutes: number;
      joinOpensMinutesBefore: number;
      capacity: number;
      requiredEquipment: Equipment[];
    }) => void;
    onCancel: () => void;
    onDelete: () => void;
    onEndLive?: () => void;
    submitting?: boolean;
  }

  let {
    liveClass,
    onSubmit,
    onCancel,
    onDelete,
    onEndLive,
    submitting = false,
  }: Props = $props();

  function formatLocalDate(ts: number) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatLocalTime(ts: number) {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  // Form state
  let editTitle = $state("");
  let editDescription = $state("");
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({ element: () => descEl ?? undefined, input: () => editDescription });

  let editTime = $state("");
  let editDuration = $state(60);
  let editJoinOpens = $state(10);
  let editCapacity = $state(12);
  let editEquipment = $state<Equipment[]>([]);

  let editDateValue = $state<DateValue | undefined>(undefined);
  const editDate = $derived(editDateValue ? editDateValue.toString() : "");

  // Initialize form when liveClass changes (only when the class reference changes)
  let previousClassId: Id<"liveClasses"> | undefined = undefined;
  $effect(() => {
    const classId = liveClass._id;
    if (classId === previousClassId) return;
    previousClassId = classId;
    editTitle = liveClass.title;
    editDescription = liveClass.description || "";
    editTime = formatLocalTime(liveClass.startsAt);
    editDuration = Math.round((liveClass.endsAt - liveClass.startsAt) / (1000 * 60));
    editJoinOpens = liveClass.joinOpensMinutesBefore ?? 10;
    editCapacity = liveClass.capacity;
    editEquipment = [...liveClass.requiredEquipment];
    try {
      editDateValue = parseDate(formatLocalDate(liveClass.startsAt));
    } catch {
      editDateValue = undefined;
    }
  });

  // Computed end time
  const endTimeDisplay = $derived.by(() => {
    const [h, m] = editTime.split(":").map(Number);
    const start = new Date(2000, 0, 1, h, m);
    const end = new Date(start.getTime() + editDuration * 60000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    const startsAt = new Date(`${editDate}T${editTime}`).getTime();
    onSubmit({
      title: editTitle.trim(),
      description: editDescription.trim(),
      startsAt,
      durationMinutes: editDuration,
      joinOpensMinutesBefore: editJoinOpens,
      capacity: liveClass.type === "one_on_one" ? 1 : editCapacity,
      requiredEquipment: editEquipment,
    });
  }
</script>

{#if liveClass.status === "ended"}
  <div class="ended-class-details">
    <div class="read-only-banner">
      <span class="material-symbols-rounded completed-tick">check_circle</span>
      <div class="banner-text">
        <h3>השיעור הושלם בהצלחה</h3>
        <p>שיעורים שהסתיימו נעולים לעריכה מטעמי שלמות היסטוריית אימונים וקרדיטים.</p>
      </div>
    </div>

    <div class="details-section">
      <div class="detail-row">
        <span class="detail-label">שם השיעור:</span>
        <span class="detail-value">{liveClass.title}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">מועד השידור:</span>
        <span class="detail-value">
          {formatLocalDate(liveClass.startsAt)} בשעה {formatLocalTime(liveClass.startsAt)}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">משך השיעור:</span>
        <span class="detail-value">{durationLabel(Math.round((liveClass.endsAt - liveClass.startsAt) / 60000))}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">סוג שידור:</span>
        <span class="detail-value">{liveClass.type === "one_on_one" ? "אימון אישי 1:1" : "שיעור קבוצתי"}</span>
      </div>
    </div>

    <div class="modal-actions">
      <Button tone="ink" type="button" onclick={onCancel} disabled={submitting}>
        סגור פרטים
      </Button>
    </div>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="edit-form">
    <div class="form-grid">
      <div class="hb-input-field span-2">
        <span class="hb-input-field__label">כותרת</span>
        <input class="hb-input" bind:value={editTitle} required disabled={submitting} maxlength="120" />
      </div>

      <div class="hb-input-field span-2">
        <span class="hb-input-field__label">תיאור</span>
        <textarea class="hb-textarea" bind:value={editDescription} bind:this={descEl} disabled={submitting} maxlength="500"></textarea>
      </div>

      <div class="form-row-split span-2">
        <DatePicker label="תאריך" bind:value={editDateValue} disabled={submitting} />
        <NativeTimePicker label="שעת התחלה" bind:value={editTime} disabled={submitting} />
      </div>

      <div class="form-row-split span-2">
        <div class="hb-input-field">
          <span class="hb-input-field__label">משך (דקות)</span>
          <Slider label="משך" bind:value={editDuration} min={15} max={180} step={5} />
          <span class="duration-badge">{durationLabel(editDuration)}</span>
        </div>

        <div class="hb-input-field">
          <span class="hb-input-field__label">עד</span>
          <div class="end-time-box">{endTimeDisplay}</div>
        </div>
      </div>

      <div class="form-row-split span-2">
        <div class="hb-input-field">
          <span class="hb-input-field__label">פתיחת כניסה (דקות לפני)</span>
          <Slider label="פתיחה" bind:value={editJoinOpens} min={0} max={60} step={5} />
          <span class="duration-badge">{editJoinOpens} דק׳</span>
        </div>

        <div class="hb-input-field">
          <span class="hb-input-field__label">קיבולת</span>
          {#if liveClass.type === "one_on_one"}
            <div class="one-on-one-badge">1 משתתפת (אישי)</div>
          {:else}
            <Slider label="קיבולת" bind:value={editCapacity} min={1} max={50} step={1} />
            <span class="duration-badge">{editCapacity} מקומות</span>
          {/if}
        </div>
      </div>

      <div class="form-field-group span-2">
        <span class="field-group-label">ציוד נדרש</span>
        <EquipmentPicker bind:selected={editEquipment} />
      </div>
    </div>

    <div class="modal-actions">
      {#if liveClass.status === "live"}
        <div class="live-action-buttons">
          <Button tone="ink" type="button" onclick={onEndLive} disabled={submitting}>
            לסיים שידור
          </Button>
          <span class="live-badge-glow">🔴 שידור חי פעיל</span>
        </div>
      {:else}
        <Button tone="ink" type="submit" disabled={submitting}>
          {submitting ? "מעדכן..." : "שמירת שינויים"}
        </Button>
        <Button tone="danger" type="button" onclick={onDelete} disabled={submitting}>
          ביטול שיעור
        </Button>
      {/if}
      <Button tone="paper" type="button" onclick={onCancel} disabled={submitting}>
        ביטול
      </Button>
    </div>
  </form>
{/if}

<style>
  .edit-form,
  .ended-class-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .span-2 {
    grid-column: span 2;
  }

  .form-row-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .duration-badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    margin-block-start: 2px;
    display: block;
    color: var(--sky-strong);
  }

  .end-time-box {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--surface);
    color: var(--muted);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step-0);
    direction: ltr;
  }

  .one-on-one-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: color-mix(in oklch, var(--sky-soft) 40%, transparent);
    color: var(--ink);
    border: 1px solid var(--sky);
    padding: var(--space-2) var(--space-3);
    font-weight: 800;
    font-size: var(--step--1);
    width: fit-content;
    min-height: 44px;
  }

  .form-field-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-block-start: var(--space-2);
  }

  .field-group-label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-2);
    margin-block-start: var(--space-3);
    align-items: center;
    flex-wrap: wrap;
  }

  .live-action-buttons {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .live-badge-glow {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--terra);
    animation: blink 1s infinite alternate;
  }

  @media (prefers-reduced-motion: reduce) {
    .live-badge-glow {
      animation: none;
    }
  }

  /* Ended Class details */
  .read-only-banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--surface);
    border: var(--border);
    padding: var(--space-3);
  }

  .completed-tick {
    font-size: var(--step-3);
    color: var(--muted);
    flex-shrink: 0;
  }

  .banner-text h3 {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 900;
  }

  .banner-text p {
    margin: 4px 0 0;
    font-size: var(--step--2);
    color: var(--muted);
    line-height: 1.3;
  }

  .details-section {
    border: var(--border);
    background: var(--white);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--step--1);
    border-bottom: 1px dashed var(--line-light);
    padding-bottom: var(--space-1);
    gap: var(--space-2);
  }

  .detail-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .detail-label {
    font-weight: 800;
    color: var(--muted);
  }

  .detail-value {
    font-weight: 900;
    color: var(--ink);
    text-align: end;
  }

  @keyframes blink {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }
</style>
