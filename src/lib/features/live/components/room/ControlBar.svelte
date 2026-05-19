<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();
</script>

<footer class="control-bar">
  <button class="ctrl-btn" class:ctrl-on={room.micEnabled} class:ctrl-off={!room.micEnabled} type="button" onclick={() => room.toggleMic()} disabled={room.pendingControl !== null} aria-label={room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}>
    <span class="material-symbols-rounded" aria-hidden="true">{room.micEnabled ? "mic" : "mic_off"}</span>
    <span class="ctrl-label">{room.micEnabled ? t.live.controls.micOnLabel() : t.live.controls.micOffLabel()}</span>
  </button>
  <button class="ctrl-btn" class:ctrl-on={room.cameraEnabled} class:ctrl-off={!room.cameraEnabled} type="button" onclick={() => room.toggleCamera()} disabled={room.pendingControl !== null} aria-label={room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}>
    <span class="material-symbols-rounded" aria-hidden="true">{room.cameraEnabled ? "videocam" : "videocam_off"}</span>
    <span class="ctrl-label">{room.cameraEnabled ? t.live.controls.cameraOnLabel() : t.live.controls.cameraOffLabel()}</span>
  </button>
  {#if room.isInstructorRoom}
    <button class="ctrl-btn" class:ctrl-on={room.screenShareEnabled} class:ctrl-off={!room.screenShareEnabled} type="button" onclick={() => room.toggleScreenShare()} disabled={room.pendingControl !== null} aria-label={room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}>
      <span class="material-symbols-rounded" aria-hidden="true">{room.screenShareEnabled ? "stop_screen_share" : "screen_share"}</span>
      <span class="ctrl-label">{room.screenShareEnabled ? t.live.controls.screenOnLabel() : t.live.controls.screenOffLabel()}</span>
    </button>
  {/if}
  <button class="ctrl-btn ctrl-participants" class:ctrl-on={room.showParticipants} type="button" onclick={() => room.showParticipants = !room.showParticipants} aria-label={t.live.room.participantsTitle()}>
    <span class="material-symbols-rounded" aria-hidden="true">people</span>
    <span class="ctrl-label">{t.live.room.participantsTitle()}</span>
  </button>
</footer>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .control-bar {
    grid-area: controls;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--white);
    border-top: var(--border);
    z-index: 10;
  }

  .ctrl-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 64px;
    min-height: 64px;
    padding: var(--space-2);
    background: var(--surface);
    border: var(--border);
    color: var(--ink);
    cursor: pointer;
    font: inherit;
    border-radius: 0;
    transition: background var(--duration-fast);
  }

  .ctrl-btn:disabled { opacity: 0.5; cursor: wait; }
  .ctrl-btn:hover:not(:disabled) { background: var(--line-light); }

  .ctrl-btn.ctrl-on {
    background: #e8f5ee;
    color: #137333;
    border-color: #137333;
  }

  .ctrl-btn.ctrl-off {
    background: var(--surface);
    color: var(--muted);
    border-color: var(--line-light);
  }

  .ctrl-label {
    font-size: var(--step--2);
    font-weight: 700;
  }

  .ctrl-participants.ctrl-on {
    background: var(--sky-soft);
    color: var(--ink);
    border-color: var(--sky-strong);
  }

  .material-symbols-rounded {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    overflow: hidden;
    font-family: "Material Symbols Rounded";
    font-weight: normal;
    font-style: normal;
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: "liga";
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
  }

  @media (max-width: 48rem) {
    .ctrl-btn {
      min-width: 56px;
      min-height: 56px;
    }

    .ctrl-label {
      font-size: 10px;
    }
  }
</style>
