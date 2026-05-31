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
    titleInput?: HTMLInputElement | null;
    lockedType: "group_live" | "one_on_one";
    showTypeToggle: boolean;
    isEdit: boolean;
    liveType?: "group_live" | "one_on_one";
    onShowDescription: () => void;
    onTypeChange: (v: string) => void;
    onWhenChange: () => void;
  }

  let {
    title = $bindable(""),
    description = $bindable(""),
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
    titleInput = $bindable(null),
    lockedType,
    showTypeToggle,
    isEdit,
    liveType = $bindable("group_live"),
    onShowDescription,
    onTypeChange,
    onWhenChange,
  }: Props = $props();

  let descEl: HTMLTextAreaElement | null = null;
  const descAutosize = new TextareaAutosize({
    element: () => descEl ?? undefined,
    input: () => description,
  });
</script>

<input
  id="composer-title"
  class="hb-input live-composer__title-input"
  bind:value={title}
  bind:this={titleInput}
  required
  maxlength="120"
  placeholder="שם השיעור לייב"
  disabled={pending}
  aria-label="כותרת השיעור"
/>

<div class="quick-when-row" aria-label="מועד השיעור">
  <div class="quick-date-chip">
    <DatePicker label="" bind:value={dateValue} disabled={pending} />
    <span class="quick-date-chip__label">{formattedDate}</span>
  </div>
  <div class="quick-time-range">
    <input
      type="time"
      class="hb-input quick-time-input"
      bind:value={startTime}
      step="60"
      disabled={pending}
      aria-label="שעת התחלה"
      onchange={onWhenChange}
    />
    <span class="quick-time-sep" aria-hidden="true">–</span>
    <input
      type="time"
      class="hb-input quick-time-input"
      bind:value={endTime}
      step="60"
      disabled={pending}
      aria-label="שעת סיום"
      onchange={onWhenChange}
    />
  </div>
  <span class="quick-duration-hint" aria-label="משך השיעור">{durationLabel}</span>
</div>

{#if showTypeToggle}
  <ToggleGroup.Root
    type="single"
    value={liveType}
    onValueChange={onTypeChange}
    class="live-type-toggle live-type-toggle--quick"
    aria-label="סוג שיעור"
  >
    <ToggleGroup.Item value="group_live" class="live-type-toggle__item" disabled={pending}>
      קבוצתי
    </ToggleGroup.Item>
    <ToggleGroup.Item value="one_on_one" class="live-type-toggle__item" disabled={pending}>
      1:1
    </ToggleGroup.Item>
  </ToggleGroup.Root>
{:else if isEdit}
  <span
    class="quick-type-badge"
    class:quick-type-badge--group={lockedType === "group_live"}
    class:quick-type-badge--one-on-one={lockedType === "one_on_one"}
  >
    {lockedType === "one_on_one" ? "1:1" : "קבוצתי"}
  </span>
{/if}

<div class="live-composer__equipment">
  <EquipmentPicker compact bind:selected={requiredEquipment} disabled={pending} />
</div>

{#if lockedType === "group_live"}
  <label class="quick-capacity-row" for="composer-capacity">
    <span class="quick-capacity-row__label">קיבולת</span>
    <input
      id="composer-capacity"
      type="number"
      class="hb-input quick-capacity-input"
      bind:value={capacity}
      min="1"
      max="50"
      step="1"
      disabled={pending}
    />
  </label>
{/if}

{#if !showDescription}
  <Button.Root
    class="hb-button hb-button--ghost composer-desc-toggle"
    type="button"
    disabled={pending}
    onclick={onShowDescription}
  >
    + תיאור לתלמידות
  </Button.Root>
{:else}
  <textarea
    id="composer-desc-quick"
    class="hb-textarea composer-desc composer-desc--quick"
    bind:value={description}
    bind:this={descEl}
    maxlength="500"
    rows="2"
    placeholder="קצב, מיקוד, ציוד…"
    disabled={pending}
    aria-label="תיאור לתלמידות"
  ></textarea>
{/if}

<style>
  .quick-type-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: end;
    min-height: 28px;
    padding: 0 var(--space-3);
    border-radius: 999px;
    font-size: var(--step--2);
    font-weight: 800;
    border: 1px solid var(--line-light);
    background: var(--surface);
  }

  .quick-type-badge--group {
    border-color: color-mix(in oklch, var(--accent) 55%, var(--line-light));
    color: var(--accent);
    background: color-mix(in oklch, var(--accent) 14%, var(--paper));
  }

  .quick-type-badge--one-on-one {
    border-color: color-mix(in oklch, var(--primary) 55%, var(--line-light));
    color: var(--primary);
    background: color-mix(in oklch, var(--primary) 12%, var(--paper));
  }

  .composer-desc--quick {
    min-height: 3.5rem;
    resize: vertical;
  }

  .quick-when-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, auto) minmax(3.25rem, auto);
    align-items: center;
    gap: var(--space-2);
    width: 100%;
  }

  .quick-time-range {
    display: grid;
    grid-template-columns: minmax(4.25rem, 1fr) auto minmax(4.25rem, 1fr);
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
  }

  .quick-date-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-height: 32px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    position: relative;
  }

  .quick-date-chip :global(.hb-date-picker) {
    gap: 0;
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  .quick-date-chip :global(.hb-date-picker__label) {
    display: none;
  }

  .quick-date-chip :global(.hb-date-picker button) {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .quick-date-chip__label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--ink);
    white-space: nowrap;
    pointer-events: none;
  }

  .quick-time-input {
    width: 5.5rem;
    min-height: 32px;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
  }

  .quick-time-sep {
    color: var(--foreground-muted);
    font-weight: 700;
    font-size: var(--step--2);
  }

  .quick-duration-hint {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--foreground-muted);
    white-space: nowrap;
    background: transparent;
    border: none;
    justify-self: end;
  }

  .quick-capacity-row {
    display: grid;
    grid-template-columns: auto minmax(4rem, 5rem);
    align-items: center;
    justify-content: end;
    justify-items: end;
    gap: var(--space-2);
    width: 100%;
  }

  .quick-capacity-row__label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .quick-capacity-input {
    width: 4rem;
    min-height: 32px;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step--2);
  }

  :global(.live-type-toggle--quick) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    width: 100%;
  }

  :global(.live-type-toggle--quick .live-type-toggle__item) {
    min-height: 36px;
    padding: var(--space-1) var(--space-3);
    font-size: var(--step--1);
    width: 100%;
  }
</style>
