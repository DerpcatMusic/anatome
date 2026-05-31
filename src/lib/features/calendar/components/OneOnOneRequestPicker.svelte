<script lang="ts">
  import {
    formatWallMinutes,
    wallMinutesFromTimestamp,
  } from "../lib/one-on-one-time";
  import type { DayAvailability } from "../lib/agenda";

  interface Props {
    dayGroups: { dayStart: number; windows: DayAvailability[] }[];
    selectedDay: number | null;
    startTimeInput?: string;
    note?: string;
    timeError: string;
    selectedEndsAt: number | null;
    selectedWindow: DayAvailability | null;
    windowRangeLabel: string;
    minStartMinutes: number;
    maxStartMinutes: number;
    onPickDay: (dayStart: number) => void;
  }

  let {
    dayGroups,
    selectedDay,
    startTimeInput = $bindable(""),
    note = $bindable(""),
    timeError,
    selectedEndsAt,
    selectedWindow,
    windowRangeLabel,
    minStartMinutes,
    maxStartMinutes,
    onPickDay,
  }: Props = $props();

  const dayFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jerusalem",
  });

  const makePickDayHandler = (dayStart: number) => () => onPickDay(dayStart);
</script>

<div class="one-on-one-modal__picker">
  <fieldset class="one-on-one-modal__dates">
    <legend class="one-on-one-modal__legend">תאריך</legend>
    <div class="one-on-one-modal__date-list">
      {#each dayGroups as group (group.dayStart)}
        <button
          type="button"
          class="one-on-one-modal__date"
          class:one-on-one-modal__date--active={selectedDay === group.dayStart}
          onclick={makePickDayHandler(group.dayStart)}
        >
          {dayFormatter.format(new Date(group.dayStart))}
        </button>
      {/each}
    </div>
  </fieldset>

  {#if selectedWindow}
    <div class="one-on-one-modal__window">
      <p class="one-on-one-modal__window-range cal-time">
        זמינות: <strong>{windowRangeLabel}</strong>
      </p>
      <p class="one-on-one-modal__window-meta">{selectedWindow.instructorDisplayName}</p>
    </div>

    <label class="hb-field hb-field--compact" for="one-on-one-start-time">
      <span class="hb-field__label">שעת התחלה</span>
      <input
        id="one-on-one-start-time"
        class="hb-input one-on-one-modal__time-input cal-time"
        type="time"
        bind:value={startTimeInput}
        min={formatWallMinutes(minStartMinutes)}
        max={formatWallMinutes(maxStartMinutes)}
        step="60"
      />
      {#if timeError}
        <span class="one-on-one-modal__time-error" role="alert">{timeError}</span>
      {:else if selectedEndsAt !== null}
        <span class="one-on-one-modal__time-hint cal-time">
          סיום משוער: {formatWallMinutes(
            wallMinutesFromTimestamp(selectedEndsAt, selectedWindow.dayStart),
          )}
        </span>
      {/if}
    </label>
  {/if}
</div>

<label class="hb-field hb-field--compact" for="one-on-one-modal-note">
  <span class="hb-field__label">הערה למדריכה (אופציונלי)</span>
  <textarea
    id="one-on-one-modal-note"
    class="hb-textarea"
    bind:value={note}
    maxlength="500"
    rows="3"
    placeholder="מטרות, מגבלות, ציוד"
  ></textarea>
</label>

<style>
  .one-on-one-modal__picker {
    display: grid;
    gap: var(--space-4);
  }

  .one-on-one-modal__dates {
    margin: 0;
    padding: 0;
    border: none;
    min-width: 0;
  }

  .one-on-one-modal__legend {
    font-size: var(--step--2);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--foreground-muted);
    margin-bottom: var(--space-2);
    padding: 0;
  }

  .one-on-one-modal__date-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .one-on-one-modal__date {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: var(--border);
    background: var(--elevated);
    font: inherit;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
    border-radius: 4px;
  }

  .one-on-one-modal__date--active {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--paper);
  }

  .one-on-one-modal__window {
    padding: var(--space-3) var(--space-4);
    border: var(--border);
    background: var(--accent-soft);
    border-radius: var(--radius-md);
  }

  .one-on-one-modal__window-range {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 700;
  }

  .one-on-one-modal__window-meta {
    margin: var(--space-1) 0 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
    font-weight: 600;
  }

  .one-on-one-modal__time-input {
    width: 100%;
    max-width: 12rem;
    font-size: var(--step-1);
    font-weight: 800;
  }

  .one-on-one-modal__time-error {
    display: block;
    margin-top: var(--space-1);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--danger);
  }

  .one-on-one-modal__time-hint {
    display: block;
    margin-top: var(--space-1);
    font-size: var(--step--1);
    color: var(--foreground-muted);
    font-weight: 600;
  }
</style>
