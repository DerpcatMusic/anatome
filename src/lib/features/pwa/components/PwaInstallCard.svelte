<script lang="ts">
  import { Button } from "bits-ui";
  import { installPrompt } from "$lib/pwa/install-prompt.svelte";
  import { isIosSafari } from "$lib/pwa/platform";

  let installing = $state(false);
  let message = $state("");

  const ios = $derived(isIosSafari());

  async function onInstallClick() {
    if (ios) return;
    installing = true;
    message = "";
    try {
      const outcome = await installPrompt.promptInstall();
      if (outcome === "dismissed") {
        message = "אפשר להתקין מאוחר יותר מהתפריט של הדפדפן.";
      }
    } finally {
      installing = false;
    }
  }

  function dismiss() {
    installPrompt.dismissForSession();
  }
</script>

{#if installPrompt.shouldShowCard}
  <section class="pwa-install-card" aria-labelledby="pwa-install-title">
    <div class="pwa-install-card__copy">
      <p class="pwa-install-card__eyebrow">אפליקציה בטלפון</p>
      <h2 id="pwa-install-title" class="pwa-install-card__title">התקיני את AnatoMe למסך הבית</h2>
      {#if ios}
        <ol class="pwa-install-card__steps">
          <li>לחצי על <strong>שיתוף</strong> (Share) בתחתית Safari</li>
          <li>בחרי <strong>הוספה למסך הבית</strong></li>
          <li>אחרי ההתקנה אפשר להפעיל התראות לשיעורים</li>
        </ol>
      {:else}
        <p class="pwa-install-card__body">
          גישה מהירה לשיעורים, חוויית מסך מלא, והתראות לפני שיעור חי.
        </p>
      {/if}
      {#if message}
        <p class="pwa-install-card__hint" role="status">{message}</p>
      {/if}
    </div>
    <div class="pwa-install-card__actions">
      {#if !ios}
        <Button.Root
          class="hb-button hb-button--ink"
          type="button"
          disabled={installing}
          onclick={onInstallClick}
        >
          {installing ? "מתקינה…" : "התקנה"}
        </Button.Root>
      {/if}
      <Button.Root
        class="hb-button hb-button--ghost"
        type="button"
        onclick={dismiss}
      >
        לא עכשיו
      </Button.Root>
    </div>
  </section>
{/if}

<style>
  .pwa-install-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-ambient);
  }

  .pwa-install-card__eyebrow {
    margin: 0 0 var(--space-2);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary);
  }

  .pwa-install-card__title {
    margin: 0 0 var(--space-3);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--foreground);
  }

  .pwa-install-card__body,
  .pwa-install-card__hint {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--foreground-muted);
  }

  .pwa-install-card__steps {
    margin: 0;
    padding-inline-start: 1.25rem;
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--foreground-muted);
  }

  .pwa-install-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  @media (min-width: 32rem) {
    .pwa-install-card {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>
