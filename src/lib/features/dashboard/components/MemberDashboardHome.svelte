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

  const now = $derived(queryNow.nowMs);

  const upcomingLives = $derived.by((): DashboardLiveItem[] => {
    const rows = upcomingQuery.data ?? [];
    return rows
      .filter((row) => row.status !== "cancelled" && row.status !== "draft" && row.startsAt >= now)
      .slice(0, 24)
      .map((row) => ({
        _id: row._id,
        title: row.title,
        startsAt: row.startsAt,
        status: row.status,
        type: row.type,
      }));
  });
</script>

<div class="dashboard-home">
  <ContinueWatchingHero displayName={memberName} />

  <DashboardLiveBoard
    lives={upcomingLives}
    loading={upcomingQuery.isLoading}
    error={upcomingQuery.error?.message ?? null}
    {nowMs}
    onRetry={() => window.location.reload()}
  />
</div>
