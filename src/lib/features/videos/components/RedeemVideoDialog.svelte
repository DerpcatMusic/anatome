<script lang="ts">
  import { Dialog, Button } from "bits-ui";
  import { durationLabel } from "$lib/labels";

  export type RedeemTarget = {
    _id: string;
    title: string;
    durationSeconds?: number | null;
    thumbnailUrl?: string | null;
  };

  let {
    open = $bindable(false),
    video = null,
    creditsBalance = 0,
    pending = false,
    onConfirm,
  }: {
    open?: boolean;
    video?: RedeemTarget | null;
    creditsBalance?: number;
    pending?: boolean;
    onConfirm: () => void | Promise<void>;
  } = $props();

  const canRedeem = $derived(creditsBalance >= 1);
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content redeem-dialog" aria-label="אישור פתיחת סרטון">
      <Dialog.Title class="redeem-dialog__title">לפתוח את השיעור?</Dialog.Title>
      <Dialog.Description class="redeem-dialog__desc">
        {#if video}
          קרדיט אחד עבור «{video.title}» ({durationLabel(video.durationSeconds)}). השיעור נשאר שלך.
        {:else}
          קרדיט אחד. השיעור נשאר שלך.
        {/if}
      </Dialog.Description>

      <div class="redeem-dialog__balance" class:redeem-dialog__balance--low={!canRedeem}>
        <span>יתרה נוכחית</span>
        <strong>{creditsBalance}</strong>
      </div>

      {#if !canRedeem}
        <p class="redeem-dialog__warn">אין מספיק קרדיטים.</p>
      {/if}

      <div class="redeem-dialog__actions">
        <Dialog.Close class="hb-button hb-button--ghost hb-button--sm" type="button" disabled={pending}>
          ביטול
        </Dialog.Close>
        <Button.Root
          class="hb-button hb-button--ink hb-button--sm"
          type="button"
          disabled={pending || !canRedeem || video === null}
          onclick={() => onConfirm()}
        >
          {pending ? "פותחים…" : "כן, לפתוח"}
        </Button.Root>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.redeem-dialog) {
    display: grid;
    gap: var(--space-4);
    max-width: min(100%, 28rem);
  }

  :global(.redeem-dialog__title) {
    margin: 0;
    font-size: var(--step-1);
    line-height: 1.2;
  }

  :global(.redeem-dialog__desc) {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  :global(.redeem-dialog__balance) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: var(--border);
    background: var(--surface);
  }

  :global(.redeem-dialog__balance strong) {
    font-family: var(--font-display);
    font-size: var(--step-1);
    color: var(--ink);
  }

  :global(.redeem-dialog__balance--low) {
    border-color: color-mix(in oklch, var(--danger) 40%, var(--line));
    background: color-mix(in oklch, var(--danger) 8%, var(--surface));
  }

  :global(.redeem-dialog__warn) {
    margin: 0;
    color: var(--danger);
    font-size: var(--step--1);
  }

  :global(.redeem-dialog__actions) {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
</style>
