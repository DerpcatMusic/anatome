<script lang="ts">
  import { Dialog, Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    open = $bindable(false),
    minutesRemaining,
    onStay,
    onLeave,
  }: {
    open?: boolean;
    minutesRemaining: number;
    onStay: () => void;
    onLeave: () => void;
  } = $props();

  const { t } = useI18n();

  function joinExpiryBodyText(minutes: number) {
    return t.live.room.joinExpiryBody({ minutes: Math.max(1, minutes) });
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content join-expiry-modal" aria-label={t.live.room.joinExpiryTitle()}>
      <Dialog.Title class="join-expiry-modal__title">{t.live.room.joinExpiryTitle()}</Dialog.Title>
      <p class="join-expiry-modal__text">
        {joinExpiryBodyText(minutesRemaining)}
      </p>
      <div class="join-expiry-modal__actions">
        <Button.Root class="hb-button hb-button--primary hb-button--md" type="button" onclick={onStay}>
          {t.live.room.joinExpiryStay()}
        </Button.Root>
        <Button.Root class="hb-button hb-button--ghost hb-button--sm" type="button" onclick={onLeave}>
          {t.live.room.joinExpiryLeave()}
        </Button.Root>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.join-expiry-modal) {
    display: grid;
    gap: var(--space-4);
    max-width: 420px;
  }

  :global(.join-expiry-modal__title) {
    margin: 0;
    font-size: var(--step-2);
  }

  :global(.join-expiry-modal__text) {
    margin: 0;
    line-height: 1.5;
    color: var(--ink);
  }

  :global(.join-expiry-modal__actions) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: flex-end;
  }
</style>
