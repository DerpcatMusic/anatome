<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { Button, ScrollArea } from "bits-ui";
  import {
    resolveLiveSession,
    type LiveSessionQuality,
  } from "$lib/features/live/live-session.svelte";

  import { tick } from "svelte";

  let {
    session: sessionProp,
    room: roomAlias,
    participantCount = 0,
  }: {
    session?: LiveSessionQuality;
    /** @deprecated Pass `session` instead. */
    room?: LiveSessionQuality;
    participantCount?: number;
  } = $props();

  const session = $derived(resolveLiveSession(sessionProp, roomAlias, "QualityPanel"));
  const { t } = useI18n();

  $effect(() => {
    if (session.showQualityPanel) {
      void tick().then(() => session.refreshStreamStats());
    }
  });
</script>

{#if session.isInstructorRoom && session.showQualityPanel}
  <aside class="lr-quality" aria-label={t.live.stats.title()}>
    <div class="lr-panel__header">
      <h3>{t.live.stats.title()}</h3>
      <Button.Root
        class="hb-button hb-button--close"
        type="button"
        onclick={() => (session.showQualityPanel = false)}
        aria-label={t.live.room.close()}
      >
        <span class="material-symbols-rounded">close</span>
      </Button.Root>
    </div>
    <ScrollArea.Root class="hb-scroll-area lr-panel__scroll">
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
    <dl class="lr-quality__headline">
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.participants()}</dt>
          <dd class="lr-quality__value">{participantCount}</dd>
        </div>
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.video()}</dt>
          <dd class="lr-quality__value">{session.streamStats.videoTracks}</dd>
        </div>
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.audio()}</dt>
          <dd class="lr-quality__value">{session.streamStats.audioTracks}</dd>
        </div>
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.bitrate()}</dt>
          <dd class="lr-quality__value">{session.formattedBitrate}</dd>
        </div>
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.resolution()}</dt>
          <dd class="lr-quality__value">{session.formattedResolution}</dd>
        </div>
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.fps()}</dt>
          <dd class="lr-quality__value">{session.formattedFps}</dd>
        </div>
        <div class="lr-quality__row">
          <dt class="lr-quality__label">{t.live.stats.packetLoss()}</dt>
          <dd class="lr-quality__value">{session.formattedPacketLoss}</dd>
        </div>
      </dl>
      {#if session.trackStats.length > 0}
        <details class="lr-quality__track-list" open>
          <summary>{t.live.stats.videoSources()}</summary>
          <div class="lr-quality__tracks">
            {#each session.trackStats.filter((t) => t.kind === "video") as stat (stat.id)}
              <div class="lr-track-stat">
                <span class="lr-track-stat__name">{stat.name}</span>
                <span
                  class="lr-track-stat__badge"
                  class:lr-track-stat__badge--screen={stat.source === "screen_share"}
                >
                  {stat.source === "screen_share" ? t.live.stats.sourceScreen() : stat.source === "camera" ? t.live.stats.sourceCamera() : t.live.stats.sourceUnknown()}
                </span>
                <span class="lr-track-stat__detail">
                  {stat.width ?? "—"}×{stat.height ?? "—"} @ {stat.bitrateKbps > 0 ? `${stat.bitrateKbps} kbps` : "—"}
                </span>
              </div>
            {/each}
          </div>
        </details>
      {/if}
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">
    <ScrollArea.Thumb class="hb-scroll-area__thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
  </aside>
{/if}
