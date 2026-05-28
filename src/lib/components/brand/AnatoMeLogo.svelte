<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  /** Brand mark — fill follows `--foreground` (dark in light theme, light in dark). */
  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** Logo height (width follows mark aspect ratio). */
    size?: number | string;
    src?: string;
  };

  const MARK_ASPECT = 221 / 174;

  let {
    size = 40,
    class: className = "",
    src = "/brand/anatome-mark.png",
    ...rest
  }: Props = $props();

  const height = $derived(typeof size === "number" ? `${size}px` : size);
  const width = $derived(
    typeof size === "number" ? `${Math.round(size * MARK_ASPECT)}px` : `calc(${size} * ${MARK_ASPECT})`,
  );
</script>

<span
  class="anatome-logo {className}"
  style:--anatome-logo-h={height}
  style:--anatome-logo-w={width}
  style:--anatome-logo-src={`url("${src}")`}
  {...rest}
></span>

<style>
  .anatome-logo {
    display: inline-block;
    flex-shrink: 0;
    width: var(--anatome-logo-w, 3.1rem);
    height: var(--anatome-logo-h, 2.5rem);
    color: var(--foreground);
    background-color: currentColor;
    -webkit-mask-image: var(--anatome-logo-src);
    mask-image: var(--anatome-logo-src);
    -webkit-mask-mode: alpha;
    mask-mode: alpha;
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
  }
</style>
