<script lang="ts">
  import { untrack } from "svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import BookingAgendaList from "./BookingAgendaList.svelte";
  import {
    buildAgendaEntries,
    filterUpcomingAvailable,
    groupAgendaByDay,
    partitionAgendaEntries,
    orEmpty,
    filterPending,
    maxAvailableCredits,
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
  import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import type { CalendarClass } from "../lib/agenda";
  import type { OneOnOneRequestPayload } from "./OneOnOneRequestModal.svelte";
  import CalendarHeader from "./CalendarHeader.svelte";
  import OneOnOnePendingSection from "./OneOnOnePendingSection.svelte";
  import CalendarModals from "./CalendarModals.svelte";
  import { setCalendarTypeFilter, goBuyCredits } from "./calendar-navigation";
  import { createCalendarActions } from "./calendar-actions";

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

  const classes = $derived(orEmpty(query.data));
  const dayWindows = $derived(orEmpty(dayAvailabilityQuery.data));
  const pendingRequests = $derived(filterPending(pendingRequestsQuery.data));

  const allAgendaEntries = $derived(buildAgendaEntries(classes, dayWindows, typeFilter));

  const displayAgendaEntries = $derived(
    filterUpcomingAvailable(allAgendaEntries, calendarNowMs),
  );

  const agendaGroups = $derived(groupAgendaByDay(displayAgendaEntries));
  const splitAgenda = $derived(partitionAgendaEntries(displayAgendaEntries));
  const groupPaneGroups = $derived(groupAgendaByDay(splitAgenda.group));
  const oneOnOnePaneGroups = $derived(groupAgendaByDay(splitAgenda.oneOnOne));

  const hasOneOnOneCredits = $derived(dayWindows.some((w) => w.availableCredits >= 1));
  const oneOnOneCreditBalance = $derived(maxAvailableCredits(dayWindows));

  const showOneOnOneRequest = $derived(isCustomer && typeFilter !== "group_live");

  function setTypeFilter(next: TypeFilter) {
    setCalendarTypeFilter(next, page.url.pathname, page.url.search);
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

  function requestCancelReservation(item: CalendarClass) {
    cancelTarget = item;
    cancelDialogOpen = true;
  }

  const actions = createCalendarActions(
    (v) => { actionId = v; },
    (v) => { actionError = v; },
    (v) => { oneOnOneModalPending = v; },
    (v) => { oneOnOneModalOpen = v; },
    (v) => { oneOnOneModalInitialDay = v; },
    (v) => { cancelDialogOpen = v; },
    (v) => { cancelTarget = v as CalendarClass | null; },
  );

  async function confirmCancelReservation() {
    if (cancelTarget === null) return;
    await actions.confirmCancelReservation(cancelTarget);
    if (!actionError) {
      cancelDialogOpen = false;
      cancelTarget = null;
    }
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
</script>

<PageShell
  title={t.calendar.title()}
  loading={pageLoading}
  error={errorMessage}
>
  {#snippet headerExtra()}
    <CalendarHeader
      {typeFilter}
      {showOneOnOneRequest}
      {hasOneOnOneCredits}
      {oneOnOneCreditBalance}
      onTypeFilterChange={setTypeFilter}
      onOpenOneOnOneModal={openOneOnOneModal}
    />
  {/snippet}

  <div class="calendar-shell">
    <OneOnOnePendingSection
      {showOneOnOneRequest}
      {pendingRequests}
      {actionId}
      onCancelRequest={actions.cancelOneOnOneRequest}
    />

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
        onReserve={actions.reserve}
        onCancel={requestCancelReservation}
        onOpenOneOnOneRequest={showOneOnOneRequest ? openOneOnOneModal : undefined}
        onBuyCredits={CREDITS_PURCHASE_ENABLED ? goBuyCredits : undefined}
      />
    </div>
  </div>

  <CalendarModals
    {showOneOnOneRequest}
    bind:oneOnOneModalOpen
    {oneOnOneModalPending}
    {oneOnOneModalInitialDay}
    {dayWindows}
    onSubmitOneOnOneRequest={actions.submitOneOnOneRequest}
    {cancelTarget}
    bind:cancelDialogOpen
    {actionId}
    onConfirmCancel={confirmCancelReservation}
  />
</PageShell>

<style>
  .calendar-shell {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .calendar-shell__agenda {
    min-width: 0;
  }
</style>
