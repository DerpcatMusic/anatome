<script lang="ts">
  import { Button, ToggleGroup } from "bits-ui";
  import DatePicker from "$components/ui/DatePicker.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import type { Equipment } from "$lib/labels";
  import { TextareaAutosize } from "runed";
  import type { DateValue } from "@internationalized/date";

  interface Props {
    title?: string;
    description?: string;
    liveType?: "group_live" | "one_on_one";
    dateValue?: DateValue | undefined;
    startTime?: string;
    endTime?: string;
    formattedDate: string;
    durationLabel: string;
    capacity?: number;
    joinOpensMinutesBefore?: number;
    requiredEquipment?: Equipment[];
    pending: boolean;
    showDescription: boolean;
    onShowDescription: () => void;
    onTypeChange: (v: string) => void;
  }

  let {
    title = $bindable(""),
    description = $bindable(""),
    liveType = $bindable("group_live"),
    dateValue = $bindable(undefined),
    startTime = $bindable("07:00"),
    endTime = $bindable("08:00"),
    formattedDate,
    durationLabel,
    capacity = $bindable(12),
    joinOpensMinutesBefore = $bindable(10),
    requiredEquipment = $bindable<Equipment[]>([]),
    pending,
    showDescription,
    onShowDescription,
    onTypeChange,
  }: Props = $props();

  let descEl: HTMLTextAreaElement | null = null;
  const descAutosize = new TextareaAutosize({
    element: () => descEl ?? undefined,
    input: () => description,
  });
</script>

<div class="form-field">
  <label class="field-label" for="composer-title-full">כותרת השיעור</label>
  <input
    id="composer-title-full"
    class="hb-input"
    bind:value={title}
    required
    maxlength="120"
    placeholder="למשל: פילאטיס מזרן דינמי"
    disabled={pending}
  />
</div>

<div class="form-field">
  <span class="field-label" id="composer-type-label">סוג שיעור</span>
  <ToggleGroup.Root
    type="single"
    value={liveType}
    onValueChange={onTypeChange}
    class="live-type-toggle"
    aria-labelledby="composer-type-label"
  >
    <ToggleGroup.Item value="group_live" class="live-type-toggle__item" disabled={pending}>
      <span class="material-symbols-rounded" aria-hidden="true">groups</span>
      <span>קבוצתי</span>
    </ToggleGroup.Item>
    <ToggleGroup.Item value="one_on_one" class="live-type-toggle__item" disabled={pending}>
      <span class="material-symbols-rounded" aria-hidden="true">person</span>
      <span>1:1</span>
    </ToggleGroup.Item>
  </ToggleGroup.Root>
</div>

<div class="form-field">
  <span class="field-label">מועד</span>
  <div class="datetime-row">
    <div class="date-field">
      <DatePicker label="" bind:value={dateValue} disabled={pending} />
      <span class="date-display">{formattedDate}</span>
    </div>
    <label class="time-field">
      <span class="time-label">התחלה</span>
      <input type="time" class="hb-input" bind:value={startTime} step="60" disabled={pending} />
    </label>
    <label class="time-field">
      <span class="time-label">סיום</span>
      <input type="time" class="hb-input" bind:value={endTime} step="60" disabled={pending} />
    </label>
    <div class="duration-badge">{durationLabel}</div>
  </div>
</div>

<div class="form-field">
  <span class="field-label">ציוד נדרש</span>
  <EquipmentPicker bind:selected={requiredEquipment} disabled={pending} />
</div>

{#if liveType === "group_live"}
  <div class="form-field form-field--narrow">
    <label class="field-label" for="composer-capacity-full">קיבולת</label>
    <input
      id="composer-capacity-full"
      type="number"
      class="hb-input"
      bind:value={capacity}
      min="1"
      max="50"
      step="1"
      disabled={pending}
    />
  </div>
{:else}
  <p class="capacity-locked" aria-live="polite">שיעור 1:1 — משתתפת אחת</p>
{/if}

<div class="settings-row">
  <label class="settings-field">
    <span class="settings-label">פתיחה (דק׳ לפני)</span>
    <input
      type="number"
      class="hb-input"
      bind:value={joinOpensMinutesBefore}
      min="0"
      max="60"
      step="5"
      disabled={pending}
    />
  </label>
</div>

<div class="form-field">
  {#if !showDescription}
    <Button.Root
      class="hb-button hb-button--ghost composer-desc-toggle"
      type="button"
      disabled={pending}
      onclick={onShowDescription}
    >
      <span class="material-symbols-rounded" aria-hidden="true">add</span>
      תיאור (אופציונלי)
    </Button.Root>
  {:else}
    <label class="field-label" for="composer-desc">
      תיאור <span class="field-optional">(אופציונלי)</span>
    </label>
    <textarea
      id="composer-desc"
      class="hb-textarea composer-desc"
      bind:value={description}
      bind:this={descEl}
      maxlength="500"
      rows="2"
      placeholder="קצב, מיקוד, דגשים…"
      disabled={pending}
    ></textarea>
  {/if}
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .form-field--narrow {
    max-width: 8rem;
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

  .capacity-locked {
    margin: 0;
    padding: var(--space-2) var(--space-3);
    background: var(--surface);
    border: 1px solid var(--primary);
    border-radius: 4px;
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--ink);
  }

  .composer-desc {
    min-height: 4rem;
    resize: vertical;
  }

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
