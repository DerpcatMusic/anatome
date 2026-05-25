<script lang="ts">
  import { Dialog, Button } from "bits-ui";
  import type { DayAvailability } from "../lib/agenda";
  import {
    formatWallMinutes,
    parseWallTimeInput,
    timestampFromWallMinutes,
    wallMinutesFromTimestamp,
  } from "../lib/one-on-one-time";
  import { RULES } from "$convex/lib/constants";
  import "../styles/cal-time.css";

  const lessonDurationMs = RULES.ONE_ON_ONE_DURATION_MINUTES * 60 * 1000;

  export type OneOnOneRequestPayload = {
    instructorUserId: DayAvailability["instructorUserId"];
    startsAt: number;
    endsAt: number;
  };

  let {
    open = $bindable(false),
    windows,
    initialDay = null,
    pending = false,
    onSubmit,
  }: {
    open?: boolean;
    windows: DayAvailability[];
    initialDay?: number | null;
    pending?: boolean;
    onSubmit: (payload: OneOnOneRequestPayload, note: string) => void | Promise<void>;
  } = $props();

  let selectedDay = $state<number | null>(null);
  let startTimeInput = $state("");
  let note = $state("");
  let timeError = $state("");

  const hasCredits = $derived(windows.some((w) => w.availableCredits >= 1));

  const dayGroups = $derived.by(() => {
    const map = new Map<number, DayAvailability[]>();
    for (const window of windows) {
      const bucket = map.get(window.dayStart);
      if (bucket) bucket.push(window);
      else map.set(window.dayStart, [window]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([dayStart, dayWindows]) => ({ dayStart, windows: dayWindows }));
  });

  const dayFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jerusalem",
  });

  const selectedWindow = $derived(
    selectedDay === null
      ? null
      : (windows.find((w) => w.dayStart === selectedDay) ?? null),
  );

  const minStartMinutes = $derived(
    selectedWindow === null
      ? 0
      : wallMinutesFromTimestamp(selectedWindow.earliestBookableAt, selectedWindow.dayStart),
  );

  const maxStartMinutes = $derived(
    selectedWindow === null
      ? 0
      : wallMinutesFromTimestamp(selectedWindow.latestBookableStartAt, selectedWindow.dayStart),
  );

  const windowRangeLabel = $derived(
    selectedWindow === null
      ? ""
      : `${formatWallMinutes(wallMinutesFromTimestamp(selectedWindow.windowStartsAt, selectedWindow.dayStart))}–${formatWallMinutes(wallMinutesFromTimestamp(selectedWindow.windowEndsAt, selectedWindow.dayStart))}`,
  );

  const selectedStartsAt = $derived.by(() => {
    if (selectedWindow === null) return null;
    const minutes = parseWallTimeInput(startTimeInput);
    if (minutes === null) return null;
    return timestampFromWallMinutes(selectedWindow.dayStart, minutes);
  });

  const selectedEndsAt = $derived(
    selectedStartsAt === null ? null : selectedStartsAt + lessonDurationMs,
  );

  const canSubmit = $derived(
    selectedWindow !== null &&
      selectedStartsAt !== null &&
      selectedEndsAt !== null &&
      selectedStartsAt >= selectedWindow.earliestBookableAt &&
      selectedStartsAt <= selectedWindow.latestBookableStartAt &&
      !timeError,
  );

  function defaultStartInput(window: DayAvailability): string {
    return formatWallMinutes(
      wallMinutesFromTimestamp(window.earliestBookableAt, window.dayStart),
    );
  }

  function validateTimeInput(): void {
    timeError = "";
    if (selectedWindow === null) return;
    const minutes = parseWallTimeInput(startTimeInput);
    if (minutes === null) {
      timeError = "בחרי שעת התחלה תקינה";
      return;
    }
    if (minutes < minStartMinutes || minutes > maxStartMinutes) {
      timeError = `השעה חייבת להיות בין ${formatWallMinutes(minStartMinutes)} ל-${formatWallMinutes(maxStartMinutes)}`;
    }
  }

  function pickDay(dayStart: number) {
    selectedDay = dayStart;
    const window = windows.find((w) => w.dayStart === dayStart);
    startTimeInput = window ? defaultStartInput(window) : "";
    validateTimeInput();
  }

  $effect(() => {
    if (!open) {
      selectedDay = null;
      startTimeInput = "";
      note = "";
      timeError = "";
      return;
    }
    if (dayGroups.length === 0) return;

    const preferredDay =
      initialDay !== null && dayGroups.some((g) => g.dayStart === initialDay)
        ? initialDay
        : dayGroups[0]!.dayStart;

    if (selectedDay === null || !dayGroups.some((g) => g.dayStart === selectedDay)) {
      pickDay(preferredDay);
    }
  });

  $effect(() => {
    if (!open) return;
    startTimeInput;
    selectedWindow;
    validateTimeInput();
  });

  async function submit() {
    if (!selectedWindow || selectedStartsAt === null || selectedEndsAt === null || !canSubmit) return;
    await onSubmit(
      {
        instructorUserId: selectedWindow.instructorUserId,
        startsAt: selectedStartsAt,
        endsAt: selectedEndsAt,
      },
      note.trim(),
    );
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content one-on-one-modal" aria-label="בקשת שיעור 1:1">
      <Dialog.Title class="one-on-one-modal__title">בקשת שיעור 1:1</Dialog.Title>
      <Dialog.Description class="one-on-one-modal__desc">
        בחרי תאריך ושעת התחלה מדויקת בתוך חלון הזמינות. משך השיעור {RULES.ONE_ON_ONE_DURATION_MINUTES} דקות.
        המדריכה מאשרת לפני פתיחת החדר.
      </Dialog.Description>

      {#if !hasCredits}
        <p class="one-on-one-modal__blocked" role="status">
          אין קרדיט 1:1 זמין כרגע. לא ניתן לשלוח בקשה חדשה.
        </p>
      {:else if dayGroups.length === 0}
        <p class="one-on-one-modal__blocked" role="status">
          אין חלונות פנויים בטווח הזה. נסי שוב מאוחר יותר או עברי לתצוגת לוח שבוע.
        </p>
      {:else}
        <div class="one-on-one-modal__picker">
          <fieldset class="one-on-one-modal__dates">
            <legend class="one-on-one-modal__legend">תאריך</legend>
            <div class="one-on-one-modal__date-list">
              {#each dayGroups as group (group.dayStart)}
                <button
                  type="button"
                  class="one-on-one-modal__date"
                  class:one-on-one-modal__date--active={selectedDay === group.dayStart}
                  onclick={() => pickDay(group.dayStart)}
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
      {/if}

      <div class="one-on-one-modal__footer">
        <Dialog.Close class="hb-button hb-button--ghost hb-button--sm" type="button">
          סגירה
        </Dialog.Close>
        {#if hasCredits && dayGroups.length > 0}
          <Button.Root
            class="hb-button hb-button--primary hb-button--sm"
            type="button"
            disabled={!canSubmit || pending}
            aria-busy={pending}
            onclick={submit}
          >
            {pending ? "שולחת..." : "שליחת בקשה"}
          </Button.Root>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.one-on-one-modal) {
    max-width: min(520px, 96vw);
    display: grid;
    gap: var(--space-4);
  }

  :global(.one-on-one-modal__title) {
    margin: 0;
    font-size: var(--step-1);
    font-weight: 800;
  }

  :global(.one-on-one-modal__desc) {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.45;
    color: var(--muted);
  }

  .one-on-one-modal__blocked {
    margin: 0;
    padding: var(--space-4);
    border: var(--border);
    border-inline-start: 3px solid var(--muted);
    background: var(--surface);
    font-weight: 700;
    line-height: 1.45;
  }

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
    color: var(--muted);
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
    background: var(--white);
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
    border-inline-start: 3px solid var(--primary);
    background: color-mix(in oklch, var(--primary) 6%, var(--white));
    border-radius: 4px;
  }

  .one-on-one-modal__window-range {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 700;
  }

  .one-on-one-modal__window-meta {
    margin: var(--space-1) 0 0;
    font-size: var(--step--1);
    color: var(--muted);
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
    color: var(--muted);
    font-weight: 600;
  }

  .one-on-one-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    flex-wrap: wrap;
    padding-top: var(--space-2);
    border-top: 1px solid var(--line-light);
  }
</style>
