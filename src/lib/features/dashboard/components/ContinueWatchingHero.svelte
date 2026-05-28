<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { Button } from "bits-ui";
  import { useQuery } from "convex-svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { watchHref, routePath } from "$lib/i18n/context";
  import { formatProgressLabel } from "../lib/format";
  import "../dashboard.css";

  type ContinueItem = NonNullable<
    FunctionReturnType<typeof api.video.playback.getContinueWatching>
  >;
  let { displayName }: { displayName?: string | null } = $props();

  const { t } = useI18n();
  const progressQuery = useQuery(api.video.playback.getContinueWatching, () =>
    canRunAuthenticatedQuery() ? {} : "skip",
  );

  const item = $derived(progressQuery.data ?? null);
  const loading = $derived(progressQuery.isLoading);
  const error = $derived(progressQuery.error?.message ?? null);
  const friendlyName = $derived.by(() => {
    const raw = displayName?.trim();
    if (!raw || raw.includes("@")) return null;
    const first = raw.split(/\s+/)[0];
    return first || null;
  });

  const greeting = $derived(
    friendlyName
      ? t.dashboard.member.greetingNamed({ name: friendlyName })
      : t.dashboard.member.greeting(),
  );
</script>

<section class="continue-hero" aria-labelledby="continue-hero-title">
  {#if loading}
    <div class="dashboard-skeleton" aria-busy="true">
      <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
      <div class="dashboard-skeleton__bar"></div>
    </div>
  {:else if error}
    <div class="continue-hero__fallback dashboard-panel">
      <p class="continue-hero__error">{error}</p>
      <Button.Root
        class="hb-button hb-button--paper hb-button--sm"
        type="button"
        onclick={() => window.location.reload()}
      >
        {t.dashboard.retry()}
      </Button.Root>
    </div>
  {:else if item}
    <a class="continue-hero__card" href={watchHref(item.videoId)}>
      <div class="continue-hero__media">
        {#if item.thumbnailUrl}
          <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" />
        {:else}
          <span class="continue-hero__placeholder" aria-hidden="true"></span>
        {/if}
      </div>
      <div class="continue-hero__body">
        <p class="continue-hero__eyebrow">{t.dashboard.member.continueKicker()}</p>
        <h2 id="continue-hero-title" class="continue-hero__title">{item.title}</h2>
        <p class="continue-hero__meta">
          {formatProgressLabel(item.currentTimeSeconds, item.durationSeconds)}
        </p>
        <div
          class="continue-hero__progress"
          role="progressbar"
          aria-valuenow={Math.max(4, Math.min(100, Math.round(item.percentWatched)))}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span style:width="{Math.max(4, Math.min(100, Math.round(item.percentWatched)))}%"></span>
        </div>
        <span class="continue-hero__cta hb-button hb-button--ink hb-button--sm">
          {t.dashboard.member.continueCta()}
        </span>
      </div>
    </a>
  {:else}
    <div class="continue-hero__welcome dashboard-panel">
      <div class="continue-hero__welcome-head">
        <h2 id="continue-hero-title" class="continue-hero__welcome-title">{greeting}</h2>
        <p class="continue-hero__welcome-text">{t.dashboard.member.welcomeBody()}</p>
      </div>
      <div class="continue-hero__welcome-actions">
        <Button.Root
          class="hb-button hb-button--ink hb-button--md"
          type="button"
          onclick={() => window.location.assign(routePath("library"))}
        >
          {t.dashboard.member.browseLibrary()}
        </Button.Root>
        <Button.Root
          class="hb-button hb-button--paper hb-button--sm"
          type="button"
          onclick={() => window.location.assign(routePath("uCalendar"))}
        >
          {t.dashboard.member.browseLives()}
        </Button.Root>
      </div>
    </div>
  {/if}
</section>

<style>
  .continue-hero {
    min-width: 0;
  }

  .continue-hero__card {
    display: grid;
    grid-template-columns: minmax(120px, 34%) minmax(0, 1fr);
    gap: 0;
    border: var(--border);
    background: var(--elevated);
    color: inherit;
    text-decoration: none;
    min-width: 0;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .continue-hero__card:hover {
    background: color-mix(in oklch, var(--accent-soft) 55%, var(--elevated));
  }

  .continue-hero__card:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .continue-hero__media {
    position: relative;
    aspect-ratio: 16 / 10;
    background: var(--surface);
    min-width: 0;
    overflow: hidden;
  }

  .continue-hero__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .continue-hero__placeholder {
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      145deg,
      color-mix(in oklch, var(--accent) 18%, var(--surface)),
      var(--surface)
    );
  }

  .continue-hero__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    min-width: 0;
  }

  .continue-hero__title {
    margin: 0;
    font-size: clamp(var(--step-1), 2.5vw, var(--step-2));
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .continue-hero__meta {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .continue-hero__progress {
    height: 6px;
    background: var(--surface);
    border: 1px solid var(--line-light);
    overflow: hidden;
  }

  .continue-hero__progress span {
    display: block;
    height: 100%;
    background: var(--accent);
    transition: width var(--duration-fast) var(--ease-out);
  }

  .continue-hero__cta {
    margin-block-start: auto;
    align-self: flex-start;
    pointer-events: none;
  }

  .continue-hero__welcome {
    border: var(--border);
    border-radius: var(--radius-md);
  }

  .continue-hero__welcome-head {
    display: grid;
    gap: var(--space-2);
  }

  .continue-hero__eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }

  .continue-hero__welcome-title {
    margin: 0;
    font-size: clamp(var(--step-2), 3vw, var(--step-3));
    line-height: 1.15;
  }

  .continue-hero__welcome-text {
    margin: var(--space-2) 0 0;
    color: var(--foreground-muted);
    line-height: 1.6;
    max-width: 52ch;
  }

  .continue-hero__welcome-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-block-start: var(--space-4);
  }

  .continue-hero__error {
    margin: var(--space-2) 0 var(--space-3);
    color: var(--danger);
  }

  .continue-hero__fallback {
    min-width: 0;
  }

  @media (max-width: 640px) {
    .continue-hero__card {
      grid-template-columns: 1fr;
    }

    .continue-hero__media {
      aspect-ratio: 16 / 9;
    }

  }
</style>
