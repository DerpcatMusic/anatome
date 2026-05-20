<script lang="ts">
  import { goto } from "$app/navigation";
  import { getAppContext } from "$features/app/context/appContext";

  let { children } = $props();

  const ctx = getAppContext();

  $effect(() => {
    if (!ctx.isLoading && (ctx.role === "instructor" || ctx.role === "admin")) {
      goto("/i/dashboard");
    }
  });
</script>

{#if ctx.isLoading}
  <div class="route-guard-skeleton" aria-hidden="true"></div>
{:else if ctx.role !== "instructor" && ctx.role !== "admin"}
  {@render children()}
{/if}

<style>
  .route-guard-skeleton {
    min-height: 60vh;
    animation: pulse 1.6s ease-in-out infinite;
    background: var(--line-light);
    margin: var(--space-6);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
