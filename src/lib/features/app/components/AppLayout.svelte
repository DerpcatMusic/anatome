<script lang="ts">
  import AppSidebar from "./AppSidebar.svelte";

  let {
    children,
  }: {
    children: import("svelte").Snippet;
  } = $props();
</script>

<div class="app-layout">
  <AppSidebar />
  <main class="app-main">
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
    background-image:
      radial-gradient(ellipse 70% 50% at 20% 30%, color-mix(in srgb, var(--sky) 28%, transparent), transparent 55%),
      radial-gradient(ellipse 50% 70% at 80% 20%, color-mix(in srgb, var(--beige) 32%, transparent), transparent 50%),
      radial-gradient(ellipse 60% 40% at 50% 80%, color-mix(in srgb, var(--sky-soft) 22%, transparent), transparent 50%);
    background-size: 180% 180%;
    animation: mesh-drift 24s ease-in-out infinite alternate;
  }

  @keyframes mesh-drift {
    0% { background-position: 0% 0%, 100% 0%, 50% 100%; }
    50% { background-position: 8% 12%, 92% 8%, 48% 92%; }
    100% { background-position: 15% 5%, 85% 15%, 45% 85%; }
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
  }
</style>
