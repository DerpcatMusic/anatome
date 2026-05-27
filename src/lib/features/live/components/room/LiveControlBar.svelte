<script lang="ts">
  import { Popover, Switch, Toolbar, Toggle, Tooltip } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    resolveLiveSession,
    type LiveSessionControlBar,
  } from "$lib/features/live/live-session.svelte";
  import LiveMediaSplitControl from "./ui/LiveMediaSplitControl.svelte";
  import LiveInlineAudioMeter from "./ui/LiveInlineAudioMeter.svelte";
  import LivePublishSettingsFields from "./LivePublishSettingsFields.svelte";

  let {
    session: sessionProp,
    room: roomAlias,
  }: {
    session?: LiveSessionControlBar;
    /** @deprecated Pass `session` instead. */
    room?: LiveSessionControlBar;
  } = $props();

  const session = $derived(resolveLiveSession(sessionProp, roomAlias, "LiveControlBar"));
  const { t } = useI18n();

  const micDevices = $derived(
    session.audioDevices.map((d) => ({ deviceId: d.deviceId, label: d.label })),
  );
  const cameraDevices = $derived(
    session.videoDevices.map((d) => ({ deviceId: d.deviceId, label: d.label })),
  );

  const micBusy = $derived(session.pendingControl === "mic");
  const cameraBusy = $derived(session.pendingControl === "camera");
  const screenBusy = $derived(session.pendingControl === "screen");

  const cameraDisabled = $derived(
    session.connectionState !== "connected" || !session.cameraAvailable,
  );
</script>

<footer class="lr-control-bar">
  <Toolbar.Root class="lr-control-bar__toolbar" aria-label={t.live.room.settingsTitle()}>
    <div class="lr-control-bar__media" role="group" aria-label={t.live.controls.mic()}>
      <LiveMediaSplitControl
        kind="mic"
        enabled={session.micEnabled}
        busy={micBusy}
        disabled={session.connectionState !== "connected"}
        devices={micDevices}
        selectedDeviceId={session.selectedAudioDevice}
        toggleLabel={session.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic()}
        deviceMenuLabel={t.live.controls.mic()}
        onToggle={() => void session.toggleMic()}
        onSelectDevice={(deviceId) => void session.switchStreamDevice("audioinput", deviceId)}
      />
    </div>

    <div class="lr-control-bar__media" role="group" aria-label={t.live.controls.camera()}>
      <LiveMediaSplitControl
        kind="camera"
        enabled={session.cameraEnabled}
        busy={cameraBusy}
        disabled={cameraDisabled}
        devices={cameraDevices}
        selectedDeviceId={session.selectedVideoDevice}
        toggleLabel={session.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera()}
        deviceMenuLabel={t.live.controls.camera()}
        onToggle={() => void session.toggleCamera()}
        onSelectDevice={(deviceId) => void session.switchStreamDevice("videoinput", deviceId)}
      />
    </div>

    {#if session.isInstructorRoom}
      <div class="lr-control-bar__media" role="group" aria-label={t.live.controls.screen()}>
        <Toggle.Root
          pressed={session.screenShareEnabled}
          onPressedChange={() => void session.toggleScreenShare()}
          disabled={screenBusy || session.connectionState !== "connected"}
          aria-label={session.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen()}
        >
          {#snippet child({ props, pressed })}
            <Toolbar.Button
              {...props}
              class="lr-dock-btn lr-dock-btn--toggle lr-dock-btn--screen {pressed ? 'lr-dock-btn--on' : ''}"
              data-state={pressed ? "on" : "off"}
              aria-busy={screenBusy}
            >
              <span class="material-symbols-rounded" aria-hidden="true">
                {pressed ? "stop_screen_share" : "present_to_all"}
              </span>
            </Toolbar.Button>
          {/snippet}
        </Toggle.Root>
      </div>
    {/if}

    {#if session.isInstructorRoom && session.connectionState === "connected"}
      <LiveInlineAudioMeter label={t.live.preConnect.audioLevel()} level={session.audioLevel} />
    {/if}

    <div class="lr-control-bar__group" role="group" aria-label={t.live.room.settingsTitle()}>
      <Popover.Root>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Toolbar.Button
              {...props}
              class="lr-dock-btn lr-dock-btn--toggle"
              aria-label={t.live.room.settingsTitle()}
            >
              <span class="material-symbols-rounded" aria-hidden="true">settings</span>
            </Toolbar.Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            class="hb-popover-content lr-popover lr-settings-panel lr-settings-panel--publish"
            side="top"
            align="center"
            sideOffset={8}
          >
            <div class="lr-settings">
              <strong class="lr-settings__title">{t.live.room.settingsTitle()}</strong>

              {#if session.isInstructorRoom}
                <LivePublishSettingsFields
                  {session}
                  mode="compact"
                  showPresets={false}
                  showEchoToggle={false}
                />
              {/if}

              <div class="lr-settings__session">
                <span class="hb-switch">
                  <Switch.Root
                    class="hb-switch__root"
                    aria-label={t.live.room.echoCancel()}
                    bind:checked={session.audioProcessingEnabled}
                    onCheckedChange={() => void session.applyAudioProcessing()}
                  >
                    <Switch.Thumb class="hb-switch__thumb" />
                  </Switch.Root>
                  <span>{t.live.room.echoCancel()}</span>
                </span>

                {#if session.isInstructorRoom}
                  <span class="hb-switch">
                    <Switch.Root
                      class="hb-switch__root"
                      aria-label={t.live.controls.selfMonitorOn()}
                      bind:checked={session.selfAudioMonitorEnabled}
                    >
                      <Switch.Thumb class="hb-switch__thumb" />
                    </Switch.Root>
                    <span>{t.live.controls.selfMonitorOn()}</span>
                  </span>

                  <span class="hb-switch">
                    <Switch.Root
                      class="hb-switch__root"
                      aria-label={t.live.room.screenShareAudio()}
                      checked={session.screenShareAudioEnabled}
                      disabled={!session.screenShareEnabled}
                      onCheckedChange={(value) => void session.setScreenShareAudioEnabled(!!value)}
                    >
                      <Switch.Thumb class="hb-switch__thumb" />
                    </Switch.Root>
                    <span>{t.live.room.screenShareAudio()}</span>
                  </span>
                {/if}
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  </Toolbar.Root>
</footer>

<style>
  .lr-control-bar__toolbar {
    flex-wrap: nowrap;
    gap: 4px;
    max-width: 100%;
  }

  .lr-control-bar__media {
    flex-shrink: 0;
  }

  :global(.lr-settings-panel--publish) {
    max-width: min(92vw, 320px);
    max-height: min(70vh, 520px);
    overflow: auto;
  }

  .lr-settings__session {
    display: grid;
    gap: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-color);
  }
</style>
