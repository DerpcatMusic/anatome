<script lang="ts">
  import { api } from "$convex/_generated/api";
  import Dashboard from "$features/dashboard/components/Dashboard.svelte";
  import { signOut } from "$lib/auth/session.svelte";
  import { routePath } from "$lib/i18n/context";
  import { useQuery } from "convex-svelte";
  import { initAuth } from "$lib/auth/session.svelte";

  const auth = initAuth();
  const query = useQuery(api.users.dashboard, () => auth.isAuthenticated ? {} : "skip");
</script>

{#if query.isLoading}
  <div class="app-frame">
    <p>טוען...</p>
  </div>
{:else if !auth.isAuthenticated}
  <div class="app-frame">
    <div class="locked">
      <p class="locked__kicker">HomeBody</p>
      <h1>צריך להתחבר</h1>
      <p>כדי לפתוח את האזור האישי, נכנסים עם כתובת אימייל.</p>
      <div class="locked__actions">
        <a href="/">כניסה</a>
      </div>
    </div>
  </div>
{:else if query.error}
  <div class="app-frame">
    <p>שגיאה: {query.error.message}</p>
  </div>
{:else if query.data?.needsOnboarding}
  <div class="app-frame">
    <div class="locked">
      <p class="locked__kicker">כמעט שם</p>
      <h1>צריך לסיים התאמה אישית</h1>
      <p>קצר, פשוט, ויעזור לנו להתאים לך שיעורים.</p>
      <div class="locked__actions">
        <a href={routePath("onboarding")}>להמשיך בהתאמה</a>
        <button onclick={signOut}>יציאה</button>
      </div>
    </div>
  </div>
{:else if query.data}
  <Dashboard profile={query.data.profile} liveAlert={query.data.liveAlert} role={query.data.role} appProfile={query.data.appProfile} />
{/if}

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

  .locked {
    display: grid;
    place-content: center;
    text-align: center;
    gap: var(--space-4);
    max-width: 520px;
    width: 100%;
    padding: var(--space-7) var(--space-6);
    border: var(--border);
    background: var(--white);
  }

  .locked__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    margin: 0;
  }

  h1 {
    font-size: var(--step-3);
    line-height: 1.1;
    margin: 0;
  }

  .locked p {
    color: var(--muted);
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

  .locked__actions a,
  .locked__actions button {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding-inline: var(--space-5);
    font-weight: 700;
    font-size: var(--step--1);
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
  }

  .locked__actions a:hover,
  .locked__actions button:hover {
    background: var(--ink-secondary);
  }
</style>
