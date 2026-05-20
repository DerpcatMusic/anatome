<script lang="ts">
  import { ScrollArea } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    children,
    orientation = "vertical",
    class: className = "",
  }: {
    children: Snippet;
    orientation?: "vertical" | "horizontal";
    class?: string;
  } = $props();
</script>

<ScrollArea.Root class={`hb-scroll-area ${className}`.trim()}>
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
    {@render children()}
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar class="hb-scroll-area__bar" {orientation}>
    <ScrollArea.Thumb class="hb-scroll-area__thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
