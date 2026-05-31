<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { Button } from "bits-ui";
  import { useQuery } from "convex-svelte";
  import { initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { liveRoomHref, routePath } from "$lib/i18n/context";
  import { formatLiveStartsAt } from "../lib/format";
  import type { DashboardLiveItem } from "./DashboardLiveStrip.svelte";
  import "../dashboard.css";

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];

  const auth = initAuth();
  const { t } = useI18n();
  const queryNow = useQueryNowMs();
  const classesQuery = useQuery(api.live.class.listMine, () =>
    canRunAuthenticatedQuery() ? { now: queryNow.nowMs } : "skip",
  );

  const now = $derived(queryNow.nowMs);

  const EMPTY_ARRAY: LiveClass[] = [];

  function buildUpcomingAgenda(rows: LiveClass[], now: number): DashboardLiveItem[] {
    return rows
      .filter(
        (row) =>
          (row.status === "scheduled" || row.status === "live") && row.startsAt >= now - 30 * 60 * 1000,
      )
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, 6)
      .map((row) => ({
        _id: row._id,
        title: row.title,
        startsAt: row.startsAt,
        status: row.status,
        type: row.type,
        href:
          row.status === "live"
            ? liveRoomHref(row._id)
            : `${routePath("iCalendar")}?classId=${row._id}`,
      }));
  }

  const upcoming = $derived(buildUpcomingAgenda(classesQuery.data ?? EMPTY_ARRAY, now));

  function reloadPage() {
    window.location.reload();
  }
</script>

<section class="dashboard-panel instructor-agenda" aria-labelledby="instructor-agenda-title">
  <header class="dashboard-panel__head">
    <h3 id="instructor-agenda-title" class="dashboard-panel__title instructor-agenda__title">
      {t.dashboard.instructor.upcomingTitle()}
    </h3>
    <a class="dashboard-link" href={routePath("iCalendar")}>{t.dashboard.instructor.openStudio()}</a>
  </header>

  {#if classesQuery.isLoading}
    <div class="dashboard-skeleton" aria-busy="true">
      <div class="dashboard-skeleton__bar"></div>
      <div class="dashboard-skeleton__bar"></div>
      <div class="dashboard-skeleton__bar"></div>
    </div>
  {:else if classesQuery.error}
    <p class="instructor-agenda__error">{classesQuery.error.message}</p>
    <Button.Root
      class="hb-button hb-button--paper hb-button--sm"
      type="button"
      onclick={reloadPage}
    >
      {t.dashboard.retry()}
    </Button.Root>
  {:else if upcoming.length === 0}
    <p class="instructor-agenda__empty">{t.dashboard.instructor.upcomingEmpty()}</p>
  {:else}
    <ol class="instructor-agenda__list">
      {#each upcoming as item (item._id)}
        <li>
          <a class="instructor-agenda__row" href={item.href}>
            <span class="instructor-agenda__title">{item.title}</span>
            <span class="instructor-agenda__when">{formatLiveStartsAt(item.startsAt)}</span>
            <span class="instructor-agenda__badge" data-status={item.status}>
              {item.status === "live"
                ? t.dashboard.liveStatus.live()
                : t.dashboard.liveStatus.scheduled()}
            </span>
          </a>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .instructor-agenda {
    min-width: 0;
  }

  .instructor-agenda__title {
    margin: 0;
  }

  .instructor-agenda__list {
    list-style: none;
    margin: calc(-1 * var(--space-1)) calc(-1 * var(--space-4)) calc(-1 * var(--space-3));
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
  }

  .instructor-agenda__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: var(--space-2) var(--space-3);
    align-items: center;
    padding: var(--space-3) var(--space-4);
    border-block-end: 1px solid color-mix(in oklch, var(--border-color) 55%, transparent);
    text-decoration: none;
    color: inherit;
    min-width: 0;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .instructor-agenda__list > li:last-child .instructor-agenda__row {
    border-block-end: none;
    padding-block-end: 0;
  }

  .instructor-agenda__list > li:first-child .instructor-agenda__row {
    padding-block-start: 0;
  }

  .instructor-agenda__row:hover {
    background: color-mix(in oklch, var(--accent) 6%, var(--elevated));
  }

  .instructor-agenda__row:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }

  .instructor-agenda__when {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--foreground-muted);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .instructor-agenda__title {
    font-size: var(--text-base);
    font-weight: 700;
    line-height: var(--leading-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .instructor-agenda__badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: var(--tracking-caps);
    text-transform: uppercase;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .instructor-agenda__badge[data-status="live"] {
    color: var(--danger);
  }

  .instructor-agenda__empty {
    margin: 0;
    padding: var(--space-4);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    text-align: center;
    color: var(--foreground-muted);
    border: 1px dashed color-mix(in oklch, var(--border-color) 70%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 50%, transparent);
    text-wrap: pretty;
  }

  .instructor-agenda__error {
    margin: 0;
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    color: var(--foreground-muted);
  }

  .instructor-agenda__error {
    color: var(--danger);
    margin-block-end: var(--space-3);
  }

  @media (max-width: 520px) {
    .instructor-agenda__row {
      grid-template-columns: 1fr;
      gap: var(--space-1);
    }
  }
</style>
