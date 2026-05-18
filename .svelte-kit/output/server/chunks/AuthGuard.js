import { a as derived } from "./dev.js";
import { n as getCachedRole, r as initAuth } from "./session.svelte.js";
import { n as AppSkeleton, t as AppLocked } from "./AppLocked.js";
//#region src/components/app/AuthGuard.svelte
function AuthGuard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { role, children } = $$props;
		const auth = initAuth();
		const cachedRole = derived(getCachedRole);
		const isAuthorized = derived(() => {
			if (!auth.isAuthenticated) return false;
			if (!role) return true;
			const r = cachedRole();
			if (r === null) return true;
			if (role === "admin") return r === "admin";
			if (role === "instructor") return r === "instructor" || r === "admin";
			return true;
		});
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			AppSkeleton($$renderer, {});
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			{
				function actions($$renderer) {
					$$renderer.push(`<a href="/">כניסה</a>`);
				}
				AppLocked($$renderer, {
					title: "צריך להתחבר",
					subtitle: auth.error || "החשבון נעול. נכנסים מחדש דרך העמוד הראשי.",
					actions,
					$$slots: { actions: true }
				});
			}
		} else if (!isAuthorized()) {
			$$renderer.push("<!--[2-->");
			AppLocked($$renderer, {
				title: "אין הרשאה",
				subtitle: "אין לך גישה לעמוד הזה."
			});
		} else {
			$$renderer.push("<!--[-1-->");
			children($$renderer);
			$$renderer.push(`<!---->`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { AuthGuard as t };
