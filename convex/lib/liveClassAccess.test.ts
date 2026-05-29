import { describe, expect, test } from "bun:test";
import type { Doc, Id } from "../_generated/dataModel";
import {
  findReactivatableReservation,
  findViewerLiveReservationFromRows,
  isValidLiveReservation,
} from "./liveClassAccess";

const classId = "class1" as Id<"liveClasses">;

function row(
  status: Doc<"liveReservations">["status"],
  reservedAt: number,
): Doc<"liveReservations"> {
  return {
    _id: `res_${status}_${reservedAt}` as Id<"liveReservations">,
    _creationTime: reservedAt,
    liveClassId: classId,
    userId: "user1" as Id<"users">,
    walletId: "wallet1" as Id<"creditWallets">,
    status,
    creditKind: "live",
    creditsReserved: 1,
    reservedAt,
  };
}

describe("liveClassAccess reservations", () => {
  test("ignores cancelled when resolving active reservation", () => {
    const rows = [row("cancelled", 100), row("reserved", 200)];
    expect(findViewerLiveReservationFromRows(rows, classId)?.status).toBe("reserved");
    expect(isValidLiveReservation(findViewerLiveReservationFromRows(rows, classId))).toBe(true);
  });

  test("finds latest cancelled row to reactivate", () => {
    const rows = [row("cancelled", 100), row("cancelled", 300), row("no_show", 200)];
    expect(findReactivatableReservation(rows, classId)?._id).toBe("res_cancelled_300");
  });
});
