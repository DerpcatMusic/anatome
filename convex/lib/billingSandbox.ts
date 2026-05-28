/**
 * Enable subscription checkout in dev/sandbox deployments only.
 * Production stays off until BILLING_SANDBOX_ENABLED is not used there.
 */
export function isBillingSandboxEnabled(): boolean {
  const override = process.env.BILLING_SANDBOX_ENABLED?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;

  const deployment = process.env.CONVEX_DEPLOYMENT?.trim() ?? "";
  if (deployment.length === 0) return true;

  return /(^dev$|dev[-_:]|[-_]dev|staging|preview|local|sandbox)/i.test(deployment);
}
