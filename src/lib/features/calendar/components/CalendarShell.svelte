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
  let oneOnOneNote = $state("");

  const typeFilter = $derived.by((): TypeFilter => {
    const raw = page.url.searchParams.get("type");
    if (raw === "group_live" || raw === "one_on_one") return raw;
    return "all";
  });

  const auth = initAuth();
  const client = useConvexClient();

  const profileQuery = useQuery(api.profiles.viewer.get, () =>
    auth.isAuthenticated ? {} : "skip",
  );
  const isCustomer = $derived(profileQuery.data?.role === "customer");

  const query = useQuery(api.live.calendar.listRange, () =>
    auth.isAuthenticated
      ? {
          from: rangeStart,
          to: rangeEnd,
        }
      : "skip",
  );

  const slotsQuery = useQuery(api.oneOnOne.customer.listAvailableSlots, () =>
    auth.isAuthenticated && isCustomer
      ? {
          from: rangeStart,
          to: rangeEnd,
        }
      : "skip",
  );

  const pendingRequestsQuery = useQuery(api.oneOnOne.customer.listMine, () =>
    auth.isAuthenticated && isCustomer && typeFilter !== "group_live" ? {} : "skip",
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
    const dayTones = new Map<number, "secondary" | "primary" | "success" | "muted">();

    for (const item of filteredClasses) {
      const dayStart = startOfLocalDay(item.liveClass.startsAt);
      const existing = dayTones.get(dayStart);
      let tone: "secondary" | "primary" | "success" | "muted" = "secondary";

      if (item.liveClass.status === "live") {
        tone = item.liveClass.type === "one_on_one" ? "primary" : "secondary";
      } else if (
        item.viewerReservationStatus === "reserved" ||
        item.viewerReservationStatus === "joined"
      ) {
        tone = "success";
      } else if (item.seatsRemaining <= 0) {
        tone = "muted";
      } else if (item.liveClass.type === "one_on_one") {
        tone = "primary";
      }

      const priority = { secondary: 4, primary: 4, success: 3, muted: 1 };
      if (!existing || priority[tone] > priority[existing]) {
        dayTones.set(dayStart, tone);
      }
    }

    for (const slot of filteredSlots) {
      const dayStart = startOfLocalDay(slot.startsAt);
      const existing = dayTones.get(dayStart);
      if (!existing || existing === "muted") {
        dayTones.set(dayStart, "primary");
      }
    }

    const events: { date: DateValue; tone: "secondary" | "primary" | "success" | "muted" }[] =
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

  async function requestOneOnOneSlot(slot: OpenSlot) {
    const key = `${slot.instructorUserId}-${slot.startsAt}`;
    actionId = key;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.requestSlot, {
        instructorUserId: slot.instructorUserId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        note: oneOnOneNote,
      });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.";
    } finally {
      actionId = null;
    }
  }

  async function cancelOneOnOneRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.cancelRequest, { requestId });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל את הבקשה.";
    } finally {
      actionId = null;
    }
  }

  function goBuyCredits() {
    void goto("/u/dashboard");
  }

  const errorMessage = $derived(
    (query.error?.message ?? slotsQuery.error?.message ?? pendingRequestsQuery.error?.message ?? actionError) ||
      null,
  );
  const loading = $derived(
    query.isLoading || (isCustomer && (slotsQuery.isLoading || pendingRequestsQuery.isLoading)),
  );

  const slotDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });
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

    {#if isCustomer && typeFilter !== "group_live"}
      <section class="one-on-one-tools" aria-labelledby="one-on-one-tools-heading">
        <header class="one-on-one-tools__head">
          <p id="one-on-one-tools-heading" class="one-on-one-tools__kicker">שיעור אישי 1:1</p>
          <p class="one-on-one-tools__lead">בחרי חלון, הוסיפי הערה אם צריך — המדריכה מאשרת לפני פתיחת החדר.</p>
        </header>

        {#if pendingRequests.length > 0}
          <div class="one-on-one-pending" role="region" aria-labelledby="one-on-one-pending-heading">
            <div class="one-on-one-pending__banner">
              <span class="material-symbols-rounded one-on-one-pending__icon" aria-hidden="true">hourglass_top</span>
              <div class="one-on-one-pending__summary">
                <h3 id="one-on-one-pending-heading" class="one-on-one-pending__title">
                  {pendingRequests.length}
                  {pendingRequests.length === 1 ? "בקשה ממתינה" : "בקשות ממתינות"}
                </h3>
                <p>קרדיט 1:1 שמור עד אישור או דחייה.</p>
              </div>
            </div>
            <ul class="one-on-one-pending__list">
              {#each pendingRequests as request (request._id)}
                <li class="one-on-one-pending__row">
                  <div class="one-on-one-pending__when">
                    <time datetime={new Date(request.requestedStartsAt).toISOString()}>
                      {slotDateFormatter.format(new Date(request.requestedStartsAt))}
                    </time>
                    <span class="one-on-one-pending__badge">ממתינה</span>
                  </div>
                  {#if request.note?.trim()}
                    <p class="one-on-one-pending__note">{request.note}</p>
                  {/if}
                  <div class="one-on-one-pending__action">
                    <Button.Root
                      class="hb-button hb-button--paper hb-button--sm"
                      type="button"
                      onclick={() => cancelOneOnOneRequest(request._id)}
                      disabled={actionId === request._id}
                      aria-busy={actionId === request._id}
                    >
                      {actionId === request._id ? "מבטלת..." : "ביטול"}
                    </Button.Root>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <label class="hb-field hb-field--compact one-on-one-note" for="one-on-one-note">
          <span class="hb-field__label">הערה למדריכה</span>
          <textarea
            id="one-on-one-note"
            class="hb-textarea one-on-one-note__input"
            bind:value={oneOnOneNote}
            maxlength="500"
            placeholder="מטרות, מגבלות, ציוד — אופציונלי"
            rows="2"
          ></textarea>
        </label>
      </section>
    {/if}

    <div class="agenda" aria-live="polite">
      {#if visibleAgenda.length === 0}
        <div class="empty-state" class:empty-state--one-on-one={typeFilter === "one_on_one"}>
          {#if typeFilter === "one_on_one"}
            <span class="material-symbols-rounded empty-state__icon" aria-hidden="true">event_available</span>
            <p class="empty-state__kicker">אין חלונות 1:1 ביום זה</p>
            <p class="empty-state__hint">
              המדריכה פותחת זמינות לפי לוח השבוע. נסי יום אחר, או סינון &quot;הכל&quot; לראות שיעורים קבוצתיים.
            </p>
          {:else}
            <p class="empty-state__kicker">{t.calendar.empty.kicker()}</p>
            <p>{t.calendar.empty.text()}</p>
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
              onRequest={requestOneOnOneSlot}
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
    background: var(--primary);
    border-color: var(--primary);
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

  .one-on-one-tools {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--surface);
    border: var(--border);
    border-inline-start: 3px solid var(--primary);
    border-radius: 4px;
  }

  .one-on-one-tools__head {
    display: grid;
    gap: var(--space-1);
  }

  .one-on-one-tools__kicker {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--primary);
  }

  .one-on-one-tools__lead {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.45;
    color: color-mix(in oklch, var(--ink) 75%, var(--muted));
    max-width: 52ch;
  }

  .one-on-one-pending {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: var(--border);
    border-inline-start: 3px solid var(--secondary);
    border-radius: 4px;
    background: var(--white);
    overflow: hidden;
  }

  .one-on-one-pending__banner {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: color-mix(in oklch, var(--secondary) 8%, var(--surface));
    border-bottom: 1px solid var(--line-light);
  }

  .one-on-one-pending__icon {
    color: var(--secondary);
    font-size: 1.35rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .one-on-one-pending__summary {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .one-on-one-pending__title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 800;
    line-height: 1.2;
    color: var(--ink);
  }

  .one-on-one-pending__summary p {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.4;
    color: var(--muted);
    font-weight: 600;
  }

  .one-on-one-pending__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .one-on-one-pending__row {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "when action"
      "note note";
    align-items: center;
    gap: var(--space-2) var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--line-light);
  }

  .one-on-one-pending__row:last-child {
    border-bottom: none;
  }

  .one-on-one-pending__when {
    grid-area: when;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    min-width: 0;
  }

  .one-on-one-pending__when time {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--ink);
  }

  .one-on-one-pending__badge {
    font-size: var(--step--2);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: 4px;
    background: color-mix(in oklch, var(--secondary) 14%, var(--surface));
    color: var(--secondary);
    border: 1px solid color-mix(in oklch, var(--secondary) 24%, var(--line-light));
  }

  .one-on-one-pending__note {
    grid-area: note;
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.45;
    color: var(--muted);
    border-inline-start: 2px solid var(--line-light);
    padding-inline-start: var(--space-3);
  }

  .one-on-one-pending__action {
    grid-area: action;
    justify-self: end;
  }

  .one-on-one-note {
    margin: 0;
  }

  .one-on-one-note__input {
    min-height: 4.5rem;
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
    line-height: 1.5;
  }

  .empty-state--one-on-one {
    padding-block: var(--space-7);
  }

  .empty-state__icon {
    font-size: 2rem;
    color: color-mix(in oklch, var(--primary) 70%, var(--muted));
    margin-inline: auto;
  }

  .empty-state--one-on-one .empty-state__kicker {
    color: var(--ink);
    font-size: var(--step-0);
    font-weight: 800;
    font-family: inherit;
    text-transform: none;
    letter-spacing: normal;
  }

  @media (max-width: 680px) {
    .one-on-one-pending__row {
      grid-template-columns: 1fr;
      grid-template-areas:
        "when"
        "note"
        "action";
    }

    .one-on-one-pending__action {
      justify-self: stretch;
      width: 100%;
    }

    .one-on-one-pending__action :global(.hb-button) {
      width: 100%;
    }
  }
</style>
