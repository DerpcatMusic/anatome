<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();
</script>

{#if room.isInstructorRoom && room.showQualityPanel}
  <aside class="quality-drawer" aria-label={t.live.stats.title()}>
    <div class="drawer-header">
      <h3>{t.live.stats.title()}</h3>
      <button class="drawer-close" type="button" onclick={() => room.showQualityPanel = false} aria-label={t.live.room.close()}>
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>
    <dl class="quality-headline">
      <div><dt>{t.live.stats.participants()}</dt><dd>{room.participants.length}</dd></div>
      <div><dt>{t.live.stats.video()}</dt><dd>{room.streamStats.videoTracks}</dd></div>
      <div><dt>{t.live.stats.audio()}</dt><dd>{room.streamStats.audioTracks}</dd></div>
      <div><dt>{t.live.stats.bitrate()}</dt><dd>{room.formattedBitrate}</dd></div>
      <div><dt>{t.live.stats.resolution()}</dt><dd>{room.formattedResolution}</dd></div>
      <div><dt>{t.live.stats.fps()}</dt><dd>{room.formattedFps}</dd></div>
      <div><dt>{t.live.stats.packetLoss()}</dt><dd>{room.formattedPacketLoss}</dd></div>
    </dl>
    {#if room.trackStats.length > 0}
      <details class="track-stats" open>
        <summary>{t.live.stats.videoSources()}</summary>
        <div class="track-stats-list">
          {#each room.trackStats.filter((t) => t.kind === "video") as stat (stat.id)}
            <div class="track-stat-row">
              <span class="track-stat-name">{stat.name}</span>
              <span class="track-stat-badge" class:track-stat-badge--screen={stat.source === "screen_share"}>
                {stat.source === "screen_share" ? t.live.stats.sourceScreen() : stat.source === "camera" ? t.live.stats.sourceCamera() : t.live.stats.sourceUnknown()}
              </span>
              <span class="track-stat-detail">
                {stat.width ?? "—"}×{stat.height ?? "—"} @ {stat.bitrateKbps > 0 ? `${stat.bitrateKbps} kbps` : "—"}
              </span>
            </div>
          {/each}
        </div>
      </details>
    {/if}
  </aside>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .quality-drawer {
    position: absolute;
    inset-inline-end: 0;
    inset-block: 48px 76px;
    width: 280px;
    background: var(--white);
    border-inline-start: var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 20;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border);
    min-height: 48px;
  }

  .drawer-header h3 {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 700;
  }

  .drawer-close {
    width: 28px;
    height: 28px;
    display: inline-grid;
    place-items: center;
    background: transparent;
    border: var(--border);
    color: var(--ink);
    cursor: pointer;
    padding: 0;
    border-radius: 0;
  }
  .drawer-close:hover { background: var(--surface); }

  .quality-headline {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-3) var(--space-4);
    overflow-y: auto;
  }

  .quality-headline div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--line-light);
    padding-bottom: var(--space-2);
  }

  .quality-headline dt {
    color: var(--muted);
    font-size: var(--step--2);
    font-weight: 800;
  }

  .quality-headline dd {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    direction: ltr;
  }

  .track-stats {
    padding: 0 var(--space-4) var(--space-3);
    overflow-y: auto;
  }

  .track-stats summary {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--muted);
    cursor: pointer;
    user-select: none;
    margin-bottom: var(--space-2);
  }

  .track-stats-list {
    display: grid;
    gap: var(--space-1);
  }

  .track-stat-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-2);
    align-items: center;
    font-size: var(--step--2);
    border-bottom: 1px solid var(--line-light);
    padding-bottom: var(--space-1);
  }

  .track-stat-name {
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-stat-badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    background: var(--surface);
    padding: 2px 6px;
    border: var(--border);
  }

  .track-stat-badge--screen {
    background: #c93322;
    color: #fff;
    border-color: #c93322;
  }

  .track-stat-detail {
    font-family: var(--font-mono);
    direction: ltr;
    text-align: left;
    color: var(--muted);
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
    .quality-drawer {
      inset-inline: 0;
      width: auto;
      inset-block-start: 48px;
      inset-block-end: 76px;
    }
  }
</style>
