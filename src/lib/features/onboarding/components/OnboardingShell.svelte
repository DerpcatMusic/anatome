<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { initAuth, setCachedRole } from "$lib/auth/session.svelte";
  import { routePath } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useQuery } from "convex-svelte";
  import AppSkeleton from "$features/app/components/AppSkeleton.svelte";
  import AppLocked from "$features/app/components/AppLocked.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import OnboardingForm from "./OnboardingForm.svelte";

  const auth = initAuth();
  const { t } = useI18n();

  const dashboardQuery = useQuery(api.users.dashboard, () => auth.isAuthenticated ? {} : 'skip');

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
    if (dashboardQuery.isLoading) {
      status = "checking";
      return;
    }
    if (dashboardQuery.error) {
      status = "error";
      error = dashboardQuery.error.message;
      return;
    }
    const dashboard = dashboardQuery.data;
    if (dashboard === null) {
      status = "locked";
    } else {
      if (dashboard.role) setCachedRole(dashboard.role);
      if (dashboard.role === "instructor" || dashboard.role === "admin") {
        status = "done";
        window.location.assign(routePath("dashboard"));
      } else if (!dashboard.needsOnboarding) {
        status = "done";
        window.location.assign(routePath("dashboard"));
      } else {
        status = "ready";
      }
    }
  });
</script>

<section class="onboarding-page">
  {#if status === "checking" || status === "done"}
    <AppSkeleton width="70%" />
  {:else if status === "locked"}
    <AppLocked
      title={t.onboarding.locked.title()}
      subtitle={t.onboarding.locked.subtitle()}
    >
      {#snippet actions()}
        <a href="/">{t.nav.backHome()}</a>
      {/snippet}
    </AppLocked>
  {:else if status === "error"}
    <div class="max-w-md mx-auto mt-20">
      <Notice tone="danger">{error}</Notice>
    </div>
  {:else}
    <OnboardingForm redirectTo={routePath("dashboard")} />
  {/if}
</section>

<style>
  .onboarding-page {
    min-height: calc(100vh - 56px);
  }

  .onboarding-page :global(> *) {
    min-height: calc(100vh - 56px);
  }
</style>
