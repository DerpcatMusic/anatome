import { Resend, type ResendOptions } from "@convex-dev/resend";
import { components, internal } from "../_generated/api";
import { isResendTestMode } from "../lib/email";

function resendOptions(): ResendOptions {
  return {
    testMode: isResendTestMode(),
    onEmailEvent: internal.email.resendEvents.onResendEmailEvent,
  };
}

/**
 * Fresh Resend client so `testMode` and env vars are read per send, not cached
 * from an isolate that warmed before `FRONTEND_URL` / `RESEND_TEST_MODE` changed.
 */
export function createResendClient(): Resend {
  return new Resend(components.resend, resendOptions());
}

/** Used by the HTTP webhook route (testMode does not affect webhook handling). */
export const resend = createResendClient();
