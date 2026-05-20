<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import InstructorVideoManager from "$features/studio/components/InstructorVideoManager.svelte";
  import { api } from "$convex/_generated/api";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useQuery } from "convex-svelte";

  import { durationLabel, equipmentLabel } from "$lib/labels";
  import type { FunctionReturnType } from "convex/server";
  import { useConvexClient } from "convex-svelte";
  import { resource } from "runed";

  type LibraryData = FunctionReturnType<typeof api.video.catalog.listLibrary>;
  type VideoItem = LibraryData["videos"][number];
  type CategoryGroup = LibraryData["categoryGroups"][number];

  const auth = initAuth();
  const profileQuery = useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
  const role = $derived(profileQuery.data?.role ?? "customer");
  const isStaff = $derived(role === "instructor" || role === "admin");
  const client = useConvexClient();

  let actionId = $state<string | null>(null);
  let actionError = $state("");

  const libraryResource = resource(
    () => auth.isAuthenticated && !isStaff,
    async (shouldFetch) => {
      if (!shouldFetch) return null;
      return await authQuery(api.video.catalog.listLibrary, {});
    },
  );

  const data = $derived(libraryResource.current);
  const ownedCount = $derived(data ? data.videos.filter((video: VideoItem) => video.owned).length : 0);

  async function purchaseMacroflow(videoId: VideoItem["_id"]) {
    actionId = videoId;
    actionError = "";
    try {
      await client.mutation(api.video.entitlements.purchaseMacroflow, { videoId });
      await libraryResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן את הזכאות.";
    } finally {
      actionId = null;
    }
  }

  function categoryTitle(group: CategoryGroup) {
    return group.category.name;
  }

  function videoStateLabel(item: VideoItem) {
    return item.owned ? "Macroflow" : "Locked";
  }
</script>

{#if auth.isLoading}
  <div class="skeleton-shell">
    <div class="skeleton skeleton--hero"></div>
    <div class="skeleton-grid">
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>
  </div>
{:else if !auth.isAuthenticated}
  <div class="state-card">
    <p class="eyebrow">חשבון נעול</p>
    <h2>צריך להתחבר כדי לצפות בווידאו</h2>
    <a class="button-link" href="/">כניסה</a>
  </div>
{:else if isStaff}
  <InstructorVideoManager />
{:else if libraryResource.error}
  <div class="state-card">
    <Notice tone="danger">{libraryResource.error?.message ?? "שגיאה בטעינת הספרייה"}</Notice>
    <Button type="button" tone="ghost" onclick={() => { void libraryResource.refetch(); }}>לנסות שוב</Button>
  </div>
{:else if data}
  <PageShell
    kicker="HomeBody Video"
    title="ספריית VOD"
    description="Macroflow נרכש פעם אחת ונשאר שלך. Microflow נפתח אוטומטית כשיש מנוי פעיל."
  >
    {#if actionError}
      <Notice tone="danger">{actionError}</Notice>
    {/if}

    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">גישה חדשה</p>
        <h2>הספרייה מאורגנת לפי קטגוריות ולא לפי שבוע</h2>
        <p>
          השיעורים מוצגים עכשיו כרשת תוכן יציבה: בעלות קבועה ל-Macroflow, וגישה זמנית ל-Microflow לפי
          מנוי פעיל.
        </p>
      </div>
      <div class="hero-metrics">
        <div>
          <span>{ownedCount}</span>
          <small>שיעורי Macroflow בבעלותך</small>
        </div>
        <div>
          <span>{data.categoryGroups.length}</span>
          <small>קטגוריות פעילות</small>
        </div>
      </div>
    </section>

    <div class="section-stack">
      {#each data.categoryGroups as group}
        <section class="category-panel">
          <header class="category-head">
            <div>
              <p class="eyebrow">{categoryTitle(group)}</p>
              <h3>{group.category.description ?? "קטגוריה אוצרה ידנית"}</h3>
            </div>
            <span class="category-count">{group.items.length}</span>
          </header>

          {#if group.items.length === 0}
            <Notice tone="neutral">אין עדיין שיעורים משויכים לקטגוריה הזו.</Notice>
          {:else}
            <div class="video-grid">
              {#each group.items as item}
                <article class="video-card" class:owned={item.owned}>
                  <div class="thumb">
                    {#if item.thumbnailUrl}
                      <img src={item.thumbnailUrl} alt="" loading="lazy" />
                    {:else}
                      <span class="thumb-placeholder">{durationLabel(item.durationSeconds)}</span>
                    {/if}
                  </div>

                  <div class="video-card__meta">
                    <p class="status">{videoStateLabel(item)}</p>
                    <span class="duration">{durationLabel(item.durationSeconds)}</span>
                  </div>

                  <h4>{item.title}</h4>
                  <p class="desc">{item.description}</p>

                  <div class="tags">
                    {#each item.requiredEquipment as equipment}
                      <span>{equipmentLabel(equipment)}</span>
                    {/each}
                  </div>

                  <div class="actions">
                    {#if item.owned}
                      <a href={`/watch?videoId=${item._id}`}>לצפות</a>
                    {:else}
                      <Button
                        type="button"
                        tone="sky"
                        onclick={() => purchaseMacroflow(item._id)}
                        disabled={actionId === item._id}
                      >
                        לרכוש Macroflow
                      </Button>
                    {/if}
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    </div>
  </PageShell>
{/if}

<style>
  .skeleton-shell,
  .state-card,
  .hero,
  .category-panel {
    border: var(--border);
    background:
      linear-gradient(180deg, color-mix(in oklch, var(--sun) 18%, white), white 48%),
      white;
  }

  .skeleton-shell {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .skeleton-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  }

  .skeleton--hero {
    min-height: 180px;
  }

  .hero {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: minmax(0, 1.6fr) minmax(240px, 0.8fr);
    padding: var(--space-5);
    margin-bottom: var(--space-5);
    overflow: hidden;
    position: relative;
  }

  .hero::after {
    content: "";
    position: absolute;
    inset-inline-end: -80px;
    inset-block-start: -120px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle at center, color-mix(in oklch, var(--sky) 32%, transparent), transparent 70%);
    pointer-events: none;
  }

  .hero-copy h2,
  .category-head h3 {
    margin: 0;
    line-height: 1.05;
  }

  .hero-copy p {
    max-width: 62ch;
    color: var(--muted);
    margin: var(--space-2) 0 0;
  }

  .hero-metrics {
    display: grid;
    gap: var(--space-3);
    align-content: center;
  }

  .hero-metrics div {
    display: grid;
    gap: 0.15rem;
    padding: var(--space-4);
    background: color-mix(in oklch, var(--sun) 14%, white);
    border: var(--border);
  }

  .hero-metrics span {
    font-family: var(--font-mono);
    font-size: var(--step-3);
    font-weight: 900;
  }

  .hero-metrics small {
    color: var(--muted);
  }

  .section-stack {
    display: grid;
    gap: var(--space-5);
  }

  .category-panel {
    padding: var(--space-4);
  }

  .category-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .category-count {
    font-family: var(--font-mono);
    color: var(--ink);
    background: color-mix(in oklch, var(--leaf) 18%, white);
    border: var(--border);
    padding: 0.4rem 0.7rem;
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    grid-auto-rows: auto auto auto 1fr auto auto;
    gap: var(--space-5) var(--space-4);
  }

  .video-card {
    grid-row: var(--subgrid-card-span);
    display: grid;
    grid-template-rows: var(--subgrid-card-rows);
    border: var(--border);
    background: linear-gradient(135deg, color-mix(in srgb, var(--white) 97%, var(--beige) 3%), var(--white));
    overflow: hidden;
    content-visibility: auto;
    contain-intrinsic-size: 340px;
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .video-card.owned {
    box-shadow: inset 0 0 0 4px color-mix(in oklch, var(--sky) 70%, white);
  }

  .thumb {
    aspect-ratio: 16 / 10;
    display: grid;
    place-items: center;
    color: white;
    background:
      linear-gradient(135deg, color-mix(in oklch, var(--ink) 92%, white), color-mix(in oklch, var(--sun) 20%, var(--ink)));
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    font-family: var(--font-mono);
    font-weight: 800;
    letter-spacing: 0.03em;
  }

  .video-card__meta {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    min-width: 0;
  }

  .status,
  .duration,
  .desc {
    margin: 0;
  }

  .status {
    font-family: var(--font-mono);
    color: color-mix(in oklch, var(--sky) 60%, var(--ink));
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: var(--step--1);
  }

  .duration {
    color: var(--muted);
    white-space: nowrap;
  }

  h4 {
    margin: 0;
    font-size: var(--step-1);
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .desc {
    color: var(--muted);
    line-height: 1.6;
    overflow-wrap: anywhere;
    min-width: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .tags span {
    border: var(--border);
    padding: 0.3rem 0.55rem;
    font-size: var(--step--1);
    background: color-mix(in oklch, var(--leaf) 10%, white);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .actions a {
    display: inline-flex;
    padding: 0.75rem 1rem;
    border: var(--border);
    text-decoration: none;
    background: var(--ink);
    color: white;
  }

  .state-card {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-5);
  }

  .eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: color-mix(in oklch, var(--sun) 50%, var(--ink));
    font-size: var(--step--1);
    font-weight: 800;
  }

  .button-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 44px;
    padding-inline: var(--space-4);
    border: var(--border);
    background: var(--ink);
    color: white;
    text-decoration: none;
    font-weight: 800;
  }

  @media (max-width: 760px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .category-head {
      align-items: start;
      flex-direction: column;
    }
  }
</style>
