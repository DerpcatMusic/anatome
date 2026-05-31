<script lang="ts">
  /**
   * Scaffold for CardCom Open Fields (שדות פתוחים).
   * Wire when CardCom provides field iframe URLs + manager iframe + 3DS script.
   * @see docs/integrations/cardcom-open-fields.md
   */
  import { CARDCOM_OPEN_FIELDS_ENABLED } from "$lib/features/subscriptions/featureFlags";

  interface Props {
    /** Low Profile id from Create response */
    lowProfileId: string | null;
    amountIls?: number;
    onSubmit: () => void;
    disabled?: boolean;
  }

  let { lowProfileId, amountIls, onSubmit, disabled = false }: Props = $props();

  const ilsFormatter = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" });

  const amountLabel = $derived(
    amountIls !== undefined ? ilsFormatter.format(amountIls) : null,
  );

  function handleSubmit(event: Event) {
    event.preventDefault();
    onSubmit();
  }
</script>

{#if CARDCOM_OPEN_FIELDS_ENABLED && lowProfileId}
  <form
    class="cardcom-open-fields"
    onsubmit={handleSubmit}
  >
    <p class="cardcom-open-fields__note">
      מצב Open Fields פעיל — ממתין ל-URLs מ-CardCom (מספר כרטיס / תוקף / CVV + manager iframe).
    </p>
    {#if amountLabel}
      <p class="cardcom-open-fields__amount">{amountLabel}</p>
    {/if}
    <div class="cardcom-open-fields__grid">
      <label class="cardcom-open-fields__field">
        <span>מספר כרטיס</span>
        <div class="cardcom-open-fields__slot" data-cardcom-field="pan"></div>
      </label>
      <label class="cardcom-open-fields__field">
        <span>תוקף</span>
        <div class="cardcom-open-fields__slot" data-cardcom-field="expiry"></div>
      </label>
      <label class="cardcom-open-fields__field">
        <span>CVV</span>
        <div class="cardcom-open-fields__slot" data-cardcom-field="cvv"></div>
      </label>
    </div>
    <iframe
      class="cardcom-open-fields__manager"
      title="CardCom manager"
      hidden
      data-cardcom-manager
    ></iframe>
    <button type="submit" class="hb-button hb-button--primary" {disabled}>שלמו עכשיו</button>
  </form>
{:else}
  <!-- Render nothing — parent falls back to CardcomCheckoutModal iframe -->
{/if}

<style>
  .cardcom-open-fields {
    display: grid;
    gap: var(--space-4);
  }

  .cardcom-open-fields__note {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .cardcom-open-fields__amount {
    margin: 0;
    font-size: var(--step-2);
    font-weight: 800;
    color: var(--primary);
  }

  .cardcom-open-fields__grid {
    display: grid;
    gap: var(--space-3);
  }

  @media (min-width: 480px) {
    .cardcom-open-fields__grid {
      grid-template-columns: 1fr 1fr;
    }

    .cardcom-open-fields__field:first-child {
      grid-column: 1 / -1;
    }
  }

  .cardcom-open-fields__field {
    display: grid;
    gap: var(--space-2);
    font-size: var(--step--1);
  }

  .cardcom-open-fields__slot {
    min-height: 2.75rem;
    border: var(--border);
    border-radius: var(--radius-md);
    background: var(--card);
  }

  .cardcom-open-fields__manager {
    width: 0;
    height: 0;
    border: 0;
    opacity: 0;
    pointer-events: none;
  }
</style>
