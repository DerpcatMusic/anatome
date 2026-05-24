<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    previewStream,
    hasPreviewCamera,
  }: {
    previewStream: MediaStream | null;
    hasPreviewCamera: boolean;
  } = $props();

  const { t } = useI18n();

  let videoEl = $state<HTMLVideoElement | null>(null);

  // Use video-only stream for preview — never attach audio tracks to prevent echo
  $effect(() => {
    if (videoEl && previewStream) {
      const videoOnly = new MediaStream(previewStream.getVideoTracks());
      videoEl.srcObject = videoOnly;
      videoEl.muted = true;
      return () => {
        if (videoEl) videoEl.srcObject = null;
      };
    }
  });
</script>

<section class="preview-panel" aria-label={t.live.preConnect.title()}>
  {#if hasPreviewCamera}
    <div class="preview-panel__video">
      <video bind:this={videoEl} autoplay playsinline muted></video>
    </div>
  {:else}
    <div class="preview-panel__placeholder">
      <span class="material-symbols-rounded" aria-hidden="true">videocam_off</span>
      <span>{t.live.room.noVideo()}</span>
    </div>
  {/if}
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .preview-panel {
    min-width: 0;
  }

  .preview-panel__video {
    position: relative;
    aspect-ratio: 16 / 10;
    border: var(--border);
    background:
      linear-gradient(135deg, var(--ink), var(--video-gradient-end)),
      var(--ink);
    overflow: hidden;
  }

  .preview-panel__video::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(transparent 0 96%, rgba(255,255,255,0.08) 96% 100%),
      linear-gradient(90deg, transparent 0 96%, rgba(255,255,255,0.08) 96% 100%);
    background-size: 28px 28px;
    mix-blend-mode: screen;
  }

  .preview-panel__video video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .preview-panel__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    aspect-ratio: 16 / 10;
    border: var(--border);
    background: var(--surface);
    color: var(--muted);
    font-size: var(--step-0);
    font-weight: 700;
  }

  .preview-panel__placeholder .material-symbols-rounded {
    width: 3rem;
    height: 3rem;
    font-size: 3rem;
    color: var(--line-light);
  }

  .material-symbols-rounded {
    display: block;
    overflow: hidden;
    font-family: "Material Symbols Rounded";
    line-height: 1;
    letter-spacing: 0;
    direction: ltr;
    font-feature-settings: "liga";
  }
</style>
