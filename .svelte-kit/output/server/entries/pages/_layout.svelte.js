import { Q as attr, et as escape_html } from "../../chunks/dev.js";
import { a as signOut, g as useConvexClient, h as setupConvex, r as initAuth, v as PUBLIC_CONVEX_CLIENT_URL } from "../../chunks/session.svelte.js";
import { t as Button } from "../../chunks/button.js";
import { t as theme } from "../../chunks/theme.svelte.js";
//#region src/lib/components/layout/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		function openAuth() {
			window.dispatchEvent(new CustomEvent("homebody:auth-open"));
		}
		$$renderer.push(`<nav class="navbar svelte-1n8e4t1" aria-label="ניווט ראשי"><div class="navbar__inner svelte-1n8e4t1"><a class="navbar__brand svelte-1n8e4t1" href="/"><span class="navbar__logo svelte-1n8e4t1">HomeBody</span> <span class="navbar__divider svelte-1n8e4t1">/</span> <span class="navbar__tagline svelte-1n8e4t1">פילאטיס בבית</span></a> <div class="navbar__actions svelte-1n8e4t1"><button type="button" class="navbar__theme svelte-1n8e4t1"${attr("title", theme.value === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה")}${attr("aria-label", theme.value === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה")}><span class="material-symbols-rounded svelte-1n8e4t1">${escape_html(theme.value === "dark" ? "light_mode" : "dark_mode")}</span></button> `);
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="navbar__status svelte-1n8e4t1">טוען...</span>`);
		} else if (auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			Button($$renderer, {
				class: "hb-button hb-button--sky hb-button--sm",
				type: "button",
				onclick: () => window.location.assign("/u/dashboard"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->אזור אישי`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button($$renderer, {
				class: "hb-button hb-button--paper hb-button--sm",
				type: "button",
				onclick: signOut,
				children: ($$renderer) => {
					$$renderer.push(`<!---->יציאה`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			Button($$renderer, {
				class: "hb-button hb-button--ink hb-button--sm",
				type: "button",
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
