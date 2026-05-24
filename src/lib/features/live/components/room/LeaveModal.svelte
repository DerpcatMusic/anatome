<script lang="ts">
  import { Dialog, Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    isInstructorRoom,
    open = $bindable(false),
    onLeave,
    onEndLive,
  }: {
    isInstructorRoom: boolean;
    open?: boolean;
    onLeave: () => void;
    onEndLive?: () => void;
  } = $props();

  const { t } = useI18n();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content
      class="hb-dialog-content leave-modal"
      aria-label={isInstructorRoom ? t.live.room.leaveTitleInstructor() : t.live.room.leaveTitleCustomer()}
    >
      <Dialog.Title class="leave-modal__title">
        {isInstructorRoom ? t.live.room.leaveTitleInstructor() : t.live.room.leaveTitleCustomer()}
      </Dialog.Title>
      <p class="leave-modal__text">
        {isInstructorRoom ? t.live.room.leaveBodyInstructor() : t.live.room.leaveBodyCustomer()}
      </p>
      <div class="leave-modal__actions">
        {#if isInstructorRoom && onEndLive}
          <Button.Root class="hb-button hb-button--danger hb-button--md" type="button" onclick={onEndLive}>
            {t.live.room.leaveEndLive()}
          </Button.Root>
          <Button.Root class="hb-button hb-button--paper hb-button--md" type="button" onclick={onLeave}>
            {t.live.room.leaveOnly()}
          </Button.Root>
        {:else}
          <Button.Root class="hb-button hb-button--ink hb-button--md" type="button" onclick={onLeave}>
            {t.live.room.leaveConfirm()}
          </Button.Root>
        {/if}
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          onclick={() => { open = false; }}
        >
          {t.live.room.leaveCancel()}
        </Button.Root>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
