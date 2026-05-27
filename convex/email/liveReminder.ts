import { resolveResendFromAddress } from "../lib/email";
import type { ActionCtx } from "../_generated/server";
import type { EmailId } from "@convex-dev/resend";
import { createResendClient } from "./resend";

export type LiveReminderEmail = {
  to: string;
  classTitle: string;
  startsAt: Date;
  kind: "day_before" | "thirty_minutes";
  roomUrl: string;
};

const EMAIL = {
  canvas: "#fbf9f4",
  card: "#fefefc",
  ink: "#18241b",
  inkMuted: "#566342",
  border: "#d8d4cb",
  primary: "#18241b",
  primaryFg: "#fbf9f4",
} as const;

const FONT_STACK =
  "'Assistant', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatClassTime(date: Date): string {
  return date.toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function subjectForKind(kind: LiveReminderEmail["kind"], classTitle: string): string {
  if (kind === "day_before") {
    return `מחר: ${classTitle} — AnatoMe`;
  }
  return `עוד 30 דקות: ${classTitle} — AnatoMe`;
}

function leadForKind(kind: LiveReminderEmail["kind"]): string {
  if (kind === "day_before") {
    return "תזכורת: מחר יש לך שיעור חי שמור.";
  }
  return "תזכורת: השיעור החי שלך מתחיל בעוד כ-30 דקות.";
}

function buildLiveReminderHtml(args: LiveReminderEmail): string {
  const when = formatClassTime(args.startsAt);
  const safeTitle = escapeHtml(args.classTitle);
  const safeLink = escapeHtml(args.roomUrl);
  const lead = escapeHtml(leadForKind(args.kind));

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:${EMAIL.canvas};font-family:${FONT_STACK};color:${EMAIL.ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL.canvas};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:440px;background:${EMAIL.card};border:1px solid ${EMAIL.border};border-radius:20px;padding:32px 24px;">
            <tr>
              <td style="text-align:center;">
                <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${EMAIL.inkMuted};">AnatoMe</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:${EMAIL.inkMuted};">${lead}</p>
                <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;">${safeTitle}</h1>
                <p style="margin:0 0 20px;font-size:15px;color:${EMAIL.inkMuted};">${escapeHtml(when)}</p>
                <a href="${safeLink}" style="display:inline-block;background:${EMAIL.primary};color:${EMAIL.primaryFg};text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;">כניסה לשיעור</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildLiveReminderText(args: LiveReminderEmail): string {
  return [
    "AnatoMe",
    leadForKind(args.kind),
    args.classTitle,
    formatClassTime(args.startsAt),
    args.roomUrl,
  ].join("\n");
}

export async function sendLiveReminderEmail(
  ctx: Pick<ActionCtx, "runMutation">,
  args: LiveReminderEmail,
): Promise<EmailId> {
  return await createResendClient().sendEmail(ctx, {
    from: resolveResendFromAddress(),
    to: args.to,
    subject: subjectForKind(args.kind, args.classTitle),
    html: buildLiveReminderHtml(args),
    text: buildLiveReminderText(args),
  });
}
