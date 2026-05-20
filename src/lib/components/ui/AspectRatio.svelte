<script lang="ts">
  import { AspectRatio } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    ratio = 16 / 9,
    children,
    class: className = "",
  }: {
    ratio?: number;
    children: Snippet;
    class?: string;
  } = $props();
</script>

<AspectRatio.Root class={`hb-aspect-ratio ${className}`.trim()} {ratio}>
  {@render children()}
</AspectRatio.Root>
