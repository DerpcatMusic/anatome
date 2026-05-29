<script lang="ts">
  import { AlertDialog } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    open = $bindable(false),
    pending = false,
    onConfirm,
  }: {
    open?: boolean;
    pending?: boolean;
    onConfirm: () => void;
  } = $props();

  const { t } = useI18n();

  function confirm() {
    onConfirm();
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay class="hb-dialog-overlay" />
    <AlertDialog.Content
      class="hb-dialog-content leave-modal"
      aria-label={t.live.room.endLiveAlertTitle()}
    >
      <AlertDialog.Title class="leave-modal__title">{t.live.room.endLiveAlertTitle()}</AlertDialog.Title>
      <AlertDialog.Description class="leave-modal__text">
        {t.live.room.endLiveAlertBody()}
      </AlertDialog.Description>
      <div class="leave-modal__actions">
        <AlertDialog.Cancel
          class="hb-button hb-button--paper hb-button--md"
          disabled={pending}
        >
          {t.live.room.endLiveAlertCancel()}
        </AlertDialog.Cancel>
        <AlertDialog.Action
          class="hb-button hb-button--danger hb-button--md"
          disabled={pending}
          onclick={confirm}
        >
          {pending ? "…" : t.live.room.endLiveAlertConfirm()}
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
