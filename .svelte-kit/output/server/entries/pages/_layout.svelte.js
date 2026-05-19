import { U as attr } from "../../chunks/dev.js";
import { n as routePath } from "../../chunks/context.js";
import { n as useConvexClient, t as setupConvex } from "../../chunks/client.svelte.js";
import { r as initAuth } from "../../chunks/session.svelte.js";
//#region \0virtual:env/static/public
/** @type {import('$env/static/public').PUBLIC_CONVEX_CLIENT_URL} */
var PUBLIC_CONVEX_CLIENT_URL = "https://honorable-woodpecker-450.eu-west-1.convex.cloud";
//#endregion
//#region src/lib/components/layout/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		$$renderer.push(`<nav class="navbar svelte-1n8e4t1" aria-label="ניווט ראשי"><div class="navbar__inner svelte-1n8e4t1"><a class="navbar__brand svelte-1n8e4t1" href="/"><span class="navbar__logo svelte-1n8e4t1">HomeBody</span> <span class="navbar__divider svelte-1n8e4t1">/</span> <span class="navbar__tagline svelte-1n8e4t1">פילאטיס בבית</span></a> <div class="navbar__actions svelte-1n8e4t1">`);
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="navbar__status svelte-1n8e4t1">טוען...</span>`);
		} else if (auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<a class="navbar__link navbar__link--primary svelte-1n8e4t1"${attr("href", routePath("dashboard"))}>אזור אישי</a> <button class="navbar__btn svelte-1n8e4t1" type="button">יציאה</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button class="navbar__btn navbar__btn--primary svelte-1n8e4t1" type="button">כניסה</button>`);
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
