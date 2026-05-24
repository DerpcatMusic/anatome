import { resolveResendFromAddress } from "../lib/email";
import type { ActionCtx } from "../_generated/server";
import { resend } from "./resend";

export type AuthVerificationEmail = {
  to: string;
  code: string;
  magicLink: string;
  expiresAt: Date;
};

function formatExpiryHebrew(expiresAt: Date): string {
  return expiresAt.toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function buildAuthVerificationHtml(args: AuthVerificationEmail): string {
  const expiry = formatExpiryHebrew(args.expiresAt);
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
  <body style="margin:0;padding:0;background:#f6f3ef;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e7dfd4;border-radius:12px;padding:32px 28px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a6f62;">AnatoMe</p>
                <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:1.35;">קוד הכניסה שלך</h1>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">הזיני את הקוד הבן 6 ספרות באתר, או לחצי על הקישור להתחברות מהירה.</p>
                <p style="margin:0 0 24px;font-size:32px;font-weight:700;letter-spacing:0.28em;text-align:center;">${args.code}</p>
                <p style="margin:0 0 24px;text-align:center;">
                  <a href="${args.magicLink}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">להתחברות ל-AnatoMe</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.5;color:#5c534a;">הקוד והקישור תקפים עד ${expiry}. אם לא ביקשת מייל זה, אפשר להתעלם ממנו.</p>
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
    `קישור: ${args.magicLink}`,
    "",
    `תוקף עד ${expiry}.`,
    "אם לא ביקשת מייל זה, אפשר להתעלם ממנו.",
  ].join("\n");
}

export async function sendAuthVerificationEmail(
  ctx: Pick<ActionCtx, "runMutation">,
  args: AuthVerificationEmail,
): Promise<void> {
  await resend.sendEmail(ctx, {
    from: resolveResendFromAddress(),
    to: args.to,
    subject: "קוד הכניסה שלך ל-AnatoMe",
    html: buildAuthVerificationHtml(args),
    text: buildAuthVerificationText(args),
  });
}
