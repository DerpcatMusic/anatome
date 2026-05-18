import { U as escape_html, o as ensure_array_like, r as attr_style } from "./dev.js";
//#region src/components/app/AppSkeleton.svelte
function AppSkeleton($$renderer, $$props) {
	let { title = true, lines = 2, width = "60%" } = $$props;
	$$renderer.push(`<div class="loading svelte-17fw4r4">`);
	if (title) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="skeleton skeleton--title svelte-17fw4r4"></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array = ensure_array_like(Array.from({ length: lines }));
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		each_array[i];
		$$renderer.push(`<div class="skeleton skeleton--text svelte-17fw4r4"${attr_style(i === lines - 1 ? `width: ${width};` : void 0)}></div>`);
	}
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
//#region src/components/app/AppLocked.svelte
function AppLocked($$renderer, $$props) {
	let { kicker = "HomeBody", title, subtitle, actions } = $$props;
	$$renderer.push(`<div class="locked svelte-uiem55"><p class="kicker svelte-uiem55">${escape_html(kicker)}</p> <h1 class="svelte-uiem55">${escape_html(title)}</h1> <p class="svelte-uiem55">${escape_html(subtitle)}</p> `);
	if (actions) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="locked__actions svelte-uiem55">`);
		actions($$renderer);
		$$renderer.push(`<!----></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { AppSkeleton as n, AppLocked as t };
