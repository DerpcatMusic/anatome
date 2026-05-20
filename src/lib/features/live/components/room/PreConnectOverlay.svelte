<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import LiveAudioMeter from "./ui/LiveAudioMeter.svelte";

  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";
  import PreConnectFrame from "./PreConnectFrame.svelte";
  import PreConnectPreview from "./PreConnectPreview.svelte";
  import PreConnectSettings from "./PreConnectSettings.svelte";
  import PreConnectState from "./PreConnectState.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();

  const backHref = $derived(
    room.isInstructorRoom ? "/i/live" : "/u/calendar"
  );
  const isPrep = $derived(room.status === "prep");
  const isReady = $derived(room.status === "ready" && room.joinInfo && room.connectionState === "idle");
  const showSetup = $derived(isPrep || isReady);

  // Auto-start preview when entering the setup state
  $effect(() => {
    if (showSetup && room.preConnectStep === "idle") {
      room.startPreview();
    }
  });
</script>

<PreConnectFrame
  title={t.live.preConnect.title()}
  {backHref}
>
  {#if room.status === "checking"}
    <PreConnectState loading message={t.live.preConnect.checking()} />
  {:else if room.status === "locked"}
    <PreConnectState
      title={t.live.preConnect.lockedTitle()}
      message={room.auth.error}
      actionLabel={t.live.preConnect.lockedCta()}
      actionHref="/"
    />
  {:else if room.status === "missing"}
    <PreConnectState
      title={t.live.preConnect.missingTitle()}
      actionLabel={t.live.preConnect.missingCta()}
      actionHref="/u/calendar"
    />
  {:else if room.status === "error"}
    <PreConnectState
      title={t.live.preConnect.errorTitle()}
      message={room.error}
      tone="danger"
      actionLabel={t.live.preConnect.retry()}
      onAction={() => room.loadToken()}
      secondaryLabel={t.live.preConnect.backCalendar()}
      secondaryHref="/u/calendar"
    />
  {:else if showSetup}
    <div class="entry-stack">
      {#if room.preConnectStep === "requesting"}
        <PreConnectState loading message={t.live.preConnect.requesting()} />
      {:else if room.preConnectStep === "preview" && room.previewStream}
        {#if room.isInstructorRoom}
          <!-- Instructor: full settings + preview side-by-side -->
          <div class="entry-console">
            <aside class="entry-console__side">
              <PreConnectSettings {room} />
              <div class="entry-actions">
                {#if isPrep}
                  <Button tone="primary" size="lg" onclick={() => room.startLiveAndConnect(true)}>{t.live.preConnect.startLive()}</Button>
                {:else}
                  <Button tone="primary" size="lg" onclick={() => room.enterRoom(true)}>{t.live.preConnect.enterRoom()}</Button>
                {/if}
                <Button tone="ghost" onclick={() => isPrep ? room.startLiveAndConnect(false) : room.enterRoom(false)}>{t.live.preConnect.enterWithoutDevices()}</Button>
              </div>
            </aside>
            <div class="entry-console__main">
              <PreConnectPreview {room} />
            </div>
          </div>
        {:else}
          <!-- Customer: simple stacked layout -->
          <div class="customer-connect">
            <div class="customer-connect__preview">
              <PreConnectPreview {room} />
            </div>
            <div class="customer-connect__tools">
              {#if room.videoDevices.length > 1}
                <Select
                  label={t.live.preConnect.cameraLabel()}
                  bind:value={room.selectedVideoDevice}
                  options={room.videoDevices.map((d) => ({ value: d.deviceId, label: d.label }))}
                  onchange={() => room.switchPreviewDevice()}
                />
              {/if}
              {#if room.audioDevices.length > 1}
                <Select
                  label={t.live.preConnect.micLabel()}
                  bind:value={room.selectedAudioDevice}
                  options={room.audioDevices.map((d) => ({ value: d.deviceId, label: d.label }))}
                  onchange={() => room.switchPreviewDevice()}
                />
              {/if}
              {#if room.hasPreviewMic}
                <LiveAudioMeter label={t.live.preConnect.audioLevel()} level={room.audioLevel} />
              {/if}
              <div class="customer-connect__actions">
                <Button tone="primary" size="lg" onclick={() => room.enterRoom(true)}>{t.live.preConnect.enterRoom()}</Button>
                <Button tone="ghost" onclick={() => room.enterRoom(false)}>{t.live.preConnect.enterWithoutDevices()}</Button>
              </div>
            </div>
          </div>
        {/if}
      {:else if room.preConnectStep === "denied" || room.preConnectStep === "no-devices"}
        <PreConnectState
          title={t.live.preConnect.enterNoDevices()}
          message={room.mediaError}
          tone="caution"
          actionLabel={t.live.preConnect.retryDevices()}
          onAction={() => room.startPreview()}
        />
        <div class="entry-actions entry-actions--single">
          <Button tone="ghost" onclick={() => isPrep ? room.startLiveAndConnect(false) : room.enterRoom(false)}>{t.live.preConnect.enterWithoutCamera()}</Button>
        </div>
      {/if}
    </div>
  {/if}
</PreConnectFrame>

<style>
  .entry-stack {
    display: grid;
    gap: var(--space-4);
    min-height: 0;
  }

  .entry-console {
    display: flex;
    flex-direction: row;
    gap: clamp(16px, 2vw, 24px);
    min-height: 0;
    direction: rtl;
  }

  .entry-console__main,
  .entry-console__side {
    min-width: 0;
    display: grid;
    align-content: start;
    gap: var(--space-4);
  }

  .entry-console__main {
    flex: 1 1 auto;
  }

  .entry-console__side {
    flex: 0 0 min(390px, 34vw);
    grid-template-rows: auto auto;
  }

  .entry-actions {
    display: grid;
    gap: var(--space-3);
  }

  .entry-actions--single {
    justify-self: center;
  }

  /* ─── Customer simple layout ─── */
  .customer-connect {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    max-width: 640px;
    margin: 0 auto;
    width: 100%;
  }

  .customer-connect__preview {
    min-height: 0;
  }

  .customer-connect__preview :global(.preview-panel__video),
  .customer-connect__preview :global(.preview-panel__empty) {
    aspect-ratio: 16 / 9;
  }

  .customer-connect__tools {
    display: grid;
    gap: var(--space-3);
    direction: rtl;
  }

  .customer-connect__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    padding-top: var(--space-2);
  }

  @media (max-width: 64rem) {
    .entry-console {
      flex-direction: column;
    }

    .entry-console__side {
      flex-basis: auto;
    }
  }
</style>
