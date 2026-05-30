<script lang="ts">
  import { resource } from "runed";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";

  import { durationLabel, equipmentLabel } from "$lib/labels";
  import Notice from "$components/ui/Notice.svelte";
  import MuxPlayer from "$components/video/MuxPlayer.svelte";
  import { useConvexClient } from "convex-svelte";
  import "../videos-feature.css";

  const auth = initAuth();

  const videoId = $derived(
    new URLSearchParams(window.location.search).get("videoId") as Id<"videos"> | null
  );

  const playbackResource = resource(
    () => auth.isAuthenticated && videoId,
    async (shouldFetch) => {
      if (!shouldFetch || !videoId) return null;
      return await authQuery(api.video.playback.getViewerPlayback, { videoId });
    }
  );

  const playbackData = $derived(playbackResource.current);

  const client = useConvexClient();
  const tokenResource = resource(
    () => auth.isAuthenticated && playbackData?.video.playbackId ? playbackData.video._id : null,
    async (resolvedVideoId) => {
      if (!resolvedVideoId) return null;
      return await client.action(api.video.playbackToken.getViewerPlaybackToken, { videoId: resolvedVideoId });
    }
  );

  const playbackToken = $derived(tokenResource.current?.token ?? null);

  async function updateProgress(progress: { currentTimeSeconds: number; durationSeconds: number }) {
    if (!videoId) return;
    await client.mutation(api.video.playback.updateProgress, { videoId, ...progress });
  }
</script>

{#if auth.isLoading}
  <div class="videos-state-card">
    <div class="skeleton skeleton--large"></div>
    <div class="skeleton"></div>
  </div>
{:else if !auth.isAuthenticated}
  <div class="videos-state-card">
    <p class="videos-eyebrow">חשבון נעול</p>
    <h2>צריך להתחבר כדי לצפות בווידאו</h2>
    <a class="button-link" href="/">כניסה</a>
  </div>
{:else if !videoId}
  <div class="videos-state-card">
    <Notice tone="danger">לא צוין מזהה וידאו</Notice>
    <a class="button-link" href="/u/library">חזרה לספרייה</a>
  </div>
{:else if playbackResource.error}
  <div class="videos-state-card">
    <Notice tone="danger">{playbackResource.error?.message ?? "שגיאה בטעינת הווידאו"}</Notice>
    <a class="button-link" href="/u/library">חזרה לספרייה</a>
  </div>
{:else if playbackData}
  <div class="watch-header">
    <p class="videos-eyebrow videos-eyebrow--video">AnatoMe Video</p>
    <h1>{playbackData.video.title}</h1>
  </div>

  {#if playbackData.video.playbackId && playbackToken}
    <MuxPlayer
      playbackId={playbackData.video.playbackId}
      playbackToken={playbackToken}
      thumbnailUrl={playbackData.video.thumbnailUrl}
      title={playbackData.video.title}
      videoId={playbackData.video._id}
      onProgress={updateProgress}
    />
  {:else if playbackData.video.playbackId && tokenResource.error}
    <div class="player-placeholder">
      <Notice tone="danger">{tokenResource.error?.message ?? "שגיאה באישור הצפייה"}</Notice>
    </div>
  {:else if playbackData.video.playbackId}
    <div class="player-placeholder">
      <Notice>מאשרים צפייה מאובטחת...</Notice>
    </div>
  {:else}
    <div class="player-placeholder">
      <Notice>הווידאו עדיין בעיבוד</Notice>
    </div>
  {/if}

  <div class="meta-card">
    <div class="meta-row">
      <span class="meta-label">משך</span>
      <span class="meta-value">{durationLabel(playbackData.video.durationSeconds)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">ציוד נדרש</span>
      <span class="meta-value">
        {playbackData.video.requiredEquipment.map(equipmentLabel).join(", ") || "ללא"}
      </span>
    </div>
    <p class="desc">{playbackData.video.description}</p>
  </div>
{:else}
  <div class="videos-state-card">
    <div class="skeleton skeleton--large"></div>
    <div class="skeleton"></div>
  </div>
{/if}

<style>
  .watch-header h1 {
    font-size: clamp(var(--step-1), 4vw, var(--step-3));
    line-height: 1.2;
    margin: var(--space-2) 0 0;
    overflow-wrap: anywhere;
  }

  @media (max-width: 48rem) {
    .watch-header {
      padding-inline: var(--space-4);
      padding-block: max(var(--space-3), env(safe-area-inset-top)) var(--space-3);
    }

    .watch-header h1 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :global(.mux-player-wrapper) {
      margin-inline: calc(-1 * var(--space-4));
      width: calc(100% + 2 * var(--space-4));
      max-width: 100vw;
    }

    .meta-card {
      margin-inline: var(--space-4);
      margin-block-end: max(var(--space-5), env(safe-area-inset-bottom));
    }
  }

  .meta-card,
  .player-placeholder {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
    border: var(--border);
    background: var(--elevated);
  }

  .player-placeholder {
    place-items: center;
    aspect-ratio: 16 / 9;
  }

  .meta-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .meta-label {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--foreground-muted);
    font-weight: 700;
  }

  .meta-value {
    font-weight: 700;
  }

  .desc {
    color: var(--foreground-muted);
    line-height: 1.7;
    margin: 0;
  }

  .skeleton {
    height: var(--space-8);
    background: var(--line-light);
    animation: pulse 1.6s ease-in-out infinite;
  }

  .skeleton--large {
    height: 180px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
