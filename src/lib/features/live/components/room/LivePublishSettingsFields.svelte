<script lang="ts">
  import { Select, Switch } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import LiveBrowserMediaHints from "./LiveBrowserMediaHints.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import type {
    AudioPresetChoice,
    BitrateChoice,
    DegradationPreferenceChoice,
    VideoCodecChoice,
    VideoFramerateChoice,
    VideoResolutionChoice,
  } from "$lib/features/live/types";

  let {
    session,
    mode = "prep",
    showPresets = true,
    showEchoToggle = true,
  }: {
    session: LiveSessionPreConnect;
    mode?: "prep" | "compact";
    showPresets?: boolean;
    showEchoToggle?: boolean;
  } = $props();

  const { t } = useI18n();

  let showAdvanced = $state(true);

  const isInstructor = $derived(session.isInstructorRoom);
  const advancedExpanded = $derived(mode === "compact" || showAdvanced);
  const showAdvancedToggle = $derived(mode !== "compact");
  const selectOverlayClass = "hb-select__content lr-select-overlay";

  const instructorResolutionOptions: { value: VideoResolutionChoice; label: string }[] = [
    { value: "1080p", label: "1080p (1920×1080)" },
    { value: "720p", label: "720p (1280×720)" },
    { value: "480p", label: "480p (854×480)" },
    { value: "360p", label: "360p (640×360)" },
  ];
  const customerResolutionOptions: { value: VideoResolutionChoice; label: string }[] = [
    { value: "720p", label: "720p" },
    { value: "360p", label: "360p" },
  ];
  const resolutionOptions = $derived(
    isInstructor ? instructorResolutionOptions : customerResolutionOptions,
  );

  const codecOptions: { value: VideoCodecChoice; label: string; hint?: string }[] = [
    { value: "h264", label: "H.264 (AVC)", hint: "הכי תואם לדפדפנים" },
    { value: "vp8", label: "VP8" },
    { value: "vp9", label: "VP9" },
    { value: "av1", label: "AV1" },
  ];

  const bitrateOptions: { value: BitrateChoice; label: string }[] = [
    { value: 2.5, label: "2.5 Mbps" },
    { value: 4.5, label: "4.5 Mbps" },
    { value: 6, label: "6 Mbps" },
    { value: 8, label: "8 Mbps" },
  ];

  const framerateOptions: { value: VideoFramerateChoice; label: string }[] = [
    { value: 24, label: "24 fps" },
    { value: 30, label: "30 fps" },
    { value: 60, label: "60 fps" },
  ];

  const audioOptions: { value: AudioPresetChoice; label: string }[] = [
    { value: "speech", label: "דיבור" },
    { value: "music", label: "תנועה" },
    { value: "musicStereo", label: "סטריאו" },
    { value: "musicHighQuality", label: "Hi-Fi" },
    { value: "musicHighQualityStereo", label: "Hi-Fi סטריאו" },
  ];

  const priorityOptions: { value: DegradationPreferenceChoice; label: string }[] = [
    { value: "maintain-framerate", label: "תנועה חלקה" },
    { value: "maintain-resolution", label: "תמונה חדה" },
    { value: "balanced", label: "מאוזן" },
  ];

  function afterPublishFieldChange(syncResolution = false) {
    if (session.selectedFramerate > 30 && session.simulcastEnabled) {
      session.simulcastEnabled = false;
    }
    const canApplyLive =
      session.inRoom && session.connectionState === "connected" && session.getClassId() !== null;
    if (syncResolution && session.isInstructorRoom && canApplyLive) {
      void session.syncPublishReceiveFromResolution();
    }
    if (canApplyLive) {
      session.scheduleApplyPublishSettings();
    }
  }

  function applyPreset(name: "voice" | "standard" | "high" | "low") {
    if (name === "voice") {
      session.selectedResolution = "720p";
      session.selectedCodec = "h264";
      session.selectedBitrateMbps = 2.5;
      session.selectedFramerate = 30;
      session.selectedAudioPreset = "speech";
      session.degradationPreference = "maintain-framerate";
      session.simulcastEnabled = true;
      session.audioProcessingEnabled = true;
    } else if (name === "standard") {
      session.selectedResolution = "720p";
      session.selectedCodec = "h264";
      session.selectedBitrateMbps = 4.5;
      session.selectedFramerate = 30;
      session.selectedAudioPreset = "music";
      session.degradationPreference = "maintain-framerate";
      session.simulcastEnabled = true;
    } else if (name === "high") {
      session.selectedResolution = "1080p";
      session.selectedCodec = "h264";
      session.selectedBitrateMbps = 6;
      session.selectedFramerate = 30;
      session.selectedAudioPreset = "musicHighQuality";
      session.degradationPreference = "maintain-framerate";
      session.simulcastEnabled = true;
    } else if (name === "low") {
      session.selectedResolution = "480p";
      session.selectedCodec = "h264";
      session.selectedBitrateMbps = 2.5;
      session.selectedFramerate = 24;
      session.selectedAudioPreset = "speech";
      session.degradationPreference = "balanced";
      session.simulcastEnabled = true;
    }
    afterPublishFieldChange(true);
  }
</script>

<div class="publish-fields" class:publish-fields--compact={mode === "compact"}>
  {#if isInstructor}
    <LiveBrowserMediaHints {session} />
  {/if}
  {#if mode === "prep" && isInstructor}
    <p class="publish-fields__hint">{t.live.preConnect.publishPrepHint()}</p>
  {:else if mode === "compact" && isInstructor}
    <p class="publish-fields__hint">
      {#if session.publishSettingsApplying}
        מעדכנת איכות שידור…
      {:else if session.activePublishVideoSource === "screen_share"}
        ההגדרות חלות על שיתוף המסך (לא על מצלמה כבויה). שיתוף מחדש אחרי שינוי קודק/ביטרייט.
      {:else}
        שינויים חלים על השידור מיד (המצלמה עשויה להבהב לרגע).
      {/if}
    </p>
  {/if}

  {#if showPresets && isInstructor}
    <p class="preset-hint">{t.live.preConnect.voicePresetHint()}</p>
    <div class="preset-row">
      <button
        type="button"
        class="preset-btn"
        class:preset-btn--active={session.selectedAudioPreset === "speech" && session.selectedBitrateMbps === 2.5}
        onclick={() => applyPreset("voice")}
      >
        <span class="preset-btn__title">{t.live.preConnect.presetVoice()}</span>
        <span class="preset-btn__desc">720p · דיבור</span>
      </button>
      <button
        type="button"
        class="preset-btn"
        class:preset-btn--active={session.selectedResolution === "720p" && session.selectedBitrateMbps === 4.5 && session.selectedAudioPreset === "music"}
        onclick={() => applyPreset("standard")}
      >
        <span class="preset-btn__title">{t.live.preConnect.presetStandard()}</span>
        <span class="preset-btn__desc">720p · 4.5 Mbps</span>
      </button>
      <button
        type="button"
        class="preset-btn"
        class:preset-btn--active={session.selectedResolution === "1080p" && session.selectedBitrateMbps === 6}
        onclick={() => applyPreset("high")}
      >
        <span class="preset-btn__title">{t.live.preConnect.presetHigh()}</span>
        <span class="preset-btn__desc">1080p · 6 Mbps</span>
      </button>
      <button
        type="button"
        class="preset-btn"
        class:preset-btn--active={session.selectedResolution === "480p" && session.selectedBitrateMbps === 2.5}
        onclick={() => applyPreset("low")}
      >
        <span class="preset-btn__title">{t.live.preConnect.presetLow()}</span>
        <span class="preset-btn__desc">480p · חיסכון</span>
      </button>
    </div>
    <p class="publish-fields__audience-note">{t.live.preConnect.presetAudienceNote()}</p>
  {/if}

  <div class="publish-stack">
    <div class="hb-field hb-field--stacked">
      <span class="hb-field__label">{t.live.preConnect.resolutionLabel()}</span>
      <Select.Root
        type="single"
        value={String(session.selectedResolution)}
        onValueChange={(selected) => {
          session.selectedResolution = selected as VideoResolutionChoice;
          afterPublishFieldChange(true);
        }}
      >
        <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.resolutionLabel()}>
          <span class="hb-select__value"
            >{resolutionOptions.find((o) => o.value === session.selectedResolution)?.label ?? ""}</span
          >
          <span class="hb-select__chevron" aria-hidden="true"></span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class={selectOverlayClass} sideOffset={6}>
            <Select.Viewport class="hb-select__viewport">
              {#each resolutionOptions as option (option.value)}
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

    {#if isInstructor}
      <div class="hb-field hb-field--stacked">
        <span class="hb-field__label">{t.live.preConnect.subscriberReceiveTitle()}</span>
        <p class="publish-fields__codec-note">{t.live.preConnect.subscriberReceiveHint()}</p>
        <Select.Root
          type="single"
          value={session.subscriberReceivePreset}
          onValueChange={(selected) => {
            void session.setSubscriberReceivePreset(selected as import("$lib/features/live/types").SubscriberReceivePreset);
          }}
        >
          <Select.Trigger
            class="hb-select__trigger"
            aria-label={t.live.preConnect.subscriberReceiveTitle()}
          >
            <span class="hb-select__value">
              {#if session.subscriberReceivePreset === "low"}
                {t.live.preConnect.subscriberReceiveLow()} — {t.live.preConnect.subscriberReceiveLowDesc()}
              {:else if session.subscriberReceivePreset === "high"}
                {t.live.preConnect.subscriberReceiveHigh()} — {t.live.preConnect.subscriberReceiveHighDesc()}
              {:else}
                {t.live.preConnect.subscriberReceiveMedium()} — {t.live.preConnect.subscriberReceiveMediumDesc()}
              {/if}
            </span>
            <span class="hb-select__chevron" aria-hidden="true"></span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectOverlayClass} sideOffset={6}>
              <Select.Viewport class="hb-select__viewport">
                <Select.Item class="hb-select__item" value="low" label={t.live.preConnect.subscriberReceiveLow()}>
                  {#snippet children({ selected })}
                    <span>{t.live.preConnect.subscriberReceiveLow()} — {t.live.preConnect.subscriberReceiveLowDesc()}</span>
                    {#if selected}<span class="hb-select__check" aria-hidden="true"></span>{/if}
                  {/snippet}
                </Select.Item>
                <Select.Item class="hb-select__item" value="medium" label={t.live.preConnect.subscriberReceiveMedium()}>
                  {#snippet children({ selected })}
                    <span>{t.live.preConnect.subscriberReceiveMedium()} — {t.live.preConnect.subscriberReceiveMediumDesc()}</span>
                    {#if selected}<span class="hb-select__check" aria-hidden="true"></span>{/if}
                  {/snippet}
                </Select.Item>
                <Select.Item class="hb-select__item" value="high" label={t.live.preConnect.subscriberReceiveHigh()}>
                  {#snippet children({ selected })}
                    <span>{t.live.preConnect.subscriberReceiveHigh()} — {t.live.preConnect.subscriberReceiveHighDesc()}</span>
                    {#if selected}<span class="hb-select__check" aria-hidden="true"></span>{/if}
                  {/snippet}
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div class="hb-field hb-field--stacked">
        <span class="hb-field__label">{t.live.preConnect.codecLabel()}</span>
        <Select.Root
          type="single"
          value={String(session.selectedCodec)}
          onValueChange={(selected) => {
            session.selectedCodec = selected as VideoCodecChoice;
            afterPublishFieldChange();
          }}
        >
          <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.codecLabel()}>
            <span class="hb-select__value"
              >{codecOptions.find((o) => o.value === session.selectedCodec)?.label ?? ""}</span
            >
            <span class="hb-select__chevron" aria-hidden="true"></span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectOverlayClass} sideOffset={6}>
              <Select.Viewport class="hb-select__viewport">
                {#each codecOptions as option (option.value)}
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
        <p class="publish-fields__codec-note">{t.live.preConnect.codecHevcNote()}</p>
      </div>

      <div class="hb-field hb-field--stacked">
        <span class="hb-field__label">{t.live.preConnect.bitrateLabel()}</span>
        <Select.Root
          type="single"
          value={String(session.selectedBitrateMbps)}
          onValueChange={(selected) => {
            session.selectedBitrateMbps = Number(selected) as BitrateChoice;
            afterPublishFieldChange();
          }}
        >
          <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.bitrateLabel()}>
            <span class="hb-select__value"
              >{bitrateOptions.find((o) => o.value === session.selectedBitrateMbps)?.label ?? ""}</span
            >
            <span class="hb-select__chevron" aria-hidden="true"></span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectOverlayClass} sideOffset={6}>
              <Select.Viewport class="hb-select__viewport">
                {#each bitrateOptions as option (option.value)}
                  <Select.Item class="hb-select__item" value={String(option.value)} label={option.label}>
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

      <div class="hb-field hb-field--stacked">
        <span class="hb-field__label">{t.live.preConnect.framerateLabel()}</span>
        <Select.Root
          type="single"
          value={String(session.selectedFramerate)}
          onValueChange={(selected) => {
            session.selectedFramerate = Number(selected) as VideoFramerateChoice;
            afterPublishFieldChange();
          }}
        >
          <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.framerateLabel()}>
            <span class="hb-select__value"
              >{framerateOptions.find((o) => o.value === session.selectedFramerate)?.label ?? ""}</span
            >
            <span class="hb-select__chevron" aria-hidden="true"></span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectOverlayClass} sideOffset={6}>
              <Select.Viewport class="hb-select__viewport">
                {#each framerateOptions as option (option.value)}
                  <Select.Item class="hb-select__item" value={String(option.value)} label={option.label}>
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
  </div>

  {#if isInstructor}
    {#if showAdvancedToggle}
      <button type="button" class="advanced-toggle" onclick={() => (showAdvanced = !showAdvanced)}>
        <span class="material-symbols-rounded" aria-hidden="true"
          >{showAdvanced ? "expand_less" : "expand_more"}</span
        >
        <span>{t.live.preConnect.advancedSettingsLabel()}</span>
      </button>
    {/if}

    {#if advancedExpanded}
      <div class="publish-stack publish-stack--advanced" class:publish-stack--advanced-flat={mode === "compact"}>
        <div class="hb-field hb-field--stacked">
          <span class="hb-field__label">{t.live.preConnect.audioLabel()}</span>
          <Select.Root
            type="single"
            value={String(session.selectedAudioPreset)}
            onValueChange={(selected) => {
              session.selectedAudioPreset = selected as AudioPresetChoice;
              afterPublishFieldChange();
            }}
          >
            <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.audioLabel()}>
              <span class="hb-select__value"
                >{audioOptions.find((o) => o.value === session.selectedAudioPreset)?.label ?? ""}</span
              >
              <span class="hb-select__chevron" aria-hidden="true"></span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content class={selectOverlayClass} sideOffset={6}>
                <Select.Viewport class="hb-select__viewport">
                  {#each audioOptions as option (option.value)}
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

        <div class="hb-field hb-field--stacked">
          <span class="hb-field__label">{t.live.preConnect.priorityLabel()}</span>
          <Select.Root
            type="single"
            value={String(session.degradationPreference)}
            onValueChange={(selected) => {
              session.degradationPreference = selected as DegradationPreferenceChoice;
              afterPublishFieldChange();
            }}
          >
            <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.priorityLabel()}>
              <span class="hb-select__value"
                >{priorityOptions.find((o) => o.value === session.degradationPreference)?.label ?? ""}</span
              >
              <span class="hb-select__chevron" aria-hidden="true"></span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content class={selectOverlayClass} sideOffset={6}>
                <Select.Viewport class="hb-select__viewport">
                  {#each priorityOptions as option (option.value)}
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

        <div class="publish-fields__toggles">
          <span class="hb-switch">
            <Switch.Root
              class="hb-switch__root"
              aria-label={t.live.preConnect.simulcastLabel()}
              bind:checked={session.simulcastEnabled}
              onCheckedChange={() => afterPublishFieldChange()}
            >
              <Switch.Thumb class="hb-switch__thumb" />
            </Switch.Root>
            <span>{t.live.preConnect.simulcastLabel()}</span>
          </span>
          <span class="hb-switch">
            <Switch.Root
              class="hb-switch__root"
              aria-label={t.live.preConnect.stereoLabel()}
              bind:checked={session.forceStereo}
              onCheckedChange={() => afterPublishFieldChange()}
            >
              <Switch.Thumb class="hb-switch__thumb" />
            </Switch.Root>
            <span>{t.live.preConnect.stereoLabel()}</span>
          </span>
        </div>
      </div>
    {/if}
  {/if}

  {#if showEchoToggle}
    <div class="publish-fields__toggles">
      <span class="hb-switch">
        <Switch.Root
          class="hb-switch__root"
          aria-label={t.live.room.echoCancel()}
          bind:checked={session.audioProcessingEnabled}
        >
          <Switch.Thumb class="hb-switch__thumb" />
        </Switch.Root>
        <span>{t.live.room.echoCancel()}</span>
      </span>
    </div>
  {/if}
</div>

<style>
  .publish-fields {
    display: grid;
    gap: var(--space-3);
    min-width: 0;
    width: 100%;
  }

  .publish-fields--compact {
    gap: var(--space-2);
  }

  .publish-fields__hint,
  .publish-fields__codec-note,
  .preset-hint {
    margin: 0;
    font-size: var(--step--2);
    line-height: 1.45;
    color: var(--foreground-muted);
  }

  .publish-fields__codec-note {
    padding-inline-start: 2px;
  }

  .preset-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--card);
    color: var(--foreground);
    font: inherit;
    cursor: pointer;
    text-align: start;
  }

  .preset-btn--active {
    border-color: var(--secondary);
    background: var(--secondary-subtle);
    box-shadow: inset 3px 0 0 var(--secondary);
  }

  .publish-fields__audience-note {
    margin: 0;
    font-size: var(--step--2);
    line-height: 1.45;
    color: var(--foreground-muted);
  }

  .preset-btn__title {
    font-size: var(--step--1);
    font-weight: 700;
  }

  .preset-btn__desc {
    font-size: var(--step--2);
    color: var(--foreground-muted);
  }

  .publish-stack {
    display: grid;
    gap: var(--space-3);
    width: 100%;
  }

  .publish-stack--advanced {
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-color);
  }

  .publish-stack--advanced-flat {
    padding-top: 0;
    border-top: none;
  }

  .publish-fields :global(.hb-field--stacked) {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-1);
    align-items: stretch;
    width: 100%;
    min-width: 0;
  }

  .publish-fields :global(.hb-field--stacked .hb-select__trigger) {
    width: 100%;
    min-width: 0;
  }

  .publish-fields :global(.hb-field--stacked .hb-field__label) {
    text-transform: none;
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground);
  }

  .advanced-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--accent);
    font: inherit;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
  }

  .publish-fields__toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
  }
</style>
