import { resolveResendFromAddress } from "../lib/email";
import type { ActionCtx } from "../_generated/server";
import type { EmailId } from "@convex-dev/resend";
import { createResendClient } from "./resend";

export type AuthVerificationEmail = {
  to: string;
  code: string;
  magicLink: string;
  expiresAt: Date;
};

/** Email-safe palette aligned with `tokens.css` light theme. */
const EMAIL = {
  canvas: "#f9f6f4",
  card: "#ffffff",
  ink: "#3a322e",
  inkMuted: "#6f6560",
  border: "#e8e0d8",
  primary: "#c9487a",
  primaryFg: "#fffaf8",
  codeBg: "#f3eeea",
  codeDigit: "#2e2825",
} as const;

const FONT_STACK =
  "'Assistant', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

function formatExpiryHebrew(expiresAt: Date): string {
  return expiresAt.toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Six separate cells — readable in RTL clients without wide letter-spacing. */
function buildCodeCellsHtml(code: string): string {
  const digits = code.padStart(6, "0").slice(0, 6).split("");
  const cells = digits
    .map(
      (digit) => `<td style="width:44px;height:52px;text-align:center;vertical-align:middle;background:${EMAIL.codeBg};border:1px solid ${EMAIL.border};border-radius:10px;font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;color:${EMAIL.codeDigit};">${escapeHtml(digit)}</td>`,
    )
    .join(`<td style="width:8px;font-size:0;line-height:0;">&nbsp;</td>`);

  return `<table role="presentation" dir="ltr" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;border-collapse:separate;border-spacing:0;"><tr>${cells}</tr></table>`;
}

function buildAuthVerificationHtml(args: AuthVerificationEmail): string {
  const expiry = formatExpiryHebrew(args.expiresAt);
  const safeLink = escapeHtml(args.magicLink);

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:${EMAIL.canvas};font-family:${FONT_STACK};color:${EMAIL.ink};-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL.canvas};padding:36px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:${EMAIL.card};border:1px solid ${EMAIL.border};border-radius:16px;padding:36px 28px 32px;">
            <tr>
              <td style="text-align:center;">
                <p style="margin:0 0 20px;font-size:15px;font-weight:600;color:${EMAIL.primary};letter-spacing:0;">AnatoMe</p>
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.4;color:${EMAIL.ink};">הנה קוד הכניסה שלך</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:${EMAIL.inkMuted};max-width:360px;margin-left:auto;margin-right:auto;">הזיני את שש הספרות בדף הכניסה. הקוד תקף עד ${escapeHtml(expiry)}.</p>
                ${buildCodeCellsHtml(args.code)}
                <p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:${EMAIL.inkMuted};">רוצה בלי להקליד? לחצי להתחברות מהירה:</p>
                <p style="margin:0 0 28px;">
                  <a href="${safeLink}" style="display:inline-block;background:${EMAIL.primary};color:${EMAIL.primaryFg};text-decoration:none;padding:13px 26px;border-radius:999px;font-size:15px;font-weight:600;font-family:${FONT_STACK};">התחברות מהירה</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.55;color:${EMAIL.inkMuted};">לא ביקשת מייל כזה? אפשר להתעלם — לא יקרה כלום.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildAuthVerificationText(args: AuthVerificationEmail): string {
  const expiry = formatExpiryHebrew(args.expiresAt);
  return [
    "AnatoMe — קוד הכניסה שלך",
    "",
    `קוד: ${args.code}`,
    `תקף עד ${expiry}.`,
    "",
    "הזיני את הקוד בדף הכניסה, או השתמשי בקישור להתחברות מהירה:",
    args.magicLink,
    "",
    "לא ביקשת מייל כזה? אפשר להתעלם.",
  ].join("\n");
}

export async function sendAuthVerificationEmail(
  ctx: Pick<ActionCtx, "runMutation">,
  args: AuthVerificationEmail,
): Promise<EmailId> {
  return await createResendClient().sendEmail(ctx, {
    from: resolveResendFromAddress(),
    to: args.to,
    subject: "קוד הכניסה שלך ל-AnatoMe",
    html: buildAuthVerificationHtml(args),
    text: buildAuthVerificationText(args),
  });
}
