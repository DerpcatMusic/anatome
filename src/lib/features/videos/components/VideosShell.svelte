<script lang="ts">
  import { resource } from "runed";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, getCachedRole, initAuth } from "$lib/auth/session.svelte";
  import { convex } from "$lib/convex/client";
  import { routePath } from "$lib/i18n/context";
  import { durationLabel, equipmentLabel } from "$lib/labels";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import InstructorVideoManager from "$features/studio/components/InstructorVideoManager.svelte";

  type VideoData = FunctionReturnType<typeof api.videos.listWeekly>;
  type VideoItem = VideoData["videos"][number];

  const auth = initAuth();
  const role = $derived(getCachedRole() ?? "customer");
  const isStaff = $derived(role === "instructor" || role === "admin");

  const fullFormatter = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  });

  let actionId = $state<string | null>(null);
  let actionError = $state("");

  const dataResource = resource(
    () => auth.isAuthenticated && !isStaff,
    async (shouldFetch) => {
      if (!shouldFetch) return null;
      return await authQuery(api.videos.listWeekly, {});
    }
  );

  const data = $derived(dataResource.current);

  function weekLabel(accessEndsAt: number | null) {
    if (!accessEndsAt) return "";
    const start = new Date(accessEndsAt);
    start.setDate(start.getDate() - 7);
    return `${fullFormatter.format(start)} - ${fullFormatter.format(new Date(accessEndsAt))}`;
  }

  function statusLabel(item: VideoItem) {
    if (item.selected) return "נבחר לשבוע";
    if (item.missingEquipment.length > 0) return "חסר ציוד";
    if ((data?.remainingCredits ?? 0) <= 0) return "נעול";
    return "זמין לבחירה";
  }

  async function selectVideo(videoId: Id<"videos">) {
    actionId = videoId;
    actionError = "";
    try {
      await convex.mutation(api.videos.selectForWeek, { videoId });
      await dataResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבחור את הווידאו.";
    } finally {
      actionId = null;
    }
  }
</script>

{#if auth.isLoading}
  <div class="state-card">
    <div class="skeleton skeleton--large"></div>
    <div class="skeleton"></div>
  </div>
{:else if !auth.isAuthenticated}
  <div class="state-card">
    <p class="eyebrow">חשבון נעול</p>
    <h2>צריך להתחבר כדי לצפות בווידאו</h2>
    <a class="button-link" href="/">כניסה</a>
  </div>
{:else if isStaff}
  <InstructorVideoManager />
{:else if dataResource.error}
  <div class="state-card">
    <Notice tone="danger">{dataResource.error?.message ?? "שגיאה"}</Notice>
    <button type="button" class="btn-ghost" onclick={() => dataResource.refetch()}>לנסות שוב</button>
  </div>
{:else if data}
  <PageShell
    title="בחירת וידאו שבועית"
    kicker="HomeBody Video"
    description="בוחרים שיעורי וידאו לשבוע הזה עם קרדיטי הווידאו שלך. מה שבחרת פתוח לצפייה עד סוף השבוע."
  >
    {#snippet headerExtra()}
      <div class="credit-meter">
        <span>{data.remainingCredits}</span>
        <small>קרדיטים פנויים</small>
      </div>
    {/snippet}

    {#if data.accessEndsAt}
      <div class="week-banner">
        <span class="week-label">{weekLabel(data.accessEndsAt)}</span>
        <span class="week-count">נבחרו {data.selectedCount} מתוך {data.videos.length}</span>
      </div>
    {/if}

    {#if actionError}
      <Notice tone="danger">{actionError}</Notice>
    {/if}

    {#if data.videos.length === 0}
      <div class="state-card">
        <p>אין עדיין וידאו פעיל לשבוע הזה. בדקי מאוחר יותר.</p>
      </div>
    {:else}
      <div class="video-grid">
        {#each data.videos as item}
          <article class:locked={item.locked} class:selected={item.selected} class="video-card">
            <div class="thumb">
              {#if item.video.thumbnailUrl}
                <img src={item.video.thumbnailUrl} alt="" loading="lazy" />
              {:else}
                <span class="thumb-placeholder">
                  <span class="thumb-duration">{durationLabel(item.video.durationSeconds)}</span>
                  HomeBody
                </span>
              {/if}
            </div>

            <div class="video-card__body">
              <div class="video-card__top">
                <p class="status">{statusLabel(item)}</p>
                <span class="duration">{durationLabel(item.video.durationSeconds)}</span>
              </div>
              <h3>{item.video.title}</h3>
              <p class="desc">{item.video.description}</p>

              <div class="tags">
                {#each item.video.requiredEquipment as equipment}
                  <span>{equipmentLabel(equipment)}</span>
                {/each}
              </div>

              {#if item.missingEquipment.length > 0}
                <Notice>חסר בפרופיל: {item.missingEquipment.map(equipmentLabel).join(", ")}</Notice>
              {/if}

              <div class="actions">
                {#if item.selected}
                  <a href={`${routePath("watch")}?videoId=${item.video._id}`}>לצפות</a>
                {:else}
                  <button
                    type="button"
                    onclick={() => selectVideo(item.video._id)}
                    disabled={!item.canSelect || actionId === item.video._id}
                  >
                    {item.locked ? "נעול" : "לבחור לשבוע"}
                  </button>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </PageShell>
{/if}

<style>
  .week-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
    border: var(--border);
    background: var(--sky-soft);
    padding: var(--space-4) var(--space-5);
  }

  .week-label {
    font-weight: 700;
    font-size: var(--step-0);
  }

  .week-count {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  .credit-meter {
    display: grid;
    min-width: 140px;
    border: var(--border);
    background: var(--sky);
    padding: var(--space-4);
    text-align: center;
  }

  .credit-meter span {
    font-family: var(--font-mono);
    font-size: var(--step-2);
    font-weight: 900;
    line-height: 1;
  }

  .credit-meter small {
    color: var(--ink);
    font-weight: 800;
    font-size: var(--step--1);
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: var(--space-4);
  }

  .video-card,
  .state-card {
    display: grid;
    border: var(--border);
    background: var(--white);
    transition: box-shadow var(--duration-fast);
  }

  .video-card.locked {
    opacity: 0.5;
    filter: grayscale(0.85);
  }

  .video-card.selected {
    box-shadow: inset 0 0 0 4px var(--sky);
  }

  .thumb {
    aspect-ratio: 16 / 10;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--white);
    overflow: hidden;
    position: relative;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-weight: 900;
    font-size: var(--step-1);
  }

  .thumb-duration {
    font-size: var(--step--1);
    background: rgba(0, 0, 0, 0.6);
    padding: 2px 8px;
  }

  .video-card__body,
  .state-card {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .video-card__top {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
  }

  .status,
  .desc {
    margin: 0;
    color: var(--muted);
  }

  .video-card h3 {
    font-size: var(--step-1);
    line-height: 1.2;
    margin: 0;
  }

  .desc {
    line-height: 1.7;
  }

  .tags,
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .tags span {
    border: 1px solid var(--line-light);
    background: var(--surface);
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--1);
    font-weight: 800;
  }

  .actions a,
  .actions button,
  .button-link,
  .btn-ghost {
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
  }

  .actions button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-ghost {
    background: var(--white);
    color: var(--ink);
  }

  .skeleton {
    height: 64px;
    background: var(--line-light);
    animation: skeleton-pulse 1.6s ease-in-out infinite;
  }

  .skeleton--large {
    height: 180px;
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
