<script lang="ts">
  import type { Equipment } from "$lib/labels";
  import type { DateValue } from "@internationalized/date";
  import QuickComposerBody from "./QuickComposerBody.svelte";
  import FullComposerBody from "./FullComposerBody.svelte";
  import LiveClassComposerTypeToggleStyles from "./LiveClassComposerTypeToggleStyles.svelte";

  interface Props {
    mode: "quick" | "full";
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

<LiveClassComposerTypeToggleStyles />

{#if mode === "quick"}
  <QuickComposerBody
    bind:title
    bind:description
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
    {lockedType}
    {showTypeToggle}
    {isEdit}
    bind:liveType
    {onShowDescription}
    {onTypeChange}
    {onWhenChange}
  />
{:else}
  <FullComposerBody
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
    {onShowDescription}
    {onTypeChange}
  />
{/if}

<style>
  :global(.live-composer--quick .live-composer__body) {
    gap: var(--space-3);
  }

  :global(.live-composer--popover .live-composer__body) {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-5) var(--space-5) var(--space-4);
    text-align: right;
    align-items: stretch;
    box-sizing: border-box;
  }

  :global(.live-composer--popover :global(.hb-input:focus)),
  :global(.live-composer--popover :global(.hb-textarea:focus)) {
    box-shadow: none;
    outline: 2px solid var(--accent);
    outline-offset: 0;
  }

  :global(.live-composer--quick .live-composer__title-input) {
    min-height: 40px;
    font-weight: 800;
    font-size: var(--step-0);
    border: none;
    border-bottom: 2px solid var(--line-light);
    border-radius: 0;
    padding-inline: 0;
    background: transparent;
  }

  :global(.live-composer--popover .live-composer__title-input) {
    min-height: 44px;
    padding-block: var(--space-1) var(--space-3);
    margin-bottom: var(--space-1);
    font-weight: 800;
    font-size: var(--step-0);
    line-height: 1.35;
    border: none;
    border-bottom: 2px solid var(--line-light);
    border-radius: 0;
    padding-inline: 0;
    background: transparent;
    text-align: right;
    width: 100%;
    box-sizing: border-box;
  }

  :global(.live-composer--popover .live-composer__title-input:focus) {
    border-bottom-color: var(--accent);
    outline: none;
    box-shadow: none;
  }

  :global(.composer-desc-toggle) {
    justify-content: flex-end;
    justify-self: stretch;
    width: 100%;
    padding-inline: 0;
    min-height: 32px;
    font-weight: 700;
    color: var(--accent);
  }

  :global(.live-composer--popover .live-composer__equipment :global(.equipment-grid--compact)) {
    gap: var(--space-2);
  }

  :global(.live-composer--popover .live-composer__equipment :global(.equipment-grid--compact .hb-choice)) {
    min-height: 52px;
    padding: var(--space-2) var(--space-1);
    border: none;
    background: var(--surface);
    border-radius: 8px;
    box-shadow: none;
  }

  :global(.live-composer--popover
    .live-composer__equipment
    :global(.equipment-grid--compact .hb-choice[data-state="checked"])) {
    background: color-mix(in oklch, var(--accent) 18%, var(--paper));
    color: var(--ink);
    outline: 2px solid color-mix(in oklch, var(--accent) 55%, var(--line-light));
    outline-offset: -2px;
  }

  :global(.live-composer--popover .live-composer__equipment :global(.equipment-grid--compact .hb-choice:hover:not([data-disabled]))) {
    background: color-mix(in oklch, var(--surface) 80%, var(--paper));
    border-color: transparent;
  }

  :global(.live-composer--popover .composer-desc--quick),
  :global(.live-composer--popover .composer-desc) {
    border-color: var(--line-light);
    background: var(--surface);
    border-radius: 8px;
    min-height: 4.5rem;
  }

  :global(.live-composer--popover .quick-capacity-input) {
    border: none;
    background: var(--surface);
    border-radius: 6px;
  }

  :global(.live-composer--popover .quick-when-row) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--surface);
    border-radius: 8px;
    border: none;
    direction: rtl;
  }

  :global(.live-composer--popover .quick-date-chip) {
    flex: 1 1 100%;
    padding-bottom: var(--space-1);
    border-bottom: 1px solid var(--line-light);
  }

  :global(.live-composer--popover .quick-time-range) {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1 1 auto;
  }

  :global(.live-composer--popover .quick-time-input) {
    width: auto;
    min-width: 4.75rem;
    flex: 1 1 0;
    border: none;
    background: transparent;
    padding: var(--space-1);
    box-shadow: none;
  }

  :global(.live-composer--popover .quick-time-input:focus) {
    outline: none;
    background: color-mix(in oklch, var(--paper) 70%, transparent);
    border-radius: 4px;
  }

  :global(.live-composer--popover .quick-duration-hint) {
    flex: 0 0 auto;
    margin-inline-start: auto;
  }

  :global(.live-composer--popover .quick-duration-hint::before) {
    content: "·";
    margin-inline-end: var(--space-2);
    color: var(--line);
  }
</style>
