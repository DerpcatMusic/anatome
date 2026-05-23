<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";
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
  <!-- Mic -->
  <div class="lr-control" class:lr-control--on={room.micEnabled} class:lr-control--off={!room.micEnabled}>
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <button
          type="button"
          class="lr-control__main"
          onclick={() => room.toggleMic()}
          disabled={room.pendingControl !== null}
          aria-label={room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">{room.micEnabled ? "mic" : "mic_off"}</span>
          <span class="lr-control__label">{room.micEnabled ? t.live.controls.micOnLabel() : t.live.controls.micOffLabel()}</span>
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
          <button type="button" class="lr-control__arrow" aria-label={t.live.preConnect.micLabel()}>
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content class="hb-popover-content" side="top" align="center" sideOffset={8}>
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

  <!-- Camera -->
  <div class="lr-control" class:lr-control--on={room.cameraEnabled} class:lr-control--off={!room.cameraEnabled}>
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <button
          type="button"
          class="lr-control__main"
          onclick={() => room.toggleCamera()}
          disabled={room.pendingControl !== null}
          aria-label={room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">{room.cameraEnabled ? "videocam" : "videocam_off"}</span>
          <span class="lr-control__label">{room.cameraEnabled ? t.live.controls.cameraOnLabel() : t.live.controls.cameraOffLabel()}</span>
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
          <button type="button" class="lr-control__arrow" aria-label={t.live.preConnect.cameraLabel()}>
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content class="hb-popover-content" side="top" align="center" sideOffset={8}>
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
    <div class="lr-control" class:lr-control--on={room.screenShareEnabled} class:lr-control--off={!room.screenShareEnabled}>
      <Tooltip.Root>
        <Tooltip.Trigger class="hb-tooltip-trigger">
          <button
            type="button"
            class="lr-control__main"
            onclick={() => room.toggleScreenShare()}
            disabled={room.pendingControl !== null}
            aria-label={room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
          >
            <span class="material-symbols-rounded" aria-hidden="true">{room.screenShareEnabled ? "stop_screen_share" : "screen_share"}</span>
            <span class="lr-control__label">{room.screenShareEnabled ? t.live.controls.screenOnLabel() : t.live.controls.screenOffLabel()}</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="hb-tooltip-content">
            {room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  {/if}

  <!-- Participants -->
  <div class="lr-control" class:lr-control--active={room.showParticipants} class:lr-control--off={!room.showParticipants}>
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <button
          type="button"
          class="lr-control__main"
          onclick={() => room.showParticipants = !room.showParticipants}
          aria-label={t.live.room.participantsTitle()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">people</span>
          <span class="lr-control__label">{t.live.room.participantsTitle()}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {room.showParticipants ? t.live.room.hideParticipants() : t.live.room.showParticipants()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>

  <!-- Chat toggle -->
  <div class="lr-control" class:lr-control--active={room.showChat} class:lr-control--off={!room.showChat}>
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <button
          type="button"
          class="lr-control__main"
          onclick={() => room.showChat = !room.showChat}
          aria-label={t.live.room.showChat()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">{room.showChat ? "chat" : "chat_bubble_outline"}</span>
          <span class="lr-control__label">{t.live.room.chatTitle()}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {room.showChat ? t.live.room.hideChat() : t.live.room.showChat()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>

  <!-- Settings -->
  <Popover.Root>
    <Popover.Trigger class="hb-popover-trigger">
      <div class="lr-control lr-control--off">
        <button type="button" class="lr-control__main" aria-label={t.live.room.settingsTitle()}>
          <span class="material-symbols-rounded" aria-hidden="true">settings</span>
          <span class="lr-control__label">{t.live.room.settingsTitle()}</span>
        </button>
      </div>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content class="hb-popover-content" side="top" align="end" sideOffset={8}>
        <div class="lr-settings">
          <strong class="lr-settings__title">{t.live.room.settingsTitle()}</strong>
          <span class="hb-switch">
            <Switch.Root
              class="hb-switch__root"
              aria-label={t.live.room.echoCancel()}
              bind:checked={room.audioProcessingEnabled} onCheckedChange={() => room.switchPreviewDevice()}
            >
              <Switch.Thumb class="hb-switch__thumb" />
            </Switch.Root>
            <span>{t.live.room.echoCancel()}</span>
          </span>
          {#if room.isInstructorRoom}
            <button type="button" class="lr-settings__link" onclick={() => room.showQualityPanel = true}>
              {t.live.stats.title()}
            </button>
          {/if}
        </div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</footer>
