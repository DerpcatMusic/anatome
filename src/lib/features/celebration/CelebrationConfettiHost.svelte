<script lang="ts">
  import { browser } from "$app/environment";
  import { Confetti } from "svelte-confetti";
  import { celebration } from "./celebration.svelte";
  import {
    burstProfileFromBurst,
    celebrationScenes,
    fallDistanceForMagnitude,
  } from "./confettiLayers";

  const burst = $derived(celebration.burst);
  const scenes = $derived(
    burst ? celebrationScenes(burstProfileFromBurst(burst)) : [],
  );
  const isHeavy = $derived(burst?.magnitude === "triumph");
  const fallDistance = $derived(
    burst ? fallDistanceForMagnitude(burst.magnitude) : "100vh",
  );
</script>

{#if browser && burst}
  <div
    class="celebration-confetti"
    class:celebration-confetti--heavy={isHeavy}
    class:celebration-confetti--ribbon={burst.magnitude === "ribbon"}
    aria-hidden="true"
  >
    {#key burst.key}
      {#each scenes as scene, sceneIndex (`${burst.key}-${sceneIndex}`)}
        <div class="celebration-confetti__cannon celebration-confetti__cannon--{scene.placement}">
          {#each scene.layers as layer, layerIndex (`${sceneIndex}-${layerIndex}`)}
            <Confetti
              amount={layer.amount}
              x={layer.x}
              y={layer.y}
              size={layer.size}
              cone={layer.cone}
              rounded={layer.rounded}
              noGravity={layer.noGravity}
              duration={layer.duration}
              delay={layer.delay}
              colorRange={layer.colorRange}
              colorArray={layer.colorArray}
              xSpread={layer.xSpread}
              {fallDistance}
              disableForReducedMotion
            />
          {/each}
        </div>
      {/each}
    {/key}
  </div>
{/if}

<style>
  /*
   * svelte-confetti defaults to 200px travel — useless on 4K / 150% scaling.
   * Scale reach with viewport so edge cannons cross the full screen.
   */
  .celebration-confetti {
    --confetti-reach-x: max(28rem, 62vw);
    --confetti-reach-y: max(22rem, 58vh);
    position: fixed;
    inset: 0;
    z-index: 250;
    overflow: hidden;
    pointer-events: none;
  }

  .celebration-confetti--ribbon {
    --confetti-reach-x: max(32rem, 68vw);
    --confetti-reach-y: max(24rem, 62vh);
  }

  .celebration-confetti--heavy {
    --confetti-reach-x: max(36rem, 78vw);
    --confetti-reach-y: max(28rem, 72vh);
    z-index: 300;
  }

  .celebration-confetti :global(.confetti-holder .confetti) {
    --translate-x: calc(var(--confetti-reach-x) * var(--translate-x-multiplier));
    --translate-y: calc(-1 * var(--confetti-reach-y) * var(--translate-y-multiplier));
    animation-duration: calc(var(--transition-duration) * (0.5 + var(--scale) * 1.4)) !important;
    animation-timing-function: cubic-bezier(0.1, 0.78, 0.2, 1) !important;
  }

  .celebration-confetti :global(.confetti-holder.cone .confetti) {
    --translate-x: calc(
      var(--confetti-reach-x) * var(--translate-y-multiplier) * var(--translate-x-multiplier)
    );
  }

  .celebration-confetti :global(.confetti-holder .confetti::before) {
    animation-duration: calc(var(--transition-duration) * (0.62 + var(--scale) * 1.08)) !important;
    animation-timing-function: cubic-bezier(0.28, 0.04, 0.48, 1) !important;
  }

  .celebration-confetti :global(.confetti-holder.no-gravity .confetti) {
    --translate-x: calc(var(--confetti-reach-x) * var(--translate-x-multiplier));
    --translate-y: calc(-1 * var(--confetti-reach-y) * var(--translate-y-multiplier));
    animation-timing-function: cubic-bezier(0.04, 0.88, 0.12, 1) !important;
  }

  .celebration-confetti__cannon {
    position: absolute;
    width: 0;
    height: 0;
    overflow: visible;
  }

  .celebration-confetti__cannon--edge-top-left {
    top: 0;
    left: 0;
  }

  .celebration-confetti__cannon--edge-top-right {
    top: 0;
    right: 0;
  }

  .celebration-confetti__cannon--edge-bottom-left {
    bottom: 0;
    left: 0;
  }

  .celebration-confetti__cannon--edge-bottom-right {
    bottom: 0;
    right: 0;
  }

  .celebration-confetti__cannon :global(.confetti-holder) {
    position: absolute;
    inset: 0;
    width: 0;
    height: 0;
  }
</style>
