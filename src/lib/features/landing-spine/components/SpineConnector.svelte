<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { useSpineLanding } from "../spine-context.svelte";

  const spine = useSpineLanding();

  let pathD = $state("");
  let visible = $state(false);

  function measureConnector() {
    if (!browser || window.innerWidth <= 900) {
      visible = false;
      return;
    }

    const hotspot = document.querySelector<HTMLElement>(".concept-spine-stage__hotspot");
    const card = document.querySelector<HTMLElement>(
      `.concept-card[data-spine-section="${spine.activeSectionIndex}"] .concept-card__anchor`,
    );

    if (!hotspot || !card) {
      visible = false;
      return;
    }

    const h = hotspot.getBoundingClientRect();
    const c = card.getBoundingClientRect();

    const x1 = h.left + h.width / 2;
    const y1 = h.top + h.height / 2;
    const x2 = c.left + c.width / 2;
    const y2 = c.top + c.height / 2;

    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.38;
    const cx2 = x1 + dx * 0.62;

    pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
    visible = true;
  }

  onMount(() => {
    measureConnector();
  });

  useEventListener("scroll", measureConnector, { passive: true });
  useEventListener("resize", measureConnector, { passive: true });

  $effect(() => {
    spine.activeSectionIndex;
    spine.activeSection.anchorY;
    measureConnector();
  });
</script>

<svg
  class="concept-connector"
  class:concept-connector--visible={visible}
  aria-hidden="true"
>
  <defs>
    <linearGradient id="concept-connector-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="var(--secondary)" stop-opacity="0.95" />
      <stop offset="100%" stop-color="var(--secondary)" stop-opacity="0.3" />
    </linearGradient>
  </defs>
  <path class="concept-connector__path" d={pathD} />
  <path class="concept-connector__path concept-connector__path--dash" d={pathD} />
</svg>
