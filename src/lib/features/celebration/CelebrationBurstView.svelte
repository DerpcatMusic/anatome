<script lang="ts">
  import { Confetti } from "svelte-confetti";
  import type { CelebrationBurst } from "./celebration.svelte";
  import { creditPoolPrestige } from "$lib/features/credits/creditPoolTheme";
  import {
    burstProfileFromBurst,
    celebrationScenes,
    fallDistanceForMagnitude,
  } from "./confettiLayers";
  import "./celebration-physics.css";

  let { burst }: { burst: CelebrationBurst } = $props();

  const profile = $derived(burstProfileFromBurst(burst));
  const scenes = $derived(celebrationScenes(profile));
  const fallDistance = $derived(fallDistanceForMagnitude(burst.magnitude, profile));
  const creditPrestige = $derived(
    burst.kind === "credit" && burst.pool ? creditPoolPrestige(burst.pool) : null,
  );
</script>

<div
  class="celebration-burst"
  class:celebration-burst--heavy={burst.magnitude === "triumph"}
  class:celebration-burst--ribbon={burst.magnitude === "ribbon"}
  class:celebration-burst--credit={burst.kind === "credit"}
  class:celebration-burst--credit-vod={creditPrestige === 0}
  class:celebration-burst--credit-live={creditPrestige === 1}
  class:celebration-burst--credit-premium={creditPrestige === 2}
>
  {#each scenes as scene, sceneIndex (`${burst.key}-${sceneIndex}`)}
    <div class="celebration-burst__cannon celebration-burst__cannon--{scene.placement}">
      {#each scene.layers as layer, layerIndex (`${burst.key}-${sceneIndex}-${layerIndex}`)}
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
</div>

<style>
  .celebration-burst {
    --confetti-reach-x: max(22rem, 50vw);
    --confetti-reach-y: max(18rem, 44vh);
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .celebration-burst--ribbon {
    --confetti-reach-x: max(26rem, 56vw);
    --confetti-reach-y: max(20rem, 48vh);
  }

  .celebration-burst--heavy {
    --confetti-reach-x: max(30rem, 64vw);
    --confetti-reach-y: max(22rem, 52vh);
  }

  .celebration-burst--credit-vod {
    --confetti-reach-x: max(9rem, 22vw);
    --confetti-reach-y: max(7rem, 18vh);
  }

  .celebration-burst--credit-live {
    --confetti-reach-x: max(17rem, 40vw);
    --confetti-reach-y: max(14rem, 34vh);
  }

  .celebration-burst--credit-premium {
    --confetti-reach-x: max(28rem, 62vw);
    --confetti-reach-y: max(22rem, 50vh);
  }

  .celebration-burst--credit-premium.celebration-burst--heavy {
    --confetti-reach-x: max(34rem, 72vw);
    --confetti-reach-y: max(26rem, 58vh);
  }

  .celebration-burst :global(.confetti-holder .confetti) {
    --translate-x: calc(var(--confetti-reach-x) * var(--translate-x-multiplier));
    --translate-y: calc(-1 * var(--confetti-reach-y) * var(--translate-y-multiplier));
  }

  .celebration-burst :global(.confetti-holder.cone .confetti) {
    --translate-x: calc(
      var(--confetti-reach-x) * var(--translate-y-multiplier) * var(--translate-x-multiplier)
    );
  }

  .celebration-burst :global(.confetti-holder.no-gravity .confetti.confetti) {
    --translate-x: calc(var(--confetti-reach-x) * var(--translate-x-multiplier));
    --translate-y: calc(-1 * var(--confetti-reach-y) * var(--translate-y-multiplier));
    animation-timing-function: ease-out;
  }

  .celebration-burst__cannon {
    position: absolute;
    width: 0;
    height: 0;
    overflow: visible;
  }

  .celebration-burst__cannon--edge-top-left {
    top: 0;
    left: 0;
  }

  .celebration-burst__cannon--edge-top-right {
    top: 0;
    right: 0;
  }

  .celebration-burst__cannon--edge-bottom-left {
    bottom: 0;
    left: 0;
  }

  .celebration-burst__cannon--edge-bottom-right {
    bottom: 0;
    right: 0;
  }

  .celebration-burst__cannon :global(.confetti-holder) {
    position: absolute;
    inset: 0;
    width: 0;
    height: 0;
  }
</style>
