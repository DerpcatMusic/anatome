<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { page } from "$app/state";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import LiveAlert from "./LiveAlert.svelte";
  import MemberDashboardHome from "./MemberDashboardHome.svelte";
  import MemberLatestVideosRail from "./MemberLatestVideosRail.svelte";
  import InstructorDashboardHome from "./InstructorDashboardHome.svelte";
  import DashboardWalletAside from "./DashboardWalletAside.svelte";
  import DashboardQuickLinks from "./DashboardQuickLinks.svelte";
  import DashboardAccountPanel from "./DashboardAccountPanel.svelte";
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

  let accountOpen = $state(false);

  $effect(() => {
    accountOpen = page.url.searchParams.get("panel") === "account";
  });

  const dashboardPayload = $derived({
    profile,
    liveAlert,
    role: role ?? null,
    appProfile,
    subscription: subscription ?? null,
    subscriptionPlan: subscriptionPlan ?? null,
    pendingSubscriptionPlan: pendingSubscriptionPlan ?? null,
    wallet: wallet ?? null,
    user: user ?? null,
    needsOnboarding: false,
  } as DashboardData);
</script>

<PageShell title={isStaff ? t.dashboard.titleStaff() : t.dashboard.title()}>
  <div class="dashboard-shell">
    <LiveAlert {liveAlert} />

    {#if isStaff}
      <InstructorDashboardHome {appProfile} />

      <DashboardAccountPanel bind:open={accountOpen} isStaff={true} dashboard={dashboardPayload} />
    {:else}
      <div class="dashboard-shell--member">
        <div class="dashboard-home__grid dashboard-home__grid--member">
          <MemberDashboardHome {memberName} />
          <aside class="dashboard-shell__aside">
            <DashboardWalletAside {wallet} {subscriptionPlan} />
          </aside>
        </div>

        <DashboardQuickLinks />

        <DashboardAccountPanel bind:open={accountOpen} isStaff={false} dashboard={dashboardPayload} />

        <div class="dashboard-shell__rail">
          <MemberLatestVideosRail />
        </div>
      </div>
    {/if}
  </div>
</PageShell>
