import "./dev.js";
import { r as initAuth, s as resource, t as authQuery } from "./session.svelte.js";
//#region src/lib/convex/useAuthQuery.svelte.ts
function useAuthQuery(query, args, options = {}) {
	const auth = initAuth();
	return resource(() => auth.isAuthenticated, async (isAuthenticated) => {
		if (!isAuthenticated) return options.initialValue ?? null;
		return await authQuery(query, args);
	}, { initialValue: options.initialValue ?? null });
}
//#endregion
export { useAuthQuery as t };
