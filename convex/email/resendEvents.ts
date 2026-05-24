import { vOnEmailEventArgs } from "@convex-dev/resend";
import { components } from "../_generated/api";
import { internalMutation } from "../_generated/server";

/**
 * Logs Resend delivery lifecycle events. Check Convex prod logs for
 * `permanent_failure` from the component if sends fail after sign-in succeeds.
 */
export const onResendEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (ctx, { id, event }) => {
    const status = await ctx.runQuery(components.resend.lib.getStatus, {
      emailId: id,
    });
    console.log(
      JSON.stringify({
        source: "resend",
        emailId: id,
        eventType: event.type,
        status: status?.status ?? "unknown",
        failed: status?.failed ?? false,
        bounced: status?.bounced ?? false,
        errorMessage: status?.errorMessage ?? null,
      }),
    );
  },
});
