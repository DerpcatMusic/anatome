import { nt as escape_html } from "./dev.js";
import { t as Notice } from "./Notice.js";
//#region src/lib/features/app/components/PageShell.svelte
function PageShell($$renderer, $$props) {
	let { kicker, title, description, badge, headerExtra, loading, error, children } = $$props;
	$$renderer.push(`<div class="page-shell svelte-1c9cbyf"><div class="page-shell__header svelte-1c9cbyf"><div class="page-shell__title-group svelte-1c9cbyf">`);
	if (kicker) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="kicker svelte-1c9cbyf">${escape_html(kicker)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <div class="title-row svelte-1c9cbyf"><h1 class="svelte-1c9cbyf">${escape_html(title)}</h1> `);
	if (badge) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<span class="badge svelte-1c9cbyf">${escape_html(badge)}</span>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div></div> `);
	if (headerExtra) {
		$$renderer.push("<!--[0-->");
		headerExtra($$renderer);
		$$renderer.push(`<!---->`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div> `);
	if (description) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="description svelte-1c9cbyf">${escape_html(description)}</p>`);
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
		$$renderer.push(`<div class="skeleton-state svelte-1c9cbyf"><div class="skeleton skeleton--lg svelte-1c9cbyf"></div> <div class="skeleton svelte-1c9cbyf"></div> <div class="skeleton svelte-1c9cbyf"></div></div>`);
	} else {
		$$renderer.push("<!--[-1-->");
		children($$renderer);
		$$renderer.push(`<!---->`);
	}
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { PageShell as t };
