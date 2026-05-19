<script lang="ts">
  let {
    title,
    children,
  }: {
    title: string;
    children: import("svelte").Snippet;
  } = $props();
</script>

<section class="form-section">
  <h3>{title}</h3>
  <div class="form-section__body">
    {@render children()}
  </div>
</section>

<style>
  .form-section {
    border: var(--border);
    background: var(--white);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  h3 {
    font-size: var(--step-0);
    font-weight: 900;
    line-height: 1.2;
    margin: 0;
  }

  .form-section__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
