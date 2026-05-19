<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";
  import { routePath } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();

  const backHref = $derived(
    room.isInstructorRoom ? routePath("studioLive") : routePath("customerCalendar")
  );
  const backLabel = $derived(
    room.isInstructorRoom ? t.live.preConnect.backStudio() : t.live.preConnect.backCalendar()
  );
</script>

{#if room.status === "checking"}
  <div class="setup-overlay">
    <div class="setup-box">
      <div class="spinner"></div>
      <p class="setup-text">{t.live.preConnect.checking()}</p>
    </div>
  </div>
{:else if room.status === "locked"}
  <div class="setup-overlay">
    <div class="setup-box">
      <h1>{t.live.preConnect.lockedTitle()}</h1>
      {#if room.auth.error}<Notice>{room.auth.error}</Notice>{/if}
      <a class="btn-primary" href="/">{t.live.preConnect.lockedCta()}</a>
    </div>
  </div>
{:else if room.status === "missing"}
  <div class="setup-overlay">
    <div class="setup-box">
      <h1>{t.live.preConnect.missingTitle()}</h1>
      <a class="btn-primary" href={routePath("customerCalendar")}>{t.live.preConnect.missingCta()}</a>
    </div>
  </div>
{:else if room.status === "error"}
  <div class="setup-overlay">
    <div class="setup-box">
      <h1>{t.live.preConnect.errorTitle()}</h1>
      <Notice tone="danger">{room.error}</Notice>
      <div class="row-buttons">
        <button class="btn-primary" type="button" onclick={() => room.loadToken()}>{t.live.preConnect.retry()}</button>
        <a class="btn-secondary" href={routePath("customerCalendar")}>{t.live.preConnect.backCalendar()}</a>
      </div>
    </div>
  </div>
{:else if room.status === "ready" && room.joinInfo && room.connectionState === "idle"}
  <div class="setup-overlay">
    <div class="setup-card">
      <div class="setup-card__header">
        <a class="setup-back" href={backHref}>
          <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
          <span>{backLabel}</span>
        </a>
        <div class="setup-title">
          <span class="setup-card__kicker">{t.live.preConnect.kicker()}</span>
          <h1>{t.live.preConnect.title()}</h1>
        </div>
      </div>
      {#if room.mediaError}<Notice tone="caution">{room.mediaError}</Notice>{/if}

      {#if room.preConnectStep === "requesting"}
        <div class="setup-box">
          <div class="spinner"></div>
          <p class="setup-text">{t.live.preConnect.requesting()}</p>
        </div>
      {:else if room.preConnectStep === "denied" || room.preConnectStep === "no-devices"}
        <div class="setup-box">
          {#if room.mediaError}<Notice tone="caution">{room.mediaError}</Notice>{/if}
          <div class="row-buttons">
            <button class="btn-enter" type="button" onclick={() => room.enterRoom(false)}>{t.live.preConnect.enterNoDevices()}</button>
            <button class="btn-secondary" type="button" onclick={() => room.startPreview()}>{t.live.preConnect.retryDevices()}</button>
          </div>
        </div>
      {:else if room.preConnectStep === "preview" && room.previewStream}
        <div class="preview-stage">
          {#if room.hasPreviewCamera}
            <div class="preview-video-wrap">
              <video srcObject={room.previewStream} autoplay playsinline muted class="preview-video"></video>
            </div>
          {:else}
            <div class="preview-audio-only">
              <span class="material-symbols-rounded" aria-hidden="true">mic</span>
              <strong>{t.live.preConnect.cameraConnected()}</strong>
              <span>{t.live.preConnect.noCamera()}</span>
              <button class="btn-secondary" type="button" onclick={() => room.retryCamera()}>{t.live.preConnect.retryCamera()}</button>
            </div>
          {/if}
          <div class="preview-controls">
            {#if room.isInstructorRoom}
              <label class="device-select">
                <span>Resolution</span>
                <select bind:value={room.selectedResolution}>
                  <option value="1080p">1080p premium</option>
                  <option value="720p">720p balanced</option>
                </select>
              </label>
              <label class="device-select">
                <span>Codec</span>
                <select bind:value={room.selectedCodec}>
                  <option value="h264">H.264 compatibility</option>
                  <option value="vp8">VP8 simulcast</option>
                  <option value="vp9">VP9 efficient</option>
                </select>
              </label>
            {:else}
              <label class="device-select">
                <span>Resolution</span>
                <select bind:value={room.selectedResolution}>
                  <option value="720p">720p</option>
                  <option value="360p">360p low data</option>
                </select>
              </label>
            {/if}
            {#if room.videoDevices.length > 1}
              <label class="device-select">
                <span>{t.live.preConnect.cameraLabel()}</span>
                <select bind:value={room.selectedVideoDevice} onchange={() => room.switchPreviewDevice()}>
                  {#each room.videoDevices as d}<option value={d.deviceId}>{d.label}</option>{/each}
                </select>
              </label>
            {:else if !room.hasPreviewCamera}
              <button class="btn-secondary device-retry" type="button" onclick={() => room.retryCamera()}>{t.live.preConnect.refreshCamera()}</button>
            {/if}
            {#if room.audioDevices.length > 1}
              <label class="device-select">
                <span>{t.live.preConnect.micLabel()}</span>
                <select bind:value={room.selectedAudioDevice} onchange={() => room.switchPreviewDevice()}>
                  {#each room.audioDevices as d}<option value={d.deviceId}>{d.label}</option>{/each}
                </select>
              </label>
            {/if}
            <label class="device-toggle">
              <input type="checkbox" bind:checked={room.audioProcessingEnabled} onchange={() => room.switchPreviewDevice()} />
              <span>Echo cancellation / noise suppression</span>
            </label>
            {#if room.hasPreviewMic}
              <div class="audio-meter">
                <span>{t.live.preConnect.audioLevel()}</span>
                <div class="audio-bar"><div class="audio-fill" style="width: {Math.round(room.audioLevel * 100)}%"></div></div>
              </div>
            {/if}
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn-enter" type="button" onclick={() => room.enterRoom(true)}>{t.live.preConnect.enterRoom()}</button>
          <button class="btn-text" type="button" onclick={() => room.enterRoom(false)}>{t.live.preConnect.enterWithoutDevices()}</button>
        </div>
      {:else}
        <div class="setup-box">
          <button class="btn-enter" type="button" onclick={() => room.startPreview()}>{t.live.preConnect.startDevices()}</button>
          <p class="setup-hint">{t.live.preConnect.devicesHint()}</p>
          <button class="btn-secondary" type="button" onclick={() => room.retryCamera()}>{t.live.preConnect.refreshCamera()}</button>
          <button class="btn-text" type="button" onclick={() => room.enterRoom(false)}>{t.live.preConnect.enterWithoutCamera()}</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .setup-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: var(--paper);
    display: grid;
    place-items: center;
    padding: var(--space-4);
    box-sizing: border-box;
  }

  .setup-box {
    text-align: center;
    display: grid;
    gap: var(--space-4);
    justify-items: center;
    max-width: 480px;
  }

  .setup-box h1 {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.1;
    color: var(--ink);
  }

  .setup-text {
    margin: 0;
    color: var(--muted);
    font-size: var(--step-0);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--line-light);
    border-top-color: var(--ink);
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .btn-primary, .btn-secondary, .btn-enter {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--space-5);
    font: inherit;
    font-weight: 800;
    font-size: var(--step-0);
    text-decoration: none;
    cursor: pointer;
    border: var(--border);
    border-radius: 0;
    transition: background var(--duration-fast);
  }

  .btn-primary {
    background: var(--ink);
    color: var(--white);
  }
  .btn-primary:hover { background: var(--ink-secondary); }

  .btn-secondary {
    background: var(--white);
    color: var(--ink);
  }
  .btn-secondary:hover { background: var(--surface); }

  .btn-text {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--space-4);
    font: inherit;
    font-weight: 700;
    font-size: var(--step--1);
    color: var(--muted);
    background: transparent;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .btn-text:hover { color: var(--ink); }

  .btn-enter {
    background: var(--ink);
    color: var(--white);
    min-height: 52px;
    font-size: var(--step-1);
    padding-inline: var(--space-6);
  }
  .btn-enter:hover { background: var(--ink-secondary); }

  .row-buttons {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    justify-content: center;
  }

  .setup-hint {
    color: var(--muted);
    font-size: var(--step--1);
    margin: 0;
  }

  .setup-card {
    width: min(100%, 720px);
    display: grid;
    gap: var(--space-5);
    background: var(--white);
    border: var(--border);
    padding: var(--space-5);
  }

  .setup-card__header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .setup-card__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    margin: 0;
  }

  .setup-title {
    display: grid;
    gap: var(--space-1);
    text-align: right;
  }

  .setup-back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-height: 36px;
    color: var(--muted);
    text-decoration: none;
    font-size: var(--step--1);
    font-weight: 800;
    white-space: nowrap;
  }

  .setup-back:hover {
    color: var(--ink);
  }

  .setup-card h1 {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.1;
    color: var(--ink);
  }

  .preview-stage {
    display: grid;
    gap: var(--space-4);
  }

  .preview-video-wrap {
    position: relative;
    aspect-ratio: 16 / 9;
    background: var(--surface);
    border: var(--border);
    overflow: hidden;
  }

  .preview-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .preview-audio-only {
    min-height: 220px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: var(--space-3);
    border: var(--border);
    background: var(--surface);
    text-align: center;
    padding: var(--space-5);
  }

  .preview-audio-only .material-symbols-rounded {
    width: 3rem;
    height: 3rem;
    font-size: 3rem;
    color: var(--ink);
  }

  .preview-audio-only strong {
    font-size: var(--step-1);
    line-height: 1.2;
  }

  .preview-audio-only span:not(.material-symbols-rounded) {
    color: var(--muted);
    font-size: var(--step--1);
  }

  .preview-controls {
    display: grid;
    gap: var(--space-3);
    justify-items: stretch;
  }

  .device-select {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    font-size: var(--step--1);
  }

  .device-select span {
    color: var(--muted);
    text-align: right;
    font-weight: 800;
  }

  .device-select select {
    min-height: 40px;
    background: var(--white);
    color: var(--ink);
    border: var(--border);
    border-radius: 0;
    font: inherit;
    padding-inline: var(--space-2);
  }

  .device-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--muted);
    font-size: var(--step--2);
    font-weight: 800;
  }

  .device-retry {
    justify-self: stretch;
  }

  .audio-meter {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    font-size: var(--step--1);
  }

  .audio-meter span {
    color: var(--muted);
    text-align: right;
    font-weight: 800;
  }

  .audio-bar {
    height: 8px;
    background: var(--line-light);
    overflow: hidden;
  }

  .audio-fill {
    height: 100%;
    background: var(--ink);
    transition: width 0.1s linear;
  }

  .preview-actions {
    display: grid;
    gap: var(--space-2);
  }

  .material-symbols-rounded {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    overflow: hidden;
    font-family: "Material Symbols Rounded";
    font-weight: normal;
    font-style: normal;
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: "liga";
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
  }

  @media (max-width: 48rem) {
    .setup-card {
      padding: var(--space-4);
    }

    .setup-card__header {
      flex-direction: column;
      align-items: stretch;
    }

    .setup-title {
      text-align: right;
    }

    .device-select,
    .audio-meter {
      grid-template-columns: 1fr;
    }

    .device-select span,
    .audio-meter span {
      text-align: right;
    }
  }
</style>
