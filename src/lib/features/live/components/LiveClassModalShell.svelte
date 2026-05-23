<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    onClose,
    title,
    icon = "edit_calendar",
    iconColor = "var(--sky-strong)",
    children,
    wide = false,
  }: {
    open?: boolean;
    onClose?: () => void;
    title: string;
    icon?: string;
    iconColor?: string;
    children: Snippet;
    wide?: boolean;
  } = $props();

  function handleOpenChange(next: boolean) {
    if (!next) {
      open = false;
      onClose?.();
    }
  }

  const contentClass = $derived(`hb-dialog-content ${wide ? "hb-dialog-content--wide" : ""}`);
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" data-state={open ? "open" : "closed"} />
    <Dialog.Content
      class={contentClass}
      aria-label={title}
    >
      <div class="modal-header">
        <span class="material-symbols-rounded header-icon" style:color={iconColor}>
          {icon}
        </span>
        <h2 class="modal-title">{title}</h2>
        <button type="button" class="close-button" aria-label="סגור" onclick={() => { open = false; onClose?.(); }}>
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="modal-body">
        {@render children()}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  .modal-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: var(--border);
    padding: var(--space-4);
  }

  .header-icon {
    font-size: var(--step-2);
    flex-shrink: 0;
  }

  .modal-title {
    margin: 0;
    font-size: var(--step-1);
    font-weight: 900;
    flex: 1;
    min-width: 0;
  }

  .close-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: var(--space-1);
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      background var(--duration-fast),
      border-radius 0.45s cubic-bezier(0.34, 1.8, 0.64, 1),
      transform 0.35s cubic-bezier(0.34, 1.8, 0.64, 1);
  }

  .close-button:hover {
    background: var(--sky-soft);
    border-radius: 999px;
    transform: scale(1.15) rotate(90deg);
  }

  .modal-body {
    padding: var(--space-5);
    overflow-y: auto;
    max-height: calc(90vh - 72px);
  }

  @media (max-width: 52rem) {
    .modal-body {
      padding: var(--space-3);
      max-height: calc(85vh - 64px);
    }
  }
</style>
