import "../../../../chunks/dev.js";
import { t as getAppContext } from "../../../../chunks/appContext.js";
import "../../../../chunks/navigation.js";
//#region src/routes/(app)/i/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const ctx = getAppContext();
		if (ctx.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="route-guard-skeleton svelte-1jgmxp0" aria-hidden="true"></div>`);
		} else if (ctx.role !== "customer") {
			$$renderer.push("<!--[1-->");
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _layout as default };
