<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import { goto } from "$app/navigation";
  import { useConvexClient } from "convex-svelte";
  import MacroflowCreditsBadge from "./MacroflowCreditsBadge.svelte";
  import HorizontalVideoRow, { type RowVideo } from "./HorizontalVideoRow.svelte";
  import MicroflowCategorySection, {
    type CategoryGroup,
  } from "./MicroflowCategorySection.svelte";
  import RedeemVideoDialog, { type RedeemTarget } from "./RedeemVideoDialog.svelte";
  import "./VideoLibraryShell.css";

  type LibraryData = FunctionReturnType<typeof api.video.catalog.listLibrary>;
  /** Pre-migration listLibrary rows still expose `videos` instead of `macroflowVideos`. */
  type LegacyLibraryData = LibraryData & {
    videos?: RowVideo[];
  };

  let {
    data,
    onRefetch,
  }: {
    data: LegacyLibraryData;
    onRefetch: () => void | Promise<void>;
  } = $props();

  const client = useConvexClient();

  let actionError = $state("");
  let pendingId = $state<string | null>(null);
  let redeemOpen = $state(false);
  let redeemTarget = $state<RedeemTarget | null>(null);

  const library = $derived.by((): {
    vodCredits: number;
    hasActiveSubscription: boolean;
    macroflowVideos: RowVideo[];
    categoryGroups: CategoryGroup[];
  } => {
    const macroflowVideos = Array.isArray(data.macroflowVideos)
      ? data.macroflowVideos
      : Array.isArray(data.videos)
        ? data.videos.filter((video) => video.accessKind === "macroflow")
        : [];

    const categoryGroups = (Array.isArray(data.categoryGroups) ? data.categoryGroups : []).map(
      (group) => ({
        ...group,
        items: Array.isArray(group.items) ? group.items : [],
      }),
    );

    return {
      vodCredits: data.vodCredits ?? 0,
      hasActiveSubscription: data.hasActiveSubscription ?? false,
      macroflowVideos,
      categoryGroups,
    };
  });

  const ownedMacroflowCount = $derived(
    library.macroflowVideos.filter((video) => video.owned).length,
  );

  function goWatch(videoId: string) {
    void goto(`/watch?videoId=${videoId}`);
  }

  function openRedeem(video: RowVideo) {
    redeemTarget = {
      _id: video._id,
      title: video.title,
      durationSeconds: video.durationSeconds,
      thumbnailUrl: video.thumbnailUrl,
    };
    redeemOpen = true;
  }

  function handleMacroflowSelect(video: RowVideo) {
    actionError = "";
    if (video.accessible) {
      goWatch(video._id);
      return;
    }
    if (library.vodCredits < 1) {
      actionError = "אין מספיק קרדיטי Macroflow לפתיחת שיעור חדש.";
      return;
    }
    openRedeem(video);
  }

  function handleMicroflowSelect(video: RowVideo) {
    actionError = "";
    if (video.accessible) {
      goWatch(video._id);
      return;
    }
    if (library.hasActiveSubscription) {
      goWatch(video._id);
      return;
    }
    actionError = "שיעורי Microflow נפתחים עם מנוי פעיל.";
  }

  async function confirmRedeem() {
    if (redeemTarget === null) return;
    pendingId = redeemTarget._id;
    actionError = "";
    try {
      await client.mutation(api.video.entitlements.purchaseMacroflow, {
        videoId: redeemTarget._id as Id<"videos">,
      });
      redeemOpen = false;
      redeemTarget = null;
      await onRefetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לפתוח את השיעור.";
    } finally {
      pendingId = null;
    }
  }
</script>

<PageShell
  kicker="AnatoMe Video"
  title="ספריית שיעורים"
  description="גללי בין שיעורי Macroflow לרכישה קבועה, ובין Microflow לפי נושא עם מנוי פעיל."
>
  {#snippet headerExtra()}
    <MacroflowCreditsBadge balance={library.vodCredits} />
  {/snippet}

  <div class="video-library">
    <div class="video-library__top">
      <MacroflowCreditsBadge balance={library.vodCredits} />
    </div>

    {#if actionError}
      <Notice tone="danger">{actionError}</Notice>
    {/if}

    {#if !CREDITS_PURCHASE_ENABLED && library.vodCredits < 1}
      <Notice tone="neutral">
        רכישת קרדיטים אינה זמינה כרגע. קרדיטים חדשים יתווספו עם חידוש המנוי.
      </Notice>
    {/if}

    <section class="macroflow-section" aria-labelledby="macroflow-heading">
      <header class="macroflow-section__intro">
        <p class="macroflow-section__eyebrow">Macroflow</p>
        <h2 id="macroflow-heading" class="macroflow-section__title">שיעורים לשמירה</h2>
        <p class="macroflow-section__desc">
          קרדיט אחד פותח שיעור לצמיתות. כבר פתחת {ownedMacroflowCount} שיעורים.
        </p>
      </header>

      <HorizontalVideoRow
        title="כל שיעורי Macroflow"
        videos={library.macroflowVideos}
        emptyMessage="עדיין אין שיעורי Macroflow מפורסמים."
        {pendingId}
        onSelect={handleMacroflowSelect}
      />
    </section>

    <MicroflowCategorySection
      groups={library.categoryGroups}
      {pendingId}
      onSelect={handleMicroflowSelect}
    />
  </div>
</PageShell>

<RedeemVideoDialog
  bind:open={redeemOpen}
  video={redeemTarget}
  creditsBalance={library.vodCredits}
  pending={pendingId !== null}
  onConfirm={() => {
    void confirmRedeem();
  }}
/>
