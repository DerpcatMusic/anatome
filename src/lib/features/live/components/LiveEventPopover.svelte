<script lang="ts">
  import { Popover } from "bits-ui";
  import LiveClassComposer from "./LiveClassComposer.svelte";
  import type { Equipment } from "$lib/labels";
  import type { Id } from "$convex/_generated/dataModel";
  import type { SelectionAnchor } from "$features/live/types/selection-anchor";
  import { anchorBesideSelection } from "$features/live/types/selection-anchor";

  type LiveClass = {
    _id: Id<"liveClasses">;
    title: string;
    description: string;
    status: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    startsAt: number;
    endsAt: number;
    capacity: number;
    type: "group_live" | "one_on_one";
    requiredEquipment: Equipment[];
    joinOpensMinutesBefore?: number;
  };

  let {
    open = $bindable(false),
    mode = "create",
    anchor = null,
    liveClass = null,
    title = $bindable(),
    description = $bindable(),
    liveType = $bindable<"group_live" | "one_on_one">(),
    startsAtLocal = $bindable(),
    durationMinutes = $bindable(),
    joinOpensMinutesBefore = $bindable(),
    capacity = $bindable(),
    requiredEquipment = $bindable<Equipment[]>(),
    pending = false,
    onSubmit,
    onCancel,
    onDelete,
    onEndLive,
  }: {
    open?: boolean;
    mode?: "create" | "edit";
    anchor: SelectionAnchor | null;
    liveClass?: LiveClass | null;
    title: string;
    description: string;
    liveType: "group_live" | "one_on_one";
    startsAtLocal: string;
    durationMinutes: number;
    joinOpensMinutesBefore: number;
    capacity: number;
    requiredEquipment: Equipment[];
    pending?: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    onEndLive?: () => void;
  } = $props();

  const placement = $derived.by(() => {
    if (!anchor) return null;
    const { trigger, side } = anchorBesideSelection(anchor);
    return {
      top: `${trigger.top}px`,
      left: `${trigger.left}px`,
      side,
    };
  });

  const railType = $derived(
    mode === "edit" ? (liveClass?.type ?? "group_live") : liveType,
  );

  const railClass = $derived(
    railType === "one_on_one" ? "live-event-popover--one-on-one" : "live-event-popover--group",
  );

  const ariaLabel = $derived(mode === "edit" ? "עריכת שיעור" : "יצירת שיעור");

  const editStatus = $derived(liveClass?.status ?? "scheduled");
  const editClassType = $derived(liveClass?.type ?? liveType);

  function handleOpenChange(next: boolean) {
    if (!next) onCancel();
    open = next;
  }
</script>

{#if anchor && placement && (mode === "create" || liveClass)}
  <Popover.Root bind:open onOpenChange={handleOpenChange}>
    <span
      class="live-event-popover-anchor-wrap"
      style="top: {placement.top}; left: {placement.left};"
      aria-hidden="true"
    >
      <Popover.Trigger class="live-event-popover-anchor-trigger" tabindex={-1} />
    </span>
    <Popover.Portal>
      <Popover.Content
        class="hb-popover-content live-event-popover {railClass}"
        side={placement.side}
        align="center"
        sideOffset={10}
        collisionPadding={12}
        aria-label={ariaLabel}
      >
        <LiveClassComposer
          layout="popover"
          mode="quick"
          intent={mode}
          bind:title
          bind:description
          bind:liveType
          bind:startsAtLocal
          bind:durationMinutes
          bind:joinOpensMinutesBefore
          bind:capacity
          bind:requiredEquipment
          editStatus={mode === "edit" ? editStatus : undefined}
          editClassType={mode === "edit" ? editClassType : undefined}
          {pending}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={mode === "edit" ? onDelete : undefined}
          onEndLive={mode === "edit" ? onEndLive : undefined}
        />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
{/if}

<style>
  .live-event-popover-anchor-wrap {
    position: fixed;
    width: 1px;
    height: 1px;
    transform: translate(0, -50%);
    z-index: 0;
    pointer-events: none;
  }

  :global(.live-event-popover-anchor-trigger) {
    width: 1px;
    height: 1px;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    opacity: 0;
    pointer-events: none;
  }

  :global(.hb-popover-content.live-event-popover) {
    z-index: 90;
    width: min(380px, 92vw);
    min-width: 320px;
    max-width: 380px;
    padding: 0;
    direction: rtl;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;
    background: var(--paper);
    border: 1px solid var(--line-light);
    border-inline-start-width: 4px;
    border-inline-start-style: solid;
    box-shadow: none;
    backdrop-filter: none;
  }

  :global(.live-event-popover--group) {
    border-inline-start-color: var(--sky-strong);
  }

  :global(.live-event-popover--one-on-one) {
    border-inline-start-color: var(--violet-strong);
  }
</style>
