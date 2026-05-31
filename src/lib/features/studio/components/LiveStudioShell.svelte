<script lang="ts">
  import "./LiveStudioShell.css";
  import { untrack } from "svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import { initAuth, setCachedRole, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useQuery } from "convex-svelte";
  import { calendarVisibleClasses } from "$features/studio/lib/live-class-display";
  import { fromCalendarEventDate } from "$lib/datetime/local";
  import { useLiveStudio } from "./useLiveStudio.svelte";
  import StudioToolbar from "./StudioToolbar.svelte";
  import LiveClassModalShell from "$features/live/components/LiveClassModalShell.svelte";
  import LiveEventPopover from "$features/live/components/LiveEventPopover.svelte";
  import OneOnOneRequestsPanel from "./OneOnOneRequestsPanel.svelte";

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];

  const auth = initAuth();
  const queryNow = useQueryNowMs();
  const profileQuery = useQuery(api.profiles.viewer.get, () => (canRunAuthenticatedQuery() ? {} : "skip"));
  let calendarQueryRange = $state<{ from: number; to: number } | null>(null);
  const classesQuery = useQuery(api.live.class.listMine, () =>
    canRunAuthenticatedQuery()
      ? {
          now: queryNow.nowMs,
          ...(calendarQueryRange ?? {}),
        }
      : "skip",
  );

  const EMPTY_ARRAY: LiveClass[] = [];
  const classes = $derived(classesQuery.data ?? EMPTY_ARRAY);
  const classesQueryError = $derived(classesQuery.error?.message ?? "");
  let hasLoadedClasses = $state(false);
  const loading = $derived(
    !canRunAuthenticatedQuery() ||
      profileQuery.isLoading ||
      (classesQuery.isLoading && !hasLoadedClasses),
  );

  let weeklyAgenda = $state<{ clearCalendarSelection: () => void } | undefined>();
  let requestsPanel = $state<{ refresh: () => Promise<void> } | undefined>(undefined);

  const studio = useLiveStudio({
    clearCalendarSelection: () => weeklyAgenda?.clearCalendarSelection(),
  });

  /** Open 1:1 publish windows are hidden; type filtering happens in WeeklyAgenda. */
  const studioCalendarClasses = $derived(calendarVisibleClasses(classes));

  $effect(() => {
    if (classesQuery.data !== undefined) {
      hasLoadedClasses = true;
    }
  });

  $effect(() => {
    if (!canRunAuthenticatedQuery() || profileQuery.isLoading) return;
    const profile = profileQuery.data;
    if (profile === null || profile === undefined) {
      window.location.assign("/");
      return;
    }
    if (profile.role !== "admin" && profile.role !== "instructor") {
      window.location.assign("/u/calendar");
      return;
    }
    untrack(() => setCachedRole(profile.role));
  });

  $effect(() => {
    void studio.loadAvailability();
  });

  function handleCalendarViewRangeChange(start: Date, end: Date) {
    const from = fromCalendarEventDate(start);
    const to = fromCalendarEventDate(end);
    if (calendarQueryRange?.from === from && calendarQueryRange.to === to) return;
    calendarQueryRange = { from, to };
  }
</script>

{#if loading}
  <div class="studio-skeleton">
    <div class="skeleton skeleton--header"></div>
    <div class="skeleton skeleton--grid"></div>
  </div>
{:else if (studio.state.error || classesQueryError) && classes.length === 0}
  <div class="studio-error">
    <p>{studio.state.error || classesQueryError}</p>
    <button class="hb-button hb-button--ghost" type="button" onclick={studio.retryLoad}>נסה שוב</button>
  </div>
{:else}
  <div class="studio-page" class:studio-page--availability-mode={studio.state.availabilityPaintMode}>
    <StudioToolbar
      typeFilter={studio.state.typeFilter}
      onTypeFilterChange={studio.handleTypeFilterChange}
      availabilityPaintMode={studio.state.availabilityPaintMode}
      onToggleAvailabilityPaintMode={studio.toggleAvailabilityPaintMode}
      availabilitySaving={studio.state.availabilitySaving}
      availabilityModeStatus={studio.availabilityModeStatus}
      pendingRequestCount={studio.state.pendingRequestCount}
      onOpenRequestsPanel={studio.openRequestsPanel}
      onEndAvailabilityPaintMode={studio.endAvailabilityPaintMode}
      error={studio.state.error}
      availabilityError={studio.state.availabilityError}
    />

    {#await import("$features/live/components/WeeklyAgenda.svelte") then { default: WeeklyAgenda }}
      <WeeklyAgenda
        bind:this={weeklyAgenda}
        classes={studioCalendarClasses}
        typeFilter={studio.state.typeFilter}
        onStart={studio.startLive}
        onEnd={studio.endLive}
        actionId={studio.state.actionId}
        onSelectSlot={studio.handleSelectSlot}
        onEventClick={studio.handleEventClick}
        createPreview={studio.state.availabilityPaintMode ? null : studio.quickCreatePreview}
        onCreatePreviewChange={studio.handleCreatePreviewChange}
        availabilityPaintMode={studio.state.availabilityPaintMode}
        availabilityPainted={studio.state.availabilityPainted}
        onAvailabilityPaintChange={studio.handleAvailabilityPaintChange}
        onViewRangeChange={handleCalendarViewRangeChange}
      />
    {/await}
  </div>
{/if}

{#snippet studioModals()}
  <LiveEventPopover
    bind:open={studio.state.popoverOpen}
    mode={studio.state.popoverMode}
    anchor={studio.state.popoverAnchor}
    liveClass={studio.state.popoverEditClass as any}
    bind:title={studio.state.title}
    bind:description={studio.state.description}
    bind:liveType={studio.state.liveType}
    bind:startsAtLocal={studio.state.startsAtLocal}
    bind:durationMinutes={studio.state.durationMinutes}
    bind:joinOpensMinutesBefore={studio.state.joinOpensMinutesBefore}
    bind:capacity={studio.state.capacity}
    bind:requiredEquipment={studio.state.requiredEquipment}
    pending={studio.popoverPending}
    onSubmit={studio.handlePopoverSubmit}
    onCancel={studio.closePopover}
    onDelete={studio.handlePopoverDelete}
    onEndLive={studio.handlePopoverEndLive}
  />

  <LiveClassModalShell
    bind:open={studio.state.showRequestsPanel}
    title="בקשות ממתינות"
    icon="inbox"
    iconColor="var(--primary)"
    wide
  >
    <OneOnOneRequestsPanel bind:this={requestsPanel} onPendingCountChange={studio.handlePendingCountChange} />
  </LiveClassModalShell>
{/snippet}

{@render studioModals()}
