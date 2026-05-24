<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";
  import LiveAudioMeter from "./ui/LiveAudioMeter.svelte";
  import { Tooltip } from "bits-ui";
  import { Popover } from "bits-ui";
  import { Switch } from "bits-ui";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();

  async function switchMic(deviceId: string) {
    if (room.connectionState === "connected") {
      await room.switchStreamDevice("audioinput", deviceId);
    } else {
      room.selectedAudioDevice = deviceId;
      await room.switchPreviewDevice();
    }
  }

  async function switchCamera(deviceId: string) {
    if (room.connectionState === "connected") {
      await room.switchStreamDevice("videoinput", deviceId);
    } else {
      room.selectedVideoDevice = deviceId;
      await room.switchPreviewDevice();
    }
  }
</script>

<footer class="lr-control-bar">
  <div class="lr-control-bar__group">
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger lr-bar-btn-wrap">
        <button
          type="button"
          class="lr-bar-btn"
          class:lr-bar-btn--on={room.micEnabled}
          class:lr-bar-btn--busy={room.pendingControl === "mic"}
          onclick={() => room.toggleMic()}
          disabled={room.pendingControl !== null}
          aria-busy={room.pendingControl === "mic"}
          aria-label={room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">{room.micEnabled ? "mic" : "mic_off"}</span>
          <span class="lr-bar-btn__label">{room.micEnabled ? t.live.controls.micOnLabel() : t.live.controls.micOffLabel()}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
    {#if room.audioDevices.length > 1}
      <Popover.Root>
        <Popover.Trigger class="hb-popover-trigger">
          <button type="button" class="lr-bar-btn lr-bar-btn--icon" aria-label={t.live.preConnect.micLabel()}>
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content class="hb-popover-content lr-popover" side="top" align="center" sideOffset={8}>
            <div class="lr-device-list">
              {#each room.audioDevices as device}
                <button
                  type="button"
                  class="lr-device-row"
                  class:lr-device-row--active={room.selectedAudioDevice === device.deviceId}
                  onclick={() => switchMic(device.deviceId)}
                >
                  {device.label}
                </button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    {/if}
  </div>

  <div class="lr-control-bar__group">
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger lr-bar-btn-wrap">
        <button
          type="button"
          class="lr-bar-btn"
          class:lr-bar-btn--on={room.cameraEnabled}
          class:lr-bar-btn--busy={room.pendingControl === "camera"}
          onclick={() => room.toggleCamera()}
          disabled={room.pendingControl !== null}
          aria-busy={room.pendingControl === "camera"}
          aria-label={room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">{room.cameraEnabled ? "videocam" : "videocam_off"}</span>
          <span class="lr-bar-btn__label">{room.cameraEnabled ? t.live.controls.cameraOnLabel() : t.live.controls.cameraOffLabel()}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
    {#if room.videoDevices.length > 1}
      <Popover.Root>
        <Popover.Trigger class="hb-popover-trigger">
          <button type="button" class="lr-bar-btn lr-bar-btn--icon" aria-label={t.live.preConnect.cameraLabel()}>
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content class="hb-popover-content lr-popover" side="top" align="center" sideOffset={8}>
            <div class="lr-device-list">
              {#each room.videoDevices as device}
                <button
                  type="button"
                  class="lr-device-row"
                  class:lr-device-row--active={room.selectedVideoDevice === device.deviceId}
                  onclick={() => switchCamera(device.deviceId)}
                >
                  {device.label}
                </button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    {/if}
  </div>

  {#if room.isInstructorRoom}
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger lr-bar-btn-wrap">
        <button
          type="button"
          class="lr-bar-btn"
          class:lr-bar-btn--on={room.screenShareEnabled}
          class:lr-bar-btn--busy={room.pendingControl === "screen"}
          onclick={() => room.toggleScreenShare()}
          disabled={room.pendingControl !== null}
          aria-label={room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">{room.screenShareEnabled ? "stop_screen_share" : "screen_share"}</span>
          <span class="lr-bar-btn__label">{room.screenShareEnabled ? t.live.controls.screenOnLabel() : t.live.controls.screenOffLabel()}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  {/if}

  <Tooltip.Root>
    <Tooltip.Trigger class="hb-tooltip-trigger lr-bar-btn-wrap">
      <button
        type="button"
        class="lr-bar-btn"
        class:lr-bar-btn--active={room.showParticipants}
        onclick={() => (room.showParticipants = !room.showParticipants)}
        aria-label={t.live.room.participantsTitle()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">people</span>
        <span class="lr-bar-btn__label">{t.live.room.participantsTitle()}</span>
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="hb-tooltip-content">
        {room.showParticipants ? t.live.room.hideParticipants() : t.live.room.showParticipants()}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger class="hb-tooltip-trigger lr-bar-btn-wrap">
      <button
        type="button"
        class="lr-bar-btn"
        class:lr-bar-btn--active={room.showChat}
        onclick={() => room.toggleChat()}
        aria-label={t.live.room.showChat()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">{room.showChat ? "chat" : "chat_bubble_outline"}</span>
        <span class="lr-bar-btn__label">{t.live.room.chatTitle()}</span>
        {#if room.unreadChatCount > 0 && !room.showChat}
          <span class="lr-bar-btn__badge" aria-label={t.live.room.newMessages()}>{room.unreadChatCount}</span>
        {/if}
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="hb-tooltip-content">
        {room.showChat ? t.live.room.hideChat() : t.live.room.showChat()}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>

  <Popover.Root>
    <Popover.Trigger class="hb-popover-trigger lr-bar-btn-wrap">
      <button type="button" class="lr-bar-btn" aria-label={t.live.room.settingsTitle()}>
        <span class="material-symbols-rounded" aria-hidden="true">settings</span>
        <span class="lr-bar-btn__label">{t.live.room.settingsTitle()}</span>
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content class="hb-popover-content lr-popover lr-settings-panel" side="top" align="end" sideOffset={8}>
        <div class="lr-settings">
          <strong class="lr-settings__title">{t.live.room.settingsTitle()}</strong>
          <span class="hb-switch">
            <Switch.Root
              class="hb-switch__root"
              aria-label={t.live.room.echoCancel()}
              bind:checked={room.audioProcessingEnabled}
              onCheckedChange={() => room.applyAudioProcessing()}
            >
              <Switch.Thumb class="hb-switch__thumb" />
            </Switch.Root>
            <span>{t.live.room.echoCancel()}</span>
          </span>
          {#if room.isInstructorRoom}
            <button type="button" class="lr-settings__link" onclick={() => (room.showQualityPanel = true)}>
              {t.live.stats.title()}
            </button>
          {/if}
        </div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>

  {#if room.isInstructorRoom && room.connectionState === "connected"}
    <div class="lr-control-bar__meter">
      <LiveAudioMeter label={t.live.preConnect.audioLevel()} level={room.audioLevel} />
    </div>
  {/if}
</footer>

<style>
  .lr-control-bar {
    position: absolute;
    inset-inline: var(--space-3);
    inset-block-end: var(--space-3);
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2);
    background: var(--lr-chrome-bg);
    border: var(--lr-chrome-border);
    z-index: 30;
  }

  .lr-control-bar__group {
    display: inline-flex;
    align-items: stretch;
    gap: 1px;
  }

  .lr-bar-btn {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 4.5rem;
    min-height: 44px;
    padding: var(--space-1) var(--space-2);
    background: var(--lr-control-off-bg);
    border: var(--lr-control-border);
    color: var(--ink);
    cursor: pointer;
    font: inherit;
    font-size: var(--step--2);
    font-weight: 750;
    transition: background var(--duration-fast), border-color var(--duration-fast);
  }

  .lr-bar-btn:hover:not(:disabled) {
    background: var(--surface);
  }

  .lr-bar-btn--on {
    background: var(--lr-control-on-bg);
    border: var(--lr-control-on-border);
    color: var(--ink);
  }

  .lr-bar-btn--active {
    background: var(--lr-control-active-bg);
    border: var(--lr-control-on-border);
  }

  .lr-bar-btn--icon {
    min-width: 44px;
    padding-inline: var(--space-1);
  }

  .lr-bar-btn--busy {
    opacity: 0.6;
    pointer-events: none;
  }

  .lr-bar-btn:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .lr-bar-btn__label {
    white-space: nowrap;
    line-height: 1.2;
  }

  .lr-bar-btn__badge {
    position: absolute;
    top: 4px;
    inset-inline-end: 4px;
    min-width: 1.1rem;
    height: 1.1rem;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--terra);
    color: var(--paper);
    font-size: 0.65rem;
    font-weight: 800;
    line-height: 1.1rem;
    text-align: center;
  }

  .lr-control-bar__meter {
    flex: 1 1 120px;
    min-width: 100px;
    max-width: 200px;
    display: flex;
    align-items: center;
    padding-inline: var(--space-2);
    border-inline-start: var(--lr-chrome-border);
  }

  .lr-bar-btn .material-symbols-rounded {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 1.25rem;
  }

  @media (max-width: 48rem) {
    .lr-control-bar {
      inset-inline: var(--space-2);
      inset-block-end: var(--space-2);
      overflow-x: auto;
      justify-content: flex-start;
      flex-wrap: nowrap;
    }

    .lr-bar-btn__label {
      font-size: 10px;
    }

    .lr-bar-btn--icon {
      display: none;
    }
  }
</style>
