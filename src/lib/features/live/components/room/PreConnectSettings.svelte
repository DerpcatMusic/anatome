<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import type { VideoResolutionChoice, VideoCodecChoice, BitrateChoice, VideoFramerateChoice, AudioPresetChoice, DegradationPreferenceChoice } from "$lib/features/live/types";
  import { Select } from "bits-ui";
  import { Switch } from "bits-ui";

  let { session }: { session: LiveSessionPreConnect } = $props();
  const { t } = useI18n();

  let showAdvanced = $state(false);

  const instructorResolutionOptions = [
    { value: "1080p", label: "1080p" },
    { value: "720p", label: "720p" },
  ];
  const customerResolutionOptions = [
    { value: "720p", label: "720p" },
    { value: "360p", label: "360p" },
  ];
  const codecOptions = [
    { value: "h264", label: "H.264" },
    { value: "vp8", label: "VP8" },
    { value: "vp9", label: "VP9" },
    { value: "av1", label: "AV1" },
  ];
  const bitrateOptions = [
    { value: 2.5, label: "2.5 Mbps" },
    { value: 4.5, label: "4.5 Mbps" },
    { value: 6, label: "6 Mbps" },
    { value: 8, label: "8 Mbps" },
  ];
  const framerateOptions = [
    { value: 24, label: "24 fps" },
    { value: 30, label: "30 fps" },
    { value: 60, label: "60 fps" },
  ];
  const audioOptions = [
    { value: "speech", label: "דיבור" },
    { value: "music", label: "תנועה" },
    { value: "musicStereo", label: "סטריאו" },
    { value: "musicHighQuality", label: "Hi-Fi" },
    { value: "musicHighQualityStereo", label: "Hi-Fi סטריאו" },
  ];
  const priorityOptions = [
    { value: "maintain-framerate", label: "תנועה חלקה" },
    { value: "maintain-resolution", label: "תמונה חדה" },
    { value: "balanced", label: "מאוזן" },
  ];

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
      session.selectedResolution = "720p";
      session.selectedCodec = "h264";
      session.selectedBitrateMbps = 2.5;
      session.selectedFramerate = 24;
      session.selectedAudioPreset = "speech";
      session.degradationPreference = "balanced";
      session.simulcastEnabled = true;
    }
  }
</script>

<section class="settings-panel" aria-label={t.live.room.settingsTitle()}>
  <div class="settings-panel__head">
    <span>{t.live.room.settingsTitle()}</span>
    <strong>{session.isInstructorRoom ? t.live.preConnect.qualityTitle() : t.live.preConnect.devicesCheckTitle()}</strong>
  </div>

  <div class="settings-panel__grid">
    {#if session.isInstructorRoom}
      <!-- Presets -->
      <p class="preset-hint">{t.live.preConnect.voicePresetHint()}</p>
      <div class="preset-row">
        <button
          type="button"
          class="preset-btn"
          class:preset-btn--active={session.selectedAudioPreset === "speech" && session.selectedBitrateMbps === 2.5}
          onclick={() => applyPreset("voice")}
        >
          <span class="preset-btn__title">{t.live.preConnect.presetVoice()}</span>
          <span class="preset-btn__desc">720p · דיבור ברור</span>
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
          class:preset-btn--active={session.selectedBitrateMbps === 2.5 && session.selectedFramerate === 24}
          onclick={() => applyPreset("low")}
        >
          <span class="preset-btn__title">{t.live.preConnect.presetLow()}</span>
          <span class="preset-btn__desc">720p · חיסכון ברוחב פס</span>
        </button>
      </div>

      <button type="button" class="advanced-toggle" onclick={() => showAdvanced = !showAdvanced}>
        <span class="material-symbols-rounded" aria-hidden="true">{showAdvanced ? "expand_less" : "expand_more"}</span>
        <span>הגדרות מתקדמות</span>
      </button>

      {#if showAdvanced}
        <div class="advanced-grid">
          <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.resolutionLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.selectedResolution)}
     onValueChange={(selected) => session.selectedResolution = selected as VideoResolutionChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.resolutionLabel()}>
      <span class="hb-select__value">{instructorResolutionOptions.find((o) => String(o.value) === String(session.selectedResolution))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each instructorResolutionOptions as option}
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
          <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.codecLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.selectedCodec)}
     onValueChange={(selected) => session.selectedCodec = selected as VideoCodecChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.codecLabel()}>
      <span class="hb-select__value">{codecOptions.find((o) => String(o.value) === String(session.selectedCodec))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each codecOptions as option}
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
          <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.bitrateLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.selectedBitrateMbps)}
     onValueChange={(selected) => session.selectedBitrateMbps = Number(selected) as BitrateChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.bitrateLabel()}>
      <span class="hb-select__value">{bitrateOptions.find((o) => String(o.value) === String(session.selectedBitrateMbps))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each bitrateOptions as option}
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
          <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.framerateLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.selectedFramerate)}
     onValueChange={(selected) => session.selectedFramerate = Number(selected) as VideoFramerateChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.framerateLabel()}>
      <span class="hb-select__value">{framerateOptions.find((o) => String(o.value) === String(session.selectedFramerate))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each framerateOptions as option}
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
          <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.audioLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.selectedAudioPreset)}
     onValueChange={(selected) => session.selectedAudioPreset = selected as AudioPresetChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.audioLabel()}>
      <span class="hb-select__value">{audioOptions.find((o) => String(o.value) === String(session.selectedAudioPreset))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each audioOptions as option}
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
          <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.priorityLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.degradationPreference)}
     onValueChange={(selected) => session.degradationPreference = selected as DegradationPreferenceChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.priorityLabel()}>
      <span class="hb-select__value">{priorityOptions.find((o) => String(o.value) === String(session.degradationPreference))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each priorityOptions as option}
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
          <div class="settings-panel__toggles">
            <span class="hb-switch">
  <Switch.Root
    class="hb-switch__root"
    aria-label={t.live.preConnect.simulcastLabel()}
    bind:checked={session.simulcastEnabled}
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
  >
    <Switch.Thumb class="hb-switch__thumb" />
  </Switch.Root>
  <span>{t.live.preConnect.stereoLabel()}</span>
</span>
          </div>
        </div>
      {/if}
    {:else}
      <div class="hb-field">
  <span class="hb-field__label">{t.live.preConnect.resolutionLabel()}</span>
  <Select.Root
    type="single"
    value={String(session.selectedResolution)}
     onValueChange={(selected) => session.selectedResolution = selected as VideoResolutionChoice}

  >
    <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.resolutionLabel()}>
      <span class="hb-select__value">{customerResolutionOptions.find((o) => String(o.value) === String(session.selectedResolution))?.label ?? ""}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each customerResolutionOptions as option}
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

    <div class="settings-panel__toggles">
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
  </div>
</section>

<style>
  .settings-panel {
    display: grid;
    align-content: start;
    gap: var(--space-4);
    border: 1px solid var(--line-light);
    background: transparent;
    padding: var(--space-4);
    direction: rtl;
  }

  .settings-panel__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    border-bottom: 1px solid var(--line);
    padding-bottom: var(--space-3);
  }

  .settings-panel__head span {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--foreground-muted);
    font-weight: 900;
  }

  .settings-panel__head strong {
    font-size: var(--step-0);
    line-height: 1;
  }

  .settings-panel__grid {
    display: grid;
    gap: var(--space-3);
  }

  .preset-hint {
    margin: 0;
    font-size: var(--step--1);
    color: var(--ink);
    line-height: 1.45;
  }

  .preset-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1 1 0;
    min-width: 100px;
    padding: var(--space-3) var(--space-2);
    border: var(--border);
    background: transparent;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
    transition:
      background var(--duration-fast),
      border-color var(--duration-fast);
  }

  .preset-btn:hover {
    background: var(--surface);
  }

  .preset-btn--active {
    background: var(--surface);
    border-color: var(--accent);
    background: color-mix(in oklch, var(--accent) 10%, var(--elevated));
  }

  .preset-btn__title {
    font-size: var(--step--1);
    font-weight: 800;
  }

  .preset-btn__desc {
    font-size: var(--step--2);
    color: var(--foreground-muted);
  }

  .advanced-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) 0;
    border: 0;
    background: transparent;
    color: var(--accent);
    font: inherit;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
    justify-self: start;
  }

  .advanced-grid {
    display: grid;
    gap: var(--space-3);
    padding-top: var(--space-2);
    border-top: 1px solid var(--line);
  }

  .settings-panel__toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
  }
</style>
