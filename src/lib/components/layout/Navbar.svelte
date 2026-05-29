<script lang="ts">
  import { Button } from "bits-ui";
  import { initAuth, signOut } from "$lib/auth/session.svelte";
  import { theme } from "$features/app/theme.svelte";
  import AnatoMeLogo from "$lib/components/brand/AnatoMeLogo.svelte";
  import { useI18n } from "$lib/i18n/runes";

  const auth = initAuth();
  const { t } = useI18n();

  function openAuth() {
    window.dispatchEvent(new CustomEvent("anatome:auth-open"));
  }
</script>

<nav class="navbar" aria-label="ניווט ראשי">
  <div class="navbar__inner">
    <a class="navbar__brand" href="/" aria-label={t.site.name()}>
      <AnatoMeLogo class="navbar__logo" size={48} />
      <span class="navbar__divider">/</span>
      <span class="navbar__tagline">{t.site.tagline()}</span>
    </a>

    <div class="navbar__actions">
      <button
        type="button"
        class="navbar__theme"
        onclick={() => theme.toggle()}
        title={theme.isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
        aria-label={theme.isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      >
        <span class="material-symbols-rounded">
          {theme.isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>

      {#if auth.isLoading}
        <span class="navbar__status">טוען...</span>
      {:else if auth.isAuthenticated}
        <Button.Root class="hb-button hb-button--secondary hb-button--sm" type="button" onclick={() => window.location.assign("/u/dashboard")}>אזור אישי</Button.Root>
        <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" onclick={signOut}>יציאה</Button.Root>
      {:else}
        <Button.Root class="hb-button hb-button--ink hb-button--sm" type="button" onclick={openAuth}>כניסה</Button.Root>
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
    flex-shrink: 0;
    align-self: center;
  }

  .navbar__divider {
    color: var(--line-light);
    font-family: var(--font-mono);
    font-size: var(--step--1);
  }

  .navbar__tagline {
    font-size: var(--step-0);
    color: var(--foreground-muted);
    font-weight: 600;
  }

  .navbar__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .navbar__theme {
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    background: transparent;
    border: var(--border);
    color: var(--foreground-muted);
    cursor: pointer;
    padding: 0;
    transition: color var(--duration-fast), border-color var(--duration-fast), background var(--duration-fast);
  }

  .navbar__theme:hover {
    color: var(--ink);
    border-color: var(--secondary);
    background: var(--surface);
  }

  .navbar__theme .material-symbols-rounded {
    font-size: 20px;
  }

  .navbar__status {
    font-size: var(--step-0);
    color: var(--foreground-muted);
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
