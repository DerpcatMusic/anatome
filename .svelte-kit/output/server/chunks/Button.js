import { H as attr, n as attr_class } from "./dev.js";
//#region src/components/ui/Button.svelte
function Button($$renderer, $$props) {
	let { type = "button", tone = "paper", disabled = false, onclick, children } = $$props;
	$$renderer.push(`<button${attr_class(`button button--${tone}`, "svelte-er4ugn")}${attr("type", type)}${attr("disabled", disabled, true)}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></button>`);
}
//#endregion
export { Button as t };
