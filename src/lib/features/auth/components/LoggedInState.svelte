<script lang="ts">
  import { routePath } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    signOut,
    closeModal,
  }: {
    signOut: () => void;
    closeModal: () => void;
  } = $props();

  const { t } = useI18n();
</script>

<div class="auth-state">
  <div class="auth-state__text">
    <p class="kicker">{t.auth.loggedIn.kicker()}</p>
    <h2>{t.auth.loggedIn.title()}</h2>
    <p class="intro">{t.auth.loggedIn.subtitle()}</p>
  </div>
  <a class="auth-btn auth-btn--primary" href={routePath("dashboard")}>{t.auth.loggedIn.cta()}</a>
  <button class="auth-btn" type="button" onclick={() => { signOut(); closeModal(); }}>{t.auth.loggedIn.signOut()}</button>
</div>

<style>
  .auth-state {
    display: grid;
    gap: 16px;
  }

  .auth-state__text {
    display: grid;
    gap: 8px;
    margin-block-end: 4px;
  }

  .kicker {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  h2 {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .intro {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .auth-btn {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding-inline: var(--space-4);
    font-weight: 700;
    font-size: var(--step--1);
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .auth-btn:hover {
    background: var(--surface);
  }

  .auth-btn--primary {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .auth-btn--primary:hover {
    background: var(--ink-secondary);
  }
</style>
