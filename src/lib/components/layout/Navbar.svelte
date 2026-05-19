<script lang="ts">
  import { initAuth, signOut } from "$lib/auth/session.svelte";
  import { routePath } from "$lib/i18n/context";

  const auth = initAuth();

  function openAuth() {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
      overlay.classList.add("is-open");
      setTimeout(() => overlay.querySelector("input")?.focus(), 100);
    }
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
        <a class="navbar__link navbar__link--primary" href={routePath("dashboard")}>אזור אישי</a>
        <button class="navbar__btn" type="button" onclick={signOut}>יציאה</button>
      {:else}
        <button class="navbar__btn navbar__btn--primary" type="button" onclick={openAuth}>כניסה</button>
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

  .navbar__link {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding-inline: var(--space-4);
    font-size: var(--step-0);
    font-weight: 700;
    text-decoration: none;
    color: var(--ink);
    border: var(--border);
    background: var(--white);
    transition: background var(--duration-fast);
  }

  .navbar__link:hover {
    background: var(--surface);
  }

  .navbar__link--primary {
    background: var(--sky);
    border-color: var(--line);
  }

  .navbar__btn {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding-inline: var(--space-4);
    font: inherit;
    font-size: var(--step-0);
    font-weight: 700;
    cursor: pointer;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    transition: background var(--duration-fast);
  }

  .navbar__btn:hover {
    background: var(--surface);
  }

  .navbar__btn--primary {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .navbar__btn--primary:hover {
    background: var(--ink-secondary);
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
