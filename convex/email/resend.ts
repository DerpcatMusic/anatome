import { Resend } from "@convex-dev/resend";
import { components } from "../_generated/api";
import { isResendTestMode } from "../lib/email";

export const resend = new Resend(components.resend, {
  testMode: isResendTestMode(),
});
