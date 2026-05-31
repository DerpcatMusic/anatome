<script lang="ts">
  import { Button } from "bits-ui";

  import { useI18n } from "$lib/i18n/runes.svelte";
  import { dashboardPathFromCachedRole, getCachedRole } from "$lib/auth/session.svelte";

  let {
    signOut,
    closeModal,
  }: {
    signOut: () => void;
    closeModal: () => void;
  } = $props();

  const { t } = useI18n();
  const dashboardHref = dashboardPathFromCachedRole(getCachedRole());

  function handleSignOut() {
    signOut();
    closeModal();
  }
</script>

<div class="auth-state grid gap-4">
  <div class="auth-state__text grid gap-2">
    <p class="kicker">{t.auth.loggedIn.kicker()}</p>
    <h2>{t.auth.loggedIn.title()}</h2>
    <p class="intro">{t.auth.loggedIn.subtitle()}</p>
  </div>
  <Button.Root class="hb-button hb-button--ink" href={dashboardHref}>{t.auth.loggedIn.cta()}</Button.Root>
  <Button.Root class="hb-button hb-button--paper" type="button" onclick={handleSignOut}>{t.auth.loggedIn.signOut()}</Button.Root>
</div>

<style>
  .auth-state__text {
    margin-block-end: 4px;
  }

  .kicker {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  h2 {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .intro {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.5;
  }

</style>
