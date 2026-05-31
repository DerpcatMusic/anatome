<script lang="ts">
  import { browser } from "$app/environment";
  import type { Snippet } from "svelte";

  interface TrueMarqueeProps {
    children: Snippet;
    class?: string;
    /** Seconds for one complete content cycle. */
    duration?: number;
    pauseOnHover?: boolean;
    direction?: "left" | "right";
  }

  let {
    children,
    class: className = "",
    duration = 42,
    pauseOnHover = true,
    direction = "left",
  }: TrueMarqueeProps = $props();

  let viewport = $state<HTMLDivElement>();
  let track = $state<HTMLDivElement>();
  let segment = $state<HTMLDivElement>();
  let active = $state(false);
  let copies = $state(1);

  $effect(() => {
    if (!browser || !viewport || !track || !segment) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const viewportEl = viewport;
    const trackEl = track;
    const segmentEl = segment;

    let paused = false;
    let rafId = 0;
    let lastTime = performance.now();
    let cycleWidth = 0;
    let position = 0;
    let pixelsPerSecond = 0;

    const setPaused = () => {
      paused = true;
    };
    const unsetPaused = () => {
      paused = false;
      lastTime = performance.now();
    };

    function measure() {
      const viewportWidth = viewportEl.clientWidth;
      cycleWidth = segmentEl.scrollWidth;
      if (cycleWidth <= 0 || viewportWidth <= 0) return;

      copies = Math.max(2, Math.ceil(viewportWidth / cycleWidth) + 2);
      pixelsPerSecond = cycleWidth / Math.max(duration, 1);
      position = direction === "left" ? 0 : -cycleWidth;
      trackEl.style.transform = `translate3d(${position}px, 0, 0)`;
      active = true;
    }

    function animate(time: number) {
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!paused && cycleWidth > 0) {
        const delta = pixelsPerSecond * deltaSeconds;
        if (direction === "left") {
          position -= delta;
          if (position <= -cycleWidth) position += cycleWidth;
        } else {
          position += delta;
          if (position >= 0) position -= cycleWidth;
        }
        trackEl.style.transform = `translate3d(${position}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewportEl);
    resizeObserver.observe(segmentEl);

    if (pauseOnHover) {
      viewportEl.addEventListener("mouseenter", setPaused);
      viewportEl.addEventListener("mouseleave", unsetPaused);
      viewportEl.addEventListener("focusin", setPaused);
      viewportEl.addEventListener("focusout", unsetPaused);
    }

    measure();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      active = false;
      copies = 1;
      trackEl.style.transform = "";
      if (pauseOnHover) {
        viewportEl.removeEventListener("mouseenter", setPaused);
        viewportEl.removeEventListener("mouseleave", unsetPaused);
        viewportEl.removeEventListener("focusin", setPaused);
        viewportEl.removeEventListener("focusout", unsetPaused);
      }
    };
  });
</script>

<div class="true-marquee {className}">
  <div class="true-marquee__viewport" bind:this={viewport}>
    <div class="true-marquee__track" class:true-marquee__track--active={active} bind:this={track}>
      <div class="true-marquee__segment" bind:this={segment}>
        {@render children()}
      </div>
      {#each Array(copies - 1) as _, index (`copy-${index}`)}
        <div class="true-marquee__segment true-marquee__segment--copy" aria-hidden="true">
          {@render children()}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .true-marquee,
  .true-marquee__viewport {
    width: 100%;
    overflow: hidden;
  }

  .true-marquee__track {
    display: flex;
    width: max-content;
    will-change: transform;
  }

  .true-marquee__segment {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--space-4);
    padding-inline-end: var(--space-4);
  }

  @media (prefers-reduced-motion: reduce) {
    .true-marquee__track {
      transform: none !important;
    }
  }
</style>
