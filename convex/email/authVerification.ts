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

/** Mindful Flow palette — matches `tokens.css` / design-context.md */
const EMAIL = {
  canvas: "#fbf9f4",
  card: "#fefefc",
  ink: "#18241b",
  inkMuted: "#566342",
  border: "#d8d4cb",
  primary: "#18241b",
  primaryFg: "#fbf9f4",
  codeBg: "#f3f1ec",
  codeDigit: "#18241b",
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

function buildCodeCellsHtml(code: string): string {
  const digits = code.padStart(6, "0").slice(0, 6).split("");
  const cells = digits
    .map(
      (digit) => `<td style="width:42px;height:50px;text-align:center;vertical-align:middle;background:${EMAIL.codeBg};border:1px solid ${EMAIL.border};border-radius:10px;font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;color:${EMAIL.codeDigit};">${escapeHtml(digit)}</td>`,
    )
    .join(`<td style="width:6px;font-size:0;line-height:0;">&nbsp;</td>`);

  return `<table role="presentation" dir="ltr" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;border-collapse:separate;"><tr>${cells}</tr></table>`;
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
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:${EMAIL.canvas};font-family:${FONT_STACK};color:${EMAIL.ink};-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL.canvas};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:440px;background:${EMAIL.card};border:1px solid ${EMAIL.border};border-radius:20px;padding:32px 24px 28px;box-shadow:0 24px 48px -32px rgba(24,36,27,0.18);">
            <tr>
              <td style="text-align:center;">
                <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:${EMAIL.inkMuted};">AnatoMe</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:${EMAIL.inkMuted};">תקף עד ${escapeHtml(expiry)}</p>
                ${buildCodeCellsHtml(args.code)}
                <p style="margin:0 0 16px;">
                  <a href="${safeLink}" style="display:inline-block;background:${EMAIL.primary};color:${EMAIL.primaryFg};text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;font-family:${FONT_STACK};">כניסה בלחיצה</a>
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL.inkMuted};">לא ביקשת? התעלמי.</p>
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
    "AnatoMe",
    `קוד: ${args.code}`,
    `תקף עד ${expiry}`,
    args.magicLink,
    "",
    "לא ביקשת? התעלמי.",
  ].join("\n");
}

export async function sendAuthVerificationEmail(
  ctx: Pick<ActionCtx, "runMutation">,
  args: AuthVerificationEmail,
): Promise<EmailId> {
  return await createResendClient().sendEmail(ctx, {
    from: resolveResendFromAddress(),
    to: args.to,
    subject: "קוד כניסה — AnatoMe",
    html: buildAuthVerificationHtml(args),
    text: buildAuthVerificationText(args),
  });
}
