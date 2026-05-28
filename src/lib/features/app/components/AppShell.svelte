<script lang="ts">
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import Dashboard from "$features/dashboard/components/Dashboard.svelte";
  import DashboardLoadingShell from "$features/dashboard/components/DashboardLoadingShell.svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { signOut } from "$lib/auth/session.svelte";

  import { useQuery } from "convex-svelte";
  import { initAuth, canRunAuthenticatedQuery, getCachedRole } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";

  const auth = initAuth();
  const appContext = getAppContext();
  const { t } = useI18n();
  const queryNow = useQueryNowMs();
  const query = useQuery(api.users.dashboard.get, () =>
    canRunAuthenticatedQuery() ? { now: queryNow.nowMs } : "skip",
  );

  const knownRole = $derived(
    (appContext.role ?? getCachedRole()) as "customer" | "instructor" | "admin" | null,
  );
  const waitingForAuth = $derived(auth.isAuthenticated && !canRunAuthenticatedQuery());
  const dashboardPending = $derived(
    auth.isAuthenticated &&
      canRunAuthenticatedQuery() &&
      (query.isLoading || (query.data === undefined && !query.error)),
  );
  const showDashboardSkeleton = $derived(dashboardPending && knownRole !== null);
</script>

{#if waitingForAuth || (dashboardPending && knownRole === null)}
  <div class="app-frame">
    <p>{t.app.loading()}</p>
  </div>
{:else if showDashboardSkeleton && knownRole}
  <DashboardLoadingShell role={knownRole} />
{:else if !auth.isAuthenticated}
  <div class="app-frame">
    <div class="locked">
      <h1>{t.app.locked.title()}</h1>
      <p>{t.app.locked.subtitle()}</p>
      <div class="locked__actions">
        <Button.Root class="hb-button hb-button--ink hb-button--md" type="button" onclick={() => window.location.assign('/')}>{t.app.locked.cta()}</Button.Root>
      </div>
    </div>
  </div>
{:else if query.error}
  <div class="app-frame">
    <p>{t.app.error()}: {query.error.message}</p>
  </div>
{:else if query.data?.needsOnboarding}
  <div class="app-frame">
    <div class="locked">
      <h1>{t.app.needsOnboarding.title()}</h1>
      <p>{t.app.needsOnboarding.subtitle()}</p>
      <div class="locked__actions">
        <Button.Root class="hb-button hb-button--ink hb-button--md" type="button" onclick={() => window.location.assign("/onboarding")}>{t.app.needsOnboarding.cta()}</Button.Root>
        <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" onclick={signOut}>יציאה</Button.Root>
      </div>
    </div>
  </div>
{:else if query.data}
  <Dashboard
    profile={query.data.profile}
    liveAlert={query.data.liveAlert}
    role={query.data.role}
    appProfile={query.data.appProfile}
    subscription={query.data.subscription}
    subscriptionPlan={query.data.subscriptionPlan}
    pendingSubscriptionPlan={query.data.pendingSubscriptionPlan}
    wallet={query.data.wallet}
    user={query.data.user}
  />
{/if}

<style>
  .app-frame {
    min-height: calc(100dvh - 56px);
    display: grid;
    place-items: center;
    padding: var(--space-6);

    /* Mesh gradient — same as AppLayout */
    background-color: var(--paper);
  }

  .locked {
    display: grid;
    place-content: center;
    text-align: center;
    gap: var(--space-4);
    max-width: 520px;
    width: 100%;
    padding: var(--space-7) var(--space-6);
    border: var(--border);
    background: var(--elevated);
  }

  h1 {
    font-size: var(--step-3);
    line-height: 1.1;
    margin: 0;
  }

  .locked p {
    color: var(--foreground-muted);
    max-width: 40ch;
    margin: 0;
  }

  .locked__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    margin-top: var(--space-2);
  }


</style>
