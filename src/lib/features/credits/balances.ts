import type { Doc } from "$convex/_generated/dataModel";
import type { CreditBalances } from "./types";

export type WalletLike = Pick<
  Doc<"userWallets">,
  "vodBalance" | "liveBalance" | "oneOnOneBalance"
>;

export const EMPTY_CREDIT_BALANCES: CreditBalances = {
  vod: 0,
  live: 0,
  oneOnOne: 0,
};

export function walletBalances(wallet: WalletLike | null | undefined): CreditBalances {
  if (!wallet) return { ...EMPTY_CREDIT_BALANCES };
  return {
    vod: Math.max(0, wallet.vodBalance),
    live: Math.max(0, wallet.liveBalance),
    oneOnOne: Math.max(0, wallet.oneOnOneBalance),
  };
}
