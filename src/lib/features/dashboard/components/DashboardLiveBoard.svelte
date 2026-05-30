<script lang="ts">
  import { ToggleGroup } from "bits-ui";
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { liveRoomHref, routePath } from "$lib/i18n/context";
  import { formatLiveStartsAt } from "../lib/format";
  import type { DashboardLiveItem } from "./DashboardLiveStrip.svelte";
  import "../dashboard.css";

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  let {
    lives = [],
    loading = false,
    error = null,
    nowMs,
    onRetry,
  }: {
    lives?: DashboardLiveItem[];
    loading?: boolean;
    error?: string | null;
    nowMs: number;
    onRetry?: () => void;
  } = $props();

  const { t } = useI18n();

  let range = $state<"week" | "month">("week");

  const filteredLives = $derived.by(() => {
    const horizon = range === "week" ? WEEK_MS : MONTH_MS;
    const end = nowMs + horizon;
    return lives
      .filter((item) => item.startsAt >= nowMs && item.startsAt <= end)
      .sort((a, b) => a.startsAt - b.startsAt);
  });

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

<section class="live-board dashboard-panel" aria-labelledby="live-board-title">
  <header class="live-board__head">
    <h2 id="live-board-title" class="live-board__title">{t.dashboard.member.upcomingLives()}</h2>
    <a class="dashboard-link" href={routePath("uCalendar")}>{t.dashboard.viewAllLives()}</a>
  </header>

  <ToggleGroup.Root
    type="single"
    value={range}
    onValueChange={(value) => {
      if (value === "week" || value === "month") range = value;
    }}
    class="live-board__range"
    aria-label="טווח תאריכים"
  >
    <ToggleGroup.Item value="week" class="live-board__range-btn">
      {t.dashboard.member.liveBoardWeek()}
    </ToggleGroup.Item>
    <ToggleGroup.Item value="month" class="live-board__range-btn">
      {t.dashboard.member.liveBoardMonth()}
    </ToggleGroup.Item>
  </ToggleGroup.Root>

  <div class="live-board__body">
    {#if loading}
      <div class="dashboard-skeleton" aria-busy="true">
        <div class="dashboard-skeleton__bar"></div>
        <div class="dashboard-skeleton__bar"></div>
      </div>
    {:else if error}
      <p class="live-board__error">{error}</p>
      {#if onRetry}
        <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" onclick={onRetry}>
          {t.dashboard.retry()}
        </Button.Root>
      {/if}
    {:else if filteredLives.length === 0}
      <p class="live-board__empty">{t.dashboard.member.upcomingLivesEmpty()}</p>
    {:else}
      <ol class="live-board__list">
        {#each filteredLives as item (item._id)}
          <li>
            <a class="live-board__row" href={itemHref(item)}>
              <span class="live-board__title">{item.title}</span>
              <time class="live-board__when" datetime={new Date(item.startsAt).toISOString()}>
                {formatLiveStartsAt(item.startsAt)}
              </time>
              <span class="live-board__status" data-status={item.status}>{statusLabel(item)}</span>
            </a>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</section>

<style>
  .live-board {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .live-board__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    min-width: 0;
  }

  .live-board__title {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 700;
    line-height: var(--leading-snug);
  }

  :global(.live-board__range) {
    display: inline-flex;
    gap: var(--space-1);
    padding: 3px;
    border: var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    width: fit-content;
    max-width: 100%;
  }

  :global(.live-board__range-btn) {
    border: none;
    background: transparent;
    color: var(--foreground-muted);
    font-size: var(--text-sm);
    font-weight: 700;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition:
      background var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  :global(.live-board__range-btn[data-state="on"]) {
    background: var(--elevated);
    color: var(--ink);
    box-shadow: var(--shadow-sm);
  }

  :global(.live-board__range-btn:focus-visible) {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .live-board__body {
    min-height: 7.5rem;
  }

  .live-board__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    border: var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--elevated);
  }

  .live-board__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: var(--space-2) var(--space-3);
    align-items: center;
    padding: var(--space-3) var(--space-4);
    text-decoration: none;
    color: inherit;
    border-block-end: 1px solid color-mix(in oklch, var(--border-color) 55%, transparent);
    transition: background var(--duration-fast) var(--ease-out);
  }

  .live-board__list > li:last-child .live-board__row {
    border-block-end: none;
  }

  .live-board__row:hover {
    background: color-mix(in oklch, var(--accent) 6%, var(--elevated));
  }

  .live-board__row:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }

  .live-board__title {
    font-size: var(--text-sm);
    font-weight: 700;
    line-height: var(--leading-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .live-board__when {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--foreground-muted);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    direction: ltr;
  }

  .live-board__status {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .live-board__status[data-status="live"] {
    color: var(--danger);
  }

  .live-board__empty {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px dashed var(--line-light);
    background: color-mix(in oklch, var(--surface) 60%, transparent);
    color: var(--foreground-muted);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
    text-wrap: pretty;
  }

  .live-board__error {
    margin: 0 0 var(--space-2);
    color: var(--danger);
    font-size: var(--text-sm);
  }

  @media (max-width: 520px) {
    .live-board__row {
      grid-template-columns: 1fr;
      gap: var(--space-1);
    }

    .live-board__when {
      justify-self: start;
    }

    .live-board__status {
      justify-self: start;
    }
  }
</style>
