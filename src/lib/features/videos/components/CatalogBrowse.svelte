<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import { useConvexClient } from "convex-svelte";
  import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import { setReturnTo } from "$lib/auth/session.svelte";
  import { watchHref } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes";
import { useIntersectionObserver } from "runed";
  import { chunkMacroflowRows } from "$features/videos/lib/catalog-chunks";
  import CatalogCategoryRail from "./CatalogCategoryRail.svelte";
  import HorizontalVideoRow, { type RowVideo } from "./HorizontalVideoRow.svelte";
  import RedeemVideoDialog, { type RedeemTarget } from "./RedeemVideoDialog.svelte";
  import type { CategoryGroup } from "./MicroflowCategorySection.svelte";
  import "../videos-feature.css";

  type CatalogData = FunctionReturnType<typeof api.video.catalog.listCatalog>;

  let {
    data,
    guest = false,
    inAppShell = false,
    onRefetch,
  }: {
    data: CatalogData;
    guest?: boolean;
    inAppShell?: boolean;
    onRefetch?: () => void | Promise<void>;
  } = $props();

  const { t } = useI18n();
  const client = useConvexClient();

  let activeRailId = $state("macroflow");
  let actionError = $state("");
  let pendingId = $state<string | null>(null);
  let redeemOpen = $state(false);
  let redeemTarget = $state<RedeemTarget | null>(null);

  function mapMacroflowVideos(videos: typeof data.macroflowVideos, isGuest: boolean): RowVideo[] {
    return (videos ?? []).map((video) =>
      isGuest
        ? { ...video, locked: true, owned: false, accessible: false }
        : video,
    ) as RowVideo[];
  }

  function mapCategoryGroups(groups: typeof data.categoryGroups, isGuest: boolean): CategoryGroup[] {
    return (groups ?? []).map((group) => ({
      ...group,
      items: (group.items ?? []).map((video) =>
        isGuest
          ? { ...video, locked: true, owned: false, accessible: false }
          : video,
      ) as RowVideo[],
    })) as CategoryGroup[];
  }

  function buildRailCategories(groups: CategoryGroup[]) {
    return groups
      .filter((g) => g.items.length > 0)
      .map((g) => ({
        id: g.category._id,
        name: g.category.name,
      }));
  }

  function countOwnedVideos(videos: RowVideo[]): number {
    return videos.reduce((count, video) => count + (video.owned ? 1 : 0), 0);
  }

  const macroflowVideos = $derived(mapMacroflowVideos(data.macroflowVideos, guest));

  const categoryGroups = $derived(mapCategoryGroups(data.categoryGroups, guest));

  const macroRows = $derived(chunkMacroflowRows(macroflowVideos));

  const railCategories = $derived(buildRailCategories(categoryGroups));

  const ownedMacroflowCount = $derived(countOwnedVideos(macroflowVideos));

  const ownedHint = $derived(
    !guest && ownedMacroflowCount > 0
      ? t.catalog.macroDescSignedIn(ownedMacroflowCount)
      : "",
  );

  const unlockHint = $derived(
    guest ? t.catalog.unlockHint() : t.catalog.unlockHintMember(),
  );

  function sectionDomId(railId: string) {
    if (railId === "macroflow") return "catalog-section-macroflow";
    if (railId === "microflow") return "catalog-section-microflow";
    return `catalog-section-${railId}`;
  }

  function jumpToSection(railId: string) {
    activeRailId = railId;
    const el = document.getElementById(sectionDomId(railId));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function guestStatusLabel(video: RowVideo) {
    if (video.accessKind === "microflow") return t.catalog.statusGuestMicro();
    return t.catalog.statusGuestMacro();
  }

  function memberStatusLabel(video: RowVideo) {
    if (video.owned) return t.catalog.statusOwned();
    if (!video.locked) return t.catalog.statusOpen();
    return video.accessKind === "microflow"
      ? t.catalog.statusLockedMicro()
      : t.catalog.statusLockedMacro();
  }

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

  function openAuthForVideo(videoId: string) {
    setReturnTo(watchHref(videoId));
    window.dispatchEvent(new CustomEvent("anatome:auth-open"));
  }

  function openAuthBrowse() {
    setReturnTo("/u/library");
    window.dispatchEvent(new CustomEvent("anatome:auth-open"));
  }

  function handleSelect(video: RowVideo) {
    if (guest) return;
    actionError = "";
    if (video.accessible) {
      goWatch(video._id);
      return;
    }
    if (video.accessKind === "macroflow") {
      if ((data.vodCredits ?? 0) < 1) {
        actionError = "אין מספיק קרדיטים.";
        return;
      }
      openRedeem(video);
      return;
    }
    actionError = "נדרש מנוי פעיל.";
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
      await onRefetch?.();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לפתוח את השיעור.";
    } finally {
      pendingId = null;
    }
  }

  function handleVideoSelect(video: RowVideo) {
    if (guest) {
      openAuthForVideo(video._id);
    } else {
      handleSelect(video);
    }
  }

  function handleConfirmRedeem() {
    void confirmRedeem();
  }

  $effect(() => {
    if (!browser) return;

    const ids = [
      "macroflow",
      "microflow",
      ...railCategories.map((c) => c.id),
    ];
    const elements = ids
      .map((id) => document.getElementById(sectionDomId(id)))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    useIntersectionObserver(
      () => elements,
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible[0]?.target.id) return;
        const raw = visible[0].target.id.replace("catalog-section-", "");
        activeRailId = raw;
      },
      { rootMargin: "-12% 0px -60% 0px", threshold: [0, 0.12, 0.35] },
    );
  });
</script>

<div class="catalog-page" class:catalog-page--app={inAppShell}>
  <CatalogCategoryRail
    bind:activeId={activeRailId}
    macroLabel={t.catalog.macroTitle()}
    microLabel={t.catalog.microTitle()}
    categories={railCategories}
    onJump={jumpToSection}
  />

  <div class="catalog-page__main">
    <div class="catalog-page__toolbar">
      {#if guest}
        <p class="catalog-page__toolbar-guest">{t.catalog.title()}</p>
        <Button.Root
          class="hb-button hb-button--brand hb-button--sm"
          type="button"
          onclick={openAuthBrowse}
        >
          {t.catalog.authCta()}
        </Button.Root>
      {:else}
        <div class="catalog-page__toolbar-actions">
          {#if !inAppShell}
            <a class="catalog-page__dashboard" href="/u/dashboard">
              {t.catalog.dashboardLink()}
            </a>
          {/if}
        </div>
        {#if ownedHint}
          <span class="catalog-page__owned-hint">{ownedHint}</span>
        {/if}
      {/if}
    </div>

    {#if actionError || (!guest && !CREDITS_PURCHASE_ENABLED && (data.vodCredits ?? 0) < 1)}
      <div class="catalog-page__notices">
        {#if actionError}
          <Notice tone="danger">{actionError}</Notice>
        {/if}
        {#if !guest && !CREDITS_PURCHASE_ENABLED && (data.vodCredits ?? 0) < 1}
          <Notice tone="neutral">{t.catalog.creditsNotice()}</Notice>
        {/if}
      </div>
    {/if}

    <section id="catalog-section-macroflow" class="catalog-page__zone" aria-labelledby="catalog-macro-title">
      <h2 id="catalog-macro-title" class="catalog-page__zone-title">
        {t.catalog.macroTitle()}
      </h2>

      {#if macroflowVideos.length === 0}
        <p class="catalog-page__empty">{t.catalog.macroEmpty()}</p>
      {:else}
        {#each macroRows as rowVideos, rowIndex (rowIndex)}
          <HorizontalVideoRow
            title=""
            videos={rowVideos}
            emptyMessage=""
            hideHeader
            vodCreditBalance={guest ? null : (data.vodCredits ?? 0)}
            {pendingId}
            carousel
            teaserLocked={guest}
            {unlockHint}
            hideStatus
            statusLabelFor={guest ? guestStatusLabel : memberStatusLabel}
            useLockGlyph={guest}
            onSelect={handleVideoSelect}
          />
        {/each}
      {/if}
    </section>

    <hr class="catalog-page__zone-rule" />

    <section id="catalog-section-microflow" class="catalog-page__zone" aria-labelledby="catalog-micro-title">
      <h2 id="catalog-micro-title" class="catalog-page__zone-title">
        {t.catalog.microTitle()}
      </h2>

      {#each categoryGroups as group (group.category._id)}
        {#if group.items.length > 0}
          <div id={sectionDomId(group.category._id)} class="catalog-page__category">
            <h3 class="catalog-page__category-title">{group.category.name}</h3>
            <HorizontalVideoRow
              title=""
              videos={group.items}
              emptyMessage={t.catalog.microCategoryEmpty()}
              hideHeader
              {pendingId}
              carousel
              teaserLocked={guest}
              {unlockHint}
              hideStatus
              statusLabelFor={guest ? guestStatusLabel : memberStatusLabel}
              useLockGlyph={guest}
              onSelect={handleVideoSelect}
            />
          </div>
        {/if}
      {:else}
        <p class="catalog-page__empty">{t.catalog.microSectionsEmpty()}</p>
      {/each}
    </section>
  </div>
</div>

{#if !guest}
  <RedeemVideoDialog
    bind:open={redeemOpen}
    video={redeemTarget}
    creditsBalance={data.vodCredits ?? 0}
    pending={pendingId !== null}
    onConfirm={handleConfirmRedeem}
  />
{/if}
