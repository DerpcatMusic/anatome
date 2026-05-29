<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  /**
   * Brand logomark — line art (stroke only, no fill).
   * Alpha mask from the vector stroke asset; color = `--foreground`.
   */
  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** Logo height (width follows mark aspect ratio). */
    size?: number | string;
  };

  /** `static/brand/anatome-mark-trim.png` viewBox (221×174). */
  const MARK_ASPECT = 221 / 174;

  let { size = 48, class: className = "", ...rest }: Props = $props();

  const height = $derived(typeof size === "number" ? `${size}px` : size);
  const width = $derived(
    typeof size === "number"
      ? `${size * MARK_ASPECT}px`
      : `calc(${size} * ${MARK_ASPECT})`,
  );
</script>

<span
  class="anatome-logo {className}"
  style:width={width}
  style:height={height}
  {...rest}
></span>

<style>
  .anatome-logo {
    display: block;
    flex-shrink: 0;
    overflow: visible;
    color: var(--foreground);
    background-color: currentColor;
    -webkit-mask-image: url("/brand/anatome-mark-trim.png");
    mask-image: url("/brand/anatome-mark-trim.png");
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
