# CardCom API hub (Zendesk)

Official developer docs index:  
https://cardcomapi.zendesk.com/hc/he/categories/25266511344146-%D7%9E%D7%9E%D7%A9%D7%A7%D7%99%D7%9D-API

Interactive API reference (OpenAPI):  
https://secure.cardcom.solutions/api/v11/docs  
(Spec: `https://secure.cardcom.solutions/swagger/v11/swagger.json`)

## What AnatoMe uses today

| Step | CardCom doc | Our code |
|------|-------------|----------|
| 1 – Create page | [שלב 1+2 (HE)](https://cardcomapi.zendesk.com/hc/he/articles/25264402497426) / [Step 1+2 (EN)](https://cardcomapi.zendesk.com/hc/he/articles/27008964534162) | `POST /api/v11/LowProfile/Create` → `convex/payments/cardcom/client.ts` |
| 2 – Show page | Same | `CardcomCheckoutModal.svelte` (`<iframe src={Url}>`) |
| 3 – Webhook | [Webhook centralization](https://cardcomapi.zendesk.com/hc/he/sections/26955787963410) | `convex/payments/cardcomHttp.ts` → `fulfill.ts` |
| 4 – Verify | `GetLpResult` in Step 1+2 | `convex/payments/cardcom/webhook.ts` |
| 5 – Finish | Success/fail redirect URLs + `embed=1` | `/billing/success`, `/billing/failure` + `cardcomEmbed.ts` |

Payload helpers: `convex/payments/cardcom/payload.ts` (`ProductName`, `DocumentTypeToCreate: Order`, `IsAllowEditDocument: false`, hide prefilled `UIDefinition` fields).

## Articles that matter for “ugly iframe”

### 1. Low Profile Step 1+2 (you pasted this)

- **Required models:** Low Profile + Documents (+ Tokens if `ChargeAndCreateToken`).
- **`CSSUrl`:** injected only with **CardCom approval**; must be public HTTPS.
- **`Language: he`:** design versions **5 + 6** (newer landing).
- **Example `Url` in docs:**  
  `https://secure.cardcom.solutions/EA/LPC6/1000/{LowProfileId}?t=24`
- **Sandbox terminal `1000` today returns:**  
  `https://secure.cardcom.solutions/External/lowProfileClearing/1000.aspx?LowProfileCode=...`  
  → legacy page (PayPal / Bit / GPay, old layout). Ask CardCom to enable **LPC6 / design 5+6** on your terminal.

### 2. Custom page CSS (hosted page, not Open Fields)

Section: [מקבץ מאמרי API](https://cardcomapi.zendesk.com/hc/he/sections/26955787963410)

- **פרופיל נמוך : עיצוב דף מותאם אישית (גרסה 5) CSS/HTML** — selectors for design v5; pair with `UIDefinition.CSSUrl`.
- Swagger article links **CSS He** / **CSS En** sample files: [ממשק Api JSON + SWAGGER](https://cardcomapi.zendesk.com/hc/he/articles/26985443818514).

Our files: `static/cardcom/checkout-*.css` → served via `CARDCOM_CHECKOUT_CSS_URL`.

### 3. Iframe UX (no full page reload)

- **בעבודה עם iframe שליחת Event לדף בית העסק** — CardCom `postMessage` to parent (optional; we use redirect + `anatome:cardcom-checkout` on success/fail pages).
- **טיפים ליציאה מאייפריים מדף הצלחה** — break out of iframe to full site after pay.

### 4. Testing

[מידע לביצוע טסטים](https://cardcomapi.zendesk.com/hc/he/articles/27008196694546):

- Terminal `1000`, API `CardTest1994`
- Card `4580280000000008`, exp `12/30`, CVV `123`
- Amount **&lt; ₪5000** = success simulation; **≥ ₪5000** = failure simulation

### 5. Step 3 – Do Transaction (token / direct interface)

[Step 3 (EN)](https://cardcomapi.zendesk.com/hc/he/articles/28452352778770) · [שלב 3 (HE)](https://cardcomapi.zendesk.com/hc/he/articles/28452352778770)  
`POST https://secure.cardcom.solutions/api/v11/Transactions/Transaction`

**Critical for AnatoMe (web app):**

| Use case | Allowed on WEB? | What we do |
|----------|-----------------|------------|
| First subscription / credit purchase | Use **Low Profile** (Step 1+2) only | `LowProfile/Create` + iframe |
| Charge saved token (renewal, admin “charge deferred”) | Yes — **token** path, not raw card | `chargeToken()` in `client.ts` ← `refunds.ts` `chargeDeferred` |
| Pass `CardNumber` + `CVV2` from our server/UI | **No** — “direct interface”, PCI on merchant; doc says **not for websites** | We do **not** implement this |
| Open Fields (שדות פתוחים) | Still Step 1+2 + field iframes | Not Step 3 |

CardCom’s rule: websites must use **Low Profile** (or Open Fields, which is still Low Profile). Step 3 with full card numbers is for native/closed systems with their own PCI.

**Our Step 3 usage today**

- `chargeToken` — after Step 1+2 created a token (`ChargeOnly` or `ChargeAndCreateToken` depending on `CARDCOM_OPERATION`).
- `cancelDocument` — refunds via `Documents/CancelDoc` (uses `ApiPassword`).
- **Token charges:** `ExternalUniqTranId` + `ExternalUniqUniqTranIdResponse: true` (swagger spelling) on admin deferred charge — keyed by `subscription-order:{orderId}`.

**Step 3 operations we might use later**

- `Advanced.ApprovalNumber` — charge a J5 hold from Step 1.
- `Advanced.MTI: 420` — release hold ([שיחרור מסגרת](https://cardcomapi.zendesk.com/hc/he/articles/26984290317714)).
- `Refund By Transaction Id` — separate article; partial/full refund.

**Models required (per CardCom)**

- Token charging: terminal **without CVV requirement** + Token model.
- Direct card: Direct interface model + merchant PCI — **not for AnatoMe web**.

### 6. Open Fields (שדות פתוחים) — **not in this Zendesk hub**

Marketing only: https://www.cardcom.solutions/developers  
Separate enablement + integration pack from CardCom support. See [cardcom-open-fields.md](./cardcom-open-fields.md).

## Category map (quick)

| Zendesk section | Use for AnatoMe |
|-----------------|-----------------|
| [פרופיל נמוך & אסימונים](https://cardcomapi.zendesk.com/hc/he/sections/25266567787922) | Subscriptions + credits checkout |
| [Transactions](https://cardcomapi.zendesk.com/hc/he/categories/25266511344146) | Refunds, list, query by id |
| [Documents](https://cardcomapi.zendesk.com/hc/he/categories/25266511344146) | Invoice URLs, cancel doc |
| [מקבץ מאמרי API](https://cardcomapi.zendesk.com/hc/he/sections/26955787963410) | Webhook, tests, CSS, iframe events |
| [ENGLISH API](https://cardcomapi.zendesk.com/hc/he/categories/25266511344146) | Same Step 1+2 / 3 in English |

## Checklist for CardCom support call

1. Enable **design 5+6 / LPC6** URLs on sandbox + production terminals (stop `lowProfileClearing/1000.aspx`).
2. Approve **`CSSUrl`** for our production origin (`/cardcom/checkout-*.css`).
3. Disable **PayPal / Bit / Google Pay** on Low Profile if we only want card (terminal settings).
4. Enable **Open Fields** + send technical integration doc (field iframes + manager iframe + 3DS script).
5. Confirm **“תמיד בצע דיווח של עסקה”** for declined transactions (webhook settings).

Phone (developers): **03-9436100**
