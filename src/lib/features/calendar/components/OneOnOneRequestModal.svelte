<script lang="ts">
  import { Dialog, Button } from "bits-ui";
  import CreditCostHint from "$lib/features/credits/CreditCostHint.svelte";
  import OneOnOneRequestPicker from "./OneOnOneRequestPicker.svelte";
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

  function hasAvailableCredit(w: DayAvailability) {
    return w.availableCredits >= 1;
  }
  function maxCreditReducer(max: number, w: DayAvailability) {
    return Math.max(max, w.availableCredits);
  }
  function calculateOneOnOneBalance(windows: DayAvailability[]) {
    return windows.reduce(maxCreditReducer, 0);
  }

  const hasCredits = $derived(windows.some(hasAvailableCredit));
  const oneOnOneBalance = $derived(calculateOneOnOneBalance(windows));

  function groupWindowsByDay(windows: DayAvailability[]) {
    const days = [...new Set(windows.map((w) => w.dayStart))].sort((a, b) => a - b);
    return days.map((dayStart) => ({
      dayStart,
      windows: windows.filter((w) => w.dayStart === dayStart),
    }));
  }

  const dayGroups = $derived(groupWindowsByDay(windows));



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
        תאריך ושעה בחלון הזמינות · {RULES.ONE_ON_ONE_DURATION_MINUTES} דקות · אישור המדריכה.
      </Dialog.Description>

      {#if !hasCredits}
        <p class="one-on-one-modal__blocked" role="status">
          אין קרדיט 1:1.
        </p>
      {:else if dayGroups.length === 0}
        <p class="one-on-one-modal__blocked" role="status">
          אין חלונות פנויים. נסי מאוחר יותר.
        </p>
      {:else}
        <OneOnOneRequestPicker
          {dayGroups}
          {selectedDay}
          bind:startTimeInput
          bind:note
          {timeError}
          {selectedEndsAt}
          {selectedWindow}
          {windowRangeLabel}
          {minStartMinutes}
          {maxStartMinutes}
          onPickDay={pickDay}
        />
      {/if}

      <div class="one-on-one-modal__footer">
        <Dialog.Close class="hb-button hb-button--ghost hb-button--sm" type="button">
          סגירה
        </Dialog.Close>
        {#if hasCredits && dayGroups.length > 0}
          <div class="one-on-one-modal__submit">
            <CreditCostHint cost={1} balance={oneOnOneBalance} pool="oneOnOne" />
            <Button.Root
              class="hb-button hb-button--primary hb-button--sm"
              type="button"
              disabled={!canSubmit || pending}
              aria-busy={pending}
              onclick={submit}
            >
              {pending ? "שולחת..." : "שליחת בקשה"}
            </Button.Root>
          </div>
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
    color: var(--foreground-muted);
  }

  .one-on-one-modal__blocked {
    margin: 0;
    padding: var(--space-4);
    border: var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    font-weight: 700;
    line-height: 1.45;
  }

  .one-on-one-modal__footer {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    gap: var(--space-2);
    flex-wrap: wrap;
    padding-top: var(--space-2);
    border-top: 1px solid var(--line-light);
  }

  .one-on-one-modal__submit {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
  }
</style>
