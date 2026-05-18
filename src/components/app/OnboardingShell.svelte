<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../../convex/_generated/api";
  import { authQuery, initAuth, setCachedRole } from "../../lib/auth/session.svelte";
  import AppSkeleton from "./AppSkeleton.svelte";
  import AppLocked from "./AppLocked.svelte";
  import Notice from "../ui/Notice.svelte";
  import OnboardingForm from "./OnboardingForm.svelte";

  const auth = initAuth();
  let status = $state<"checking" | "locked" | "ready" | "done" | "error">("checking");
  let error = $state("");

  async function check() {
    if (!auth.isAuthenticated) { status = "locked"; return; }
    try {
      const dashboard = await authQuery(api.users.dashboard, {});
      if (dashboard === null) { status = "locked"; }
      else {
        if (dashboard.role) setCachedRole(dashboard.role);
        if (dashboard.role === "instructor" || dashboard.role === "admin") {
          status = "done";
          window.location.assign("/dashboard");
        } else if (!dashboard.needsOnboarding) {
          status = "done";
          window.location.assign("/dashboard");
        } else {
          status = "ready";
        }
      }
    } catch (reason) {
      status = "error";
      error = reason instanceof Error ? reason.message : "לא הצלחנו לטעון אונבורדינג.";
    }
  }

  onMount(() => { void check(); });
</script>

<section class="onboarding-page">
  {#if status === "checking" || status === "done"}
    <AppSkeleton width="70%" />
  {:else if status === "locked"}
    <AppLocked
      title="צריך להתחבר קודם"
      subtitle="כדי להתחיל את ההתאמה האישית, נכנסים עם כתובת אימייל."
    >
      {#snippet actions()}
        <a href="/">לעמוד הראשי</a>
      {/snippet}
    </AppLocked>
  {:else if status === "error"}
    <div class="max-w-md mx-auto mt-20">
      <Notice tone="danger">{error}</Notice>
    </div>
  {:else}
    <OnboardingForm redirectTo="/dashboard" />
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
