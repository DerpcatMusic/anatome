<script lang="ts">
  import { Dialog, Button } from "bits-ui";

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
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content leave-modal" aria-label="יציאה מהחדר">
      <Dialog.Title class="leave-modal__title">
        {isInstructorRoom ? "סיום שידור" : "יציאה מהחדר"}
      </Dialog.Title>
      <p class="leave-modal__text">
        {isInstructorRoom
          ? "האם לסיים את השידור לכל המשתתפות?"
          : "האם לצאת מהחדר? תוכלי להיכנס שוב דרך הלוח."}
      </p>
      <div class="leave-modal__actions">
        {#if isInstructorRoom && onEndLive}
          <Button.Root class="hb-button hb-button--danger hb-button--md" type="button" onclick={onEndLive}>סיום שידור</Button.Root>
          <Button.Root class="hb-button hb-button--paper hb-button--md" type="button" onclick={onLeave}>יציאה בלבד</Button.Root>
        {:else}
          <Button.Root class="hb-button hb-button--ink hb-button--md" type="button" onclick={onLeave}>יציאה מהחדר</Button.Root>
        {/if}
        <Button.Root class="hb-button hb-button--ghost hb-button--sm" type="button" onclick={() => { open = false; }}>ביטול</Button.Root>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
