<script lang="ts">
  import { ScrollArea } from "bits-ui";
  import type { Equipment } from "$lib/labels";
  import type { DateValue } from "@internationalized/date";
  import LiveClassComposerContent from "./LiveClassComposerContent.svelte";

  interface Props {
    mode: "quick" | "full";
    isPopover: boolean;
    isEdit: boolean;
    editClassType?: "group_live" | "one_on_one";
    lockedType: "group_live" | "one_on_one";
    showTypeToggle: boolean;
    title?: string;
    description?: string;
    liveType?: "group_live" | "one_on_one";
    dateValue?: DateValue | undefined;
    startTime?: string;
    endTime?: string;
    formattedDate: string;
    durationLabel: string;
    capacity?: number;
    joinOpensMinutesBefore?: number;
    requiredEquipment?: Equipment[];
    pending: boolean;
    showDescription: boolean;
    titleInput?: HTMLInputElement | null;
    onTitleInputBind?: (el: HTMLInputElement | null) => void;
    onShowDescription: () => void;
    onTypeChange: (v: string) => void;
    onWhenChange: () => void;
  }

  let {
    mode,
    isPopover,
    isEdit,
    editClassType,
    lockedType,
    showTypeToggle,
    title = $bindable(""),
    description = $bindable(""),
    liveType = $bindable("group_live"),
    dateValue = $bindable(undefined),
    startTime = $bindable("07:00"),
    endTime = $bindable("08:00"),
    formattedDate,
    durationLabel,
    capacity = $bindable(12),
    joinOpensMinutesBefore = $bindable(10),
    requiredEquipment = $bindable<Equipment[]>([]),
    pending,
    showDescription,
    titleInput = $bindable(null),
    onTitleInputBind,
    onShowDescription,
    onTypeChange,
    onWhenChange,
  }: Props = $props();
</script>

{#if isPopover}
  <div class="live-composer__scroll">
    <ScrollArea.Root class="hb-scroll-area">
      <ScrollArea.Viewport class="hb-scroll-area__viewport live-composer__body">
        <LiveClassComposerContent
          {mode}
          {isEdit}
          {editClassType}
          {lockedType}
          {showTypeToggle}
          bind:title
          bind:description
          bind:liveType
          bind:dateValue
          bind:startTime
          bind:endTime
          {formattedDate}
          {durationLabel}
          bind:capacity
          bind:joinOpensMinutesBefore
          bind:requiredEquipment
          {pending}
          {showDescription}
          bind:titleInput
          {onTitleInputBind}
          {onShowDescription}
          {onTypeChange}
          {onWhenChange}
        />
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">
        <ScrollArea.Thumb class="hb-scroll-area__thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  </div>
{:else}
  <div class="live-composer__body">
    <LiveClassComposerContent
      {mode}
      {isEdit}
      {editClassType}
      {lockedType}
      {showTypeToggle}
      bind:title
      bind:description
      bind:liveType
      bind:dateValue
      bind:startTime
      bind:endTime
      {formattedDate}
      {durationLabel}
      bind:capacity
      bind:joinOpensMinutesBefore
      bind:requiredEquipment
      {pending}
      {showDescription}
      bind:titleInput
      {onTitleInputBind}
      {onShowDescription}
      {onTypeChange}
      {onWhenChange}
    />
  </div>
{/if}

<style>
  .live-composer__scroll {
    flex: 1 1 auto;
    min-height: 0;
    max-height: min(calc(100dvh - 200px), 520px);
    padding: 0;
  }

  .live-composer__scroll :global(.hb-scroll-area) {
    height: 100%;
  }

  .live-composer__scroll :global(.hb-scroll-area__viewport) {
    scrollbar-gutter: stable;
  }

  .live-composer__scroll :global(.hb-scroll-area__bar) {
    width: 6px;
    padding: 2px;
    background: transparent;
  }

  .live-composer__scroll :global(.hb-scroll-area__thumb) {
    background: var(--line-light);
    border-radius: 999px;
  }

  .live-composer__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-bottom: var(--space-2);
  }
</style>
