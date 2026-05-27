<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import LivePublishSettingsFields from "./LivePublishSettingsFields.svelte";

  let { session }: { session: LiveSessionPreConnect } = $props();
  const { t } = useI18n();
</script>

<section class="preconnect-settings" aria-label={t.live.room.settingsTitle()}>
  <header class="preconnect-settings__head">
    <span class="preconnect-settings__eyebrow">{t.live.room.settingsTitle()}</span>
    <h2 class="preconnect-settings__title">
      {session.isInstructorRoom ? t.live.preConnect.qualityTitle() : t.live.preConnect.devicesCheckTitle()}
    </h2>
  </header>

  <LivePublishSettingsFields {session} mode="prep" showPresets={session.isInstructorRoom} />
</section>

<style>
  .preconnect-settings {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    min-width: 0;
    max-height: min(100%, calc(100dvh - 12rem));
    overflow: auto;
    overscroll-behavior: contain;
    padding: var(--space-3) clamp(16px, 3vw, 24px);
    direction: rtl;
    background: var(--muted);
    border-inline-end: 1px solid var(--border-color);
    scrollbar-gutter: stable;
  }

  .preconnect-settings__head {
    display: grid;
    gap: var(--space-1);
    flex-shrink: 0;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border-color);
  }

  .preconnect-settings__eyebrow {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary);
  }

  .preconnect-settings__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-0);
    font-weight: 400;
    line-height: 1.2;
    color: var(--ink);
  }
</style>
