<script lang="ts">
  import { equipmentIconPath } from "./equipment-icon-paths";

  let { name, size = 48 }: { name: string; size?: number } = $props();

  const svgContent = $derived(equipmentIconPath(name));
  let gEl: SVGGElement | null = null;
  $effect(() => {
    if (gEl) gEl.innerHTML = svgContent;
  });
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <g bind:this={gEl}></g>
</svg>
