<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { setCachedRole } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import LiveAlert from "./LiveAlert.svelte";
  import InstructorActions from "./InstructorActions.svelte";
  import ProfileSummary from "./ProfileSummary.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;

  let { profile, liveAlert, role, appProfile }: {
    profile: DashboardData["profile"];
    liveAlert: DashboardData["liveAlert"];
    role?: "customer" | "instructor" | "admin" | null;
    appProfile: DashboardData["appProfile"];
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
    background: linear-gradient(135deg, color-mix(in srgb, var(--white) 97%, var(--beige) 3%), var(--white));
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
