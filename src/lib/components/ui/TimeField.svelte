<!--
  DEPRECATED: This component has focus-loss issues due to bidirectional $effect()
  sync between bits-ui TimeField.Segment and parent string value.
  Use NativeTimePicker.svelte instead for a robust, accessible time input.
-->
<script lang="ts">
  import { TimeField } from "bits-ui";
  import { Time, parseTime } from "@internationalized/date";
  import type { TimeValue } from "bits-ui";

  let {
    value = $bindable("09:00"),
    label,
    disabled = false,
  }: {
    value?: string;
    label: string;
    disabled?: boolean;
  } = $props();

  // Internal Time object representation for Bits UI
  let internalTime = $state<TimeValue>(initTime());

  function initTime() {
    try {
      return parseTime(value || "09:00");
    } catch {
      return new Time(9, 0);
    }
  }

  // Sync internal Time object back to the parent string value
  $effect(() => {
    if (internalTime) {
      const hour = String(internalTime.hour).padStart(2, "0");
      const minute = String(internalTime.minute).padStart(2, "0");
      const formatted = `${hour}:${minute}`;
      if (value !== formatted) {
        value = formatted;
      }
    }
  });

  // Sync parent string changes down to internal Time object
  $effect(() => {
    if (value) {
      try {
        const parsed = parseTime(value);
        if (!internalTime || parsed.hour !== internalTime.hour || parsed.minute !== internalTime.minute) {
          internalTime = parsed;
        }
      } catch {
        // Safe fallback
      }
    }
  });
</script>

<div class="hb-time-field">
  <span class="hb-time-field__label">{label}</span>
  <TimeField.Root bind:value={internalTime} {disabled} locale="he-IL">
    <TimeField.Input class="hb-time-field__input">
      {#snippet children({ segments })}
        {#each segments as { part, value: segmentVal }, i (part + i)}
          <div class="inline-block select-none">
            {#if part === "literal"}
              <TimeField.Segment {part} class="hb-time-field__segment literal">
                {segmentVal}
              </TimeField.Segment>
            {:else}
              <TimeField.Segment
                {part}
                class="hb-time-field__segment"
              >
                {segmentVal}
              </TimeField.Segment>
            {/if}
          </div>
        {/each}
      {/snippet}
    </TimeField.Input>
  </TimeField.Root>
</div>
