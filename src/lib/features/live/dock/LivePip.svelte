<script lang="ts">
  import { Tooltip } from "bits-ui";
  import type { LiveSession } from "../live-session.svelte";
  import { LiveKitRoom } from "$lib/livekit";
  import LivePipVideo from "./LivePipVideo.svelte";
  import { clampPipBounds, type PipBounds } from "./live-dock-pip-bounds";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import EndLiveConfirm from "../components/room/EndLiveConfirm.svelte";
  import "$lib/features/live/styles/live-pip.css";

  let {
    session,
    bounds,
    onBoundsChange,
    onExpand,
    onEndLive,
  }: {
    session: LiveSession;
    bounds: PipBounds;
    onBoundsChange: (bounds: PipBounds) => void;
    onExpand: () => void;
    onEndLive: () => void;
  } = $props();

  const { t } = useI18n();

  let showEndLiveConfirm = $state(false);
  let endingLive = $state(false);

  let dragging = $state(false);
  let resizing = $state(false);
  let dragOrigin = $state({ x: 0, y: 0, pointerX: 0, pointerY: 0 });
  let resizeOrigin = $state({ width: 0, height: 0, pointerX: 0, pointerY: 0 });

  function onDragPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    dragging = true;
    dragOrigin = {
      x: bounds.x,
      y: bounds.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onDragPointerMove(event: PointerEvent) {
    if (!dragging) return;
    const dx = event.clientX - dragOrigin.pointerX;
    const dy = event.clientY - dragOrigin.pointerY;
    onBoundsChange(
      clampPipBounds({
        ...bounds,
        x: dragOrigin.x + dx,
        y: dragOrigin.y + dy,
      }),
    );
  }

  function onDragPointerUp(event: PointerEvent) {
    dragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  function onResizePointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    event.stopPropagation();
    resizing = true;
    resizeOrigin = {
      width: bounds.width,
      height: bounds.height,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onResizePointerMove(event: PointerEvent) {
    if (!resizing) return;
    const dx = event.clientX - resizeOrigin.pointerX;
    const dy = event.clientY - resizeOrigin.pointerY;
    onBoundsChange(
      clampPipBounds({
        ...bounds,
        width: resizeOrigin.width + dx,
        height: resizeOrigin.height + dy,
      }),
    );
  }

  function onResizePointerUp(event: PointerEvent) {
    resizing = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  function onShellDblClick() {
    onExpand();
  }

  function confirmEndLive() {
    if (endingLive) return;
    endingLive = true;
    showEndLiveConfirm = false;
    void Promise.resolve(onEndLive()).finally(() => {
      endingLive = false;
    });
  }
</script>

<EndLiveConfirm bind:open={showEndLiveConfirm} pending={endingLive} onConfirm={confirmEndLive} />

<Tooltip.Provider delayDuration={120}>
  <div
    class="live-pip"
    class:live-pip--dragging={dragging}
    class:live-pip--resizing={resizing}
    style:left="{bounds.x}px"
    style:top="{bounds.y}px"
    style:width="{bounds.width}px"
    style:height="{bounds.height}px"
    role="region"
    aria-label={t.live.room.screenShare()}
    ondblclick={onShellDblClick}
  >
    <div
      class="live-pip__drag"
      role="toolbar"
      aria-label={session.classTitle || t.live.room.instructor()}
      onpointerdown={onDragPointerDown}
      onpointermove={onDragPointerMove}
      onpointerup={onDragPointerUp}
      onpointercancel={onDragPointerUp}
    >
      <span class="live-pip__title">{session.classTitle || t.live.room.instructor()}</span>
      <span class="live-pip__live-dot" aria-hidden="true"></span>
    </div>

    {#if session.liveKitRoom}
      <LiveKitRoom room={session.liveKitRoom}>
        <div class="live-pip__stage">
          <LivePipVideo compact />
        </div>
      </LiveKitRoom>
    {/if}

    <div class="live-pip__controls" role="toolbar">
      <button
        type="button"
        class="live-pip__btn"
        class:live-pip__btn--off={!session.micEnabled}
        aria-pressed={session.micEnabled}
        aria-label={t.live.preConnect.micLabel()}
        onclick={() => void session.toggleMic()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">
          {session.micEnabled ? "mic" : "mic_off"}
        </span>
      </button>
      <button
        type="button"
        class="live-pip__btn"
        class:live-pip__btn--off={!session.cameraEnabled}
        aria-pressed={session.cameraEnabled}
        aria-label={t.live.preConnect.cameraLabel()}
        onclick={() => void session.toggleCamera()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">
          {session.cameraEnabled ? "videocam" : "videocam_off"}
        </span>
      </button>
      <button
        type="button"
        class="live-pip__btn"
        class:live-pip__btn--off={!session.screenShareEnabled}
        aria-pressed={session.screenShareEnabled}
        aria-label={t.live.room.screenShare()}
        onclick={() => void session.toggleScreenShare()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">
          {session.screenShareEnabled ? "stop_screen_share" : "present_to_all"}
        </span>
      </button>
      <button
        type="button"
        class="live-pip__btn live-pip__btn--expand"
        aria-label={t.live.preConnect.enterRoom()}
        onclick={onExpand}
      >
        <span class="material-symbols-rounded" aria-hidden="true">open_in_full</span>
      </button>
      <button
        type="button"
        class="live-pip__btn live-pip__btn--danger"
        aria-label={t.live.room.leaveEndLive()}
        disabled={endingLive}
        onclick={() => {
          showEndLiveConfirm = true;
        }}
      >
        <span class="material-symbols-rounded" aria-hidden="true">stop_circle</span>
      </button>
    </div>

    <button
      type="button"
      class="live-pip__resize"
      aria-label="Resize"
      onpointerdown={onResizePointerDown}
      onpointermove={onResizePointerMove}
      onpointerup={onResizePointerUp}
      onpointercancel={onResizePointerUp}
    ></button>
  </div>
</Tooltip.Provider>
