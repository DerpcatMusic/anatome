<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { PUBLIC_CONVEX_CLIENT_URL } from "$env/static/public";
  import { api } from "$convex/_generated/api";
  import { useQuery, useConvexClient } from "convex-svelte";
  import MarketingNavbar from "$components/layout/MarketingNavbar.svelte";
  import LandingAuthHost from "$lib/features/marketing/LandingAuthHost.svelte";
  import { initConvex } from "$lib/convex/setup";
  import {
    initAuth,
    wireConvexAuth,
    canRunAuthenticatedQuery,
    getCachedRole,
    setCachedRole,
  } from "$lib/auth/session.svelte";
  import { untrack } from "svelte";
  import { useThemeMedia } from "$features/app/themeMedia.svelte";
  import "@fontsource/secular-one/hebrew-400.css";

  let { children } = $props();

  initConvex(PUBLIC_CONVEX_CLIENT_URL);

  const client = useConvexClient();
  if (browser) {
    wireConvexAuth(client);
    useThemeMedia();
  }

  const auth = initAuth();
  const profileQuery = useQuery(api.profiles.viewer.get, () =>
    canRunAuthenticatedQuery() ? {} : "skip",
  );

  const role = $derived(profileQuery.data?.role ?? getCachedRole());
  const isStaff = $derived(role === "instructor" || role === "admin");

  /** Public catalog only — signed-in members use /u/library (app shell). */
  $effect(() => {
    if (!browser || auth.isLoading) return;
    if (!auth.isAuthenticated) return;
    if (!canRunAuthenticatedQuery()) return;
    if (profileQuery.isLoading && role === null) return;
    if (!page.url.pathname.startsWith("/library")) return;

    untrack(() => {
      const profileRole = profileQuery.data?.role;
      if (profileRole) setCachedRole(profileRole);
    });

    if (isStaff) {
      void goto("/i/videos", { replaceState: true });
      return;
    }
    void goto("/u/library", { replaceState: true });
  });
</script>

<MarketingNavbar />
<main class="catalog-layout-main">
  {@render children()}
</main>
<LandingAuthHost />

<style>
  .catalog-layout-main {
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: none;
    min-width: 0;
    box-sizing: border-box;
    background: var(--paper);
    color: var(--ink);
  }
</style>
