<script lang="ts">
  import { Meter } from "bits-ui";

  let {
    label,
    value = 0,
    max = 100,
  }: {
    label: string;
    value?: number;
    max?: number;
  } = $props();

  const scale = $derived(Math.max(0, Math.min(1, value / max)));
</script>

<div class="hb-meter">
  <span class="hb-meter__label">{label}</span>
  <Meter.Root class="hb-meter__track" {value} {max} aria-label={label}>
    <div class="hb-meter__fill" style="transform: scaleX({scale})"></div>
  </Meter.Root>
</div>
