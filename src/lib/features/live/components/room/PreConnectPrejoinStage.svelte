<script lang="ts">
  import type { LocalUserChoices } from "@livekit/components-core";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import { PreJoin } from "$lib/livekit";
  import PreConnectSettings from "./PreConnectSettings.svelte";
  import { showHostPublishSettings } from "$lib/features/live/lib/preconnect-ui";

  function makePreJoinDefaults(isInstructorRoom: boolean): Partial<LocalUserChoices> {
    return {
      username: "guest",
      videoEnabled: true,
      audioEnabled: isInstructorRoom,
    };
  }

  let {
    session,
    isJoining,
    isChecking,
    isPrep,
    canStartBroadcast,
    onPreJoinSubmit,
    onPreJoinError,
    onEnterWithoutDevices,
    onEnterWithoutDevicesNonInstructor,
  }: {
    session: LiveSessionPreConnect;
    isJoining: boolean;
    isChecking: boolean;
    isPrep: boolean;
    canStartBroadcast: boolean;
    onPreJoinSubmit: (choices: LocalUserChoices) => void;
    onPreJoinError: (error: Error) => void;
    onEnterWithoutDevices: () => void;
    onEnterWithoutDevicesNonInstructor: () => void;
  } = $props();

  const { t } = useI18n();

  const showPublishPanel = $derived(
    showHostPublishSettings(session.isInstructorRoom, canStartBroadcast),
  );
  const preJoinDefaults = $derived(makePreJoinDefaults(session.isInstructorRoom));
  const primaryJoinLabel = $derived(
    isPrep ? t.live.preConnect.startLive() : t.live.preConnect.enterRoom(),
  );
  const primaryJoinIcon = $derived(isPrep ? "play_circle" : "sensors");
  const primaryJoinButtonClass = $derived(isPrep ? "hb-button--start-live" : "");
  const secondaryJoinLabel = $derived(
    isPrep ? t.live.preConnect.startLiveWithoutDevices() : t.live.preConnect.enterWithoutDevices(),
  );
</script>

<div class="prejoin-stage lk-theme" class:prejoin-stage--joining={isJoining}>
  {#if isJoining}
    <div class="prejoin-stage__busy" role="status" aria-live="polite" aria-busy="true">
      <div class="prejoin-stage__spinner" aria-hidden="true"></div>
      <p class="prejoin-stage__busy-title">{t.live.room.connecting()}</p>
      <p class="prejoin-stage__busy-hint">{t.live.preConnect.joiningHint()}</p>
    </div>
  {/if}

  {#snippet hostBadge()}
    {#if session.isClassHost}
      <p class="prejoin-host-badge" role="status">
        <span class="material-symbols-rounded" aria-hidden="true">verified</span>
        {t.live.preConnect.hostBadge()}
      </p>
    {/if}
  {/snippet}

  {#if session.isInstructorRoom}
    {#if showPublishPanel}
      <div class="prejoin-layout" class:prejoin-layout--dimmed={isJoining}>
        <aside class="prejoin-layout__side">
          {@render hostBadge()}
          <PreConnectSettings {session} />
        </aside>
        <div class="prejoin-layout__main">
          <PreJoin
            class="prejoin-layout__prefab"
            defaults={preJoinDefaults}
            showUsername={false}
            persistUserChoices={true}
            joinLabel={primaryJoinLabel}
            joinIcon={primaryJoinIcon}
            joinButtonClass={primaryJoinButtonClass}
            secondaryJoinLabel={!isJoining ? secondaryJoinLabel : ""}
            onSecondaryJoin={onEnterWithoutDevices}
            micLabel={t.live.preConnect.micLabel()}
            camLabel={t.live.preConnect.cameraLabel()}
            noDeviceLabel={t.live.preConnect.noDeviceAvailable()}
            speakerLabel={t.live.preConnect.speakerLabel()}
            speakerHintSupported={t.live.preConnect.speakerHintSupported()}
            speakerHintUnsupported={t.live.preConnect.speakerHintUnsupported()}
            cameraNotFoundToast={t.live.preConnect.cameraNotFound()}
            onSubmit={onPreJoinSubmit}
            onError={onPreJoinError}
          />
        </div>
      </div>
    {:else}
      <div class="prejoin-layout__main prejoin-layout__main--solo">
        <PreJoin
          class="prejoin-layout__prefab"
          defaults={preJoinDefaults}
          showUsername={false}
          persistUserChoices={true}
          joinLabel={primaryJoinLabel}
          joinIcon={primaryJoinIcon}
          joinButtonClass={primaryJoinButtonClass}
          secondaryJoinLabel={!isJoining ? secondaryJoinLabel : ""}
          onSecondaryJoin={onEnterWithoutDevices}
          micLabel={t.live.preConnect.micLabel()}
          camLabel={t.live.preConnect.cameraLabel()}
          noDeviceLabel={t.live.preConnect.noDeviceAvailable()}
          speakerLabel={t.live.preConnect.speakerLabel()}
          speakerHintSupported={t.live.preConnect.speakerHintSupported()}
          speakerHintUnsupported={t.live.preConnect.speakerHintUnsupported()}
          cameraNotFoundToast={t.live.preConnect.cameraNotFound()}
          onSubmit={onPreJoinSubmit}
          onError={onPreJoinError}
        />
      </div>
    {/if}
  {:else}
    <div class="prejoin-layout__main" class:prejoin-layout__main--dimmed={isJoining}>
      <PreJoin
        class="prejoin-layout__prefab"
        defaults={preJoinDefaults}
        showUsername={false}
        persistUserChoices={true}
        joinLabel={t.live.preConnect.enterRoom()}
        secondaryJoinLabel={!isJoining ? t.live.preConnect.enterWithoutDevices() : ""}
        onSecondaryJoin={onEnterWithoutDevicesNonInstructor}
        micLabel={t.live.preConnect.micLabel()}
        camLabel={t.live.preConnect.cameraLabel()}
        noDeviceLabel={t.live.preConnect.noDeviceAvailable()}
        speakerLabel={t.live.preConnect.speakerLabel()}
        speakerHintSupported={t.live.preConnect.speakerHintSupported()}
        speakerHintUnsupported={t.live.preConnect.speakerHintUnsupported()}
        cameraNotFoundToast={t.live.preConnect.cameraNotFound()}
        onSubmit={onPreJoinSubmit}
        onError={onPreJoinError}
      />
    </div>
  {/if}
</div>

<style>
  .prejoin-stage {
    position: relative;
    min-height: 0;
  }

  .prejoin-stage__busy {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--space-3);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    background: color-mix(in oklch, var(--background) 82%, transparent);
    backdrop-filter: blur(8px);
    text-align: center;
    direction: rtl;
  }

  .prejoin-stage__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--accent-subtle);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  .prejoin-stage__busy-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-1);
    color: var(--foreground);
  }

  .prejoin-stage__busy-hint {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
    max-width: 28ch;
  }

  :global(.hb-button--start-live.hb-button--start-live) {
    background: var(--accent);
    border-color: color-mix(in oklch, var(--accent) 80%, black);
    font-size: var(--step-0);
    font-weight: 800;
    min-height: 52px;
    box-shadow: 0 4px 14px color-mix(in oklch, var(--accent) 35%, transparent);
  }

  :global(.hb-button--start-live .material-symbols-rounded) {
    --icon-size: 1.5rem;
  }

  .prejoin-layout {
    display: grid;
    grid-template-columns: minmax(280px, min(400px, 40vw)) minmax(0, 1fr);
    gap: clamp(12px, 2vw, 20px);
    align-items: start;
    min-height: 0;
    max-height: min(78vh, 920px);
    direction: rtl;
    transition: opacity 0.2s ease;
  }

  .prejoin-layout--dimmed,
  .prejoin-layout__main--dimmed {
    opacity: 0.45;
    pointer-events: none;
    user-select: none;
  }

  .prejoin-layout__main,
  .prejoin-layout__side {
    min-width: 0;
    display: grid;
    align-content: start;
    gap: var(--space-4);
  }

  .prejoin-layout__main {
    flex: 1 1 auto;
    max-width: 720px;
    margin-inline: auto;
    width: 100%;
  }

  .prejoin-layout__main--solo {
    max-width: 720px;
  }

  .prejoin-layout__side {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-height: 0;
    max-height: min(72vh, 860px);
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--muted);
    border: 1px solid var(--border-color);
  }

  .prejoin-host-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--primary);
    background: color-mix(in srgb, var(--primary) 12%, transparent);
  }

  .prejoin-host-badge .material-symbols-rounded {
    font-size: 1.1rem;
  }

  .prejoin-layout :global(.prejoin-layout__prefab.lk-prejoin) {
    width: 100%;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 64rem) {
    .prejoin-layout {
      grid-template-columns: 1fr;
      max-height: none;
    }

    .prejoin-layout__side {
      max-height: none;
      order: 2;
    }

    .prejoin-layout__main {
      order: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .prejoin-stage__spinner {
      animation: none;
    }
  }
</style>
