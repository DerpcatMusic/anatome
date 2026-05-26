<script lang="ts">
  import { useSpineLanding } from "../spine-context.svelte";

  const spine = useSpineLanding();

  const top = $derived(`${spine.activeSection.anchorY * 100}%`);
</script>

<div
  class="concept-spine-stage__hotspot"
  style:top
  aria-hidden="true"
>
  <span class="concept-spine-stage__hotspot-ring"></span>
  <span class="concept-spine-stage__hotspot-core"></span>
</div>
