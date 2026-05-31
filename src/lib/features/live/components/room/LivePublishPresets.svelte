<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";

  let {
    session,
    showPresets,
    afterChange,
  }: {
    session: LiveSessionPreConnect;
    showPresets: boolean;
    afterChange: (syncResolution?: boolean) => void;
  } = $props();

  const { t } = useI18n();

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
    afterChange(true);
  }

  function handleApplyVoicePreset() {
    applyPreset("voice");
  }
  function handleApplyStandardPreset() {
    applyPreset("standard");
  }
  function handleApplyHighPreset() {
    applyPreset("high");
  }
  function handleApplyLowPreset() {
    applyPreset("low");
  }
</script>

{#if showPresets && session.isInstructorRoom}
  <p class="preset-hint">{t.live.preConnect.voicePresetHint()}</p>
  <div class="preset-row">
    <button
      type="button"
      class="preset-btn"
      class:preset-btn--active={session.selectedAudioPreset === "speech" && session.selectedBitrateMbps === 2.5}
      onclick={handleApplyVoicePreset}
    >
      <span class="preset-btn__title">{t.live.preConnect.presetVoice()}</span>
      <span class="preset-btn__desc">720p · דיבור</span>
    </button>
    <button
      type="button"
      class="preset-btn"
      class:preset-btn--active={session.selectedResolution === "720p" && session.selectedBitrateMbps === 4.5 && session.selectedAudioPreset === "music"}
      onclick={handleApplyStandardPreset}
    >
      <span class="preset-btn__title">{t.live.preConnect.presetStandard()}</span>
      <span class="preset-btn__desc">720p · 4.5 Mbps</span>
    </button>
    <button
      type="button"
      class="preset-btn"
      class:preset-btn--active={session.selectedResolution === "1080p" && session.selectedBitrateMbps === 6}
      onclick={handleApplyHighPreset}
    >
      <span class="preset-btn__title">{t.live.preConnect.presetHigh()}</span>
      <span class="preset-btn__desc">1080p · 6 Mbps</span>
    </button>
    <button
      type="button"
      class="preset-btn"
      class:preset-btn--active={session.selectedResolution === "480p" && session.selectedBitrateMbps === 2.5}
      onclick={handleApplyLowPreset}
    >
      <span class="preset-btn__title">{t.live.preConnect.presetLow()}</span>
      <span class="preset-btn__desc">480p · חיסכון</span>
    </button>
  </div>
  <p class="publish-fields__audience-note">{t.live.preConnect.presetAudienceNote()}</p>
{/if}

<style>
  .preset-hint {
    margin: 0;
    font-size: var(--step--2);
    line-height: 1.45;
    color: var(--foreground-muted);
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
</style>
