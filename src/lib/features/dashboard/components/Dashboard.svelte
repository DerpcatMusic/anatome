<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { setCachedRole } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import LiveAlert from "./LiveAlert.svelte";
  import InstructorActions from "./InstructorActions.svelte";
  import ProfileSummary from "./ProfileSummary.svelte";
  import SubscriptionManager from "./SubscriptionManager.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;

  let { profile, liveAlert, role, appProfile, subscription, subscriptionPlan, pendingSubscriptionPlan, wallet }: {
    profile: DashboardData["profile"];
    liveAlert: DashboardData["liveAlert"];
    role?: "customer" | "instructor" | "admin" | null;
    appProfile: DashboardData["appProfile"];
    subscription?: DashboardData["subscription"];
    subscriptionPlan?: DashboardData["subscriptionPlan"];
    pendingSubscriptionPlan?: DashboardData["pendingSubscriptionPlan"];
    wallet?: DashboardData["wallet"];
  } = $props();

  const isStaff = $derived(role === "instructor" || role === "admin");

  $effect(() => { if (role) setCachedRole(role); });

  const { t } = useI18n();
</script>

<PageShell
  title={isStaff ? t.dashboard.titleStaff() : t.dashboard.title()}
  kicker={t.dashboard.kicker()}
  description={isStaff ? t.dashboard.description.staff() : t.dashboard.description.customer()}
>
  <LiveAlert {liveAlert} />

  {#if isStaff}
    <ProfileSummary {isStaff} {appProfile} />
    <InstructorActions />
  {:else if profile}
    <SubscriptionManager
      subscription={subscription ?? null}
      subscriptionPlan={subscriptionPlan ?? null}
      pendingSubscriptionPlan={pendingSubscriptionPlan ?? null}
      wallet={wallet ?? null}
    />
    <ProfileSummary {isStaff} {profile} />
  {/if}

  <div class="empty-state">
    <p class="empty-state__kicker">{t.dashboard.empty.title()}</p>
    <p class="empty-state__text">
      {#if isStaff}
        {t.dashboard.empty.staff()}
      {:else}
        {t.dashboard.empty.customer()}
      {/if}
    </p>
  </div>
</PageShell>

<style>
  .empty-state {
    padding: var(--space-6);
    border: var(--border);
    background: linear-gradient(135deg, var(--white), var(--white));
  }

  .empty-state__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    margin: 0 0 var(--space-3);
  }

  .empty-state__text {
    color: var(--muted);
    font-size: var(--step-1);
    max-width: 50ch;
    margin: 0;
  }
</style>
