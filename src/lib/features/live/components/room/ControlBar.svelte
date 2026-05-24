<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";
  import LiveAudioMeter from "./ui/LiveAudioMeter.svelte";
  import LiveMediaSplitControl from "./ui/LiveMediaSplitControl.svelte";
  import { Popover, Switch, Toolbar, Tooltip } from "bits-ui";

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

  const controlsDisabled = $derived(room.pendingControl !== null);
</script>

<footer class="lr-control-bar">
  <Toolbar.Root class="hb-toolbar lr-control-bar__toolbar" aria-label={t.live.room.settingsTitle()}>
    <div class="hb-toolbar__group lr-control-bar__media" role="group" aria-label={t.live.preConnect.micLabel()}>
      <LiveMediaSplitControl
        kind="mic"
        enabled={room.micEnabled}
        busy={room.pendingControl === "mic"}
        disabled={controlsDisabled}
        devices={room.audioDevices}
        selectedDeviceId={room.selectedAudioDevice}
        toggleLabel={room.micEnabled ? t.live.controls.micOnLabel() : t.live.controls.micOffLabel()}
        tooltipLabel={room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}
        deviceMenuLabel={t.live.preConnect.micLabel()}
        onToggle={() => room.toggleMic()}
        onSelectDevice={switchMic}
      />

      <LiveMediaSplitControl
        kind="camera"
        enabled={room.cameraEnabled}
        busy={room.pendingControl === "camera"}
        disabled={controlsDisabled}
        devices={room.videoDevices}
        selectedDeviceId={room.selectedVideoDevice}
        toggleLabel={room.cameraEnabled ? t.live.controls.cameraOnLabel() : t.live.controls.cameraOffLabel()}
        tooltipLabel={room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}
        deviceMenuLabel={t.live.preConnect.cameraLabel()}
        onToggle={() => room.toggleCamera()}
        onSelectDevice={switchCamera}
      />
    </div>

    {#if room.isInstructorRoom}
      <div class="hb-toolbar__group" role="group" aria-label={t.live.controls.startScreen()}>
        <Tooltip.Root>
          <Tooltip.Trigger class="hb-tooltip-trigger">
            <Toolbar.Button
              class="hb-button hb-button--control {room.screenShareEnabled ? 'hb-button--control-on' : ''}"
              disabled={controlsDisabled}
              onclick={() => room.toggleScreenShare()}
              aria-label={room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
            >
              <span class="material-symbols-rounded" aria-hidden="true">
                {room.screenShareEnabled ? "stop_screen_share" : "screen_share"}
              </span>
            </Toolbar.Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="hb-tooltip-content">
              {room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    {/if}

    <div class="hb-toolbar__group lr-panel-toggles" role="group" aria-label={t.live.room.chatTitle()}>
      <Tooltip.Root>
        <Tooltip.Trigger class="hb-tooltip-trigger">
          <Toolbar.Button
            class="hb-button hb-button--control hb-toolbar-control {room.showChat ? 'hb-button--control-on' : ''}"
            onclick={() => (room.showChat = !room.showChat)}
            aria-label={room.showChat ? t.live.room.hideChat() : t.live.room.showChat()}
            aria-pressed={room.showChat}
          >
            <span class="material-symbols-rounded" aria-hidden="true">
              {room.showChat ? "chat" : "chat_bubble_outline"}
            </span>
            {#if room.unreadChatCount > 0 && !room.showChat}
              <span class="hb-toolbar-control__badge" aria-label={t.live.room.newMessages()}>
                {room.unreadChatCount}
              </span>
            {/if}
          </Toolbar.Button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="hb-tooltip-content">
            {room.showChat ? t.live.room.hideChat() : t.live.room.showChat()}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>

    <div class="hb-toolbar__group" role="group" aria-label={t.live.room.settingsTitle()}>
      <Popover.Root>
        <Popover.Trigger class="hb-popover-trigger">
          <Toolbar.Button class="hb-button hb-button--control" aria-label={t.live.room.settingsTitle()}>
            <span class="material-symbols-rounded" aria-hidden="true">settings</span>
          </Toolbar.Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            class="hb-popover-content lr-popover lr-settings-panel"
            side="top"
            align="center"
            sideOffset={8}
          >
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
    </div>

    {#if room.isInstructorRoom && room.connectionState === "connected"}
      <div class="lr-control-bar__meter" aria-hidden="true">
        <LiveAudioMeter label={t.live.preConnect.audioLevel()} level={room.audioLevel} />
      </div>
    {/if}
  </Toolbar.Root>
</footer>
