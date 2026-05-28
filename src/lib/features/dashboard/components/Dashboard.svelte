<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import LiveAlert from "./LiveAlert.svelte";
  import MemberDashboardHome from "./MemberDashboardHome.svelte";
  import MemberLatestVideosRail from "./MemberLatestVideosRail.svelte";
  import InstructorDashboardHome from "./InstructorDashboardHome.svelte";
  import ProfileSummary from "./ProfileSummary.svelte";
  import SubscriptionManager from "./SubscriptionManager.svelte";
  import "../dashboard.css";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;

  let {
    profile,
    liveAlert,
    role,
    appProfile,
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    wallet,
    user,
  }: {
    profile: DashboardData["profile"];
    liveAlert: DashboardData["liveAlert"];
    role?: "customer" | "instructor" | "admin" | null;
    appProfile: DashboardData["appProfile"];
    subscription?: DashboardData["subscription"];
    subscriptionPlan?: DashboardData["subscriptionPlan"];
    pendingSubscriptionPlan?: DashboardData["pendingSubscriptionPlan"];
    wallet?: DashboardData["wallet"];
    user?: DashboardData["user"];
  } = $props();

  const isStaff = $derived(role === "instructor" || role === "admin");

  const { t } = useI18n();

  const memberName = $derived(
    user?.name?.trim() || appProfile?.displayName?.trim() || null,
  );
</script>

<PageShell title={isStaff ? t.dashboard.titleStaff() : t.dashboard.title()}>
  <div class="dashboard-shell">
    <LiveAlert {liveAlert} />

    {#if isStaff}
      <InstructorDashboardHome {appProfile} />
    {:else}
      <div class="dashboard-shell--member">
        <div class="dashboard-home__grid dashboard-home__grid--member">
          <MemberDashboardHome {memberName} />
          <aside class="dashboard-shell__aside">
            <SubscriptionManager
              subscription={subscription ?? null}
              subscriptionPlan={subscriptionPlan ?? null}
              pendingSubscriptionPlan={pendingSubscriptionPlan ?? null}
            />
            {#if profile}
              <ProfileSummary isStaff={false} {profile} showEditLink />
            {/if}
          </aside>
        </div>
        <MemberLatestVideosRail />
      </div>
    {/if}
  </div>
</PageShell>

<style>
  .dashboard-shell {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .dashboard-shell__aside {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .dashboard-shell--member {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-width: 0;
  }

</style>
