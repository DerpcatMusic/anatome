/** Default From domain — must match a domain verified in Resend. */
export const RESEND_SENDING_DOMAIN = "dolmengatemedia.com";

export const DEFAULT_RESEND_FROM = `AnatoMe <noreply@${RESEND_SENDING_DOMAIN}>`;

/** Unverified on Resend free tier — remap to {@link RESEND_SENDING_DOMAIN}. */
const LEGACY_RESEND_FROM_DOMAIN = "anatome.dolmengatemedia.com";

export function resolveResendFromAddress(): string {
  const configured = process.env.RESEND_FROM?.trim();
  const from = configured && configured.length > 0 ? configured : DEFAULT_RESEND_FROM;
  if (!from.includes(LEGACY_RESEND_FROM_DOMAIN)) {
    return from;
  }
  return from.replaceAll(LEGACY_RESEND_FROM_DOMAIN, RESEND_SENDING_DOMAIN);
}

/**
 * When true, the Resend component only accepts @resend.dev test inboxes.
 * Matches @convex-dev/resend default (test mode on) for local frontends only.
 */
export function isResendTestMode(): boolean {
  const flag = process.env.RESEND_TEST_MODE?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;

  const frontendUrl = process.env.FRONTEND_URL?.trim() ?? "";
  if (!frontendUrl) {
    // No public URL configured — stay in test mode (safe default).
    return true;
  }
  return /localhost|127\.0\.0\.1/i.test(frontendUrl);
}
