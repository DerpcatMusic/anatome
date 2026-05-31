<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  /**
   * Brand logomark — inline vector. No raster image, no external SVG mutation.
   * Light theme = black, dark theme = white.
   */
  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** Logo height (width follows padded vector viewBox aspect ratio). */
    size?: number | string;
  };

  const MARK_ASPECT = 3593 / 2892;

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
>
  <svg
    class="anatome-logo__svg"
    viewBox="-160 -160 3593 2892"
    fill="currentColor"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="matrix(1,0,0,1,-165.563199,-1102.0921)">
      <path d="M2035.238,2556.791C1923.824,2098.138 1776.333,1764.296 1574.844,1555.416C1401.293,1375.498 1141.337,1420.052 1003.558,1620.763C838.819,1860.747 709.811,2152.399 641.844,2413.126C587.333,2670.695 492.027,2940.164 650.776,3135.532C938.529,3489.664 1730.144,3196.737 2123.97,2803.033C2280.755,2646.296 2436.462,2239.994 2874.888,2275.64C3342.665,2313.671 3465.079,2826.123 3432.755,3143.939C3403.823,3428.41 3368.316,3524.049 3249.297,3517.577C3164.207,3512.95 3120.53,3434.595 3134.71,3331.376C3178.888,3049.991 3226.76,2716.27 2923.759,2573.272C2796.797,2513.353 2625.159,2573.483 2443.508,2802.356C2225.863,3076.581 1611.76,3739.308 774.123,3668.697C357.88,3633.608 154.315,3337.816 166.042,2942.933C166.042,2499.463 660.728,1178.074 1230.221,1106.075C1738.089,1041.868 2044.782,1763.904 2188.891,2549.039C2205.732,2640.789 2061.201,2663.675 2035.238,2556.791Z" />
      <path d="M2020.682,2696.845C2031.94,2709.487 2037.436,2726.24 2035.851,2743.094C2034.267,2759.948 2025.746,2775.384 2012.329,2785.706C1998.377,2796.467 1983.643,2807.802 1971.191,2817.382C1953.919,2830.669 1929.451,2828.989 1914.158,2813.466C1329.823,2222.559 793.438,2599.968 745.879,3071.215C745.319,3077.096 741.122,3081.99 735.394,3083.439C729.667,3084.888 723.647,3082.578 720.359,3077.67C541.504,2807.371 813.689,2324.69 1356.001,2361.201C1599.551,2377.598 1833.025,2485.389 2020.682,2696.845Z" />
      <g transform="matrix(1,0,0,1,56.552455,56.552455)">
        <path d="M2164.366,3134.178C2159.516,3124.562 2161.456,3112.911 2169.16,3105.385C2191.868,3083.19 2239.854,3036.32 2273.276,3003.675C2281.436,2995.705 2292.864,2992.031 2304.139,2993.751C2315.414,2995.471 2325.226,3002.387 2330.638,3012.427C2391.45,3125.275 2481.846,3201.347 2682.638,3216.516C2886.123,3231.888 2825.978,3515.245 2573.063,3458.814C2348.031,3408.605 2239.818,3282.903 2164.366,3134.178Z" />
      </g>
    </g>
  </svg>
</span>

<style>
  .anatome-logo {
    display: block;
    flex-shrink: 0;
    overflow: visible;
    color: oklch(0% 0 0);
  }

  .anatome-logo__svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    fill-rule: evenodd;
    clip-rule: evenodd;
    stroke-linejoin: round;
    stroke-miterlimit: 2;
  }

  :global(html[data-theme="dark"]) .anatome-logo {
    color: oklch(100% 0 0);
  }
</style>
