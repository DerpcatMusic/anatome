<script lang="ts">
  import Button from "$components/ui/Button.svelte";

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
  <Button tone="ink" href="/u/dashboard">{t.auth.loggedIn.cta()}</Button>
  <Button tone="paper" type="button" onclick={() => { signOut(); closeModal(); }}>{t.auth.loggedIn.signOut()}</Button>
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

</style>
