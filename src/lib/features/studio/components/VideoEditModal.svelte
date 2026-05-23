<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { Id } from "$convex/_generated/dataModel";
  import { Button } from "bits-ui";
  import { TextareaAutosize } from "runed";

  interface Video {
    _id: Id<"videos">;
    title: string;
    description: string;
  }

  interface Props {
    video: Video | null;
    actionId: string | null;
    onClose: () => void;
    onSave: (videoId: Id<"videos">, title: string, description: string) => Promise<void>;
  }

  let {
    video,
    actionId = null,
    onClose,
    onSave,
  }: Props = $props();

  let title = $state("");
  let description = $state("");
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({ element: () => descEl ?? undefined, input: () => description });
  let isSaving = $state(false);

  // Sync internal state when active video changes
  $effect(() => {
    if (video) {
      title = video.title;
      description = video.description;
    }
  });

  const isPending = $derived(actionId === video?._id || isSaving);

  async function handleSave(e: Event) {
    e.preventDefault();
    if (!video || !title.trim()) return;
    isSaving = true;
    try {
      await onSave(video._id, title.trim(), description.trim());
      onClose();
    } catch (err) {
      // Handled by parent
    } finally {
      isSaving = false;
    }
  }
</script>

<Dialog.Root open={video !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
  <Dialog.Portal>
    <Dialog.Overlay class="edit-modal-backdrop" />
    <Dialog.Content class="edit-modal-card" aria-label="עריכת פרטי שיעור">
      {#if video}
        <div class="modal-header">
          <span class="material-symbols-rounded header-icon">edit_note</span>
          <Dialog.Title class="modal-title" level={2}>עריכת פרטי שיעור</Dialog.Title>
          <Dialog.Close class="close-button" aria-label="סגור">
            <span class="material-symbols-rounded">close</span>
          </Dialog.Close>
        </div>

        <form onsubmit={handleSave} class="modal-form">
          <label class="field">
            <span class="field__label">כותרת השיעור</span>
            <input bind:value={title} required maxlength="120" disabled={isPending} />
          </label>

          <label class="field">
            <span class="field__label">תיאור השיעור</span>
            <textarea bind:value={description} bind:this={descEl} maxlength="500" disabled={isPending}></textarea>
          </label>

          <div class="modal-actions">
            <Button.Root class="hb-button hb-button--ink" type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "שומר..." : "שמירת שינויים"}
            </Button.Root>
            <Button.Root class="hb-button hb-button--paper" type="button" onclick={onClose} disabled={isPending}>
              ביטול
            </Button.Root>
          </div>
        </form>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

