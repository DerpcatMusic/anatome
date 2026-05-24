<script lang="ts">
  import { Button, ToggleGroup } from "bits-ui";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import MonthCalendar from "$components/ui/MonthCalendar.svelte";
  import DayStrip from "./DayStrip.svelte";
  import ClassCard from "./ClassCard.svelte";
  import OneOnOneSlotCard from "./OneOnOneSlotCard.svelte";
  import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";
  import { isInLocalDay, startOfLocalDay } from "$lib/datetime/local";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  type CalendarClass = FunctionReturnType<typeof api.live.calendar.listRange>[number];
  type OpenSlot = FunctionReturnType<typeof api.oneOnOne.customer.listAvailableSlots>[number];
  type TypeFilter = "all" | "group_live" | "one_on_one";

  const dayMs = 24 * 60 * 60 * 1000;
  const rangeStart = startOfLocalDay();
  const rangeEnd = rangeStart + 14 * dayMs;

  let selectedDay = $state(rangeStart);
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  const typeFilter = $derived.by((): TypeFilter => {
    const raw = page.url.searchParams.get("type");
    if (raw === "group_live" || raw === "one_on_one") return raw;
    return "all";
  });

  const auth = initAuth();
  const client = useConvexClient();

  const query = useQuery(api.live.calendar.listRange, () =>
    auth.isAuthenticated
      ? {
          from: rangeStart,
          to: rangeEnd,
        }
      : "skip",
  );

  const slotsQuery = useQuery(api.oneOnOne.customer.listAvailableSlots, () =>
    auth.isAuthenticated
      ? {
          from: rangeStart,
          to: rangeEnd,
        }
      : "skip",
  );

  const pendingRequestsQuery = useQuery(api.oneOnOne.customer.listMine, () =>
    auth.isAuthenticated && typeFilter !== "group_live" ? {} : "skip",
  );

  const classes = $derived(query.data ?? []);
  const openSlots = $derived(slotsQuery.data ?? []);
  const pendingRequests = $derived(
    (pendingRequestsQuery.data ?? []).filter((r) => r.status === "pending"),
  );

  const filteredClasses = $derived(
    typeFilter === "all"
      ? classes
      : classes.filter((item) => item.liveClass.type === typeFilter),
  );

  const filteredSlots = $derived(
    typeFilter === "group_live" ? [] : openSlots,
  );

  const days = $derived(
    Array.from({ length: 14 }, (_, index) => {
      const date = rangeStart + index * dayMs;
      return { date, label: "" };
    }),
  );

  type AgendaEntry =
    | { kind: "class"; startsAt: number; item: CalendarClass }
    | { kind: "slot"; startsAt: number; slot: OpenSlot };

  const visibleAgenda = $derived.by((): AgendaEntry[] => {
    const entries: AgendaEntry[] = [];

    for (const item of filteredClasses) {
      const startsAt = item.liveClass.startsAt;
      if (!isInLocalDay(startsAt, selectedDay)) continue;
      entries.push({ kind: "class", startsAt, item });
    }

    for (const slot of filteredSlots) {
      if (!isInLocalDay(slot.startsAt, selectedDay)) continue;
      entries.push({ kind: "slot", startsAt: slot.startsAt, slot });
    }

    return entries.sort((a, b) => a.startsAt - b.startsAt);
  });

  const calendarEvents = $derived.by(() => {
    const dayTones = new Map<number, "sky" | "terra" | "violet" | "success" | "muted">();

    for (const item of filteredClasses) {
      const dayStart = startOfLocalDay(item.liveClass.startsAt);
      const existing = dayTones.get(dayStart);
      let tone: "sky" | "terra" | "violet" | "success" | "muted" = "sky";

      if (item.liveClass.status === "live") {
        tone = item.liveClass.type === "one_on_one" ? "violet" : "terra";
      } else if (
        item.viewerReservationStatus === "reserved" ||
        item.viewerReservationStatus === "joined"
      ) {
        tone = "success";
      } else if (item.seatsRemaining <= 0) {
        tone = "muted";
      } else if (item.liveClass.type === "one_on_one") {
        tone = "violet";
      }

      const priority = { terra: 4, violet: 4, success: 3, sky: 2, muted: 1 };
      if (!existing || priority[tone] > priority[existing]) {
        dayTones.set(dayStart, tone);
      }
    }

    for (const slot of filteredSlots) {
      const dayStart = startOfLocalDay(slot.startsAt);
      const existing = dayTones.get(dayStart);
      if (!existing || existing === "muted") {
        dayTones.set(dayStart, "violet");
      }
    }

    const events: { date: DateValue; tone: "sky" | "terra" | "violet" | "success" | "muted" }[] =
      [];
    for (const [dayStart, tone] of dayTones) {
      const d = new Date(dayStart);
      events.push({
        date: new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
        tone,
      });
    }
    return events;
  });

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

  function setTypeFilter(next: TypeFilter) {
    const url = new URL(page.url);
    if (next === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", next);
    }
    void goto(`${url.pathname}${url.search}`, { replaceState: true, keepFocus: true });
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

  async function bookOpenSlot(slot: OpenSlot) {
    const key = `${slot.instructorUserId}-${slot.startsAt}`;
    actionId = key;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.bookOpenSlot, {
        instructorUserId: slot.instructorUserId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו להזמין את החלון.";
    } finally {
      actionId = null;
    }
  }

  function goBuyCredits() {
    void goto("/u/dashboard");
  }

  const errorMessage = $derived((query.error?.message ?? slotsQuery.error?.message ?? actionError) || null);
  const loading = $derived(query.isLoading || slotsQuery.isLoading);
</script>

<PageShell
  kicker={t.calendar.kicker()}
  title={t.calendar.title()}
  {loading}
  error={errorMessage}
>
  {#snippet headerExtra()}
    <div class="calendar-header-actions">
      <ToggleGroup.Root
        type="single"
        value={typeFilter}
        onValueChange={(v) => {
          if (v === "all" || v === "group_live" || v === "one_on_one") setTypeFilter(v);
        }}
        class="calendar-filter"
        aria-label="סינון לפי סוג שיעור"
      >
        <ToggleGroup.Item value="all" class="calendar-filter__item">הכל</ToggleGroup.Item>
        <ToggleGroup.Item value="group_live" class="calendar-filter__item">קבוצתי</ToggleGroup.Item>
        <ToggleGroup.Item value="one_on_one" class="calendar-filter__item">1:1</ToggleGroup.Item>
      </ToggleGroup.Root>

      <Button.Root
        class="hb-button hb-button--paper hb-button--sm"
        type="button"
        onclick={() => {
          selectedDay = rangeStart;
        }}
      >
        {t.calendar.today()}
      </Button.Root>
    </div>
  {/snippet}

  <div class="calendar-layout">
    <div class="calendar-month">
      <MonthCalendar value={calendarValue} onchange={onCalendarSelect} events={calendarEvents} />
    </div>

    <DayStrip {days} {selectedDay} onSelect={(date) => {
      selectedDay = date;
    }} />

    {#if typeFilter !== "group_live" && pendingRequests.length > 0}
      <div class="pending-requests" role="status">
        <span class="material-symbols-rounded" aria-hidden="true">hourglass_top</span>
        <p>
          {pendingRequests.length} בקשות 1:1 ממתינות לאישור המדריכה. חלונות שפורסמו בלוח ניתן להזמין מיידית.
        </p>
      </div>
    {/if}

    <div class="agenda" aria-live="polite">
      {#if visibleAgenda.length === 0}
        <div class="empty-state">
          <p class="empty-state__kicker">{t.calendar.empty.kicker()}</p>
          <p>{t.calendar.empty.text()}</p>
          {#if typeFilter === "one_on_one"}
            <p class="empty-state__hint">נסי סינון "הכל" או בדקי שוב מאוחר יותר — חלונות 1:1 נפתחים לפי זמינות המדריכה.</p>
          {/if}
        </div>
      {:else}
        {#each visibleAgenda as entry (entry.kind === "class" ? entry.item.liveClass._id : `slot-${entry.slot.startsAt}`)}
          {#if entry.kind === "class"}
            <ClassCard
              item={entry.item}
              {actionId}
              onReserve={reserve}
              onCancel={cancel}
              onBuyCredits={goBuyCredits}
            />
          {:else}
            <OneOnOneSlotCard
              slot={entry.slot}
              {actionId}
              onBook={bookOpenSlot}
              onBuyCredits={goBuyCredits}
            />
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</PageShell>

<style>
  .calendar-header-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  :global(.calendar-filter) {
    display: inline-flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  :global(.calendar-filter__item) {
    min-height: 36px;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    background: var(--white);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  :global(.calendar-filter__item[data-state="on"]) {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  :global(.calendar-filter__item[data-state="on"][data-value="one_on_one"]) {
    background: var(--violet-strong);
    border-color: var(--violet-strong);
    color: var(--paper);
  }

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
    border-radius: 4px;
  }

  .pending-requests {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3);
    background: color-mix(in srgb, var(--violet-soft) 35%, var(--white));
    border: 1px solid var(--violet-strong);
    border-radius: 4px;
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--ink);
  }

  .pending-requests p {
    margin: 0;
    line-height: 1.4;
  }

  .pending-requests .material-symbols-rounded {
    color: var(--violet-strong);
    flex-shrink: 0;
  }

  .agenda {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--white);
    border: var(--border);
    border-radius: 4px;
    overflow: hidden;
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

  .empty-state__hint {
    font-size: var(--step--1);
    max-width: 36ch;
    margin-inline: auto;
  }
</style>
