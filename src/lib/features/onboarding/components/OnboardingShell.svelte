<script lang="ts">
  import { api } from "$convex/_generated/api";
  import {
    authMutation,
    authQuery,
    dashboardPathForRole,
    initAuth,
    setCachedRole,
    canRunAuthenticatedQuery,
  } from "$lib/auth/session.svelte";

  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useQuery } from "convex-svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import AppSkeleton from "$features/app/components/AppSkeleton.svelte";
  import AppLocked from "$features/app/components/AppLocked.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import OnboardingForm from "./OnboardingForm.svelte";

  const auth = initAuth();
  const { t } = useI18n();

  const queryNow = useQueryNowMs();
  /** Optional enrichment once WS auth is ready (display name). */
  const dashboardQuery = useQuery(api.users.dashboard.get, () =>
    canRunAuthenticatedQuery() ? { now: queryNow.nowMs } : "skip",
  );

  let status = $state<"checking" | "locked" | "ready" | "done" | "error">("checking");
  let error = $state("");

  $effect(() => {
    if (auth.isLoading) {
      status = "checking";
      return;
    }
    if (!auth.isAuthenticated) {
      status = "locked";
      return;
    }

    let cancelled = false;
    status = "checking";

    void (async () => {
      try {
        const session = await authQuery(api.users.session.resolve, {});
        if (cancelled) return;

        if (session === null) {
          status = "locked";
          return;
        }

        const role = session.role ?? "customer";
        setCachedRole(role);

        if (!session.needsOnboarding) {
          status = "done";
          window.location.assign(dashboardPathForRole(role, false));
          return;
        }

        status = "ready";
        void authMutation(api.users.bootstrap.ensureAppProfile, {}).catch(() => {
          /* Best-effort; onboarding.complete also ensures profile */
        });
      } catch (reason) {
        if (cancelled) return;
        status = "error";
        error =
          reason instanceof Error ? reason.message : "לא הצלחנו לטעון את החשבון";
      }
    })();

    return () => {
      cancelled = true;
    };
  });

  const initialDisplayName = $derived(
    dashboardQuery.data?.appProfile?.displayName ?? null,
  );
</script>

<section class="onboarding-page">
  {#if status === "checking" || status === "done"}
    <div class="onboarding-page__child"><AppSkeleton width="70%" /></div>
  {:else if status === "locked"}
    <div class="onboarding-page__child"><AppLocked
      title={t.onboarding.locked.title()}
      subtitle={t.onboarding.locked.subtitle()}
    >
      {#snippet actions()}
        <a href="/">{t.nav.backHome()}</a>
      {/snippet}
    </AppLocked></div>
  {:else if status === "error"}
    <div class="onboarding-page__child"><div class="max-w-md mx-auto mt-20">
      <Notice tone="danger">{error}</Notice>
    </div></div>
  {:else}
    <div class="onboarding-page__child">
      <OnboardingForm
        redirectTo="/u/dashboard"
        initialDisplayName={initialDisplayName}
      />
    </div>
  {/if}
</section>

<style>
  .onboarding-page {
    min-height: calc(100dvh - 56px);
  }

  .onboarding-page__child {
    min-height: calc(100dvh - 56px);
  }
</style>
