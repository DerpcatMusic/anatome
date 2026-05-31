import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { isStaff, requireAppProfile, requireCustomer } from "./authz";

export async function requireSelfServeBillingCustomer(
  ctx: MutationCtx,
  userId: Id<"users">,
  staffMessage: string,
) {
  const profile = await requireAppProfile(ctx, userId);
  if (isStaff(profile)) {
    throw new Error(staffMessage);
  }
  requireCustomer(profile);
  return profile;
}
