<script lang="ts">
  import { VideoConference } from "$lib/livekit";

  let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="live-pip-video" class:live-pip-video--compact={compact}>
  <VideoConference class="live-pip-video__conference" />
</div>

<style>
  .live-pip-video {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    background: var(--video-bg, #000);
    border-radius: inherit;
    overflow: hidden;
  }

  .live-pip-video :global(.live-pip-video__conference) {
    position: absolute;
    inset: 0;
    --lk-control-bar-height: 0px;
  }

  .live-pip-video--compact :global(.lk-participant-tile) {
    border-radius: 0;
  }
</style>
