<script lang="ts">
  import { Slider } from "bits-ui";

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    label,
    disabled = false,
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label: string;
    disabled?: boolean;
  } = $props();

  const displayValue = $derived(value);

  function updateValue(v: number) {
    value = v;
  }
</script>

<div class="hb-slider">
  <span class="hb-slider__label">{label}</span>
  <span class="hb-slider__value">{displayValue}</span>
  <Slider.Root
    class="hb-slider__root"
    type="single"
    {min}
    {max}
    {step}
    {disabled}
    value={value}
    onValueChange={updateValue}
    aria-label={label}
  >
    <span class="hb-slider__track">
      <Slider.Range class="hb-slider__range" />
    </span>
    <Slider.Thumb class="hb-slider__thumb" index={0} />
  </Slider.Root>
</div>
