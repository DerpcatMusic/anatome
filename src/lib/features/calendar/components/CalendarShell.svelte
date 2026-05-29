<script lang="ts">
  import { untrack } from "svelte";
  import { Button, ToggleGroup } from "bits-ui";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import BookingAgendaList from "./BookingAgendaList.svelte";
  import OneOnOneRequestModal, {
    type OneOnOneRequestPayload,
  } from "./OneOnOneRequestModal.svelte";
  import {
    buildAgendaEntries,
    filterUpcomingAvailable,
    groupAgendaByDay,
    partitionAgendaEntries,
    type TypeFilter,
  } from "../lib/agenda";
  import {
    CALENDAR_INITIAL_DAYS,
    CALENDAR_LOAD_MORE_DAYS,
    agendaRangeEndForLoadedDays,
    canLoadMoreAgendaRange,
    maxAgendaDays,
  } from "../lib/calendar-range";
  import { startOfLocalDay } from "$lib/datetime/local";
  import { bucketQueryNowMs, QUERY_NOW_CALENDAR_BUCKET_MS } from "$lib/convex/queryClockBucket";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { getCachedRole } from "$lib/auth/session.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import { convexMutationErrorMessage } from "$lib/convex/errors";
  import CreditCostTooltip from "$lib/features/credits/CreditCostTooltip.svelte";
  import CancelReservationDialog from "./CancelReservationDialog.svelte";
  import type { CalendarClass } from "../lib/agenda";

  /** Stable for this page visit — avoids re-query when unrelated reactive state updates. */
  const agendaRangeStart = startOfLocalDay();
  let loadedAgendaDays = $state(CALENDAR_INITIAL_DAYS);
  const queryNow = useQueryNowMs(QUERY_NOW_CALENDAR_BUCKET_MS);
  const nowMs = $derived(queryNow.nowMs);
  const calendarNowMs = $derived(bucketQueryNowMs(nowMs));
  let calendarHasLoaded = $state(false);
  let actionId = $state<string | null>(null);
  let actionError = $state("");
  let cancelDialogOpen = $state(false);
  let cancelTarget = $state<CalendarClass | null>(null);
  let oneOnOneModalOpen = $state(false);
  let oneOnOneModalPending = $state(false);
  let oneOnOneModalInitialDay = $state<number | null>(null);

  const typeFilter = $derived.by((): TypeFilter => {
    const raw = page.url.searchParams.get("type");
    if (raw === "group_live" || raw === "one_on_one") return raw;
    return "all";
  });

  const auth = initAuth();
  const client = useConvexClient();
  const appContext = getAppContext();

  const isCustomer = $derived.by(() => {
    const role = appContext.role ?? getCachedRole();
    return role === "customer";
  });

  const agendaRangeEnd = $derived(
    agendaRangeEndForLoadedDays(agendaRangeStart, typeFilter, loadedAgendaDays),
  );

  $effect(() => {
    const filter = typeFilter;
    untrack(() => {
      loadedAgendaDays = Math.min(CALENDAR_INITIAL_DAYS, maxAgendaDays(filter));
    });
  });

  const query = useQuery(api.live.calendar.listRange, () =>
    canRunAuthenticatedQuery()
      ? {
          from: agendaRangeStart,
          to: agendaRangeEnd,
          now: calendarNowMs,
        }
      : "skip",
  );

  const dayAvailabilityQuery = useQuery(api.oneOnOne.customer.listDayAvailability, () =>
    canRunAuthenticatedQuery() && isCustomer
      ? {
          from: agendaRangeStart,
          to: agendaRangeEnd,
          now: calendarNowMs,
        }
      : "skip",
  );

  const canLoadMore = $derived(
    canLoadMoreAgendaRange(agendaRangeEnd, agendaRangeStart, typeFilter),
  );

  const pendingRequestsQuery = useQuery(api.oneOnOne.customer.listMine, () =>
    canRunAuthenticatedQuery() && isCustomer && typeFilter !== "group_live" ? {} : "skip",
  );

  const classes = $derived(query.data ?? []);
  const dayWindows = $derived(dayAvailabilityQuery.data ?? []);
  const pendingRequests = $derived(
    (pendingRequestsQuery.data ?? []).filter((r) => r.status === "pending"),
  );

  const allAgendaEntries = $derived(buildAgendaEntries(classes, dayWindows, typeFilter));

  const displayAgendaEntries = $derived(
    filterUpcomingAvailable(allAgendaEntries, calendarNowMs),
  );

  const agendaGroups = $derived(groupAgendaByDay(displayAgendaEntries));
  const splitAgenda = $derived(partitionAgendaEntries(displayAgendaEntries));
  const groupPaneGroups = $derived(groupAgendaByDay(splitAgenda.group));
  const oneOnOnePaneGroups = $derived(groupAgendaByDay(splitAgenda.oneOnOne));

  const hasOneOnOneCredits = $derived(dayWindows.some((w) => w.availableCredits >= 1));
  const oneOnOneCreditBalance = $derived(
    dayWindows.reduce((max, w) => Math.max(max, w.availableCredits), 0),
  );

  const showOneOnOneRequest = $derived(isCustomer && typeFilter !== "group_live");

  function setTypeFilter(next: TypeFilter) {
    const url = new URL(page.url);
    if (next === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", next);
    }
    void goto(`${url.pathname}${url.search}`, { replaceState: true, keepFocus: true });
  }

  let rangeExtendLock = $state(false);

  function loadMoreAgenda() {
    if (!canLoadMore || rangeExtendLock) return;
    const maxDays = maxAgendaDays(typeFilter);
    if (loadedAgendaDays >= maxDays) return;
    rangeExtendLock = true;
    loadedAgendaDays = Math.min(loadedAgendaDays + CALENDAR_LOAD_MORE_DAYS, maxDays);
  }

  $effect(() => {
    if (query.data !== undefined && !query.isLoading) {
      rangeExtendLock = false;
    }
  });

  function openOneOnOneModal(dayStart?: number) {
    if (!hasOneOnOneCredits) return;
    oneOnOneModalInitialDay = dayStart ?? null;
    oneOnOneModalOpen = true;
  }

  const { t } = useI18n();

  async function reserve(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.live.reservation.reserve, { liveClassId });
    } catch (reason) {
      actionError = convexMutationErrorMessage(reason, t.calendar.error.reserve());
    } finally {
      actionId = null;
    }
  }

  function requestCancelReservation(item: CalendarClass) {
    cancelTarget = item;
    cancelDialogOpen = true;
  }

  async function confirmCancelReservation() {
    if (cancelTarget === null) return;
    const liveClassId = cancelTarget.liveClass._id;
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.live.reservation.cancel, { liveClassId });
      cancelDialogOpen = false;
      cancelTarget = null;
    } catch (reason) {
      actionError = convexMutationErrorMessage(reason, t.calendar.error.cancel());
    } finally {
      actionId = null;
    }
  }

  async function submitOneOnOneRequest(payload: OneOnOneRequestPayload, note: string) {
    const key = `${payload.instructorUserId}-${payload.startsAt}`;
    oneOnOneModalPending = true;
    actionId = key;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.requestSlot, {
        instructorUserId: payload.instructorUserId,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        note,
      });
      oneOnOneModalOpen = false;
      oneOnOneModalInitialDay = null;
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.";
    } finally {
      oneOnOneModalPending = false;
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

  function goBuyCredits(pool?: "vod" | "live" | "oneOnOne") {
    if (!CREDITS_PURCHASE_ENABLED) return;
    const query = pool ? `?pool=${pool}` : "";
    void goto(`/u/credits${query}`);
  }

  const errorMessage = $derived(
    (query.error?.message ??
      dayAvailabilityQuery.error?.message ??
      pendingRequestsQuery.error?.message ??
      actionError) ||
      null,
  );
  const waitingForAuth = $derived(auth.isAuthenticated && !canRunAuthenticatedQuery());

  $effect(() => {
    if (query.data !== undefined) calendarHasLoaded = true;
  });

  const pageLoading = $derived(
    auth.isLoading ||
      waitingForAuth ||
      (canRunAuthenticatedQuery() && !calendarHasLoaded && query.isLoading),
  );

  /** Avoid opacity flicker on Convex cache refresh; only show while extending range or first 1:1 load. */
  const agendaRefreshing = $derived(
    rangeExtendLock ||
      (isCustomer &&
        query.data !== undefined &&
        dayAvailabilityQuery.data === undefined &&
        dayAvailabilityQuery.isLoading),
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
  title={t.calendar.title()}
  loading={pageLoading}
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
        <ToggleGroup.Item
          value="one_on_one"
          class="calendar-filter__item"
          disabled={showOneOnOneRequest && !hasOneOnOneCredits}
        >
          1:1
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      {#if showOneOnOneRequest}
        <CreditCostTooltip
          cost={1}
          balance={oneOnOneCreditBalance}
          pool="oneOnOne"
          enabled={hasOneOnOneCredits}
        >
          {#snippet child({ props })}
            <Button.Root
              {...props}
              class="hb-button hb-button--primary hb-button--sm"
              type="button"
              disabled={!hasOneOnOneCredits}
              title={hasOneOnOneCredits ? "בקשת שיעור אישי" : "אין קרדיט 1:1 זמין"}
              onclick={() => openOneOnOneModal()}
            >
              בקשת 1:1
            </Button.Root>
          {/snippet}
        </CreditCostTooltip>
      {/if}

    </div>
  {/snippet}

  <div class="calendar-shell">
    {#if showOneOnOneRequest && pendingRequests.length > 0}
      <div class="one-on-one-pending" role="region" aria-labelledby="one-on-one-pending-heading">
        <div class="one-on-one-pending__banner">
          <span class="material-symbols-rounded one-on-one-pending__icon" aria-hidden="true"
            >hourglass_top</span
          >
          <div class="one-on-one-pending__summary">
            <h3 id="one-on-one-pending-heading" class="one-on-one-pending__title">
              {pendingRequests.length}
              {pendingRequests.length === 1 ? "בקשה ממתינה" : "בקשות ממתינות"}
            </h3>
          </div>
        </div>
        <ul class="one-on-one-pending__list">
          {#each pendingRequests as request (request._id)}
            <li class="one-on-one-pending__row">
              <time datetime={new Date(request.requestedStartsAt).toISOString()}>
                {slotDateFormatter.format(new Date(request.requestedStartsAt))}
              </time>
              <Button.Root
                class="hb-button hb-button--paper hb-button--sm"
                type="button"
                onclick={() => cancelOneOnOneRequest(request._id)}
                disabled={actionId === request._id}
              >
                {actionId === request._id ? "מבטלת..." : "ביטול"}
              </Button.Root>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="calendar-shell__agenda" aria-live="polite">
      <BookingAgendaList
        split={typeFilter === "all"}
        groups={agendaGroups}
        groupGroups={groupPaneGroups}
        oneOnOneGroups={oneOnOnePaneGroups}
        {actionId}
        {typeFilter}
        {canLoadMore}
        loading={agendaRefreshing}
        nowMs={nowMs}
        onLoadMore={loadMoreAgenda}
        onReserve={reserve}
        onCancel={requestCancelReservation}
        onOpenOneOnOneRequest={showOneOnOneRequest ? (day) => openOneOnOneModal(day) : undefined}
        onBuyCredits={CREDITS_PURCHASE_ENABLED ? goBuyCredits : undefined}
      />
    </div>
  </div>

  {#if showOneOnOneRequest}
    <OneOnOneRequestModal
      bind:open={oneOnOneModalOpen}
      windows={dayWindows}
      initialDay={oneOnOneModalInitialDay}
      pending={oneOnOneModalPending}
      onSubmit={submitOneOnOneRequest}
    />
  {/if}

  {#if cancelTarget}
    <CancelReservationDialog
      bind:open={cancelDialogOpen}
      classTitle={cancelTarget.liveClass.title}
      creditCost={cancelTarget.liveClass.creditCost}
      pending={actionId === cancelTarget.liveClass._id}
      onConfirm={() => void confirmCancelReservation()}
    />
  {/if}
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
    background: var(--elevated);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  :global(.calendar-filter__item[data-disabled]) {
    opacity: 0.45;
    cursor: not-allowed;
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

  .calendar-shell {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .calendar-shell__agenda {
    min-width: 0;
  }

  .one-on-one-pending {
    border: var(--border);
    border-radius: var(--radius-md);
    background: var(--elevated);
    overflow: hidden;
  }

  .one-on-one-pending__banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--accent-soft);
    border-bottom: 1px solid var(--line-light);
  }

  .one-on-one-pending__icon {
    color: var(--primary);
    font-size: 1.25rem;
  }

  .one-on-one-pending__title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 800;
  }

  .one-on-one-pending__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .one-on-one-pending__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--line-light);
    font-family: var(--font-body);
    font-variant-numeric: tabular-nums;
    font-size: var(--step--1);
    font-weight: 700;
  }

  .one-on-one-pending__row:last-child {
    border-bottom: none;
  }
</style>
