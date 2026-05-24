import type { FunctionReturnType } from "convex/server";
import type { api } from "$convex/_generated/api";

type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];

/** Auto-published open slots from "פרסום חלונות" — shown via availability background, not as events. */
export function isAutoPublishedOpenSlot(liveClass: LiveClass): boolean {
  return (
    liveClass.type === "one_on_one" &&
    liveClass.status === "scheduled" &&
    (liveClass.seatsTaken ?? 0) === 0 &&
    liveClass.title === "שיעור 1:1 אישי"
  );
}

export function calendarVisibleClasses(classes: LiveClass[]): LiveClass[] {
  return classes.filter((c) => !isAutoPublishedOpenSlot(c));
}
