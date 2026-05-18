<script lang="ts">
  import { resource } from "runed";
  import { api } from "../../../convex/_generated/api";
  import type { Id } from "../../../convex/_generated/dataModel";
  import { authQuery, initAuth } from "../../lib/auth/session.svelte";
  import { durationLabel, equipmentLabel } from "../../lib/labels";
  import AppLayout from "./AppLayout.svelte";
  import Notice from "../ui/Notice.svelte";
  import MuxPlayer from "../video/MuxPlayer.svelte";

  const auth = initAuth();

  const videoId = $derived(
    new URLSearchParams(window.location.search).get("videoId") as Id<"videos"> | null
  );

  const playbackResource = resource(
    () => auth.isAuthenticated && videoId,
    async (shouldFetch) => {
      if (!shouldFetch || !videoId) return null;
      return await authQuery(api.videos.getViewerPlayback, { videoId });
    }
  );

  const playbackData = $derived(playbackResource.current);
</script>

{#if auth.isLoading}
  <AppLayout>
    <div class="state-card">
      <div class="skeleton skeleton--large"></div>
      <div class="skeleton"></div>
    </div>
  </AppLayout>
{:else if !auth.isAuthenticated}
  <AppLayout>
    <div class="state-card">
      <p class="eyebrow">חשבון נעול</p>
      <h2>צריך להתחבר כדי לצפות בווידאו</h2>
      <a class="button-link" href="/">כניסה</a>
    </div>
  </AppLayout>
{:else if !videoId}
  <AppLayout>
    <div class="state-card">
      <Notice tone="danger">לא צוין מזהה וידאו</Notice>
      <a class="button-link" href="/videos">חזרה לספרייה</a>
    </div>
  </AppLayout>
{:else if playbackResource.error}
  <AppLayout>
    <div class="state-card">
      <Notice tone="danger">{playbackResource.error?.message ?? "שגיאה בטעינת הווידאו"}</Notice>
      <a class="button-link" href="/videos">חזרה לספרייה</a>
    </div>
  </AppLayout>
{:else if playbackData}
  <AppLayout>
    <div class="watch-header">
      <p class="eyebrow">HomeBody Video</p>
      <h1>{playbackData.video.title}</h1>
    </div>

    {#if playbackData.video.playbackId}
      <MuxPlayer
        playbackId={playbackData.video.playbackId}
        thumbnailUrl={playbackData.video.thumbnailUrl}
        title={playbackData.video.title}
      />
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
  </AppLayout>
{:else}
  <AppLayout>
    <div class="state-card">
      <div class="skeleton skeleton--large"></div>
      <div class="skeleton"></div>
    </div>
  </AppLayout>
{/if}

<style>
  .watch-header h1 {
    font-size: var(--step-3);
    line-height: 1.1;
    margin: var(--space-2) 0 0;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0;
  }

  .state-card,
  .meta-card,
  .player-placeholder {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
    border: var(--border);
    background: var(--white);
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
    color: var(--muted);
    font-weight: 700;
  }

  .meta-value {
    font-weight: 700;
  }

  .desc {
    color: var(--muted);
    line-height: 1.7;
    margin: 0;
  }

  .button-link {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding-inline: var(--space-5);
    font: inherit;
    font-weight: 900;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--duration-fast);
  }

  .skeleton {
    height: 64px;
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
