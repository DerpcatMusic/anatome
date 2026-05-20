import type { Id } from "../_generated/dataModel";

export function roomNameForClass(liveClassId: Id<"liveClasses">) {
  return `homebody_liveClass_${liveClassId}`;
}
