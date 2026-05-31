<script lang="ts">
  import { useSpineLanding } from "../spine-context.svelte";
  import { CONCEPT_SECTIONS } from "../concept-sections";

  const spine = useSpineLanding();

  const fillHeight = $derived(`${spine.activeSection.anchorY * 100}%`);

  const makeScrollHandler = (i: number) => () => {
    const el = document.querySelector<HTMLElement>(
      `[data-spine-section="${i}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
</script>

<div class="concept-spine-rail" aria-hidden="true">
  <div class="concept-spine-rail__track"></div>
  <div class="concept-spine-rail__fill" style:height={fillHeight}></div>

  {#each CONCEPT_SECTIONS as section, i (section.id)}
    <button
      type="button"
      class="concept-spine-rail__dot"
      class:concept-spine-rail__dot--active={spine.activeSectionIndex === i}
      class:concept-spine-rail__dot--passed={spine.activeSectionIndex > i}
      style:top="{section.anchorY * 100}%"
      onclick={makeScrollHandler(i)}
      tabindex="-1"
      aria-hidden="true"
    ></button>
  {/each}
</div>
