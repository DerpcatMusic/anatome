<script lang="ts">
  let {
    tone = "neutral",
    children,
  }: {
    tone?: "neutral" | "danger" | "success" | "caution";
    children?: import("svelte").Snippet;
  } = $props();
</script>

<p class={`notice notice--${tone}`}>
  {@render children?.()}
</p>

<style>
  .notice {
    border: var(--border);
    margin: 0;
    padding: var(--space-3);
    background: var(--surface);
    font-size: var(--step--1);
    color: var(--ink);
    line-height: 1.5;
  }

  .notice--danger {
    border-color: var(--danger);
    background: var(--danger-soft);
    color: var(--ink);
  }

  .notice--success {
    border-color: var(--success);
    background: var(--success-soft);
    color: var(--ink);
  }

  .notice--caution {
    border-color: var(--caution);
    background: var(--caution-soft);
    color: var(--ink);
  }
</style>
