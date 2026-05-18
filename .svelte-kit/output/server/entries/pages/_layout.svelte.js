import "../../chunks/index-server.js";
import { it as setContext, nt as getContext } from "../../chunks/dev.js";
import { r as initAuth } from "../../chunks/session.svelte.js";
import { ConvexClient } from "convex/browser";
//#region \0virtual:env/static/public
/** @type {import('$env/static/public').PUBLIC_CONVEX_CLIENT_URL} */
var PUBLIC_CONVEX_CLIENT_URL = "https://honorable-woodpecker-450.eu-west-1.convex.cloud";
//#endregion
//#region node_modules/convex-svelte/dist/client.svelte.js
var _contextKey = "$$_convexClient";
var useConvexClient = () => {
	const client = getContext(_contextKey);
	if (!client) throw new Error("No ConvexClient was found in Svelte context. Did you forget to call setupConvex() in a parent component?");
	return client;
};
var setConvexClientContext = (client) => {
	setContext(_contextKey, client);
};
var setupConvex = (url, options = {}) => {
	if (!url || typeof url !== "string") throw new Error("Expected string url property for setupConvex");
	setConvexClientContext(new ConvexClient(url, {
		disabled: true,
		...options
	}));
};
//#endregion
//#region src/components/layout/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		$$renderer.push(`<nav class="navbar svelte-bwhq31" aria-label="ניווט ראשי"><div class="navbar__inner svelte-bwhq31"><a class="navbar__brand svelte-bwhq31" href="/"><span class="navbar__logo svelte-bwhq31">HomeBody</span> <span class="navbar__divider svelte-bwhq31">/</span> <span class="navbar__tagline svelte-bwhq31">פילאטיס בבית</span></a> <div class="navbar__actions svelte-bwhq31">`);
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="navbar__status svelte-bwhq31">טוען...</span>`);
		} else if (auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<a class="navbar__link navbar__link--primary svelte-bwhq31" href="/dashboard">אזור אישי</a> <button class="navbar__btn svelte-bwhq31" type="button">יציאה</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button class="navbar__btn navbar__btn--primary svelte-bwhq31" type="button">כניסה</button>`);
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
