<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SpineRegion } from "../spine-regions";
  import { useSpineLanding } from "../spine-context.svelte";

  interface Props {
    region: SpineRegion;
    sectionIndex: number;
    ariaLabel: string;
    id?: string;
    class?: string;
    children: Snippet;
  }

  let { region, sectionIndex, ariaLabel, id, class: className = "", children }: Props = $props();

  const spine = useSpineLanding();
  const isActive = $derived(spine.activeSectionIndex === sectionIndex);
</script>

<section
  {id}
  class="concept-card {className}"
  class:concept-card--active={isActive}
  data-spine-region={region}
  data-spine-section={sectionIndex}
  aria-label={ariaLabel}
  aria-current={isActive ? "true" : undefined}
>
  <!-- Connector anchor (inline-start edge → toward spine in RTL) -->
  <span class="concept-card__anchor" aria-hidden="true"></span>

  <div class="concept-card__inner">
    <span class="concept-card__pulse" aria-hidden="true"></span>
    {@render children()}
  </div>
</section>
