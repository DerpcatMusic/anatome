import { U as escape_html } from "../../../chunks/dev.js";
import { a as verifyMagicLinkCode } from "../../../chunks/session.svelte.js";
//#region src/components/auth/CallbackHandler.svelte
function CallbackHandler($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = "מעבירים אותך...";
		let error = "";
		async function handle() {
			const code = new URLSearchParams(window.location.search).get("code");
			if (!code) {
				window.location.replace("/");
				return;
			}
			try {
				await verifyMagicLinkCode(code);
			} catch (err) {
				console.error("Magic link failed:", err);
				error = "הקוד פג תוקף או כבר נוצל. נסי להתחבר שוב.";
				message = "";
				setTimeout(() => window.location.replace("/"), 3e3);
			}
		}
		handle();
		$$renderer.push(`<div class="callback svelte-a7h300">`);
		if (error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="error svelte-a7h300">${escape_html(error)}</p> <p class="sub svelte-a7h300">מעבירים אותך חזרה...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="message svelte-a7h300">${escape_html(message)}</p>`);
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
