<script lang="ts">
  import { page } from "$app/state";
  import AppSidebar from "./AppSidebar.svelte";

  let {
    children,
  }: {
    children: import("svelte").Snippet;
  } = $props();

  const isFullbleed = $derived(page.url.pathname === "/i/live");
</script>

<div class="app-layout">
  <AppSidebar />
  <main class="app-main" data-fullbleed={isFullbleed ? "" : undefined}>
    {@render children()}
  </main>
</div>

<style>
  .app-layout {
    --app-sidebar-size: clamp(220px, 16vw, 260px);
    display: grid;
    grid-template-columns: var(--app-sidebar-size) minmax(0, 1fr);
    align-items: stretch;
    height: calc(100dvh - 56px);
    min-height: 0;
    overflow: hidden;

    background-color: var(--paper);
  }

  .app-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: clamp(20px, 3vw, 40px);
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .app-main[data-fullbleed] {
    padding: 0;
    gap: 0;
    overflow: hidden;
  }

  @media (max-width: 860px) {
    .app-layout {
      grid-template-columns: 1fr;
      height: auto;
      min-height: calc(100dvh - 56px);
      overflow: visible;
    }

    .app-main {
      padding: var(--space-5) clamp(16px, 4vw, 32px);
    }

    .app-main[data-fullbleed] {
      padding: 0;
    }
  }
</style>
