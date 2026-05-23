<script lang="ts">
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import MonthCalendar from "$components/ui/MonthCalendar.svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import DayStrip from "./DayStrip.svelte";
  import ClassCard from "./ClassCard.svelte";
  import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";

  type CalendarClass = FunctionReturnType<typeof api.live.calendar.listRange>[number];

  const dayMs = 24 * 60 * 60 * 1000;
  const rangeStart = startOfToday();

  let selectedDay = $state(rangeStart);
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  const auth = initAuth();
  const client = useConvexClient();

  const query = useQuery(api.live.calendar.listRange, () => auth.isAuthenticated ? {
    from: rangeStart,
    to: rangeStart + 14 * dayMs,
  } : "skip");

  const classes = $derived(query.data ?? []);

  const days = $derived(
    Array.from({ length: 14 }, (_, index) => {
      const date = rangeStart + index * dayMs;
      return { date, label: "" };
    }),
  );

  const visibleClasses = $derived(
    classes.filter((item: CalendarClass) => {
      const startsAt = item.liveClass.startsAt;
      return startsAt >= selectedDay && startsAt < selectedDay + dayMs;
    }),
  );

  // Event dots for the month calendar
  const calendarEvents = $derived.by(() => {
    const dayTones = new Map<number, "sky" | "terra" | "success" | "muted">();

    for (const item of classes) {
      const dayStart = Math.floor(item.liveClass.startsAt / dayMs) * dayMs;
      const existing = dayTones.get(dayStart);
      let tone: "sky" | "terra" | "success" | "muted" = "sky";

      if (item.liveClass.status === "live") {
        tone = "terra";
      } else if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
        tone = "success";
      } else if (item.seatsRemaining <= 0) {
        tone = "muted";
      }

      // Priority: terra > success > sky > muted
      const priority = { terra: 4, success: 3, sky: 2, muted: 1 };
      if (!existing || priority[tone] > priority[existing]) {
        dayTones.set(dayStart, tone);
      }
    }

    const events: { date: DateValue; tone: "sky" | "terra" | "success" | "muted" }[] = [];
    for (const [dayStart, tone] of dayTones) {
      const d = new Date(dayStart);
      events.push({
        date: new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
        tone,
      });
    }
    return events;
  });

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  function timestampToDateValue(ts: number): DateValue {
    const d = new Date(ts);
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  function dateValueToTimestamp(dv: DateValue): number {
    return dv.toDate(getLocalTimeZone()).getTime();
  }

  let calendarValue = $derived(timestampToDateValue(selectedDay));

  function onCalendarSelect(dv: DateValue | undefined) {
    if (!dv) return;
    selectedDay = dateValueToTimestamp(dv);
  }

  const { t } = useI18n();

  async function reserve(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.live.reservation.reserve, { liveClassId });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : t.calendar.error.reserve();
    } finally {
      actionId = null;
    }
  }

  async function cancel(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.live.reservation.cancel, { liveClassId });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : t.calendar.error.cancel();
    } finally {
      actionId = null;
    }
  }

  const errorMessage = $derived((query.error?.message ?? actionError) || null);
</script>

<PageShell
  kicker={t.calendar.kicker()}
  title={t.calendar.title()}
  loading={query.isLoading}
  error={errorMessage}
>
  {#snippet headerExtra()}
    <Button.Root
      class="hb-button hb-button--paper hb-button--sm"
      type="button"
      onclick={() => { selectedDay = rangeStart; }}
    >
      {t.calendar.today()}
    </Button.Root>
  {/snippet}

  <div class="calendar-layout">
    <div class="calendar-month">
      <MonthCalendar value={calendarValue} onchange={onCalendarSelect} events={calendarEvents} />
    </div>

    <DayStrip {days} {selectedDay} onSelect={(date) => { selectedDay = date; }} />

    <div class="agenda" aria-live="polite">
      {#if visibleClasses.length === 0}
        <div class="empty-state">
          <p class="empty-state__kicker">{t.calendar.empty.kicker()}</p>
          <p>{t.calendar.empty.text()}</p>
        </div>
      {:else}
        {#each visibleClasses as item}
          <ClassCard {item} {actionId} onReserve={reserve} onCancel={cancel} />
        {/each}
      {/if}
    </div>
  </div>
</PageShell>

<style>
  .calendar-layout {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .calendar-month {
    max-width: 340px;
    background: var(--white);
    border: var(--border);
    padding: var(--space-3);
  }

  .agenda {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--white);
    border: var(--border);
  }

  .empty-state {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-6);
    text-align: center;
  }

  .empty-state__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    font-weight: 700;
    margin: 0;
  }

  .empty-state p {
    color: var(--muted);
    margin: 0;
  }
</style>
