<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import { isBroadcastActive } from "$lib/features/live/lib/preconnect-ui";
  import { isCameraNotFoundMediaError } from "$lib/features/live/live-room-shared";

  let {
    session,
    isChecking,
    isJoining,
    canStartBroadcast,
    showEndLiveOnPreconnect,
    endingLive,
    onOpenEndLiveConfirm,
    onRetryReconnect,
  }: {
    session: LiveSessionPreConnect;
    isChecking: boolean;
    isJoining: boolean;
    canStartBroadcast: boolean;
    showEndLiveOnPreconnect: boolean;
    endingLive: boolean;
    onOpenEndLiveConfirm: () => void;
    onRetryReconnect: () => void;
  } = $props();

  const { t } = useI18n();

  const broadcastAlreadyLive = $derived(isBroadcastActive(session.joinAccess));
  const showPreconnectMediaError = $derived(
    Boolean(session.mediaError?.trim()) &&
      !isCameraNotFoundMediaError(session.mediaError) &&
      !isJoining,
  );
</script>

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
  <div class="prep-live-bar" role="status">
    <p class="prep-notice prep-notice--live">{t.live.preConnect.reenterLiveNotice()}</p>
    {#if showEndLiveOnPreconnect}
      <div class="prep-live-bar__end">
        <Button.Root
          class="hb-button hb-button--danger hb-button--md"
          type="button"
          disabled={endingLive}
          onclick={onOpenEndLiveConfirm}
        >
          <span class="material-symbols-rounded" aria-hidden="true">stop_circle</span>
          {t.live.room.leaveEndLive()}
        </Button.Root>
      </div>
    {/if}
  </div>
{/if}

{#if showPreconnectMediaError}
  <p class="entry-error" role="alert">{session.mediaError}</p>
{/if}

{#if session.connectionState === "disconnected" && session.mediaError && !isJoining}
  <div class="entry-retry">
    <p class="entry-error" role="alert">{session.mediaError}</p>
    <Button.Root
      class="hb-button hb-button--primary"
      type="button"
      onclick={onRetryReconnect}
    >
      {t.live.room.reconnectAction()}
    </Button.Root>
  </div>
{/if}

<style>
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
    margin: 0;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--foreground-muted);
  }

  .prep-live-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    background: var(--muted);
    direction: rtl;
  }

  .prep-live-bar__end {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .prep-live-bar__end .material-symbols-rounded {
    --icon-size: 1.125rem;
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

  .entry-retry {
    display: grid;
    gap: var(--space-3);
    justify-items: center;
  }

  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .entry-inline-status__dot {
      animation: none;
    }
  }
</style>
