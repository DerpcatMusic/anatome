<script lang="ts">
  import OneOnOneRequestModal, {
    type OneOnOneRequestPayload,
  } from "./OneOnOneRequestModal.svelte";
  import CancelReservationDialog from "./CancelReservationDialog.svelte";
  import type { CalendarClass, DayAvailability } from "../lib/agenda";

  interface Props {
    showOneOnOneRequest: boolean;
    oneOnOneModalOpen: boolean;
    oneOnOneModalPending: boolean;
    oneOnOneModalInitialDay: number | null;
    dayWindows: DayAvailability[];
    onSubmitOneOnOneRequest: (payload: OneOnOneRequestPayload, note: string) => void;
    cancelTarget: CalendarClass | null;
    cancelDialogOpen: boolean;
    actionId: string | null;
    onConfirmCancel: () => void;
  }

  let {
    showOneOnOneRequest,
    oneOnOneModalOpen = $bindable(),
    oneOnOneModalPending,
    oneOnOneModalInitialDay,
    dayWindows,
    onSubmitOneOnOneRequest,
    cancelTarget,
    cancelDialogOpen = $bindable(),
    actionId,
    onConfirmCancel,
  }: Props = $props();
</script>

{#if showOneOnOneRequest}
  <OneOnOneRequestModal
    bind:open={oneOnOneModalOpen}
    windows={dayWindows}
    initialDay={oneOnOneModalInitialDay}
    pending={oneOnOneModalPending}
    onSubmit={onSubmitOneOnOneRequest}
  />
{/if}

{#if cancelTarget}
  <CancelReservationDialog
    bind:open={cancelDialogOpen}
    classTitle={cancelTarget.liveClass.title}
    creditCost={cancelTarget.liveClass.creditCost}
    pending={actionId === cancelTarget.liveClass._id}
    onConfirm={onConfirmCancel}
  />
{/if}
