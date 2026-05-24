<script lang="ts">
  import { Button } from "bits-ui";
  import { Select } from "bits-ui";
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
  {:else if room.status === "waiting"}
    <PreConnectState
      title={t.live.room.joinTooEarlyTitle()}
      message={room.joinWaitingMessage ?? t.live.room.joinTooEarlyBody()}
      actionLabel={t.live.preConnect.retry()}
      onAction={() => room.loadToken()}
      secondaryLabel={t.live.preConnect.backCalendar()}
      secondaryHref={backHref}
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
      {#if isPrep}
        <p class="prep-notice" role="status">{t.live.preConnect.prepNotice()}</p>
      {/if}
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
                  <Button.Root class="hb-button hb-button--primary hb-button--lg" type="button" onclick={() => room.startLiveAndConnect(true)}>{t.live.preConnect.startLive()}</Button.Root>
                {:else}
                  <Button.Root class="hb-button hb-button--primary hb-button--lg" type="button" onclick={() => room.enterRoom(true)}>{t.live.preConnect.enterRoom()}</Button.Root>
                {/if}
                <Button.Root class="hb-button hb-button--ghost" type="button" onclick={() => isPrep ? room.startLiveAndConnect(false) : room.enterRoom(false)}>{t.live.preConnect.enterWithoutDevices()}</Button.Root>
              </div>
            </aside>
            <div class="entry-console__main">
              <PreConnectPreview previewStream={room.previewStream} hasPreviewCamera={room.hasPreviewCamera} />
            </div>
          </div>
        {:else}
          <!-- Customer: simple stacked layout -->
          <div class="customer-connect">
            <div class="customer-connect__preview">
              <PreConnectPreview previewStream={room.previewStream} hasPreviewCamera={room.hasPreviewCamera} />
            </div>
            <div class="customer-connect__tools">
              <p class="customer-connect__hint">{t.live.room.listenModeHint()}</p>
              {#if room.videoDevices.length > 1}
                {@const cameraOptions = room.videoDevices.map((d) => ({ value: d.deviceId, label: d.label }))}
                <div class="hb-field">
                  <span class="hb-field__label">{t.live.preConnect.cameraLabel()}</span>
                  <Select.Root
                    type="single"
                    value={room.selectedVideoDevice}
                    onValueChange={(v) => { room.selectedVideoDevice = v; room.switchPreviewDevice(); }}
                    items={cameraOptions.map((o) => ({ value: o.value, label: o.label }))}
                  >
                    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.cameraLabel()}>
                      <span class="hb-select__value">{cameraOptions.find((o) => o.value === room.selectedVideoDevice)?.label ?? ""}</span>
                      <span class="hb-select__chevron" aria-hidden="true"></span>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content class="hb-select__content" sideOffset={6}>
                        <Select.Viewport class="hb-select__viewport">
                          {#each cameraOptions as option}
                            <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                              {#snippet children({ selected })}
                                <span>{option.label}</span>
                                {#if selected}
                                  <span class="hb-select__check" aria-hidden="true"></span>
                                {/if}
                              {/snippet}
                            </Select.Item>
                          {/each}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              {/if}
              {#if room.audioDevices.length > 1}
                {@const micOptions = room.audioDevices.map((d) => ({ value: d.deviceId, label: d.label }))}
                <div class="hb-field">
                  <span class="hb-field__label">{t.live.preConnect.micLabel()}</span>
                  <Select.Root
                    type="single"
                    value={room.selectedAudioDevice}
                    onValueChange={(v) => { room.selectedAudioDevice = v; room.switchPreviewDevice(); }}
                    items={micOptions.map((o) => ({ value: o.value, label: o.label }))}
                  >
                    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.micLabel()}>
                      <span class="hb-select__value">{micOptions.find((o) => o.value === room.selectedAudioDevice)?.label ?? ""}</span>
                      <span class="hb-select__chevron" aria-hidden="true"></span>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content class="hb-select__content" sideOffset={6}>
                        <Select.Viewport class="hb-select__viewport">
                          {#each micOptions as option}
                            <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                              {#snippet children({ selected })}
                                <span>{option.label}</span>
                                {#if selected}
                                  <span class="hb-select__check" aria-hidden="true"></span>
                                {/if}
                              {/snippet}
                            </Select.Item>
                          {/each}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              {/if}
              {#if room.hasPreviewMic}
                <LiveAudioMeter label={t.live.preConnect.audioLevel()} level={room.audioLevel} />
              {/if}
              <div class="customer-connect__actions">
                <Button.Root class="hb-button hb-button--primary hb-button--lg" type="button" onclick={() => room.enterRoom(false)}>{t.live.preConnect.enterRoom()}</Button.Root>
                <Button.Root class="hb-button hb-button--ghost" type="button" onclick={() => room.enterRoom(true)}>{t.live.room.enterWithDevices()}</Button.Root>
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
          <Button.Root class="hb-button hb-button--ghost" type="button" onclick={() => isPrep ? room.startLiveAndConnect(false) : room.enterRoom(false)}>{t.live.preConnect.enterWithoutCamera()}</Button.Root>
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

  .prep-notice {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px solid color-mix(in srgb, var(--terra) 35%, transparent);
    background: color-mix(in srgb, var(--terra) 10%, transparent);
    font-size: var(--step--1);
    line-height: 1.5;
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


  .customer-connect__tools {
    display: grid;
    gap: var(--space-3);
    direction: rtl;
  }

  .customer-connect__hint {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.45;
    color: color-mix(in srgb, var(--ink) 68%, transparent);
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
