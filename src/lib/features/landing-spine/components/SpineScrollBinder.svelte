<script lang="ts">

  import { createSpineScrollObserver } from "../create-spine-scroll-observer";
  import { useSpineLanding } from "../spine-context.svelte";

  const spine = useSpineLanding();

  $effect(() =>
    createSpineScrollObserver({
      onSectionChange: (index) => spine.setActiveSection(index),
    }),
  );
</script>
