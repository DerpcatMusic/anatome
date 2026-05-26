<script lang="ts">
  import AgendaPane from "./AgendaPane.svelte";
  import type { Id } from "$convex/_generated/dataModel";
  import type { DayAgendaGroup } from "../lib/agenda";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import "../styles/agenda-list.css";

  let {
    split = false,
    groups = [],
    groupGroups = [],
    oneOnOneGroups = [],
    actionId,
    typeFilter,
    canLoadMore = false,
    loading = false,
    nowMs,
    onLoadMore,
    onReserve,
    onCancel,
    onOpenOneOnOneRequest,
    onBuyCredits,
  }: {
    split?: boolean;
    groups?: DayAgendaGroup[];
    groupGroups?: DayAgendaGroup[];
    oneOnOneGroups?: DayAgendaGroup[];
    actionId: string | null;
    typeFilter: "all" | "group_live" | "one_on_one";
    canLoadMore?: boolean;
    loading?: boolean;
    nowMs: number;
    onLoadMore?: () => void;
    onReserve: (liveClassId: Id<"liveClasses">) => void;
    onCancel: (liveClassId: Id<"liveClasses">) => void;
    onOpenOneOnOneRequest?: (dayStart: number) => void;
    onBuyCredits?: () => void;
  } = $props();

  const { t } = useI18n();

  const isEmpty = $derived(
    split
      ? groupGroups.length === 0 && oneOnOneGroups.length === 0
      : groups.length === 0,
  );

  let loadMoreSentinel = $state<HTMLDivElement | null>(null);

  $effect(() => {
    const node = loadMoreSentinel;
    if (!node || !onLoadMore || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  });
</script>

{#if isEmpty}
  <p class="booking-agenda__empty">{t.calendar.empty.upcomingText()}</p>
{:else if split}
  <div class="booking-agenda booking-agenda--split">
    <AgendaPane
      paneTitle={t.calendar.panes.groupTitle()}
      paneVariant="group"
      groups={groupGroups}
      listTypeFilter="group_live"
      emptyText={t.calendar.panes.groupEmpty()}
      {actionId}
      {nowMs}
      onReserve={onReserve}
      onCancel={onCancel}
      {onBuyCredits}
    />
    <AgendaPane
      paneTitle={t.calendar.panes.oneOnOneTitle()}
      paneVariant="one_on_one"
      groups={oneOnOneGroups}
      listTypeFilter="one_on_one"
      emptyText={t.calendar.panes.oneOnOneEmpty()}
      {actionId}
      {nowMs}
      onReserve={onReserve}
      onCancel={onCancel}
      onOpenOneOnOneRequest={onOpenOneOnOneRequest}
      {onBuyCredits}
    />
    <div class="booking-agenda__footer" bind:this={loadMoreSentinel}>
      {#if loading}
        <p class="booking-agenda__footer-text">{t.calendar.loadMore.loading()}</p>
      {:else if canLoadMore}
        <p class="booking-agenda__footer-text">{t.calendar.loadMore.hint()}</p>
      {:else}
        <p class="booking-agenda__footer-text">{t.calendar.loadMore.end()}</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="booking-agenda">
    <AgendaPane
      paneTitle={typeFilter === "group_live"
        ? t.calendar.panes.groupTitle()
        : t.calendar.panes.oneOnOneTitle()}
      paneVariant={typeFilter === "group_live" ? "group" : "one_on_one"}
      groups={groups}
      listTypeFilter={typeFilter}
      emptyText={typeFilter === "group_live"
        ? t.calendar.panes.groupEmpty()
        : t.calendar.panes.oneOnOneEmpty()}
      {actionId}
      {nowMs}
      onReserve={onReserve}
      onCancel={onCancel}
      onOpenOneOnOneRequest={typeFilter !== "group_live" ? onOpenOneOnOneRequest : undefined}
      {onBuyCredits}
    />
    <div class="booking-agenda__footer" bind:this={loadMoreSentinel}>
      {#if loading}
        <p class="booking-agenda__footer-text">{t.calendar.loadMore.loading()}</p>
      {:else if canLoadMore}
        <p class="booking-agenda__footer-text">{t.calendar.loadMore.hint()}</p>
      {:else}
        <p class="booking-agenda__footer-text">{t.calendar.loadMore.end()}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .booking-agenda {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .booking-agenda--split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    align-items: start;
  }

  @media (max-width: 900px) {
    .booking-agenda--split {
      grid-template-columns: 1fr;
    }
  }

  .booking-agenda--split .booking-agenda__footer {
    grid-column: 1 / -1;
  }

  .booking-agenda__empty {
    margin: 0;
    padding: var(--space-4);
    border: var(--border);
    background: var(--elevated);
    text-align: center;
    color: var(--muted);
    line-height: 1.5;
    font-size: var(--step--1);
  }

  .booking-agenda__footer {
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2);
  }

  .booking-agenda__footer-text {
    margin: 0;
    font-size: var(--step--2);
    font-weight: 600;
    color: var(--muted);
    text-align: center;
  }
</style>
