<script lang="ts">
  import AppSidebar from "./AppSidebar.svelte";

  let {
    children,
    role,
  }: {
    children: import("svelte").Snippet;
    role?: "customer" | "instructor" | "admin" | null;
  } = $props();
</script>

<div class="app-layout">
  <AppSidebar {role} />
  <main class="app-main">
    {@render children()}
  </main>
</div>

<style>
  .app-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    align-items: stretch;
    min-height: calc(100vh - 56px);

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
    padding: var(--space-7) clamp(16px, 4vw, 56px);
    min-width: 0;
  }

  @media (max-width: 860px) {
    .app-layout {
      grid-template-columns: 1fr;
    }

    .app-main {
      padding: var(--space-5) clamp(16px, 4vw, 32px);
    }
  }
</style>
