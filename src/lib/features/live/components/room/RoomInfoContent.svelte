<script lang="ts">
  import { tick } from "svelte";
  import { ScrollArea } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    resolveLiveSession,
    type LiveSessionQuality,
  } from "$lib/features/live/live-session.svelte";

  let {
    session: sessionProp,
    room: roomAlias,
    participantCount = 0,
    active = true,
  }: {
    session?: LiveSessionQuality;
    room?: LiveSessionQuality;
    participantCount?: number;
    active?: boolean;
  } = $props();

  const session = $derived(resolveLiveSession(sessionProp, roomAlias, "RoomInfoContent"));
  const { t } = useI18n();

  const micOnOff = (value: boolean) => (value ? t.live.room.micOn() : t.live.room.micOff());
  const cameraOnOff = (value: boolean) => (value ? t.live.room.cameraOn() : t.live.room.cameraOff());

  const publishResolution = $derived(
    `${session.selectedResolution} · ${session.selectedFramerate}fps · ${session.selectedBitrateMbps}Mbps`,
  );

  const activePublishLabel = $derived.by(() => {
    switch (session.activePublishVideoSource) {
      case "screen_share":
        return t.live.stats.sourceScreen();
      case "camera":
        return t.live.stats.sourceCamera();
      default:
        return "—";
    }
  });

  const subscriberReceiveLabel = $derived.by(() => {
    switch (session.subscriberReceivePreset) {
      case "low":
        return t.live.preConnect.subscriberReceiveLow();
      case "high":
        return t.live.preConnect.subscriberReceiveHigh();
      default:
        return t.live.preConnect.subscriberReceiveMedium();
    }
  });

  $effect(() => {
    if (active) {
      void tick().then(() => session.refreshStreamStats());
    }
  });
</script>

<ScrollArea.Root class="hb-scroll-area lr-info-content">
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
    <div class="lr-info-sections">
      <section class="lr-info-section">
        <h4 class="lr-info-section__title">{t.live.room.sidebarConnection()}</h4>
        <dl class="lr-info-dl">
          <div class="lr-info-dl__row">
            <dt>{t.live.stats.participants()}</dt>
            <dd>{participantCount}</dd>
          </div>
          <div class="lr-info-dl__row">
            <dt>{t.live.room.sidebarConnection()}</dt>
            <dd>{session.connectionLabel}</dd>
          </div>
          {#if session.connectionQualityLabel}
            <div class="lr-info-dl__row">
              <dt>{t.live.room.sidebarQuality()}</dt>
              <dd>{session.connectionQualityLabel}</dd>
            </div>
          {/if}
        </dl>
      </section>

      <section class="lr-info-section">
        <h4 class="lr-info-section__title">{t.live.room.sidebarPublish()}</h4>
        <dl class="lr-info-dl">
          <div class="lr-info-dl__row">
            <dt>{t.live.room.sidebarActiveSource()}</dt>
            <dd>{activePublishLabel}</dd>
          </div>
          <div class="lr-info-dl__row">
            <dt>{t.live.preConnect.codecLabel()}</dt>
            <dd>{session.selectedCodec.toUpperCase()}</dd>
          </div>
          <div class="lr-info-dl__row">
            <dt>{t.live.preConnect.resolutionLabel()}</dt>
            <dd>{publishResolution}</dd>
          </div>
          {#if session.isInstructorRoom}
            <div class="lr-info-dl__row">
              <dt>{t.live.preConnect.subscriberReceiveTitle()}</dt>
              <dd>{subscriberReceiveLabel}</dd>
            </div>
          {/if}
          <div class="lr-info-dl__row">
            <dt>{t.live.preConnect.simulcastLabel()}</dt>
            <dd>{session.simulcastEnabled ? t.live.room.sidebarOn() : t.live.room.sidebarOff()}</dd>
          </div>
          <div class="lr-info-dl__row">
            <dt>{t.live.room.echoCancel()}</dt>
            <dd>{session.audioProcessingEnabled ? t.live.room.sidebarOn() : t.live.room.sidebarOff()}</dd>
          </div>
        </dl>
      </section>

      <section class="lr-info-section">
        <h4 class="lr-info-section__title">{t.live.room.sidebarTracks()}</h4>
        <dl class="lr-info-dl">
          <div class="lr-info-dl__row">
            <dt>{t.live.controls.mic()}</dt>
            <dd>{micOnOff(session.micEnabled)}</dd>
          </div>
          <div class="lr-info-dl__row">
            <dt>{t.live.controls.camera()}</dt>
            <dd>{cameraOnOff(session.cameraEnabled)}</dd>
          </div>
          {#if session.isInstructorRoom}
            <div class="lr-info-dl__row">
              <dt>{t.live.controls.screen()}</dt>
              <dd>{session.screenShareEnabled ? t.live.room.sidebarOn() : t.live.room.sidebarOff()}</dd>
            </div>
            <div class="lr-info-dl__row">
              <dt>{t.live.room.screenShareAudio()}</dt>
              <dd>
                {session.screenShareEnabled
                  ? session.screenShareAudioEnabled
                    ? t.live.room.sidebarOn()
                    : t.live.room.sidebarOff()
                  : "—"}
              </dd>
            </div>
          {/if}
        </dl>
      </section>

      {#if session.isInstructorRoom}
        <section class="lr-info-section">
          <h4 class="lr-info-section__title">{t.live.room.sidebarLiveStats()}</h4>
          <dl class="lr-info-dl">
            <div class="lr-info-dl__row">
              <dt>{t.live.stats.bitrate()}</dt>
              <dd>{session.formattedBitrate}</dd>
            </div>
            <div class="lr-info-dl__row">
              <dt>{t.live.stats.resolution()}</dt>
              <dd>{session.formattedResolution}</dd>
            </div>
            <div class="lr-info-dl__row">
              <dt>{t.live.stats.fps()}</dt>
              <dd>{session.formattedFps}</dd>
            </div>
            <div class="lr-info-dl__row">
              <dt>{t.live.stats.packetLoss()}</dt>
              <dd>{session.formattedPacketLoss}</dd>
            </div>
          </dl>
          {#if session.trackStats.length > 0}
            <ul class="lr-info-tracks">
              {#each session.trackStats.filter((track) => track.kind === "video") as stat (stat.id)}
                <li class="lr-info-tracks__item">
                  <span class="lr-info-tracks__name">{stat.name}</span>
                  <span class="lr-info-tracks__meta">
                    {stat.source === "screen_share"
                      ? t.live.stats.sourceScreen()
                      : stat.source === "camera"
                        ? t.live.stats.sourceCamera()
                        : t.live.stats.sourceUnknown()}
                    · {stat.width ?? "—"}×{stat.height ?? "—"}
                    {#if stat.bitrateKbps > 0}
                      · {stat.bitrateKbps} kbps
                    {/if}
                  </span>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/if}
    </div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">
    <ScrollArea.Thumb class="hb-scroll-area__thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>

<style>
  .lr-info-content {
    flex: 1 1 auto;
    min-height: 0;
  }

  .lr-info-sections {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-3);
  }

  .lr-info-section__title {
    margin: 0 0 var(--space-2);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--lr-text);
    letter-spacing: 0.02em;
  }

  .lr-info-dl {
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }

  .lr-info-dl__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: var(--step--1);
  }

  .lr-info-dl__row dt {
    margin: 0;
    color: var(--lr-text-muted);
    font-weight: 600;
  }

  .lr-info-dl__row dd {
    margin: 0;
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--lr-text);
    text-align: end;
  }

  .lr-info-tracks {
    margin: var(--space-2) 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .lr-info-tracks__item {
    padding: var(--space-2);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--foreground) 5%, var(--muted));
    border: 1px solid var(--border-color);
  }

  .lr-info-tracks__name {
    display: block;
    font-weight: 700;
    font-size: var(--step--1);
  }

  .lr-info-tracks__meta {
    display: block;
    margin-top: 2px;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--lr-text-muted);
  }
</style>
