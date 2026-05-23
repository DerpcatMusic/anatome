import { et as escape_html } from "../../../chunks/dev.js";
import { g as useConvexClient } from "../../../chunks/session.svelte.js";
//#region src/lib/features/auth/components/CallbackHandler.svelte
function CallbackHandler($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = "מעבירים אותך...";
		useConvexClient();
		$$renderer.push(`<div class="callback svelte-194dfrm">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<p class="message svelte-194dfrm">${escape_html(message)}</p>`);
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
