<script lang="ts">
  import { AlertDialog, Button, Dialog } from "bits-ui";
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

  let showEndLiveAlert = $state(false);

  function requestEndLive() {
    open = false;
    showEndLiveAlert = true;
  }

  function confirmEndLive() {
    showEndLiveAlert = false;
    onEndLive?.();
  }
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
          <Button.Root class="hb-button hb-button--danger hb-button--md" type="button" onclick={requestEndLive}>
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

{#if isInstructorRoom && onEndLive}
  <AlertDialog.Root bind:open={showEndLiveAlert}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay class="hb-dialog-overlay" />
      <AlertDialog.Content class="hb-dialog-content leave-modal" aria-label={t.live.room.endLiveAlertTitle()}>
        <AlertDialog.Title class="leave-modal__title">{t.live.room.endLiveAlertTitle()}</AlertDialog.Title>
        <AlertDialog.Description class="leave-modal__text">
          {t.live.room.endLiveAlertBody()}
        </AlertDialog.Description>
        <div class="leave-modal__actions">
          <AlertDialog.Cancel>
            <Button.Root class="hb-button hb-button--paper hb-button--md" type="button">
              {t.live.room.endLiveAlertCancel()}
            </Button.Root>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button.Root class="hb-button hb-button--danger hb-button--md" type="button" onclick={confirmEndLive}>
              {t.live.room.endLiveAlertConfirm()}
            </Button.Root>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
{/if}
