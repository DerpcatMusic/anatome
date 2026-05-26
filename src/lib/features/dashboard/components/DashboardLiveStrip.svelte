<script lang="ts">
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
    title,
    lives = [],
    loading = false,
    error = null,
    emptyKicker,
    emptyText,
    viewAllHref = routePath("uCalendar"),
    viewAllLabel,
    onRetry,
    manageHref,
  }: {
    title: string;
    lives?: DashboardLiveItem[];
    loading?: boolean;
    error?: string | null;
    emptyKicker: string;
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

<section class="dashboard-panel dashboard-panel--cool live-strip" aria-labelledby="live-strip-title">
  <header class="dashboard-panel__head">
    <h3 id="live-strip-title" class="dashboard-panel__title live-strip__title-only">{title}</h3>
    <div class="dashboard-panel__actions">
      {#if manageHref}
        <a class="dashboard-link" href={manageHref}>{t.dashboard.instructor.openStudio()}</a>
      {/if}
      <a class="dashboard-link" href={viewAllHref}>{allLabel}</a>
    </div>
  </header>

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
    <p class="live-strip__empty-text">{emptyText || emptyKicker}</p>
  {:else}
    <ul class="live-strip__list" role="list">
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

  .live-strip__title-only {
    margin: 0;
  }

  .live-strip__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: var(--space-3);
    overflow-x: auto;
    scroll-snap-type: x proximity;
    padding-block-end: var(--space-1);
    -webkit-overflow-scrolling: touch;
  }

  .live-strip__item {
    display: grid;
    gap: var(--space-1);
    min-width: min(240px, 78vw);
    max-width: 280px;
    padding: var(--space-3);
    border: var(--border);
    background: var(--paper);
    text-decoration: none;
    color: inherit;
    scroll-snap-align: start;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .live-strip__item:hover {
    background: color-mix(in oklch, var(--accent) 10%, var(--paper));
  }

  .live-strip__status {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }

  .live-strip__status[data-status="live"] {
    color: var(--danger);
  }

  .live-strip__title {
    font-weight: 700;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .live-strip__when {
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .live-strip__empty-text {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .live-strip__error {
    margin: 0 0 var(--space-3);
    color: var(--danger);
  }
</style>
