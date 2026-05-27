<script lang="ts">
  import { equipmentIconPath } from "./equipment-icon-paths";

  let { name, size = 48 }: { name: string; size?: number } = $props();

  const svgContent = $derived(equipmentIconPath(name));
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  {@html svgContent}
</svg>
