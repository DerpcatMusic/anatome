<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import AppSidebar from "./AppSidebar.svelte";
  import { sidebar } from "$features/app/sidebar.svelte";
  import { clearStuckPageSurfaceStyles } from "$lib/navigation/app-shell-transition";
  import { isLiveRoomPath } from "$lib/features/live/dock/live-dock-paths";

  let {
    children,
  }: {
    children: import("svelte").Snippet;
  } = $props();

  const pathname = $derived(page.url.pathname);

  const isFullbleed = $derived(
    pathname === "/i/calendar" ||
      pathname === "/u/library" ||
      isLiveRoomPath(pathname),
  );

  onMount(() => {
    clearStuckPageSurfaceStyles();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "b" && event.key !== "B") return;
      if (!event.metaKey && !event.ctrlKey) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      event.preventDefault();
      sidebar.toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
</script>

<div
  class="app-layout"
  class:app-layout--sidebar-collapsed={sidebar.isCollapsed}
  data-sidebar-collapsed={sidebar.isCollapsed ? "" : undefined}
>
  <AppSidebar />
  <main class="app-main" data-fullbleed={isFullbleed ? "" : undefined}>
    {#key pathname}
      <div class="app-main__page">
        {@render children()}
      </div>
    {/key}
  </main>
</div>

<style>
  .app-layout {
    --app-sidebar-size-expanded: clamp(220px, 16vw, 260px);
    --app-sidebar-size-collapsed: 5rem;
    --app-sidebar-size: var(--app-sidebar-size-expanded);
    display: grid;
    grid-template-columns: var(--app-sidebar-size) minmax(0, 1fr);
    align-items: stretch;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
    transition: grid-template-columns 0.2s var(--ease-out, ease);
    background-color: var(--paper);
  }

  .app-layout--sidebar-collapsed {
    --app-sidebar-size: var(--app-sidebar-size-collapsed);
  }

  @media (prefers-reduced-motion: reduce) {
    .app-layout {
      transition: none;
    }
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

  .app-main[data-fullbleed] .app-main__page {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 860px) {
    .app-layout {
      grid-template-columns: 1fr;
      height: auto;
      min-height: 100dvh;
      overflow: visible;
      transition: none;
    }

    .app-main {
      padding: var(--space-5) clamp(16px, 4vw, 32px);
    }

    .app-main[data-fullbleed] {
      padding: 0;
    }
  }
</style>
