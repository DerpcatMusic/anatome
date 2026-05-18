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
    padding: var(--space-5) clamp(var(--space-5), 4vw, var(--space-6));
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  h3 {
    font-size: var(--step-1);
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
  }

  .form-section__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
</style>
