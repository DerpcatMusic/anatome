<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { Id } from "$convex/_generated/dataModel";
  import Button from "$components/ui/Button.svelte";

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
            <textarea bind:value={description} rows="4" maxlength="500" disabled={isPending}></textarea>
          </label>

          <div class="modal-actions">
            <Button tone="ink" type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "שומר..." : "שמירת שינויים"}
            </Button>
            <Button tone="paper" type="button" onclick={onClose} disabled={isPending}>
              ביטול
            </Button>
          </div>
        </form>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.edit-modal-backdrop) {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    backdrop-filter: blur(2px);
  }

  :global(.edit-modal-card) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    background: var(--white);
    border: var(--border);
    box-shadow: 8px 8px 0 var(--ink);
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    animation: modalPop var(--duration-fast) cubic-bezier(0.16, 1, 0.3, 1);
    direction: rtl;
  }

  :global(.edit-modal-card .modal-header) {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: var(--border);
    padding: var(--space-4);
  }

  :global(.edit-modal-card .header-icon) {
    font-size: var(--step-2);
    color: var(--terra);
  }

  :global(.edit-modal-card .modal-title) {
    margin: 0;
    font-size: var(--step-1);
    font-weight: 900;
    flex: 1;
  }

  :global(.edit-modal-card .close-button) {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: var(--space-1);
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--duration-fast);
  }

  :global(.edit-modal-card .close-button:hover) {
    color: var(--ink);
  }

  :global(.edit-modal-card .modal-form) {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  :global(.edit-modal-card .modal-actions) {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  @keyframes modalPop {
    from {
      transform: translate(-50%, -50%) scale(0.96) translateY(10px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, -50%) scale(1) translateY(0);
      opacity: 1;
    }
  }
</style>
