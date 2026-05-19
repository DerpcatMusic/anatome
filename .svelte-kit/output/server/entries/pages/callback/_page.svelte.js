import { W as escape_html } from "../../../chunks/dev.js";
import { n as routePath } from "../../../chunks/context.js";
import { n as useConvexClient } from "../../../chunks/client.svelte.js";
import { o as storeTokens, s as api } from "../../../chunks/session.svelte.js";
//#region src/lib/features/auth/components/CallbackHandler.svelte
function CallbackHandler($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = "מעבירים אותך...";
		let error = "";
		const client = useConvexClient();
		async function handle() {
			const code = new URLSearchParams(window.location.search).get("code");
			if (!code) {
				window.location.replace("/");
				return;
			}
			try {
				storeTokens((await client.action(api.auth.signIn, {
					provider: "email",
					params: { code }
				})).tokens ?? null);
				window.location.assign(routePath("dashboard"));
			} catch (err) {
				console.error("Magic link failed:", err);
				error = "הקוד פג תוקף או כבר נוצל. נסי להתחבר שוב.";
				message = "";
				setTimeout(() => window.location.replace("/"), 3e3);
			}
		}
		handle();
		$$renderer.push(`<div class="callback svelte-194dfrm">`);
		if (error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="error svelte-194dfrm">${escape_html(error)}</p> <p class="sub svelte-194dfrm">מעבירים אותך חזרה...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="message svelte-194dfrm">${escape_html(message)}</p>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
//#region src/routes/callback/+page.svelte
function _page($$renderer) {
	$$renderer.push(`<main class="page-shell">`);
	CallbackHandler($$renderer, {});
	$$renderer.push(`<!----></main>`);
}
//#endregion
export { _page as default };
