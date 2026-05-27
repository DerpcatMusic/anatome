# Credits lifecycle

Persistent balances live in `userWallets`. Live and 1:1 booking move credits into per-pool **reserved** fields until join (spend) or cancel/settle (refund).

## Pools

| Pool | Balance field | Reserved field | UI “available” |
|------|---------------|----------------|----------------|
| VOD | `vodBalance` | — | `vodBalance` |
| Group live | `liveBalance` | `liveReserved` | `liveBalance` only |
| 1:1 | `oneOnOneBalance` | `oneOnOneReserved` | `oneOnOneBalance` only |

## VOD (macroflow)

```text
Grant ──► vodBalance
              │
              ▼ purchaseMacroflow (video/entitlements)
         vodBalance -= 1  +  videoEntitlements row
              │
              ├─ duplicate entitlement race ──► refundVodCredit (restore prior balance)
              └─ playback ──► entitlement check only (no per-view charge)
```

- **Grant:** `grantSubscriptionPeriodCredits`, `grantPlanUpgradeDelta`, `ops/support.grantWalletCreditsByEmail`, `subscriptions/admin.grantManualByEmail`
- **Spend:** `consumeVodCredit` on macroflow purchase
- **Refund:** `refundVodCredit` on entitlement insert race

## Group live

```text
Grant ──► liveBalance
              │
              ▼ live/reservation.reserve (active subscription required)
         liveBalance -= cost ; liveReserved += cost
              │
              ├─ cancel ──► releaseCredits ──► liveBalance += cost ; liveReserved -= cost
              ├─ class cancelled ──► releaseLiveReservationHoldIfStillReserved
              ├─ no-show settle ──► same release + status no_show
              └─ LiveKit join (reserved) ──► consumeCredits ──► liveReserved -= cost (spent)
```

- **Grant / membership gate:** `requireWalletForMember` (`trialing` | `active` only; `past_due` blocked)
- **Reserve:** `convex/live/reservation.ts`
- **Spend:** `convex/livekitAttendance/events.ts` on first customer join
- **Refund:** `reservation.cancel`, `live/settle`, class cancel wallet loop

## 1:1

```text
Grant ──► oneOnOneBalance
              │
              ▼ oneOnOne/customer.requestSlot
         oneOnOneBalance -= 1 ; oneOnOneReserved += 1  (pending request)
              │
              ├─ cancel / reject / expire ──► releaseOneOnOneCredits
              ├─ instructor approve ──► liveReservations row (still reserved on wallet)
              └─ LiveKit join ──► consumeCredits (oneOnOneReserved -= 1)
```

- **Reserve:** at request time (`oneOnOne/customer`), not again on approve
- **Spend:** same join webhook as group live
- **Refund:** customer cancel, instructor reject, cron expire, class cancel/settle (via reservation hold release)

## Subscription credits

- Monthly grant: `grantSubscriptionPeriodCredits` (idempotent per `lastCreditsGrantedPeriodStart`)
- Renewal: `subscriptions/internal.renewDue` / `renewOne`
- Upgrade delta: `grantPlanUpgradeDelta`

## Frontend

- Balances: `users/dashboard.get` → `wallet` → `walletBalances()` in `src/lib/features/credits/balances.ts`
- Calendar / catalog: Convex queries (`live/calendar`, `video/catalog`, `oneOnOne/customer`) — no hardcoded balances
- Plan marketing counts: `plans.*CreditsPerMonth` (allowances), not wallet

## Invariants

- Reserve checks **balance**; join consumes **reserved**
- `releaseCredits` uses `min(amount, *Reserved)` to avoid over-release
- `releaseLiveReservationHoldIfStillReserved` re-reads reservation status to avoid settle/join double-refund
