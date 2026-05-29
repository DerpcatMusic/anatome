<script lang="ts">
  import { horizontalWheelScroll } from "$lib/actions/horizontal-wheel-scroll";
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { liveRoomHref, routePath } from "$lib/i18n/context";
  import { formatLiveStartsAt } from "../lib/format";
  import "../dashboard.css";

  export type DashboardLiveItem = {
    _id: string;
    title: string;
    startsAt: number;
    status: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    type?: "group_live" | "one_on_one";
    href?: string;
  };

  let {
    lives = [],
    loading = false,
    error = null,
    emptyText,
    viewAllHref = routePath("uCalendar"),
    viewAllLabel,
    onRetry,
    manageHref,
  }: {
    lives?: DashboardLiveItem[];
    loading?: boolean;
    error?: string | null;
    emptyText: string;
    viewAllHref?: string;
    viewAllLabel?: string;
    onRetry?: () => void;
    manageHref?: string;
  } = $props();

  const { t } = useI18n();
  const allLabel = $derived(viewAllLabel ?? t.dashboard.viewAllLives());

  function itemHref(item: DashboardLiveItem): string {
    if (item.href) return item.href;
    if (item.status === "live") return liveRoomHref(item._id);
    return routePath("uCalendar");
  }

  function statusLabel(item: DashboardLiveItem): string {
    if (item.status === "live") return t.dashboard.liveStatus.live();
    if (item.type === "one_on_one") return t.dashboard.liveStatus.oneOnOne();
    return t.dashboard.liveStatus.scheduled();
  }
</script>

<section class="live-strip" aria-label={t.dashboard.member.upcomingLivesAria()}>
  <div class="live-strip__head">
    <p class="live-strip__kicker dashboard-panel__kicker">{t.dashboard.member.upcomingLives()}</p>
    <div class="live-strip__toolbar">
      {#if manageHref}
        <a class="dashboard-link" href={manageHref}>{t.dashboard.instructor.openStudio()}</a>
      {/if}
      <a class="dashboard-link" href={viewAllHref}>{allLabel}</a>
    </div>
  </div>

  {#if loading}
    <div class="dashboard-skeleton" aria-busy="true">
      <div class="dashboard-skeleton__bar"></div>
      <div class="dashboard-skeleton__bar"></div>
    </div>
  {:else if error}
    <p class="live-strip__error">{error}</p>
    {#if onRetry}
      <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" onclick={onRetry}>
        {t.dashboard.retry()}
      </Button.Root>
    {/if}
  {:else if lives.length === 0}
    <p class="live-strip__empty-text">{emptyText}</p>
  {:else}
    <ul class="live-strip__list" role="list" use:horizontalWheelScroll={true}>
      {#each lives as item (item._id)}
        <li>
          <a class="live-strip__item" href={itemHref(item)}>
            <span class="live-strip__status" data-status={item.status}>{statusLabel(item)}</span>
            <span class="live-strip__title">{item.title}</span>
            <time class="live-strip__when" datetime={new Date(item.startsAt).toISOString()}>
              {formatLiveStartsAt(item.startsAt)}
            </time>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .live-strip {
    min-width: 0;
  }

  .live-strip__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-block-end: var(--space-2);
    min-width: 0;
  }

  .live-strip__kicker {
    margin: 0;
  }

  .live-strip__toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .live-strip__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: var(--space-3);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    padding-block-end: var(--space-1);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .live-strip__item {
    display: grid;
    gap: var(--space-1);
    min-width: min(240px, 78vw);
    max-width: 280px;
    padding: var(--space-3);
    border: var(--border);
    background: var(--elevated);
    text-decoration: none;
    color: inherit;
    scroll-snap-align: start;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .live-strip__item:hover {
    background: color-mix(in oklch, var(--accent) 10%, var(--elevated));
  }

  .live-strip__item:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .live-strip__status {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }

  .live-strip__status[data-status="live"] {
    color: var(--danger);
  }

  .live-strip__title {
    font-size: var(--text-base);
    font-weight: 700;
    line-height: var(--leading-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .live-strip__when {
    font-size: var(--text-sm);
    color: var(--foreground-muted);
    font-variant-numeric: tabular-nums;
  }

  .live-strip__empty-text {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px dashed var(--line-light);
    background: color-mix(in oklch, var(--surface) 60%, transparent);
    color: var(--foreground-muted);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
  }

  .live-strip__error {
    margin: 0 0 var(--space-3);
    color: var(--danger);
  }
</style>
