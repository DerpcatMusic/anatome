<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { routePath } from "$lib/i18n/context";
  import HorizontalVideoRow from "$features/videos/components/HorizontalVideoRow.svelte";
  import type { RowVideo } from "$features/videos/components/HorizontalVideoRow.svelte";
  import ContinueWatchingHero from "./ContinueWatchingHero.svelte";
  import DashboardLiveStrip from "./DashboardLiveStrip.svelte";
  import type { DashboardLiveItem } from "./DashboardLiveStrip.svelte";
  import "../dashboard.css";

  let {
    memberName,
  }: {
    memberName?: string | null;
  } = $props();

  const auth = initAuth();
  const { t } = useI18n();

  const catalogQuery = useQuery(api.video.catalog.listCatalog, () =>
    auth.isAuthenticated ? {} : "skip",
  );
  const upcomingQuery = useQuery(api.live.calendar.listUpcoming, () =>
    auth.isAuthenticated ? {} : "skip",
  );

  const now = Date.now();

  const latestVideos = $derived.by((): RowVideo[] => {
    const data = catalogQuery.data;
    if (!data) return [];
    const micro = data.categoryGroups.flatMap((group) => group.items);
    const merged = [...data.macroflowVideos, ...micro];
    const seen = new Set<string>();
    const rows: RowVideo[] = [];
    for (const video of merged) {
      if (seen.has(video._id)) continue;
      seen.add(video._id);
      rows.push({
        _id: video._id,
        title: video.title,
        durationSeconds: video.durationSeconds,
        thumbnailUrl: video.thumbnailUrl,
        locked: video.locked,
        owned: video.owned,
        accessible: video.accessible,
        accessKind: video.accessKind,
      });
      if (rows.length >= 10) break;
    }
    return rows;
  });

  const upcomingLives = $derived.by((): DashboardLiveItem[] => {
    const rows = upcomingQuery.data ?? [];
    return rows
      .filter((row) => row.status !== "cancelled" && row.status !== "draft" && row.startsAt >= now)
      .slice(0, 8)
      .map((row) => ({
        _id: row._id,
        title: row.title,
        startsAt: row.startsAt,
        status: row.status,
        type: row.type,
      }));
  });

  function openVideo(video: RowVideo) {
    if (!video.accessible && video.locked) {
      window.location.assign(routePath("library"));
      return;
    }
    window.location.assign(`${routePath("watch")}?videoId=${video._id}`);
  }
</script>

<div class="dashboard-home">
  <ContinueWatchingHero displayName={memberName} />

  <div class="dashboard-home__discovery">
    {#if catalogQuery.isLoading}
      <div class="dashboard-skeleton dashboard-panel" aria-busy="true">
        <div class="dashboard-skeleton__bar"></div>
        <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
      </div>
    {:else}
      <HorizontalVideoRow
        title={t.dashboard.member.latestVideos()}
        videos={latestVideos}
        emptyMessage={t.dashboard.member.latestVideosEmpty()}
        onSelect={openVideo}
      />
    {/if}

    {#if catalogQuery.error}
      <p class="dashboard-home__error">{catalogQuery.error.message}</p>
    {/if}

    <DashboardLiveStrip
      title={t.dashboard.member.upcomingLives()}
      lives={upcomingLives}
      loading={upcomingQuery.isLoading}
      error={upcomingQuery.error?.message ?? null}
      emptyKicker=""
      emptyText={t.calendar.empty.upcomingText()}
      viewAllHref={routePath("uCalendar")}
      onRetry={() => window.location.reload()}
    />
  </div>
</div>

<style>
  .dashboard-home__discovery {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .dashboard-home__error {
    margin: 0;
    color: var(--danger);
    font-size: var(--step--1);
  }

  .dashboard-home__discovery :global(.video-row) {
    min-width: 0;
  }
</style>
