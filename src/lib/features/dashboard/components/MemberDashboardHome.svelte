<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import ContinueWatchingHero from "./ContinueWatchingHero.svelte";
  import DashboardLiveBoard from "./DashboardLiveBoard.svelte";
  import type { DashboardLiveItem } from "./DashboardLiveStrip.svelte";
  import "../dashboard.css";

  let { memberName }: { memberName?: string | null } = $props();

  const queryNow = useQueryNowMs();
  const upcomingQuery = useQuery(api.live.calendar.listUpcoming, () =>
    canRunAuthenticatedQuery() ? { now: queryNow.nowMs } : "skip",
  );

  const nowMs = $derived(queryNow.nowMs);

  const EMPTY_ARRAY: DashboardLiveItem[] = [];

  function isUpcomingLive(row: DashboardLiveItem, now: number) {
    return row.status !== "cancelled" && row.status !== "draft" && row.startsAt >= now;
  }
  function toLiveItem(row: DashboardLiveItem): DashboardLiveItem {
    return {
      _id: row._id,
      title: row.title,
      startsAt: row.startsAt,
      status: row.status,
      type: row.type,
    };
  }
  function buildUpcomingLives(rows: DashboardLiveItem[], now: number): DashboardLiveItem[] {
    return rows
      .filter((row) => isUpcomingLive(row, now))
      .slice(0, 24)
      .map(toLiveItem);
  }

  const upcomingLives = $derived(buildUpcomingLives(upcomingQuery.data ?? EMPTY_ARRAY, nowMs));

  function reloadPage() {
    window.location.reload();
  }
</script>

<div class="dashboard-home">
  <ContinueWatchingHero displayName={memberName} />

  <DashboardLiveBoard
    lives={upcomingLives}
    loading={upcomingQuery.isLoading}
    error={upcomingQuery.error?.message ?? null}
    {nowMs}
    onRetry={reloadPage}
  />
</div>
