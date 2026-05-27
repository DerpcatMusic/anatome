import type { Doc } from "../_generated/dataModel";

/** Auto-published open slots from legacy "פרסום חלונות" — calendar paints availability instead. */
export function isAutoPublishedOpenSlot(liveClass: Doc<"liveClasses">): boolean {
  return (
    liveClass.type === "one_on_one" &&
    liveClass.status === "scheduled" &&
    (liveClass.seatsTaken ?? 0) === 0 &&
    liveClass.title === "שיעור 1:1 אישי"
  );
}
