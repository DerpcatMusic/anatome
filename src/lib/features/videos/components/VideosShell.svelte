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
  import "./VideosShell.css";

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

