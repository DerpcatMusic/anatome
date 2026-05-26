<script lang="ts">
  import { onMount } from "svelte";
  import { createSpineScrollObserver } from "../create-spine-scroll-observer";
  import { useSpineLanding } from "../spine-context.svelte";

  const spine = useSpineLanding();

  onMount(() =>
    createSpineScrollObserver({
      onSectionChange: (index) => spine.setActiveSection(index),
    }),
  );
</script>
