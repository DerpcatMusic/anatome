import type { Doc } from "../_generated/dataModel";

/** Whether a pending reminder should not be delivered (class/reservation state). */
export function shouldSkipLiveReminderDelivery(
  reservation: Doc<"liveReservations"> | null,
  liveClass: Doc<"liveClasses"> | null,
): boolean {
  if (reservation === null || liveClass === null) return true;
  if (
    reservation.status === "cancelled" ||
    reservation.status === "refunded" ||
    reservation.status === "no_show"
  ) {
    return true;
  }
  if (liveClass.status === "cancelled" || liveClass.status === "ended") {
    return true;
  }
  return false;
}
