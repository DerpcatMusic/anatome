<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    onClose,
    title,
    icon = "edit_calendar",
    iconColor = "var(--accent)",
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

  function handleClose() {
    open = false;
    onClose?.();
  }

  const contentClasses = $derived(
    `calendar-modal-content ${wide ? "calendar-modal-content--wide" : ""}`
  );
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay class="calendar-modal-overlay" data-state={open ? "open" : "closed"} />
    <Dialog.Content
      class={contentClasses}
      aria-label={title}
    >
      <div class="modal-header">
        <span class="material-symbols-rounded header-icon" style:color={iconColor}>
          {icon}
        </span>
        <h2 class="modal-title">{title}</h2>
        <button
          type="button"
          class="close-button"
          aria-label="סגור"
          onclick={handleClose}
        >
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
  :global(.calendar-modal-overlay) {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: var(--overlay-scrim);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  :global(.calendar-modal-overlay[data-state="open"]) {
    opacity: 1;
    pointer-events: auto;
  }

  :global(.calendar-modal-content) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, calc(-50% + 6px));
    z-index: 101;
    background: var(--elevated);
    border: var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    width: min(480px, 92vw);
    max-height: min(720px, 88dvh);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    direction: rtl;
    opacity: 0;
    transition:
      transform 0.2s ease-out,
      opacity 0.15s ease;
  }

  :global(.calendar-modal-content[data-state="open"]) {
    transform: translate(-50%, -50%);
    opacity: 1;
  }

  :global(.calendar-modal-content--wide) {
    width: min(640px, 94vw);
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: var(--border);
    padding: var(--space-3) var(--space-4);
    flex-shrink: 0;
  }

  .header-icon {
    font-size: var(--step-1);
    flex-shrink: 0;
  }

  .modal-title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 900;
    flex: 1;
    min-width: 0;
  }

  .close-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--foreground-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 4px;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .close-button:hover {
    color: var(--ink);
    background: var(--surface);
  }

  .close-button:active {
    background: var(--line-light);
  }

  .modal-body {
    padding: var(--space-4);
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 860px) {
    :global(.calendar-modal-content) {
      width: 96vw;
      max-height: min(90dvh, calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    }

    .modal-body {
      padding: var(--space-3);
    }
  }
</style>
