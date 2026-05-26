<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { PUBLIC_CONVEX_CLIENT_URL } from "$env/static/public";
  import { api } from "$convex/_generated/api";
  import { useQuery, useConvexClient } from "convex-svelte";
  import MarketingNavbar from "$components/layout/MarketingNavbar.svelte";
  import LandingAuthHost from "$lib/features/marketing/LandingAuthHost.svelte";
  import { initConvex } from "$lib/convex/setup";
  import { initAuth, wireConvexAuth } from "$lib/auth/session.svelte";
  import { useThemeMedia } from "$features/app/themeMedia.svelte";

  let { children } = $props();

  initConvex(PUBLIC_CONVEX_CLIENT_URL);

  const client = useConvexClient();
  if (browser) {
    wireConvexAuth(client);
    useThemeMedia();
  }

  const auth = initAuth();
  const profileQuery = useQuery(api.profiles.viewer.get, () =>
    auth.isAuthenticated ? {} : "skip",
  );

  const role = $derived(profileQuery.data?.role ?? null);
  const isStaff = $derived(role === "instructor" || role === "admin");

  /** Public catalog only — signed-in members use /u/library (app shell). */
  $effect(() => {
    if (!browser || auth.isLoading) return;
    if (!auth.isAuthenticated) return;
    if (profileQuery.isLoading) return;
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
