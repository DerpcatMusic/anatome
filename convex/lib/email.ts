/** Verified sending domain: anatome.dolmengatemedia.com (Resend subdomain). */
export const RESEND_SENDING_DOMAIN = "anatome.dolmengatemedia.com";

export const DEFAULT_RESEND_FROM = `AnatoMe <noreply@${RESEND_SENDING_DOMAIN}>`;

export function resolveResendFromAddress(): string {
  const configured = process.env.RESEND_FROM?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_RESEND_FROM;
}

/** When true, Resend only delivers to test inboxes (delivered@resend.dev, etc.). */
export function isResendTestMode(): boolean {
  const flag = process.env.RESEND_TEST_MODE?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;

  const frontendUrl = process.env.FRONTEND_URL ?? "";
  return /localhost|127\.0\.0\.1/.test(frontendUrl);
}
