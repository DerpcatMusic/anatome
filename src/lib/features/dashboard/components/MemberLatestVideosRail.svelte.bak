<script lang="ts">
  import { onMount } from "svelte";
import { useIntersectionObserver } from "runed";
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { routePath } from "$lib/i18n/context";
  import HorizontalVideoRow from "$features/videos/components/HorizontalVideoRow.svelte";
  import type { RowVideo } from "$features/videos/components/HorizontalVideoRow.svelte";
  import "../dashboard.css";

  const { t } = useI18n();

  let sectionEl: HTMLElement | undefined = $state();
  let catalogEnabled = $state(false);

  useIntersectionObserver(
    () => sectionEl,
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        catalogEnabled = true;
      }
    },
    { rootMargin: "240px 0px", threshold: 0, once: true },
  );

  const queryNow = useQueryNowMs();
  const catalogQuery = useQuery(api.video.catalog.listCatalog, () =>
    canRunAuthenticatedQuery() && catalogEnabled ? { now: queryNow.nowMs } : "skip",
  );

  const latestVideos = $derived.by((): RowVideo[] => {
    const data = catalogQuery.data;
    if (!data) return [];

    const micro = data.categoryGroups.flatMap((group) => group.items);
    const merged = [...data.macroflowVideos, ...micro];
    const seen = new Set<string>();

    return merged
      .filter((video) => {
        if (seen.has(video._id)) return false;
        seen.add(video._id);
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 24)
      .map((video) => ({
        _id: video._id,
        title: video.title,
        durationSeconds: video.durationSeconds,
        thumbnailUrl: video.thumbnailUrl,
        locked: video.locked,
        owned: video.owned,
        accessible: video.accessible,
        accessKind: video.accessKind,
      }));
  });

  function openVideo(video: RowVideo) {
    if (!video.accessible && video.locked) {
      window.location.assign(routePath("library"));
      return;
    }
    window.location.assign(`${routePath("watch")}?videoId=${video._id}`);
  }
</script>

<section
  class="dashboard-latest"
  aria-label={t.dashboard.member.latestVideos()}
  bind:this={sectionEl}
>
  {#if !catalogEnabled || catalogQuery.isLoading}
    <div class="dashboard-skeleton dashboard-panel" aria-busy="true">
      <div class="dashboard-skeleton__bar"></div>
      <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
    </div>
  {:else}
    <HorizontalVideoRow
      title=""
      hideHeader
      eyebrow={t.dashboard.member.latestVideosEyebrow()}
      videos={latestVideos}
      emptyMessage={t.dashboard.member.latestVideosEmpty()}
      onSelect={openVideo}
    />
  {/if}

  {#if catalogQuery.error}
    <p class="dashboard-latest__error">{catalogQuery.error.message}</p>
  {/if}
</section>

<style>
  .dashboard-latest {
    min-width: 0;
    padding-block-start: var(--space-3);
    border-top: var(--border);
  }

  .dashboard-latest__error {
    margin: var(--space-3) 0 0;
    color: var(--danger);
    font-size: var(--text-sm);
  }

  .dashboard-latest :global(.video-row__eyebrow) {
    margin: 0 0 var(--space-2);
    padding-inline: 0;
    font-size: var(--text-xs);
    letter-spacing: 0.04em;
    color: var(--secondary);
  }

  .dashboard-latest :global(.video-row__track--carousel) {
    padding-inline: var(--space-1) var(--space-5);
    margin-inline: 0;
    scroll-padding-inline: var(--space-5);
  }
</style>
