<script lang="ts">
  import { Meter } from "bits-ui";
  let { label, level }: { label: string; level: number } = $props();
  const scale = $derived(Math.max(0, Math.min(1, level)));
</script>

<div class="hb-meter">
  <span class="hb-meter__label">{label}</span>
  <Meter.Root class="hb-meter__track" value={Math.round(scale * 100)} max={100} aria-label={label}>
    <div class="hb-meter__fill" style="transform: scaleX({scale})"></div>
  </Meter.Root>
</div>
