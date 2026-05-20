<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";
  import Tooltip from "$components/ui/Tooltip.svelte";
  import Popover from "$components/ui/Popover.svelte";
  import Switch from "$components/ui/Switch.svelte";

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
    <Tooltip label={room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}>
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
    </Tooltip>
    {#if room.audioDevices.length > 1}
      <Popover side="top" align="center" sideOffset={8}>
        {#snippet trigger()}
          <button type="button" class="lr-control__arrow" aria-label={t.live.preConnect.micLabel()}>
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        {/snippet}
        {#snippet children()}
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
        {/snippet}
      </Popover>
    {/if}
  </div>

  <!-- Camera -->
  <div class="lr-control" class:lr-control--on={room.cameraEnabled} class:lr-control--off={!room.cameraEnabled}>
    <Tooltip label={room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}>
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
    </Tooltip>
    {#if room.videoDevices.length > 1}
      <Popover side="top" align="center" sideOffset={8}>
        {#snippet trigger()}
          <button type="button" class="lr-control__arrow" aria-label={t.live.preConnect.cameraLabel()}>
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        {/snippet}
        {#snippet children()}
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
        {/snippet}
      </Popover>
    {/if}
  </div>

  {#if room.isInstructorRoom}
    <div class="lr-control" class:lr-control--on={room.screenShareEnabled} class:lr-control--off={!room.screenShareEnabled}>
      <Tooltip label={room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}>
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
      </Tooltip>
    </div>
  {/if}

  <!-- Participants -->
  <div class="lr-control" class:lr-control--active={room.showParticipants} class:lr-control--off={!room.showParticipants}>
    <Tooltip label={room.showParticipants ? t.live.room.hideParticipants() : t.live.room.showParticipants()}>
      <button
        type="button"
        class="lr-control__main"
        onclick={() => room.showParticipants = !room.showParticipants}
        aria-label={t.live.room.participantsTitle()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">people</span>
        <span class="lr-control__label">{t.live.room.participantsTitle()}</span>
      </button>
    </Tooltip>
  </div>

  <!-- Chat toggle -->
  <div class="lr-control" class:lr-control--active={room.showChat} class:lr-control--off={!room.showChat}>
    <Tooltip label={room.showChat ? t.live.room.hideChat() : t.live.room.showChat()}>
      <button
        type="button"
        class="lr-control__main"
        onclick={() => room.showChat = !room.showChat}
        aria-label={t.live.room.showChat()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">{room.showChat ? "chat" : "chat_bubble_outline"}</span>
        <span class="lr-control__label">{t.live.room.chatTitle()}</span>
      </button>
    </Tooltip>
  </div>

  <!-- Settings -->
  <Popover side="top" align="end" sideOffset={8}>
    {#snippet trigger()}
      <div class="lr-control lr-control--off">
        <button type="button" class="lr-control__main" aria-label={t.live.room.settingsTitle()}>
          <span class="material-symbols-rounded" aria-hidden="true">settings</span>
          <span class="lr-control__label">{t.live.room.settingsTitle()}</span>
        </button>
      </div>
    {/snippet}
    {#snippet children()}
      <div class="lr-settings">
        <strong class="lr-settings__title">{t.live.room.settingsTitle()}</strong>
        <Switch
          bind:checked={room.audioProcessingEnabled}
          label={t.live.room.echoCancel()}
          onchange={() => room.switchPreviewDevice()}
        />
        {#if room.isInstructorRoom}
          <button type="button" class="lr-settings__link" onclick={() => room.showQualityPanel = true}>
            {t.live.stats.title()}
          </button>
        {/if}
      </div>
    {/snippet}
  </Popover>
</footer>
