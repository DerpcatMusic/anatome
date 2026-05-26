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
  import { formatAppDate, formatAppTime, parseDateTimeLocal } from "$lib/datetime/local";

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
    variant?: "modal" | "popover";
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
    variant = "modal",
    onSubmit,
    onCancel,
    onDelete,
    onEndLive,
    submitting = false,
  }: Props = $props();

  const isPopover = $derived(variant === "popover");
  let showDescription = $state(false);

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
    editStartTime = formatAppTime(liveClass.startsAt);
    editEndTime = formatAppTime(liveClass.endsAt);
    editJoinOpens = liveClass.joinOpensMinutesBefore ?? 15;
    editCapacity = liveClass.capacity;
    editEquipment = [...liveClass.requiredEquipment];
    showDescription = isPopover ? Boolean(liveClass.description?.trim()) : true;
    try {
      editDateValue = parseDate(formatAppDate(liveClass.startsAt));
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
    const startsAt = parseDateTimeLocal(`${editDateValue.toString()}T${editStartTime}`);
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
  <div class="ended-class-details" class:ended-class-details--popover={isPopover}>
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
          {formatAppDate(liveClass.startsAt)} בשעה {formatAppTime(liveClass.startsAt)}
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

    <div class="modal-actions" class:modal-actions--popover={isPopover}>
      <Button.Root class="hb-button hb-button--ink" type="button" onclick={onCancel} disabled={submitting}>
        {isPopover ? "סגירה" : "סגור פרטים"}
      </Button.Root>
    </div>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="edit-form" class:edit-form--popover={isPopover}>
    <div class="form-field">
      {#if isPopover}
        <input
          id="edit-title"
          class="hb-input edit-title-input--popover"
          bind:value={editTitle}
          required
          disabled={submitting}
          maxlength="120"
          placeholder="כותרת השיעור"
          aria-label="כותרת השיעור"
        />
      {:else}
        <label class="field-label" for="edit-title">כותרת השיעור</label>
        <input id="edit-title" class="hb-input" bind:value={editTitle} required disabled={submitting} maxlength="120" />
      {/if}
    </div>

    <div class="form-field">
      {#if !isPopover}
        <span class="field-label">מועד השיעור</span>
      {/if}
      <div class="datetime-row" class:datetime-row--popover={isPopover}>
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
        <div class="duration-badge" class:duration-badge--popover={isPopover}>{durationLabelText}</div>
      </div>
    </div>

    <div class="form-field form-field--type-row">
      <span class="type-badge" class:type-badge--group={liveClass.type === "group_live"} class:type-badge--one-on-one={liveClass.type === "one_on_one"}>
        {liveClass.type === "one_on_one" ? "1:1" : "קבוצתי"}
      </span>
    </div>

    <div class="form-field">
      {#if !isPopover}
        <span class="field-label">ציוד נדרש</span>
      {/if}
      <EquipmentPicker compact bind:selected={editEquipment} disabled={submitting} />
    </div>

    {#if liveClass.type === "group_live"}
      <label class="capacity-row" class:capacity-row--popover={isPopover} for="edit-capacity">
        <span class="capacity-row__label">קיבולת</span>
        <input
          id="edit-capacity"
          type="number"
          class="hb-input capacity-input--popover"
          bind:value={editCapacity}
          min="1"
          max="50"
          step="1"
          disabled={submitting}
        />
      </label>
    {/if}

    {#if !isPopover}
      <div class="settings-row">
        <label class="settings-field">
          <span class="settings-label">פתיחה (דק׳ לפני)</span>
          <input type="number" class="hb-input" bind:value={editJoinOpens} min="0" max="60" step="5" disabled={submitting} />
        </label>
      </div>
    {/if}

    <div class="form-field">
      {#if isPopover && !showDescription}
        <Button.Root
          class="hb-button hb-button--ghost edit-desc-toggle"
          type="button"
          disabled={submitting}
          onclick={() => (showDescription = true)}
        >
          <span class="material-symbols-rounded" aria-hidden="true">add</span>
          תיאור (אופציונלי)
        </Button.Root>
      {:else if !isPopover || showDescription}
        <label class="field-label" for="edit-desc">
          תיאור <span class="field-optional">(אופציונלי)</span>
        </label>
        <textarea
          id="edit-desc"
          class="hb-textarea"
          class:edit-desc--popover={isPopover}
          bind:value={editDescription}
          bind:this={descEl}
          disabled={submitting}
          maxlength="500"
          rows="2"
          placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים..."
        ></textarea>
      {/if}
    </div>

    <div class="modal-actions" class:modal-actions--popover={isPopover}>
      {#if liveClass.status === "live"}
        <Button.Root class="hb-button hb-button--ink" type="button" onclick={onEndLive} disabled={submitting}>
          לסיים שידור
        </Button.Root>
        {#if !isPopover}
          <span class="live-badge"><span class="live-dot"></span>שידור חי פעיל</span>
        {/if}
      {:else}
        <Button.Root class="hb-button hb-button--ink" type="submit" disabled={submitting}>
          {submitting ? "מעדכן..." : isPopover ? "שמירה" : "שמירת שינויים"}
        </Button.Root>
        <Button.Root class="hb-button hb-button--danger" type="button" onclick={onDelete} disabled={submitting}>
          ביטול שיעור
        </Button.Root>
      {/if}
      <Button.Root class="hb-button hb-button--ghost" type="button" onclick={onCancel} disabled={submitting}>
        {isPopover ? "סגירה" : "סגור"}
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

  .edit-form--popover,
  .ended-class-details--popover {
    gap: var(--space-2);
    min-height: 0;
  }

  .edit-title-input--popover {
    min-height: 36px;
    font-weight: 800;
    font-size: var(--step--1);
  }

  .datetime-row--popover {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    grid-template-columns: unset;
  }

  .datetime-row--popover .date-field {
    flex: 0 0 auto;
  }

  .datetime-row--popover .time-field {
    flex: 0 0 auto;
  }

  .duration-badge--popover {
    min-height: 32px;
    padding: 0 var(--space-2);
    font-size: var(--step--2);
  }

  .form-field--type-row {
    margin-block: calc(-1 * var(--space-1));
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 var(--space-2);
    border-radius: 4px;
    font-size: var(--step--2);
    font-weight: 800;
    border: 1px solid var(--line-light);
    background: var(--surface);
  }

  .type-badge--group {
    border-color: color-mix(in oklch, var(--accent) 55%, var(--line-light));
    color: var(--accent);
    background: color-mix(in oklch, var(--accent) 10%, var(--elevated));
  }

  .type-badge--one-on-one {
    border-color: var(--primary);
    color: var(--primary);
  }

  .capacity-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .capacity-row__label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .capacity-input--popover {
    width: 4rem;
    min-height: 32px;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step--2);
  }

  :global(.edit-desc-toggle) {
    justify-content: flex-start;
    padding-inline: 0;
    min-height: 32px;
  }

  .edit-desc--popover {
    min-height: 3.5rem;
    resize: vertical;
  }

  .modal-actions--popover {
    padding-top: var(--space-2);
    margin-top: var(--space-1);
    border-top: 1px solid var(--line-light);
    position: static;
    background: inherit;
    justify-content: flex-end;
  }

  .ended-class-details--popover .read-only-banner {
    padding: var(--space-2);
  }

  .ended-class-details--popover .details-section {
    padding: var(--space-2);
    gap: var(--space-1);
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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }

  .modal-actions {
    display: flex;
    gap: var(--space-2);
    padding-top: var(--space-3);
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .live-badge {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .live-dot {
    width: 8px;
    height: 8px;
    background: var(--primary);
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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
    line-height: 1.3;
  }

  .details-section {
    border: var(--border);
    background: var(--elevated);
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
    color: var(--foreground-muted);
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
