import { describe, expect, test } from "bun:test";
import {
  availableFromWallet,
  availableLiveCredits,
  availableOneOnOneCredits,
  availableVodCredits,
} from "./lib";
import type { Doc } from "../_generated/dataModel";

function wallet(
  overrides: Partial<Doc<"userWallets">> = {},
): Doc<"userWallets"> {
  return {
    _id: "wallet" as Doc<"userWallets">["_id"],
    _creationTime: 0,
    userId: "user" as Doc<"userWallets">["userId"],
    vodBalance: 0,
    liveBalance: 0,
    liveReserved: 0,
    oneOnOneBalance: 0,
    oneOnOneReserved: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe("wallet available balances", () => {
  test("clamps negative balances to zero", () => {
    const w = wallet({ vodBalance: -2, liveBalance: -1, oneOnOneBalance: -3 });
    expect(availableVodCredits(w)).toBe(0);
    expect(availableLiveCredits(w)).toBe(0);
    expect(availableOneOnOneCredits(w)).toBe(0);
    expect(availableFromWallet(w)).toEqual({ vod: 0, live: 0, oneOnOne: 0 });
  });

  test("exposes spendable balance only (reserved is separate)", () => {
    const w = wallet({
      liveBalance: 2,
      liveReserved: 5,
      oneOnOneBalance: 1,
      oneOnOneReserved: 3,
      vodBalance: 4,
    });
    expect(availableFromWallet(w)).toEqual({
      vod: 4,
      live: 2,
      oneOnOne: 1,
    });
  });
});
