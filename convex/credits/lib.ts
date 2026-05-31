import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getActiveSubscription } from "../subscriptions/lib";

export type CreditPool = "vod" | "live" | "oneOnOne";
export type LiveCreditPool = "live" | "oneOnOne";

export type CreditAccess = {
  subscription: Doc<"userSubscriptions"> | null;
  wallet: Doc<"userWallets"> | null;
};

export function availableVodCredits(
  wallet: Pick<Doc<"userWallets">, "vodBalance">,
) {
  return Math.max(0, wallet.vodBalance);
}

export function availableLiveCredits(
  wallet: Pick<Doc<"userWallets">, "liveBalance">,
) {
  return Math.max(0, wallet.liveBalance);
}

export function availableOneOnOneCredits(
  wallet: Pick<Doc<"userWallets">, "oneOnOneBalance">,
) {
  return Math.max(0, wallet.oneOnOneBalance);
}

export function availableFromWallet(wallet: Doc<"userWallets">) {
  return {
    vod: availableVodCredits(wallet),
    live: availableLiveCredits(wallet),
    oneOnOne: availableOneOnOneCredits(wallet),
  };
}

/** @deprecated Use availableFromWallet */
export const availableFromBucket = availableFromWallet;

export async function getUserWallet(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const rows = await ctx.db
    .query("userWallets")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(2);
  if (rows.length > 1) {
    throw new Error("Duplicate user wallets require repair");
  }
  return rows[0] ?? null;
}

export async function ensureUserWallet(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const existing = await getUserWallet(ctx, userId);
  if (existing !== null) return existing;

  const now = Date.now();
  const walletId = await ctx.db.insert("userWallets", {
    userId,
    vodBalance: 0,
    liveBalance: 0,
    liveReserved: 0,
    oneOnOneBalance: 0,
    oneOnOneReserved: 0,
    updatedAt: now,
  });
  const wallet = await ctx.db.get(walletId);
  if (wallet === null) throw new Error("Wallet creation failed");
  return wallet;
}

export async function getCreditAccess(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  at: number,
): Promise<CreditAccess> {
  const subscription = await getActiveSubscription(ctx, userId, at);
  const wallet = await getUserWallet(ctx, userId);
  return { subscription, wallet };
}

export async function requireWallet(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  return await ensureUserWallet(ctx, userId);
}

/** Active subscription required for subscription-gated product surfaces (not credit spend). */
export async function requireWalletForMember(
  ctx: MutationCtx,
  userId: Id<"users">,
  at: number = Date.now(),
) {
  const subscription = await getActiveSubscription(ctx, userId, at);
  if (subscription === null) {
    throw new Error("נדרש מנוי פעיל");
  }
  const wallet = await ensureUserWallet(ctx, userId);
  return { subscription, wallet };
}

function assertPositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid credit amount");
  }
}

async function requireWalletById(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
) {
  const wallet = await ctx.db.get(walletId);
  if (wallet === null) {
    throw new Error("ארנק נקודות לא נמצא");
  }
  return wallet;
}

export async function reserveCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  kind: LiveCreditPool,
  amount: number,
) {
  assertPositiveAmount(amount);
  const wallet = await requireWalletById(ctx, walletId);

  if (kind === "live") {
    if (wallet.liveBalance < amount) throw new Error("אין מספיק נקודות");
    await ctx.db.patch(walletId, {
      liveBalance: wallet.liveBalance - amount,
      liveReserved: wallet.liveReserved + amount,
      updatedAt: Date.now(),
    });
    return;
  }

  if (wallet.oneOnOneBalance < amount) throw new Error("אין מספיק נקודות");
  await ctx.db.patch(walletId, {
    oneOnOneBalance: wallet.oneOnOneBalance - amount,
    oneOnOneReserved: wallet.oneOnOneReserved + amount,
    updatedAt: Date.now(),
  });
}

export async function releaseCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  kind: LiveCreditPool,
  amount: number,
) {
  assertPositiveAmount(amount);
  const wallet = await requireWalletById(ctx, walletId);

  if (kind === "live") {
    const release = Math.min(amount, wallet.liveReserved);
    await ctx.db.patch(walletId, {
      liveBalance: wallet.liveBalance + release,
      liveReserved: Math.max(0, wallet.liveReserved - release),
      updatedAt: Date.now(),
    });
    return;
  }

  const release = Math.min(amount, wallet.oneOnOneReserved);
  await ctx.db.patch(walletId, {
    oneOnOneBalance: wallet.oneOnOneBalance + release,
    oneOnOneReserved: Math.max(0, wallet.oneOnOneReserved - release),
    updatedAt: Date.now(),
  });
}

export async function consumeCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  kind: LiveCreditPool,
  amount: number,
) {
  assertPositiveAmount(amount);
  const wallet = await requireWalletById(ctx, walletId);

  if (kind === "live") {
    if (wallet.liveReserved < amount) {
      throw new Error("Reserved live credits mismatch");
    }
    await ctx.db.patch(walletId, {
      liveReserved: wallet.liveReserved - amount,
      updatedAt: Date.now(),
    });
    return;
  }

  if (wallet.oneOnOneReserved < amount) {
    throw new Error("Reserved 1:1 credits mismatch");
  }
  await ctx.db.patch(walletId, {
    oneOnOneReserved: wallet.oneOnOneReserved - amount,
    updatedAt: Date.now(),
  });
}

export async function consumeVodCredit(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
) {
  const wallet = await requireWalletById(ctx, walletId);
  if (wallet.vodBalance < 1) {
    throw new Error("אין נקודות וידאו נותרות");
  }
  await ctx.db.patch(walletId, {
    vodBalance: wallet.vodBalance - 1,
    updatedAt: Date.now(),
  });
}

export async function refundVodCredit(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  vodBalanceAfterRefund: number,
) {
  await ctx.db.patch(walletId, {
    vodBalance: Math.max(0, vodBalanceAfterRefund),
    updatedAt: Date.now(),
  });
}

export async function grantWalletCredits(
  ctx: MutationCtx,
  userId: Id<"users">,
  grant: {
    vod?: number;
    live?: number;
    oneOnOne?: number;
  },
) {
  const wallet = await ensureUserWallet(ctx, userId);
  await ctx.db.patch(wallet._id, {
    vodBalance: wallet.vodBalance + Math.max(0, grant.vod ?? 0),
    liveBalance: wallet.liveBalance + Math.max(0, grant.live ?? 0),
    oneOnOneBalance: wallet.oneOnOneBalance + Math.max(0, grant.oneOnOne ?? 0),
    updatedAt: Date.now(),
  });
  return wallet._id;
}

export async function reserveLiveCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  amount: number,
) {
  await reserveCredits(ctx, walletId, "live", amount);
}

export async function reserveOneOnOneCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  amount: number,
) {
  await reserveCredits(ctx, walletId, "oneOnOne", amount);
}

export async function releaseLiveCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  amount: number,
) {
  await releaseCredits(ctx, walletId, "live", amount);
}

export async function releaseOneOnOneCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  amount: number,
) {
  await releaseCredits(ctx, walletId, "oneOnOne", amount);
}

/**
 * Re-read reservation and release wallet hold only if still `reserved`.
 * Prevents double-refund when join/settle/cancel race on the same row.
 */
export async function releaseLiveReservationHoldIfStillReserved(
  ctx: MutationCtx,
  reservationId: Id<"liveReservations">,
): Promise<Doc<"liveReservations"> | null> {
  const reservation = await ctx.db.get(reservationId);
  if (reservation === null || reservation.status !== "reserved") {
    return null;
  }
  const kind: LiveCreditPool =
    reservation.creditKind === "live" ? "live" : "oneOnOne";
  await releaseCredits(
    ctx,
    reservation.walletId,
    kind,
    reservation.creditsReserved,
  );
  return reservation;
}

export async function consumeLiveCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  amount: number,
) {
  await consumeCredits(ctx, walletId, "live", amount);
}

export async function consumeOneOnOneCredits(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
  amount: number,
) {
  await consumeCredits(ctx, walletId, "oneOnOne", amount);
}

export async function purchaseVodCredit(
  ctx: MutationCtx,
  walletId: Id<"userWallets">,
) {
  await consumeVodCredit(ctx, walletId);
}
