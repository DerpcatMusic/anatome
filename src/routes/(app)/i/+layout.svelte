<script lang="ts">
  import { goto } from "$app/navigation";
  import { getAppContext } from "$features/app/context/appContext";

  let { children } = $props();

  const ctx = getAppContext();

  $effect(() => {
    if (!ctx.isLoading && ctx.role === "customer") {
      void goto("/u/dashboard", { replaceState: true });
    }
  });
</script>

{#if ctx.isLoading}
  <div class="route-guard-skeleton" aria-hidden="true"></div>
{:else if ctx.role !== "customer"}
  {@render children()}
{/if}
