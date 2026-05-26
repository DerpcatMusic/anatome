<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { Button } from "bits-ui";
  import { useQuery } from "convex-svelte";
  import { initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { liveRoomHref, routePath } from "$lib/i18n/context";
  import { formatLiveStartsAt } from "../lib/format";
  import type { DashboardLiveItem } from "./DashboardLiveStrip.svelte";
  import "../dashboard.css";

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];

  const auth = initAuth();
  const { t } = useI18n();
  const classesQuery = useQuery(api.live.class.listMine, () =>
    auth.isAuthenticated ? {} : "skip",
  );

  const now = Date.now();

  const upcoming = $derived.by((): DashboardLiveItem[] => {
    const rows = classesQuery.data ?? [];
    return rows
      .filter(
        (row: LiveClass) =>
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
            : `${routePath("iLive")}?classId=${row._id}`,
      }));
  });
</script>

<section class="dashboard-panel instructor-agenda" aria-labelledby="instructor-agenda-title">
  <header class="dashboard-panel__head">
    <h3 id="instructor-agenda-title" class="dashboard-panel__title instructor-agenda__title">
      {t.dashboard.instructor.upcomingTitle()}
    </h3>
    <a class="dashboard-link" href={routePath("iLive")}>{t.dashboard.instructor.openStudio()}</a>
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
      onclick={() => window.location.reload()}
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
            <span class="instructor-agenda__when">{formatLiveStartsAt(item.startsAt)}</span>
            <span class="instructor-agenda__title">{item.title}</span>
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
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .instructor-agenda__row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-3);
    border: var(--border);
    background: var(--paper);
    text-decoration: none;
    color: inherit;
    min-width: 0;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .instructor-agenda__row:hover {
    background: color-mix(in oklch, var(--secondary-cool) 8%, var(--paper));
  }

  .instructor-agenda__when {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    white-space: nowrap;
  }

  .instructor-agenda__title {
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .instructor-agenda__badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
  }

  .instructor-agenda__badge[data-status="live"] {
    color: var(--danger);
  }

  .instructor-agenda__empty,
  .instructor-agenda__error {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
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
