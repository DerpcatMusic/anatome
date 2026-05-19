<script lang="ts">
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
  const cachedRole = $derived(getCachedRole());

  const isAuthorized = $derived.by(() => {
    if (!auth.isAuthenticated) return false;
    if (!role) return true;
    const r = cachedRole;
    if (r === null) return true; // Role unknown — let the page handle server-side auth
    if (role === "admin") return r === "admin";
    if (role === "instructor") return r === "instructor" || r === "admin";
    return true;
  });
</script>

{#if auth.isLoading}
  <AppSkeleton />
{:else if !auth.isAuthenticated}
  <AppLocked
    title="צריך להתחבר"
    subtitle={auth.error || "החשבון נעול. נכנסים מחדש דרך העמוד הראשי."}
  >
    {#snippet actions()}
      <a href="/">כניסה</a>
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
