<script lang="ts">
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import InstructorVideoManager from "$features/studio/components/InstructorVideoManager.svelte";
  import VideoLibraryShell from "./VideoLibraryShell.svelte";
  import { api } from "$convex/_generated/api";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useQuery } from "convex-svelte";
  import { resource } from "runed";
  import "./VideosShell.css";

  const auth = initAuth();
  const profileQuery = useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
  const role = $derived(profileQuery.data?.role ?? "customer");
  const isStaff = $derived(role === "instructor" || role === "admin");

  const libraryResource = resource(
    () => auth.isAuthenticated && !isStaff,
    async (shouldFetch) => {
      if (!shouldFetch) return null;
      return await authQuery(api.video.catalog.listLibrary, {});
    },
  );

  const data = $derived(libraryResource.current);

  const libraryReady = $derived(
    data !== null &&
      data !== undefined &&
      typeof data === "object" &&
      Array.isArray(data.categoryGroups) &&
      (Array.isArray(data.macroflowVideos) ||
        Array.isArray((data as { videos?: unknown }).videos)),
  );
</script>

{#if auth.isLoading}
  <div class="skeleton-shell">
    <div class="skeleton skeleton--hero"></div>
    <div class="skeleton-row">
      <div class="skeleton skeleton--card"></div>
      <div class="skeleton skeleton--card"></div>
      <div class="skeleton skeleton--card"></div>
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
    <Button.Root class="hb-button hb-button--ghost" type="button" onclick={() => { void libraryResource.refetch(); }}>
      לנסות שוב
    </Button.Root>
  </div>
{:else if libraryReady && data}
  <VideoLibraryShell
    {data}
    onRefetch={async () => {
      await libraryResource.refetch();
    }}
  />
{:else}
  <div class="skeleton-shell">
    <div class="skeleton skeleton--hero"></div>
    <div class="skeleton-row">
      <div class="skeleton skeleton--card"></div>
      <div class="skeleton skeleton--card"></div>
      <div class="skeleton skeleton--card"></div>
    </div>
  </div>
{/if}
