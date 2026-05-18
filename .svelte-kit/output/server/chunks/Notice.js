import { n as attr_class } from "./dev.js";
//#region src/components/ui/Notice.svelte
function Notice($$renderer, $$props) {
	let { tone = "neutral", children } = $$props;
	$$renderer.push(`<p${attr_class(`notice notice--${tone}`, "svelte-ofm8p3")}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></p>`);
}
//#endregion
export { Notice as t };
