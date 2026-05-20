<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { initAuth, getCachedRole } from "$lib/auth/session.svelte";
  import AppSkeleton from "./AppSkeleton.svelte";
  import AppLocked from "./AppLocked.svelte";

  let {
    role,
    children,
  }: {
    role?: "customer" | "instructor" | "admin";
    children: import("svelte").Snippet;
  } = $props();

  const auth = initAuth();

  // Fetch the real profile from the backend instead of trusting localStorage
  const profileQuery = useQuery(api.profiles.viewer.get, () =>
    auth.isAuthenticated ? {} : "skip"
  );

  const realRole = $derived(profileQuery.data?.role ?? getCachedRole());

  const isAuthorized = $derived.by(() => {
    if (!auth.isAuthenticated) return false;
    if (!role) return true;
    const r = realRole;
    if (r === null) return true; // Role unknown — let the page handle server-side auth
    if (role === "admin") return r === "admin";
    if (role === "instructor") return r === "instructor" || r === "admin";
    if (role === "customer") return r === "customer";
    return true;
  });

  const isLoading = $derived(auth.isLoading || profileQuery.isLoading);
</script>

{#if isLoading}
  <AppSkeleton />
{:else if !auth.isAuthenticated}
  <AppLocked
    title="צריך להתחבר"
    subtitle={auth.error || "החשבון נעול. נכנסים מחדש דרך העמוד הראשי."}
  >
    {#snippet actions()}
      <a href="/" class="locked__action">כניסה</a>
    {/snippet}
  </AppLocked>
{:else if !isAuthorized}
  <AppLocked
    title="אין הרשאה"
    subtitle="אין לך גישה לעמוד הזה."
  />
{:else}
  {@render children()}
{/if}
