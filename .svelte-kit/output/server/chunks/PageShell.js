import { U as escape_html } from "./dev.js";
import { t as Notice } from "./Notice.js";
//#region src/components/app/PageShell.svelte
function PageShell($$renderer, $$props) {
	let { kicker, title, description, badge, headerExtra, loading, error, children } = $$props;
	$$renderer.push(`<div class="page-shell svelte-amudkf"><div class="page-shell__header svelte-amudkf"><div class="page-shell__title-group svelte-amudkf">`);
	if (kicker) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="kicker svelte-amudkf">${escape_html(kicker)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <h1 class="svelte-amudkf">${escape_html(title)}</h1></div> `);
	if (headerExtra) {
		$$renderer.push("<!--[0-->");
		headerExtra($$renderer);
		$$renderer.push(`<!---->`);
	} else if (badge) {
		$$renderer.push("<!--[1-->");
		$$renderer.push(`<span class="badge svelte-amudkf">${escape_html(badge)}</span>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div> `);
	if (description) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="description svelte-amudkf">${escape_html(description)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (error) {
		$$renderer.push("<!--[0-->");
		Notice($$renderer, {
			tone: "danger",
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(error)}`);
			},
			$$slots: { default: true }
		});
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (loading) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="skeleton-state svelte-amudkf"><div class="skeleton skeleton--lg svelte-amudkf"></div> <div class="skeleton svelte-amudkf"></div> <div class="skeleton svelte-amudkf"></div></div>`);
	} else {
		$$renderer.push("<!--[-1-->");
		children($$renderer);
		$$renderer.push(`<!---->`);
	}
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { PageShell as t };
