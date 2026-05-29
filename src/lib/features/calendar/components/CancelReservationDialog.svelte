<script lang="ts">
  import { Button, Dialog } from "bits-ui";

  let {
    open = $bindable(false),
    classTitle,
    creditCost,
    pending = false,
    onConfirm,
  }: {
    open?: boolean;
    classTitle: string;
    creditCost: number;
    pending?: boolean;
    onConfirm: () => void;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content billing-confirm" aria-labelledby="cancel-reservation-title">
      <Dialog.Title id="cancel-reservation-title" class="billing-confirm__title">
        לבטל את ההרשמה?
      </Dialog.Title>
      <Dialog.Description class="billing-confirm__desc">
        <p>
          ההרשמה ל<strong>{classTitle}</strong> תבוטל ו-{creditCost === 1 ? "הנקודה" : `${creditCost} הנקודות`} יוחזרו ליתרה שלך.
        </p>
        <p>אפשר לשמור מקום שוב כל עוד ההרשמה לשיעור עדיין פתוחה.</p>
      </Dialog.Description>

      <div class="billing-confirm__actions">
        <Dialog.Close class="hb-button hb-button--paper hb-button--sm" type="button" disabled={pending}>
          להשאיר הרשמה
        </Dialog.Close>
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          disabled={pending}
          onclick={onConfirm}
        >
          {pending ? "מבטלים…" : "כן, לבטל הרשמה"}
        </Button.Root>
      </div>

      <p class="billing-confirm__legal">
        <a href="/legal/cancellations">מדיניות ביטולים</a>
      </p>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
