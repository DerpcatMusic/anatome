<script lang="ts">
  import { Progress } from "bits-ui";

  let {
    value = 0,
    max = 100,
    label,
  }: {
    value?: number;
    max?: number;
    label: string;
  } = $props();

  const percent = $derived(Math.min(100, Math.max(0, Math.round((value / max) * 100))));
</script>

<Progress.Root class="hb-progress-track" {value} {max} aria-label={label}>
  <div class="hb-progress-fill" style="transform: translateX(-{100 - percent}%)"></div>
</Progress.Root>
