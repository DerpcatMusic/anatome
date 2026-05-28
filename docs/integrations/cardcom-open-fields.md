# CardCom checkout: hosted page vs Open Fields

AnatoMe currently uses **Low Profile — classic hosted iframe** (`lowProfileClearing/1000.aspx`). That page is CardCom’s full UI (invoice block, PayPal, Bit, Google Pay). We cannot restyle it to match AnatoMe; `UIDefinition.CSSUrl` only helps when CardCom approves it and the URL is **HTTPS** (not `localhost`).

CardCom’s **Open Fields** (שדות פתוחים) is the product that fixes “ugly hosted iframe” while staying PCI-safe.

## Two integration modes (same backend lifecycle)

| | **IFRAME / Redirect (current)** | **Open Fields (target)** |
|---|---|---|
| Step 1 | `POST /api/v11/LowProfile/Create` | Same |
| Step 2 | One `<iframe src={Url}>` | Your page: card number / expiry / CVV each in a **small CardCom iframe** + hidden **manager iframe** |
| Billing fields | On CardCom page | On **your** page (ת.ז, כתובת, שם) with AnatoMe tokens |
| Step 3–5 | Webhook → `GetLpResult` → success/fail redirect | **Unchanged** |

Public docs: [Zendesk API hub](./cardcom-api-hub.md), [CardCom developers](https://www.cardcom.solutions/developers), [v11 Swagger UI](https://secure.cardcom.solutions/api/v11/docs) (`swagger/v11/swagger.json`).

Open Fields is described on the marketing site but **is not documented in the public v11 Swagger** (no extra paths, no field-URL schema).

## What we verified (sandbox terminal `1000` / `CardTest1994`)

`LowProfile/Create` returns only:

```json
{
  "LowProfileId": "...",
  "Url": "https://secure.cardcom.solutions/External/lowProfileClearing/1000.aspx?LowProfileCode=...",
  "UrlToPayPal": "...",
  "UrlToBit": "..."
}
```

No per-field URLs and no manager URL until CardCom enables **Open Fields on the terminal** and provides their integration pack (iframe URLs, `postMessage` events, 3DS script).

## Open Fields flow (from CardCom)

1. Create Low Profile deal (same API as today).
2. Build **your** checkout layout (AnatoMe CSS).
3. Embed CardCom iframes for **card number**, **expiry**, **CVV** (each field styled via CardCom’s per-iframe CSS).
4. Embed a **transparent manager iframe**; your Pay button triggers charge through it.
5. Optional **3DS script** — popup for OTP when required.
6. Webhook + `GetLpResult` + embed success/failure URLs — same as today.

## What we need from CardCom (action list)

1. **Enable “שדות פתוחים / Open Fields”** on sandbox terminal `1000` and production terminal.
2. **Integration document**: manager iframe URL pattern, field iframe URLs, JS SDK (if any), `postMessage` contract, 3DS script URL, error codes.
3. **CSS injection** per field (or confirm `UIDefinition.CSSUrl` applies to field iframes).
4. Confirm whether **PayPal / Bit / Google Pay** can be disabled for Open Fields checkout (terminal settings vs API).
5. Confirm **document/invoice** behavior when billing fields live on our page (`Document`, `IsAllowEditDocument`, `DocumentTypeToCreate`).

Contact: developer support **03-9436100** (per CardCom site).

## AnatoMe implementation plan (after pack received)

1. `convex/payments/cardcom/create*.ts` — store `checkoutMode: "hosted" | "openFields"` and any extra URLs from Create response.
2. `CardcomOpenFieldsCheckout.svelte` — native form + field iframes + manager iframe; reuse `cardcomEmbed.ts` for completion.
3. Feature flag `CARDCOM_OPEN_FIELDS_ENABLED` (off until terminal enabled).
4. Keep `CardcomCheckoutModal` as fallback for hosted mode.

## Hosted-mode mitigations (until Open Fields)

- `IsAllowEditDocument: false` + prefilled `Document` / `UIDefinition` (less invoice clutter).
- `CARDCOM_CHECKOUT_CSS_URL` → deployed origin serving `/static/cardcom/*.css` (CardCom must approve CSSUrl).
- Disable wallet buttons in **terminal back office** for sandbox/production.

## Env (unchanged)

```bash
# bunx convex env set CARDCOM_CHECKOUT_CSS_URL https://<public-https-origin>
```

`FRONTEND_URL` success/fail redirects must be **HTTPS** and reachable by CardCom (not `localhost` for iframe redirects).
