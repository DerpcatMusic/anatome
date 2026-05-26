<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { getAppContext } from "$features/app/context/appContext";

  let { children } = $props();

  const ctx = getAppContext();

  $effect(() => {
    if (ctx.isLoading) return;
    if (ctx.role !== "customer" || !page.url.pathname.startsWith("/i")) return;
    void goto("/u/dashboard", { replaceState: true });
  });
</script>

{#if ctx.isLoading}
  <div class="route-guard-skeleton" aria-hidden="true"></div>
{:else if ctx.role !== "customer"}
  {@render children()}
{/if}
