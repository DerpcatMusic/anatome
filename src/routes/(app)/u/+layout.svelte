<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { getAppContext } from "$features/app/context/appContext";

  let { children } = $props();

  const ctx = getAppContext();

  $effect(() => {
    if (ctx.isLoading) return;
    const isStaff = ctx.role === "instructor" || ctx.role === "admin";
    if (!isStaff || !page.url.pathname.startsWith("/u")) return;
    void goto("/i/dashboard", { replaceState: true });
  });
</script>

{#if ctx.isLoading}
  <div class="route-guard-skeleton" aria-hidden="true"></div>
{:else if ctx.role !== "instructor" && ctx.role !== "admin"}
  {@render children()}
{/if}
