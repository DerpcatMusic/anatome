<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import Switch from "$lib/components/ui/Switch.svelte";
  import LiveAudioMeter from "./ui/LiveAudioMeter.svelte";

  let { room }: { room: LiveRoom } = $props();
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

  function applyPreset(name: "standard" | "high" | "low") {
    if (name === "standard") {
      room.selectedResolution = "720p";
      room.selectedCodec = "h264";
      room.selectedBitrateMbps = 4.5;
      room.selectedFramerate = 30;
      room.selectedAudioPreset = "musicHighQuality";
      room.degradationPreference = "maintain-framerate";
      room.simulcastEnabled = true;
    } else if (name === "high") {
      room.selectedResolution = "1080p";
      room.selectedCodec = "h264";
      room.selectedBitrateMbps = 6;
      room.selectedFramerate = 30;
      room.selectedAudioPreset = "musicHighQuality";
      room.degradationPreference = "maintain-framerate";
      room.simulcastEnabled = true;
    } else if (name === "low") {
      room.selectedResolution = "720p";
      room.selectedCodec = "vp9";
      room.selectedBitrateMbps = 2.5;
      room.selectedFramerate = 24;
      room.selectedAudioPreset = "music";
      room.degradationPreference = "balanced";
      room.simulcastEnabled = false;
    }
  }
</script>

<section class="settings-panel" aria-label={t.live.room.settingsTitle()}>
  <div class="settings-panel__head">
    <span>{t.live.room.settingsTitle()}</span>
    <strong>{room.isInstructorRoom ? t.live.preConnect.qualityTitle() : t.live.preConnect.devicesCheckTitle()}</strong>
  </div>

  <div class="settings-panel__grid">
    {#if room.isInstructorRoom}
      <!-- Presets -->
      <div class="preset-row">
        <button type="button" class="preset-btn" class:preset-btn--active={room.selectedResolution === "720p" && room.selectedBitrateMbps === 4.5} onclick={() => applyPreset("standard")}>
          <span class="preset-btn__title">סטנדרטי</span>
          <span class="preset-btn__desc">720p · 4.5 Mbps</span>
        </button>
        <button type="button" class="preset-btn" class:preset-btn--active={room.selectedResolution === "1080p" && room.selectedBitrateMbps === 6} onclick={() => applyPreset("high")}>
          <span class="preset-btn__title">איכות גבוהה</span>
          <span class="preset-btn__desc">1080p · 6 Mbps</span>
        </button>
        <button type="button" class="preset-btn" class:preset-btn--active={room.selectedCodec === "vp9" && room.selectedBitrateMbps === 2.5} onclick={() => applyPreset("low")}>
          <span class="preset-btn__title">רוחב פס נמוך</span>
          <span class="preset-btn__desc">720p · 2.5 Mbps</span>
        </button>
      </div>

      <button type="button" class="advanced-toggle" onclick={() => showAdvanced = !showAdvanced}>
        <span class="material-symbols-rounded" aria-hidden="true">{showAdvanced ? "expand_less" : "expand_more"}</span>
        <span>הגדרות מתקדמות</span>
      </button>

      {#if showAdvanced}
        <div class="advanced-grid">
          <Select label={t.live.preConnect.resolutionLabel()} bind:value={room.selectedResolution} options={instructorResolutionOptions} />
          <Select label={t.live.preConnect.codecLabel()} bind:value={room.selectedCodec} options={codecOptions} />
          <Select label={t.live.preConnect.bitrateLabel()} bind:value={room.selectedBitrateMbps} options={bitrateOptions} />
          <Select label={t.live.preConnect.framerateLabel()} bind:value={room.selectedFramerate} options={framerateOptions} />
          <Select label={t.live.preConnect.audioLabel()} bind:value={room.selectedAudioPreset} options={audioOptions} />
          <Select label={t.live.preConnect.priorityLabel()} bind:value={room.degradationPreference} options={priorityOptions} />
          <div class="settings-panel__toggles">
            <Switch bind:checked={room.simulcastEnabled} label={t.live.preConnect.simulcastLabel()} />
            <Switch bind:checked={room.forceStereo} label={t.live.preConnect.stereoLabel()} />
          </div>
        </div>
      {/if}
    {:else}
      <Select label={t.live.preConnect.resolutionLabel()} bind:value={room.selectedResolution} options={customerResolutionOptions} />
    {/if}

    {#if room.videoDevices.length > 1}
      <Select label={t.live.preConnect.cameraLabel()} bind:value={room.selectedVideoDevice} options={room.videoDevices.map((d) => ({ value: d.deviceId, label: d.label }))} onchange={() => room.switchPreviewDevice()} />
    {/if}

    {#if room.audioDevices.length > 1}
      <Select label={t.live.preConnect.micLabel()} bind:value={room.selectedAudioDevice} options={room.audioDevices.map((d) => ({ value: d.deviceId, label: d.label }))} onchange={() => room.switchPreviewDevice()} />
    {/if}

    <div class="settings-panel__toggles">
      <Switch bind:checked={room.audioProcessingEnabled} label={t.live.room.echoCancel()} onchange={() => room.switchPreviewDevice()} />
    </div>

    {#if room.hasPreviewMic}
      <LiveAudioMeter label={t.live.preConnect.audioLevel()} level={room.audioLevel} />
    {/if}
  </div>
</section>

<style>
  .settings-panel {
    display: grid;
    align-content: start;
    gap: var(--space-4);
    border: var(--glass-border);
    background: var(--glass-bg);
    padding: var(--space-4);
    backdrop-filter: var(--glass-blur);
    direction: rtl;
  }

  .settings-panel__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    border-bottom: 1px solid color-mix(in srgb, var(--line) 24%, transparent);
    padding-bottom: var(--space-3);
  }

  .settings-panel__head span {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--muted);
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
    background: var(--sky-soft);
    border-color: var(--sky-strong);
  }

  .preset-btn__title {
    font-size: var(--step--1);
    font-weight: 800;
  }

  .preset-btn__desc {
    font-size: var(--step--2);
    color: var(--muted);
  }

  .advanced-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) 0;
    border: 0;
    background: transparent;
    color: var(--sky-strong);
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
    border-top: 1px solid color-mix(in srgb, var(--line) 24%, transparent);
  }

  .settings-panel__toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
  }
</style>
