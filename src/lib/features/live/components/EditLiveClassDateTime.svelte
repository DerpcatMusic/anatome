<script lang="ts">
  import DatePicker from "$components/ui/DatePicker.svelte";
  import type { DateValue } from "@internationalized/date";

  interface Props {
    isPopover: boolean;
    editDateValue?: DateValue | undefined;
    editStartTime?: string;
    editEndTime?: string;
    submitting: boolean;
  }

  let {
    isPopover,
    editDateValue = $bindable(undefined),
    editStartTime = $bindable("07:00"),
    editEndTime = $bindable("08:00"),
    submitting,
  }: Props = $props();

  const shortDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jerusalem",
  });

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function computeDuration(): number {
    const diff = timeToMinutes(editEndTime) - timeToMinutes(editStartTime);
    return diff > 0 ? diff : diff + 24 * 60;
  }

  const formattedDate = $derived(
    editDateValue ? shortDateFormatter.format(new Date(editDateValue.toString())) : "",
  );
  const computedDuration = $derived(computeDuration());
  const durationLabelText = $derived(`${computedDuration} דק׳`);
</script>

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

<style>
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

  .datetime-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr auto;
    gap: var(--space-2);
    align-items: end;
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

  .duration-badge--popover {
    min-height: 32px;
    padding: 0 var(--space-2);
    font-size: var(--step--2);
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
  }
</style>
