<script lang="ts">
  import { api } from "../../../convex/_generated/api";
  import Dashboard from "./Dashboard.svelte";
  import { signOut } from "../../lib/auth/session.svelte";
  import { useAuthQuery } from "../../lib/convex/useAuthQuery.svelte";
  import AuthGuard from "./AuthGuard.svelte";
  import AppSkeleton from "./AppSkeleton.svelte";
  import AppLocked from "./AppLocked.svelte";
  import Notice from "../ui/Notice.svelte";

  const dashboardResource = useAuthQuery(api.users.dashboard, {}, { initialValue: null });

  const current = $derived(dashboardResource.current);
  const loading = $derived(dashboardResource.loading);
  const error = $derived(dashboardResource.error);
</script>

<AuthGuard>
  {#if loading}
    <div class="app-frame">
      <AppSkeleton />
    </div>
  {:else if error}
    <div class="app-frame">
      <AppLocked title="לא הצלחנו לטעון" subtitle="">
        {#snippet actions()}
          <Notice tone="danger">{error.message}</Notice>
          <button onclick={() => dashboardResource.refetch()}>לנסות שוב</button>
        {/snippet}
      </AppLocked>
    </div>
  {:else if current === null}
    <div class="app-frame">
      <AppLocked
        title="צריך להתחבר"
        subtitle="החשבון נעול. נכנסים מחדש דרך העמוד הראשי."
      >
        {#snippet actions()}
          <a href="/">כניסה</a>
        {/snippet}
      </AppLocked>
    </div>
  {:else if current.needsOnboarding}
    <div class="app-frame">
      <AppLocked
        kicker="כמעט שם"
        title="צריך לסיים התאמה אישית"
        subtitle="קצר, פשוט, ויעזור לנו להתאים לך שיעורים."
      >
        {#snippet actions()}
          <a href="/onboarding">להמשיך בהתאמה</a>
          <button onclick={signOut}>יציאה</button>
        {/snippet}
      </AppLocked>
    </div>
  {:else}
    <Dashboard profile={current.profile} liveAlert={current.liveAlert} role={current.role} appProfile={current.appProfile} />
  {/if}
</AuthGuard>

<style>
  .app-frame {
    min-height: calc(100vh - 56px);
    display: grid;
    place-items: center;
    padding: var(--space-6);

    /* Mesh gradient — same as AppLayout */
    background-color: var(--paper);
    background-image:
      radial-gradient(ellipse 70% 50% at 20% 30%, color-mix(in srgb, var(--sky) 28%, transparent), transparent 55%),
      radial-gradient(ellipse 50% 70% at 80% 20%, color-mix(in srgb, var(--beige) 32%, transparent), transparent 50%),
      radial-gradient(ellipse 60% 40% at 50% 80%, color-mix(in srgb, var(--sky-soft) 22%, transparent), transparent 50%);
    background-size: 180% 180%;
    animation: mesh-drift 24s ease-in-out infinite alternate;
  }

  @keyframes mesh-drift {
    0% { background-position: 0% 0%, 100% 0%, 50% 100%; }
    50% { background-position: 8% 12%, 92% 8%, 48% 92%; }
    100% { background-position: 15% 5%, 85% 15%, 45% 85%; }
  }
</style>
