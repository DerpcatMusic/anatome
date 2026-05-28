<script lang="ts">
  import { Button, Dialog } from "bits-ui";

  let {
    open = $bindable(false),
    renewalDate,
    planName,
    pending = false,
    onConfirm,
  }: {
    open?: boolean;
    renewalDate: string;
    planName: string;
    pending?: boolean;
    onConfirm: () => void;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content billing-confirm" aria-labelledby="cancel-title">
      <Dialog.Title id="cancel-title" class="billing-confirm__title">ביטול בסוף התקופה</Dialog.Title>
      <Dialog.Description class="billing-confirm__desc">
        <ul class="billing-confirm__list">
          <li>המנוי <strong>{planName}</strong> יישאר פעיל עד <strong>{renewalDate}</strong>.</li>
          <li>עד אז תמשיכו להשתמש בנקודות שנותרו לכם בתקופה הנוכחית.</li>
          <li>לאחר {renewalDate} לא יחודש חיוב — תעברו לגישה חינמית.</li>
          <li>אפשר לבטל את הביטול בכל עת לפני תאריך החידוש.</li>
        </ul>
      </Dialog.Description>

      <div class="billing-confirm__actions">
        <Dialog.Close class="hb-button hb-button--paper hb-button--sm" type="button" disabled={pending}>
          להשאיר מנוי
        </Dialog.Close>
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          disabled={pending}
          onclick={onConfirm}
        >
          {pending ? "מבטלים…" : "אישור ביטול בסוף התקופה"}
        </Button.Root>
      </div>

      <p class="billing-confirm__legal">
        <a href="/legal/cancellations">מדיניות ביטולים</a>
        ·
        <a href="mailto:hello@anatome.co.il">תמיכה</a>
      </p>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.billing-confirm) {
    display: grid;
    gap: var(--space-4);
    max-width: min(28rem, calc(100vw - var(--space-8)));
  }

  :global(.billing-confirm__title) {
    margin: 0;
    font-size: var(--step-1);
    line-height: 1.2;
  }

  :global(.billing-confirm__desc) {
    margin: 0;
    color: var(--foreground);
    line-height: 1.55;
  }

  .billing-confirm__list {
    margin: 0;
    padding-inline-start: 1.2rem;
    display: grid;
    gap: var(--space-2);
  }

  .billing-confirm__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: flex-end;
  }

  .billing-confirm__legal {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .billing-confirm__legal a {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
