<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { routePath } from "$lib/i18n/context";
  import type { WalletLike } from "$lib/features/credits/balances";
  import ContinueWatchingHero from "./ContinueWatchingHero.svelte";
  import DashboardLiveStrip from "./DashboardLiveStrip.svelte";
  import type { DashboardLiveItem } from "./DashboardLiveStrip.svelte";
  import "../dashboard.css";

  let {
    memberName,
    wallet = null,
  }: {
    memberName?: string | null;
    wallet?: WalletLike | null;
  } = $props();

  const { t } = useI18n();

  const upcomingQuery = useQuery(api.live.calendar.listUpcoming, () =>
    canRunAuthenticatedQuery() ? {} : "skip",
  );

  const now = Date.now();

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
</script>

<div class="dashboard-home">
  <ContinueWatchingHero displayName={memberName} {wallet} />

  <DashboardLiveStrip
    lives={upcomingLives}
    loading={upcomingQuery.isLoading}
    error={upcomingQuery.error?.message ?? null}
    emptyText={t.dashboard.member.upcomingLivesEmpty()}
    viewAllHref={routePath("uCalendar")}
    onRetry={() => window.location.reload()}
  />
</div>
