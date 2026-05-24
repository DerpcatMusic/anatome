<script lang="ts">
  import LiveClassComposer from "$features/live/components/LiveClassComposer.svelte";
  import type { Equipment } from "$lib/labels";

  let {
    title = $bindable(),
    description = $bindable(),
    liveType = $bindable<"group_live" | "one_on_one">(),
    startsAtLocal = $bindable(),
    durationMinutes = $bindable(),
    joinOpensMinutesBefore = $bindable(),
    capacity = $bindable(),
    requiredEquipment = $bindable<Equipment[]>(),
    pending = false,
    mode = "full",
    onSubmit,
    onCancel,
  }: {
    title: string;
    description: string;
    liveType: "group_live" | "one_on_one";
    startsAtLocal: string;
    durationMinutes: number;
    joinOpensMinutesBefore: number;
    capacity: number;
    requiredEquipment: Equipment[];
    pending?: boolean;
    mode?: "quick" | "full";
    onSubmit: () => void;
    onCancel?: () => void;
  } = $props();
</script>

<LiveClassComposer
  {mode}
  bind:title
  bind:description
  bind:liveType
  bind:startsAtLocal
  bind:durationMinutes
  bind:joinOpensMinutesBefore
  bind:capacity
  bind:requiredEquipment
  {pending}
  {onSubmit}
  {onCancel}
/>
