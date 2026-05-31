<script lang="ts">
  import EndedClassView from "./EndedClassView.svelte";
  import EditLiveClassFormBody from "./EditLiveClassFormBody.svelte";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";

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

  interface Props {
    liveClass: LiveClass;
    variant?: "modal" | "popover";
    onSubmit: (data: {
      title: string;
      description: string;
      startsAt: number;
      durationMinutes: number;
      joinOpensMinutesBefore: number;
      capacity: number;
      requiredEquipment: Equipment[];
    }) => void;
    onCancel: () => void;
    onDelete: () => void;
    onEndLive?: () => void;
    submitting?: boolean;
  }

  let {
    liveClass,
    variant = "modal",
    onSubmit,
    onCancel,
    onDelete,
    onEndLive,
    submitting = false,
  }: Props = $props();

  const isPopover = $derived(variant === "popover");
</script>

{#if liveClass.status === "ended"}
  <EndedClassView {liveClass} {isPopover} {onCancel} {submitting} />
{:else}
  <EditLiveClassFormBody
    {liveClass}
    {isPopover}
    {submitting}
    {onSubmit}
    {onDelete}
    {onCancel}
    {onEndLive}
  />
{/if}
