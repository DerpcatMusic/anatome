<script lang="ts">
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import { parseDate } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";
  import { formatAppDate, formatAppTime, parseDateTimeLocal } from "$lib/datetime/local";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import EditLiveClassDateTime from "./EditLiveClassDateTime.svelte";
  import EditLiveClassDescription from "./EditLiveClassDescription.svelte";
  import EditLiveClassActions from "./EditLiveClassActions.svelte";

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
    isPopover: boolean;
    submitting?: boolean;
    onSubmit: (data: {
      title: string;
      description: string;
      startsAt: number;
      durationMinutes: number;
      joinOpensMinutesBefore: number;
      capacity: number;
      requiredEquipment: Equipment[];
    }) => void;
    onDelete: () => void;
    onCancel: () => void;
    onEndLive?: () => void;
  }

  let {
    liveClass,
    isPopover,
    submitting = false,
    onSubmit,
    onDelete,
    onCancel,
    onEndLive,
  }: Props = $props();

  let editTitle = $state("");
  let editDescription = $state("");
  let editStartTime = $state("07:00");
  let editEndTime = $state("08:00");
  let editJoinOpens = $state(10);
  let editCapacity = $state(12);
  let editEquipment = $state<Equipment[]>([]);
  let editDateValue = $state<DateValue | undefined>(undefined);
  let showDescription = $state(false);

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

  function showDescriptionField() {
    showDescription = true;
  }
</script>

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

  <EditLiveClassDateTime
    {isPopover}
    bind:editDateValue
    bind:editStartTime
    bind:editEndTime
    {submitting}
  />

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
    <label class="capacity-row" for="edit-capacity">
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

  <EditLiveClassDescription
    {isPopover}
    {showDescription}
    bind:editDescription
    {submitting}
    onShowDescription={showDescriptionField}
  />

  <EditLiveClassActions
    {isPopover}
    status={liveClass.status}
    {submitting}
    {onEndLive}
    {onDelete}
    {onCancel}
  />
</form>

<style>
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .edit-form--popover {
    gap: var(--space-2);
    min-height: 0;
  }

  .edit-title-input--popover {
    min-height: 36px;
    font-weight: 800;
    font-size: var(--step--1);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .form-field--type-row {
    margin-block: calc(-1 * var(--space-1));
  }
  .field-label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
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

  @media (max-width: 520px) {
    .settings-row {
      grid-template-columns: 1fr;
    }
  }
</style>
