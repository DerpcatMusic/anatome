<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    label,
    children,
  }: {
    label: string;
    children: Snippet;
  } = $props();
</script>

<section class="lr-room-panel" aria-label={label}>
  {@render children()}
</section>
