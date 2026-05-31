import { useConvexClient } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import { convexMutationErrorMessage } from "$lib/convex/errors";
import { useI18n } from "$lib/i18n/runes.svelte";
import type { OneOnOneRequestPayload } from "./OneOnOneRequestModal.svelte";

export function useCalendarActions() {
  const client = useConvexClient();
  const { t } = useI18n();

  let actionId = $state<string | null>(null);
  let actionError = $state("");

  async function reserve(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.live.reservation.reserve, { liveClassId });
    } catch (reason) {
      actionError = convexMutationErrorMessage(reason, t.calendar.error.reserve());
    } finally {
      actionId = null;
    }
  }

  async function confirmCancelReservation(cancelTarget: { liveClass: { _id: Id<"liveClasses"> } } | null) {
    if (cancelTarget === null) return;
    const liveClassId = cancelTarget.liveClass._id;
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.live.reservation.cancel, { liveClassId });
    } catch (reason) {
      actionError = convexMutationErrorMessage(reason, t.calendar.error.cancel());
    } finally {
      actionId = null;
    }
  }

  async function submitOneOnOneRequest(
    payload: OneOnOneRequestPayload,
    note: string,
  ) {
    const key = `${payload.instructorUserId}-${payload.startsAt}`;
    actionId = key;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.requestSlot, {
        instructorUserId: payload.instructorUserId,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        note,
      });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.";
    } finally {
      actionId = null;
    }
  }

  async function cancelOneOnOneRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.cancelRequest, { requestId });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל את הבקשה.";
    } finally {
      actionId = null;
    }
  }

  return {
    get actionId() { return actionId; },
    get actionError() { return actionError; },
    reserve,
    confirmCancelReservation,
    submitOneOnOneRequest,
    cancelOneOnOneRequest,
    resetActionError() { actionError = ""; },
  };
}
