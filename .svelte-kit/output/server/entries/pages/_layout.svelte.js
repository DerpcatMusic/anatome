import "../../chunks/dev.js";
import { n as routePath } from "../../chunks/context.js";
import { a as signOut, d as setupConvex, f as useConvexClient, m as PUBLIC_CONVEX_CLIENT_URL, r as initAuth } from "../../chunks/session.svelte.js";
import { t as Button_1 } from "../../chunks/Button.js";
//#region src/lib/components/layout/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		function openAuth() {
			window.dispatchEvent(new CustomEvent("homebody:auth-open"));
		}
		$$renderer.push(`<nav class="navbar svelte-1n8e4t1" aria-label="ניווט ראשי"><div class="navbar__inner svelte-1n8e4t1"><a class="navbar__brand svelte-1n8e4t1" href="/"><span class="navbar__logo svelte-1n8e4t1">HomeBody</span> <span class="navbar__divider svelte-1n8e4t1">/</span> <span class="navbar__tagline svelte-1n8e4t1">פילאטיס בבית</span></a> <div class="navbar__actions svelte-1n8e4t1">`);
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="navbar__status svelte-1n8e4t1">טוען...</span>`);
		} else if (auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			Button_1($$renderer, {
				tone: "sky",
				size: "sm",
				onclick: () => window.location.assign(routePath("dashboard")),
				children: ($$renderer) => {
					$$renderer.push(`<!---->אזור אישי`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button_1($$renderer, {
				tone: "paper",
				size: "sm",
				onclick: signOut,
				children: ($$renderer) => {
					$$renderer.push(`<!---->יציאה`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			Button_1($$renderer, {
				tone: "ink",
				size: "sm",
				onclick: openAuth,
				children: ($$renderer) => {
					$$renderer.push(`<!---->כניסה`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></div></nav>`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		setupConvex(PUBLIC_CONVEX_CLIENT_URL);
		useConvexClient();
		Navbar($$renderer, {});
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}
//#endregion
export { _layout as default };
