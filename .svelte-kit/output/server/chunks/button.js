import { a as bind_props, i as attributes, s as element } from "./dev.js";
//#region node_modules/bits-ui/dist/bits/button/components/button.svelte
function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { href, type, children, disabled = false, ref = null, $$slots, $$events, ...restProps } = $$props;
		element($$renderer, href ? "a" : "button", () => {
			$$renderer.push(`${attributes({
				"data-button-root": true,
				type: href ? void 0 : type,
				href: href && !disabled ? href : void 0,
				disabled: href ? void 0 : disabled,
				"aria-disabled": href ? disabled : void 0,
				role: href && disabled ? "link" : void 0,
				tabindex: href && disabled ? -1 : 0,
				...restProps
			})}`);
		}, () => {
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		});
		bind_props($$props, { ref });
	});
}
//#endregion
export { Button as t };
