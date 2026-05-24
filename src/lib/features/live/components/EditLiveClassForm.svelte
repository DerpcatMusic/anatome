<script lang="ts">
  import { Button } from "bits-ui";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import DatePicker from "$components/ui/DatePicker.svelte";
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
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  const shortDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jerusalem",
  });

  // Form state
  let editTitle = $state("");
  let editDescription = $state("");
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({ element: () => descEl ?? undefined, input: () => editDescription });

  let editStartTime = $state("07:00");
  let editEndTime = $state("08:00");
  let editJoinOpens = $state(10);
  let editCapacity = $state(12);
  let editEquipment = $state<Equipment[]>([]);
  let editDateValue = $state<DateValue | undefined>(undefined);

  let previousClassId: Id<"liveClasses"> | undefined = undefined;
  $effect(() => {
    const classId = liveClass._id;
    if (classId === previousClassId) return;
    previousClassId = classId;
    editTitle = liveClass.title;
    editDescription = liveClass.description || "";
    editStartTime = formatLocalTime(liveClass.startsAt);
    editEndTime = formatLocalTime(liveClass.endsAt);
    editJoinOpens = liveClass.joinOpensMinutesBefore ?? 10;
    editCapacity = liveClass.capacity;
    editEquipment = [...liveClass.requiredEquipment];
    try {
      editDateValue = parseDate(formatLocalDate(liveClass.startsAt));
    } catch {
      editDateValue = undefined;
    }
  });

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function computeDuration(): number {
    const diff = timeToMinutes(editEndTime) - timeToMinutes(editStartTime);
    return diff > 0 ? diff : diff + 24 * 60;
  }

  const formattedDate = $derived(editDateValue ? shortDateFormatter.format(new Date(editDateValue.toString())) : "");
  const computedDuration = $derived(computeDuration());
  const durationLabelText = $derived(`${computedDuration} דק׳`);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!editDateValue) return;
    const startsAt = new Date(`${editDateValue.toString()}T${editStartTime}`).getTime();
    onSubmit({
      title: editTitle.trim(),
      description: editDescription.trim(),
      startsAt,
      durationMinutes: computeDuration(),
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
      <Button.Root class="hb-button hb-button--ink" type="button" onclick={onCancel} disabled={submitting}>
        סגור פרטים
      </Button.Root>
    </div>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="edit-form">
    <!-- Title -->
    <div class="form-field">
      <label class="field-label" for="edit-title">כותרת השיעור</label>
      <input id="edit-title" class="hb-input" bind:value={editTitle} required disabled={submitting} maxlength="120" />
    </div>

    <!-- Equipment -->
    <div class="form-field">
      <span class="field-label">ציוד נדרש</span>
      <EquipmentPicker compact bind:selected={editEquipment} />
    </div>

    <!-- Date + Time row -->
    <div class="form-field">
      <span class="field-label">מועד השיעור</span>
      <div class="datetime-row">
        <div class="date-field">
          <DatePicker label="" bind:value={editDateValue} disabled={submitting} />
          <span class="date-display">{formattedDate}</span>
        </div>
        <label class="time-field">
          <span class="time-label">התחלה</span>
          <input type="time" class="hb-input" bind:value={editStartTime} step="60" disabled={submitting} />
        </label>
        <label class="time-field">
          <span class="time-label">סיום</span>
          <input type="time" class="hb-input" bind:value={editEndTime} step="60" disabled={submitting} />
        </label>
        <div class="duration-badge">{durationLabelText}</div>
      </div>
    </div>

    <!-- Settings row -->
    <div class="settings-row">
      <label class="settings-field">
        <span class="settings-label">פתיחה (דק׳ לפני)</span>
        <input type="number" class="hb-input" bind:value={editJoinOpens} min="0" max="60" step="5" disabled={submitting} />
      </label>
      {#if liveClass.type === "group_live"}
        <label class="settings-field">
          <span class="settings-label">קיבולת</span>
          <input type="number" class="hb-input" bind:value={editCapacity} min="1" max="50" step="1" disabled={submitting} />
        </label>
      {:else}
        <div class="settings-field">
          <span class="settings-label">קיבולת</span>
          <div class="one-on-one-badge">1 משתתפת (אישי)</div>
        </div>
      {/if}
    </div>

    <!-- Description -->
    <div class="form-field">
      <label class="field-label" for="edit-desc">תיאור <span class="field-optional">(אופציונלי)</span></label>
      <textarea id="edit-desc" class="hb-textarea" bind:value={editDescription} bind:this={descEl} disabled={submitting} maxlength="500" rows="2" placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים..."></textarea>
    </div>

    <!-- Actions -->
    <div class="modal-actions">
      {#if liveClass.status === "live"}
        <Button.Root class="hb-button hb-button--ink" type="button" onclick={onEndLive} disabled={submitting}>
          לסיים שידור
        </Button.Root>
        <span class="live-badge"><span class="live-dot"></span>שידור חי פעיל</span>
      {:else}
        <Button.Root class="hb-button hb-button--ink" type="submit" disabled={submitting}>
          {submitting ? "מעדכן..." : "שמירת שינויים"}
        </Button.Root>
        <Button.Root class="hb-button hb-button--danger" type="button" onclick={onDelete} disabled={submitting}>
          ביטול שיעור
        </Button.Root>
      {/if}
      <Button.Root class="hb-button hb-button--paper" type="button" onclick={onCancel} disabled={submitting}>
        ביטול
      </Button.Root>
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

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .field-optional {
    font-weight: 600;
    color: var(--muted);
  }

  /* Date + time row */
  .datetime-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr auto;
    gap: var(--space-2);
    align-items: end;
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    position: relative;
  }

  .date-field :global(.hb-date-picker) {
    gap: 0;
  }

  .date-field :global(.hb-date-picker__label) {
    display: none;
  }

  .date-display {
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
    padding-inline: var(--space-1);
  }

  .time-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .time-label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }

  .duration-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 var(--space-3);
    background: var(--surface);
    border: var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--muted);
    white-space: nowrap;
  }

  /* Settings row */
  .settings-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .settings-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .settings-label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
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
    border-radius: 4px;
  }

  /* Actions */
  .modal-actions {
    display: flex;
    gap: var(--space-2);
    padding-top: var(--space-2);
    border-top: var(--border);
    align-items: center;
    flex-wrap: wrap;
  }

  .live-badge {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--terra);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .live-dot {
    width: 8px;
    height: 8px;
    background: var(--terra-strong);
    border-radius: 50%;
    display: inline-block;
  }

  /* Ended class */
  .read-only-banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--surface);
    border: var(--border);
    padding: var(--space-3);
    border-radius: 4px;
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
    border-radius: 4px;
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

  @media (max-width: 520px) {
    .datetime-row {
      grid-template-columns: 1fr 1fr;
    }

    .date-field {
      grid-column: 1 / -1;
    }

    .duration-badge {
      grid-column: 1 / -1;
    }

    .settings-row {
      grid-template-columns: 1fr;
    }
  }
</style>
