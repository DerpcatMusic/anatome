import { useConvexClient } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import { convexMutationErrorMessage } from "$lib/convex/errors";
import { useI18n } from "$lib/i18n/runes.svelte";
import type { OneOnOneRequestPayload } from "./OneOnOneRequestModal.svelte";

export function createCalendarActions(
  setActionId: (v: string | null) => void,
  setActionError: (v: string) => void,
  setOneOnOneModalPending: (v: boolean) => void,
  setOneOnOneModalOpen: (v: boolean) => void,
  setOneOnOneModalInitialDay: (v: number | null) => void,
  setCancelDialogOpen: (v: boolean) => void,
  setCancelTarget: (v: { liveClass: { _id: Id<"liveClasses"> } } | null) => void,
) {
  const client = useConvexClient();
  const { t } = useI18n();

  async function reserve(liveClassId: Id<"liveClasses">) {
    setActionId(liveClassId);
    setActionError("");
    try {
      await client.mutation(api.live.reservation.reserve, { liveClassId });
    } catch (reason) {
      setActionError(convexMutationErrorMessage(reason, t.calendar.error.reserve()));
    } finally {
      setActionId(null);
    }
  }

  async function confirmCancelReservation(cancelTarget: { liveClass: { _id: Id<"liveClasses"> } } | null) {
    if (cancelTarget === null) return;
    const liveClassId = cancelTarget.liveClass._id;
    setActionId(liveClassId);
    setActionError("");
    try {
      await client.mutation(api.live.reservation.cancel, { liveClassId });
    } catch (reason) {
      setActionError(convexMutationErrorMessage(reason, t.calendar.error.cancel()));
    } finally {
      setActionId(null);
    }
  }

  async function submitOneOnOneRequest(payload: OneOnOneRequestPayload, note: string) {
    const key = `${payload.instructorUserId}-${payload.startsAt}`;
    setOneOnOneModalPending(true);
    setActionId(key);
    setActionError("");
    try {
      await client.mutation(api.oneOnOne.customer.requestSlot, {
        instructorUserId: payload.instructorUserId,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        note,
      });
      setOneOnOneModalOpen(false);
      setOneOnOneModalInitialDay(null);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.");
    } finally {
      setOneOnOneModalPending(false);
      setActionId(null);
    }
  }

  async function cancelOneOnOneRequest(requestId: Id<"oneOnOneRequests">) {
    setActionId(requestId);
    setActionError("");
    try {
      await client.mutation(api.oneOnOne.customer.cancelRequest, { requestId });
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "לא הצלחנו לבטל את הבקשה.");
    } finally {
      setActionId(null);
    }
  }

  return { reserve, confirmCancelReservation, submitOneOnOneRequest, cancelOneOnOneRequest };
}
