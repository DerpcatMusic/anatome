<script lang="ts">
  import { Button } from "bits-ui";
  import type { LocalUserChoices } from "@livekit/components-core";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    resolveLiveSession,
    type LiveSessionPreConnect,
  } from "$lib/features/live/live-session.svelte";
  import { getMediaErrorMessage } from "$lib/features/live/live-room-shared";
  import { formatLiveWindow } from "$lib/features/dashboard/lib/format";
  import { PreJoin } from "$lib/livekit";
  import PreConnectFrame from "./PreConnectFrame.svelte";
  import PreConnectSettings from "./PreConnectSettings.svelte";
  import PreConnectState from "./PreConnectState.svelte";
  import {
    canHostStartBroadcast,
    isBroadcastActive,
    showHostPublishSettings,
  } from "$lib/features/live/lib/preconnect-ui";

  let {
    session: sessionProp,
    room: roomAlias,
    joinLoading = false,
  }: {
    session?: LiveSessionPreConnect;
    /** @deprecated Pass `session` instead. */
    room?: LiveSessionPreConnect;
    joinLoading?: boolean;
  } = $props();

  const session = $derived(resolveLiveSession(sessionProp, roomAlias, "PreConnectOverlay"));
  const { t } = useI18n();

  const backHref = $derived(session.isInstructorRoom ? "/i/calendar" : "/u/calendar");
  const profileHref = $derived(session.isInstructorRoom ? "/i/profile" : "/u/profile");
  const canStartBroadcast = $derived(
    canHostStartBroadcast(
      session.isClassHost,
      session.isInstructorRoom,
      session.joinAccess,
      session.status,
    ),
  );
  const isPrep = $derived(canStartBroadcast);
  const showPublishPanel = $derived(
    showHostPublishSettings(session.isInstructorRoom, canStartBroadcast),
  );
  const broadcastAlreadyLive = $derived(isBroadcastActive(session.joinAccess));
  const primaryJoinLabel = $derived(
    isPrep ? t.live.preConnect.startLive() : t.live.preConnect.enterRoom(),
  );
  const primaryJoinIcon = $derived(isPrep ? "play_circle" : "sensors");
  const primaryJoinButtonClass = $derived(isPrep ? "hb-button--start-live" : "");
  const secondaryJoinLabel = $derived(
    isPrep ? t.live.preConnect.startLiveWithoutDevices() : t.live.preConnect.enterWithoutDevices(),
  );
  const isReady = $derived(
    session.status === "ready" &&
      (session.joinInfo !== null || session.joinAccess?.canEnter === true),
  );
  const isChecking = $derived(
    joinLoading || session.status === "checking" || session.auth.isLoading,
  );
  const isJoining = $derived(
    session.joiningLive || session.connectionState === "connecting",
  );
  const showDeviceSetup = $derived(
    (isPrep || isReady) &&
      (session.joinInfo !== null || session.joinAccess?.canEnter === true),
  );
  const frameTitle = $derived(
    session.joinInfo?.classTitle?.trim() ||
      session.joinContextTitle?.trim() ||
      t.live.preConnect.title(),
  );
  const frameSubtitle = $derived(
    session.joinInfo?.instructorName
      ? t.live.preConnect.classWithInstructor({ name: session.joinInfo.instructorName })
      : "",
  );

  const scheduleLine = $derived.by(() => {
    const access = session.joinAccess;
    if (!access) return "";
    return formatLiveWindow(access.startsAt, access.joinClosesAt);
  });

  const broadcastStatusLabel = $derived.by(() => {
    if (canStartBroadcast) return t.live.preConnect.statusAwaitingStart();
    return session.classBroadcastLabel ?? "";
  });

  const preJoinDefaults = $derived<Partial<LocalUserChoices>>({
    username: "guest",
    videoEnabled: true,
    audioEnabled: session.isInstructorRoom,
  });

  function onPreJoinSubmit(choices: LocalUserChoices) {
    const safeChoices = session.mediaError
      ? { ...choices, videoEnabled: false }
      : choices;
    void session.enterFromPreJoin(safeChoices, { isPrep });
  }

  function onPreJoinError(error: Error) {
    session.mediaError = getMediaErrorMessage("camera", error);
    session.wantsCameraOnJoin = false;
  }
</script>

<PreConnectFrame
  title={frameTitle}
  subtitle={frameSubtitle}
  {scheduleLine}
  statusLabel={broadcastStatusLabel}
  statusTone={canStartBroadcast ? "prep" : session.joinAccess?.status === "live" ? "live" : "default"}
>
  {#if session.status === "locked"}
    <PreConnectState
      title={t.live.preConnect.lockedTitle()}
      message={session.auth.error}
      actionLabel={t.live.preConnect.lockedCta()}
      actionHref="/"
    />
  {:else if session.status === "missing"}
    <PreConnectState
      title={t.live.preConnect.missingTitle()}
      actionLabel={t.live.preConnect.missingCta()}
      actionHref={backHref}
    />
  {:else if session.status === "invalidClass"}
    <PreConnectState
      title={t.live.preConnect.invalidClassTitle()}
      message={t.live.preConnect.invalidClassBody()}
      actionLabel={t.live.preConnect.missingCta()}
      actionHref={backHref}
    />
  {:else if session.status === "equipment"}
    <PreConnectState
      title={t.live.preConnect.equipmentTitle()}
      message={t.live.preConnect.equipmentBody()}
      tone="caution"
      actionLabel={session.isInstructorRoom ? t.live.preConnect.equipmentCtaStudio() : t.live.preConnect.equipmentCtaProfile()}
      actionHref={session.isInstructorRoom ? backHref : profileHref}
      secondaryLabel={session.isInstructorRoom ? t.live.preConnect.equipmentCtaProfile() : t.live.preConnect.equipmentCtaCalendar()}
      secondaryHref={session.isInstructorRoom ? profileHref : backHref}
    />
  {:else if session.status === "waiting"}
    <PreConnectState
      title={session.joinWaitingTitle}
      message={session.joinWaitingMessage ?? t.live.room.joinTooEarlyBody()}
      actionLabel={t.live.preConnect.retry()}
      onAction={() => session.loadToken()}
      secondaryLabel={t.live.preConnect.backCalendar()}
      secondaryHref={backHref}
    />
  {:else if session.status === "error"}
    <PreConnectState
      title={t.live.preConnect.errorTitle()}
      message={session.error}
      tone="danger"
      actionLabel={t.live.preConnect.retry()}
      onAction={() => session.loadToken()}
      secondaryLabel={t.live.preConnect.backCalendar()}
      secondaryHref={backHref}
    />
  {:else if showDeviceSetup}
    <div class="entry-stack" class:entry-stack--joining={isJoining}>
      {#if isChecking && !isJoining}
        <p class="entry-inline-status" role="status">
          <span class="entry-inline-status__dot" aria-hidden="true"></span>
          {t.live.preConnect.checking()}
        </p>
      {/if}

      {#if canStartBroadcast}
        <div class="prep-callout" role="status">
          <span class="material-symbols-rounded prep-callout__icon" aria-hidden="true">play_circle</span>
          <div class="prep-callout__copy">
            <strong>{t.live.preConnect.prepCalloutTitle()}</strong>
            <p>{t.live.preConnect.prepNoticeInstructor()}</p>
          </div>
        </div>
      {:else if session.isClassHost && broadcastAlreadyLive}
        <p class="prep-notice prep-notice--live" role="status">
          {t.live.preConnect.reenterLiveNotice()}
        </p>
      {/if}

      {#if session.mediaError && !isJoining}
        <p class="entry-error" role="alert">{session.mediaError}</p>
      {/if}

      <div class="prejoin-stage lk-theme" class:prejoin-stage--joining={isJoining}>
        {#if isJoining}
          <div class="prejoin-stage__busy" role="status" aria-live="polite" aria-busy="true">
            <div class="prejoin-stage__spinner" aria-hidden="true"></div>
            <p class="prejoin-stage__busy-title">{t.live.room.connecting()}</p>
            <p class="prejoin-stage__busy-hint">{t.live.preConnect.joiningHint()}</p>
          </div>
        {/if}

        {#if session.isInstructorRoom}
          {#if showPublishPanel}
            <div class="prejoin-layout" class:prejoin-layout--dimmed={isJoining}>
              <aside class="prejoin-layout__side">
                {#if session.isClassHost}
                  <p class="prejoin-host-badge" role="status">
                    <span class="material-symbols-rounded" aria-hidden="true">verified</span>
                    {t.live.preConnect.hostBadge()}
                  </p>
                {/if}
                <PreConnectSettings session={session} />
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
                  micLabel={t.live.preConnect.micLabel()}
                  camLabel={t.live.preConnect.cameraLabel()}
                  onSubmit={onPreJoinSubmit}
                  onError={onPreJoinError}
                />
                {#if !isJoining}
                  <div class="prejoin-actions">
                    <Button.Root
                      class="hb-button hb-button--ghost"
                      type="button"
                      onclick={() => void session.enterWithoutDevicesFromPreJoin({ isPrep })}
                    >
                      {secondaryJoinLabel}
                    </Button.Root>
                  </div>
                {/if}
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
                micLabel={t.live.preConnect.micLabel()}
                camLabel={t.live.preConnect.cameraLabel()}
                onSubmit={onPreJoinSubmit}
                onError={onPreJoinError}
              />
              {#if !isJoining}
                <div class="prejoin-actions prejoin-actions--center">
                  <Button.Root
                    class="hb-button hb-button--ghost"
                    type="button"
                    onclick={() => void session.enterWithoutDevicesFromPreJoin({ isPrep })}
                  >
                    {secondaryJoinLabel}
                  </Button.Root>
                </div>
              {/if}
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
              micLabel={t.live.preConnect.micLabel()}
              camLabel={t.live.preConnect.cameraLabel()}
              onSubmit={onPreJoinSubmit}
              onError={onPreJoinError}
            />
            {#if !isJoining}
              <div class="prejoin-actions prejoin-actions--center">
                <Button.Root
                  class="hb-button hb-button--ghost"
                  type="button"
                  onclick={() => void session.enterWithoutDevicesFromPreJoin({ isPrep: false })}
                >
                  {t.live.preConnect.enterWithoutDevices()}
                </Button.Root>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      {#if session.connectionState === "disconnected" && session.mediaError && !isJoining}
        <div class="entry-retry">
          <p class="entry-error" role="alert">{session.mediaError}</p>
          <Button.Root
            class="hb-button hb-button--primary"
            type="button"
            onclick={() => void session.reconnect()}
          >
            {t.live.room.reconnectAction()}
          </Button.Root>
        </div>
      {/if}
    </div>
  {:else if isChecking}
    <PreConnectState loading message={t.live.preConnect.checking()} />
  {/if}
</PreConnectFrame>

<style>
  .entry-stack {
    display: grid;
    gap: var(--space-4);
    min-height: 0;
  }

  .entry-inline-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    margin: 0;
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--foreground-muted);
    direction: rtl;
  }

  .entry-inline-status__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .prep-notice {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid color-mix(in oklch, var(--accent) 35%, var(--border-color));
    background: var(--accent-subtle);
    font-size: var(--step--1);
    line-height: 1.5;
    color: var(--foreground);
    direction: rtl;
  }

  .prep-notice--live {
    border-color: var(--border-color);
    background: var(--muted);
  }

  .prep-callout {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    border: 2px solid color-mix(in oklch, var(--accent) 55%, var(--border-color));
    background: color-mix(in oklch, var(--accent) 14%, var(--card));
    direction: rtl;
  }

  .prep-callout__icon {
    flex-shrink: 0;
    font-size: 2rem;
    color: var(--accent);
  }

  .prep-callout__copy {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .prep-callout__copy strong {
    font-size: var(--step-0);
    font-family: var(--font-display);
  }

  .prep-callout__copy p {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.5;
    color: var(--foreground-muted);
  }

  :global(.hb-button--start-live) {
    background: var(--accent) !important;
    border-color: color-mix(in oklch, var(--accent) 80%, black) !important;
    font-size: var(--step-0);
    font-weight: 800;
    min-height: 52px;
    box-shadow: 0 4px 14px color-mix(in oklch, var(--accent) 35%, transparent);
  }

  :global(.hb-button--start-live .material-symbols-rounded) {
    --icon-size: 1.5rem;
  }

  .entry-error {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid color-mix(in oklch, var(--destructive) 35%, var(--border-color));
    background: color-mix(in oklch, var(--destructive) 12%, var(--muted));
    color: var(--foreground);
    font-size: var(--step--1);
    direction: rtl;
  }

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

  .prejoin-actions {
    display: grid;
    gap: var(--space-3);
  }

  .prejoin-actions--center {
    justify-items: center;
  }

  .entry-retry {
    display: grid;
    gap: var(--space-3);
    justify-items: center;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    50% {
      opacity: 0.35;
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
    .prejoin-stage__spinner,
    .entry-inline-status__dot {
      animation: none;
    }
  }
</style>
