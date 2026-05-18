import { resource } from "runed";
import { authQuery, initAuth } from "../auth/session.svelte";
import type { FunctionReference } from "convex/server";

export function useAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
  options: { initialValue?: Query["_returnType"] | null } = {}
) {
  const auth = initAuth();

  return resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return options.initialValue ?? null;
      return await authQuery(query, args);
    },
    { initialValue: options.initialValue ?? null }
  );
}
