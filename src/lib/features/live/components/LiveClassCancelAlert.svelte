<script lang="ts">
  import { AlertDialog, Button } from "bits-ui";

  let {
    open = $bindable(false),
    pending = false,
    onConfirm,
  }: {
    open?: boolean;
    pending?: boolean;
    onConfirm: () => void;
  } = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay class="hb-dialog-overlay" />
    <AlertDialog.Content class="hb-dialog-content live-cancel-alert" aria-label="אישור ביטול שיעור">
      <AlertDialog.Title class="live-cancel-alert__title">לבטל את השיעור?</AlertDialog.Title>
      <AlertDialog.Description class="live-cancel-alert__desc">
        כל הרשמות המנויות יבוטלו ויזוכו בקרדיט באופן אוטומטי. לא ניתן לבטל פעולה זו.
      </AlertDialog.Description>
      <div class="live-cancel-alert__actions">
        <AlertDialog.Cancel>
          <Button.Root class="hb-button hb-button--paper" type="button" disabled={pending}>
            חזרה
          </Button.Root>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button.Root
            class="hb-button hb-button--danger"
            type="button"
            disabled={pending}
            onclick={onConfirm}
          >
            {pending ? "מבטלת..." : "ביטול שיעור"}
          </Button.Root>
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>

<style>
  :global(.live-cancel-alert) {
    max-width: min(420px, 92vw);
    direction: rtl;
  }

  :global(.live-cancel-alert__title) {
    margin: 0 0 var(--space-2);
    font-size: var(--step-1);
    font-weight: 900;
  }

  :global(.live-cancel-alert__desc) {
    margin: 0 0 var(--space-4);
    font-size: var(--step--1);
    color: var(--foreground-muted);
    line-height: 1.45;
  }

  .live-cancel-alert__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: flex-end;
  }
</style>
