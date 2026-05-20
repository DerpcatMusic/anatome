<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import { initAuth, signOut } from "$lib/auth/session.svelte";


  const auth = initAuth();

  function openAuth() {
    window.dispatchEvent(new CustomEvent("homebody:auth-open"));
  }
</script>

<nav class="navbar" aria-label="ניווט ראשי">
  <div class="navbar__inner">
    <a class="navbar__brand" href="/">
      <span class="navbar__logo">HomeBody</span>
      <span class="navbar__divider">/</span>
      <span class="navbar__tagline">פילאטיס בבית</span>
    </a>

    <div class="navbar__actions">
      {#if auth.isLoading}
        <span class="navbar__status">טוען...</span>
      {:else if auth.isAuthenticated}
        <Button tone="sky" size="sm" onclick={() => window.location.assign("/u/dashboard")}>אזור אישי</Button>
        <Button tone="paper" size="sm" onclick={signOut}>יציאה</Button>
      {:else}
        <Button tone="ink" size="sm" onclick={openAuth}>כניסה</Button>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    height: 56px;
    background: var(--paper);
    border-bottom: var(--border);
  }

  .navbar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    height: 100%;
    padding: 0 clamp(16px, 3vw, 32px);
  }

  .navbar__brand {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    text-decoration: none;
    color: var(--ink);
  }

  .navbar__logo {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: var(--step-1);
    letter-spacing: -0.02em;
  }

  .navbar__divider {
    color: var(--line-light);
    font-family: var(--font-mono);
    font-size: var(--step--1);
  }

  .navbar__tagline {
    font-size: var(--step-0);
    color: var(--muted);
    font-weight: 600;
  }

  .navbar__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .navbar__status {
    font-size: var(--step-0);
    color: var(--muted);
    font-family: var(--font-mono);
  }

  @media (max-width: 520px) {
    .navbar__tagline {
      display: none;
    }

    .navbar__inner {
      padding: var(--space-3) 16px;
    }
  }
</style>
