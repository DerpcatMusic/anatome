<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    BOTTOM_SHEET_DRAG_THRESHOLD_PX,
    resolveSnapAfterDrag,
    translateYForSnap,
    type BottomSheetSnap,
  } from "./bottom-sheet.svelte";
  import "./HbBottomSheet.css";

  const CLOSE_MS = 260;

  let {
    open = $bindable(false),
    title,
    ariaLabel,
    initialSnap = "half",
    showHandle = true,
    onClose,
    headerActions,
    children,
  }: {
    open?: boolean;
    title?: string;
    ariaLabel: string;
    initialSnap?: "half" | "full";
    showHandle?: boolean;
    onClose?: () => void;
    headerActions?: Snippet;
    children: Snippet;
  } = $props();

  let dialogEl = $state<HTMLDialogElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let presented = $state(false);
  let snap = $state<BottomSheetSnap>("closed");
  let dragOffsetPx = $state(0);
  let dragging = $state(false);
  let pointerId = $state<number | null>(null);
  let dragStartY = 0;
  let dragStartOffset = 0;
  let dragDistancePx = 0;
  let lastMoveY = 0;
  let lastMoveTime = 0;
  let velocityY = 0;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  let reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const layoutSnap = $derived.by((): BottomSheetSnap => {
    if (!open && !presented) return "closed";
    return snap === "closed" ? initialSnap : snap;
  });

  let panelTransform = $state("translateY(100%)");
  $effect(() => {
    if (!presented) {
      panelTransform = "translateY(100%)";
      return;
    }
    const sheetHeight = panelEl?.offsetHeight ?? 0;
    if (sheetHeight <= 0) {
      panelTransform = "translateY(0)";
      return;
    }
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const y = translateYForSnap(layoutSnap, sheetHeight, viewportHeight, dragOffsetPx);
    panelTransform = `translateY(${y}px)`;
  });

  function clearCloseTimer() {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function openDialog() {
    const dialog = dialogEl;
    if (!dialog || dialog.open) return;
    snap = initialSnap;
    dragOffsetPx = 0;
    clearCloseTimer();
    dialog.showModal();
    if (reducedMotion) {
      presented = true;
      return;
    }
    presented = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        presented = true;
      });
    });
  }

  function finishClose() {
    const dialog = dialogEl;
    presented = false;
    clearCloseTimer();
    closeTimer = setTimeout(() => {
      dialog?.close();
      snap = "closed";
      dragOffsetPx = 0;
      closeTimer = undefined;
    }, reducedMotion ? 0 : CLOSE_MS);
  }

  function requestClose() {
    if (!open) return;
    open = false;
    onClose?.();
    finishClose();
  }

  $effect(() => {
    if (open) {
      clearCloseTimer();
      if (!dialogEl?.open) {
        openDialog();
      } else if (!presented) {
        presented = true;
      }
      return;
    }
    if (dialogEl?.open) {
      finishClose();
    }
  });

  function stopPointerPropagation(e: PointerEvent) {
    e.stopPropagation();
  }

  function onDialogClick(event: MouseEvent) {
    if (event.target !== dialogEl) return;
    requestClose();
  }

  function onDialogCancel(event: Event) {
    event.preventDefault();
    requestClose();
  }

  function onHandlePointerDown(event: PointerEvent) {
    if (!showHandle || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragging = true;
    pointerId = event.pointerId;
    dragStartY = event.clientY;
    dragStartOffset = dragOffsetPx;
    dragDistancePx = 0;
    lastMoveY = event.clientY;
    lastMoveTime = performance.now();
    velocityY = 0;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onHandlePointerMove(event: PointerEvent) {
    if (!dragging || event.pointerId !== pointerId) return;
    event.preventDefault();
    const now = performance.now();
    const dt = Math.max(now - lastMoveTime, 1);
    velocityY = (event.clientY - lastMoveY) / dt;
    lastMoveY = event.clientY;
    lastMoveTime = now;
    const delta = event.clientY - dragStartY;
    dragDistancePx = Math.max(dragDistancePx, Math.abs(delta));
    dragOffsetPx = Math.max(0, dragStartOffset + delta);
  }

  function onHandlePointerEnd(event: PointerEvent) {
    if (!dragging || event.pointerId !== pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    dragging = false;
    pointerId = null;

    const didDrag = dragDistancePx >= BOTTOM_SHEET_DRAG_THRESHOLD_PX;
    const sheetHeight = panelEl?.offsetHeight ?? 0;
    const viewportHeight = window.innerHeight;
    const next = resolveSnapAfterDrag({
      sheetHeight,
      viewportHeight,
      currentSnap: layoutSnap,
      dragOffsetPx,
      velocityY,
      didDrag,
    });
    dragOffsetPx = 0;
    dragDistancePx = 0;

    if (next === "closed") {
      requestClose();
      return;
    }
    snap = next;
  }
</script>

<!-- Native dialog = top layer (above scrim) + ::backdrop dimming -->
<dialog
  bind:this={dialogEl}
  class="hb-bottom-sheet"
  class:hb-bottom-sheet--presented={presented}
  aria-label={ariaLabel}
  onclick={onDialogClick}
  oncancel={onDialogCancel}
>
  <div
    bind:this={panelEl}
    class="hb-bottom-sheet__panel"
    class:hb-bottom-sheet__panel--dragging={dragging}
    style:transform={panelTransform}
    role="document"
    onpointerdown={stopPointerPropagation}
  >
    {#if showHandle}
      <div
        class="hb-bottom-sheet__handle-zone"
        role="presentation"
        onpointerdown={onHandlePointerDown}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerEnd}
        onpointercancel={onHandlePointerEnd}
      >
        <div class="hb-bottom-sheet__handle" aria-hidden="true"></div>
        {#if title || headerActions}
          <header class="hb-bottom-sheet__head">
            {#if title}
              <h2 id="hb-bottom-sheet-title" class="hb-bottom-sheet__title">{title}</h2>
            {:else if headerActions}
              <div class="hb-bottom-sheet__head-leading">
                {@render headerActions()}
              </div>
            {/if}
            <div class="hb-bottom-sheet__head-actions">
              <button
                type="button"
                class="hb-bottom-sheet__close"
                aria-label="סגירה"
                onclick={requestClose}
              >
                <span class="material-symbols-rounded" aria-hidden="true">close</span>
              </button>
            </div>
          </header>
        {/if}
      </div>
    {:else if title}
      <header class="hb-bottom-sheet__handle-zone">
        <header class="hb-bottom-sheet__head">
          <h2 class="hb-bottom-sheet__title">{title}</h2>
          <button type="button" class="hb-bottom-sheet__close" aria-label="סגירה" onclick={requestClose}>
            <span class="material-symbols-rounded" aria-hidden="true">close</span>
          </button>
        </header>
      </header>
    {/if}

    <div class="hb-bottom-sheet__body">
      {@render children()}
    </div>
  </div>
</dialog>
