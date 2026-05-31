<script lang="ts">
  import { browser } from "$app/environment";

  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import { useSpineLanding } from "../spine-context.svelte";
  import SpineHotspot from "./SpineHotspot.svelte";
  import SpineRail from "./SpineRail.svelte";

  interface Props {
    hydrate3d?: boolean;
  }

  let { hydrate3d = false }: Props = $props();

  const spine = useSpineLanding();

  let CanvasComponent = $state<typeof import("@threlte/core").Canvas | null>(null);
  let SceneComponent = $state<typeof import("./SpineScene.svelte").default | null>(null);
  let dpr = $state(1);

  const showCanvas = $derived(
    browser && hydrate3d && spine.webglEnabled && !spine.reducedMotion && CanvasComponent && SceneComponent,
  );

  $effect(() => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    if (spine.reducedMotion) return;

    const startLoad = () => {
      void Promise.all([
        import("@threlte/core"),
        import("./SpineScene.svelte"),
      ]).then(([threlte, scene]) => {
        CanvasComponent = threlte.Canvas;
        SceneComponent = scene.default;
      });
    };

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(startLoad, { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(startLoad, 400);
    return () => clearTimeout(t);
  });

</script>

<div class="concept-spine-stage" aria-hidden="true">
  <img
    class="concept-spine-stage__poster"
    class:concept-spine-stage__poster--hidden={showCanvas && spine.sceneReady}
    src={LANDING_IMAGES.sessions.anatomy.src}
    alt=""
    width={LANDING_IMAGES.sessions.anatomy.width}
    height={LANDING_IMAGES.sessions.anatomy.height}
    fetchpriority="high"
    decoding="async"
  />
  <div class="concept-spine-stage__grain" aria-hidden="true"></div>

  {#if showCanvas && CanvasComponent && SceneComponent}
    <div class="concept-spine-stage__canvas-wrap">
      <CanvasComponent {dpr} renderMode="always">
        <SceneComponent />
      </CanvasComponent>
    </div>
  {/if}

  <div
    class="concept-spine-stage__glow"
    data-region={spine.activeRegion}
    style:--concept-anchor-y={spine.activeSection.anchorY}
    aria-hidden="true"
  ></div>

  <SpineRail />
  <SpineHotspot />
</div>
