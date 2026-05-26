<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import SEO from "$components/seo/SEO.svelte";
  import { api } from "$convex/_generated/api";
  import { useConvexClient } from "convex-svelte";
  import { resource } from "runed";
  import { initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes";
  import CatalogBrowse from "./CatalogBrowse.svelte";
  import "../videos-feature.css";

  const auth = initAuth();
  const { t } = useI18n();
  const client = useConvexClient();

  const catalogResource = resource(
    () => true,
    async () => client.query(api.video.catalog.listCatalog, {}),
  );

  const data = $derived(catalogResource.current ?? null);
  const isStaff = $derived(data?.isStaff ?? false);
  const isGuest = $derived(!auth.isAuthenticated);
  const isMemberRoute = $derived(page.url.pathname === "/u/library");
  const inAppShell = $derived(isMemberRoute);

  $effect(() => {
    if (!browser || auth.isLoading) return;
    if (isGuest && isMemberRoute) {
      void goto("/library", { replaceState: true });
    }
  });

  $effect(() => {
    if (!auth.isAuthenticated || !isStaff) return;
    void goto("/i/videos", { replaceState: true });
  });
</script>

<SEO
  title={`${t.catalog.title()} · ${t.site.name()}`}
  description={t.catalog.leadGuest()}
/>

{#if auth.isLoading || catalogResource.loading}
  <div class="videos-skeleton-shell">
    <div class="skeleton skeleton--hero"></div>
    <div class="videos-skeleton-row">
      <div class="skeleton videos-skeleton--card"></div>
      <div class="skeleton videos-skeleton--card"></div>
      <div class="skeleton videos-skeleton--card"></div>
    </div>
  </div>
{:else if catalogResource.error}
  <div class="catalog-state">
    <Notice tone="danger">{catalogResource.error.message ?? t.catalog.error()}</Notice>
    <Button.Root
      class="hb-button hb-button--ghost"
      type="button"
      onclick={() => {
        void catalogResource.refetch();
      }}
    >
      {t.catalog.retry()}
    </Button.Root>
  </div>
{:else if data}
  <CatalogBrowse
    {data}
    guest={isGuest}
    {inAppShell}
    onRefetch={async () => {
      await catalogResource.refetch();
    }}
  />
{:else}
  <div class="catalog-state">
    <Notice tone="neutral">{t.catalog.macroEmpty()}</Notice>
  </div>
{/if}
