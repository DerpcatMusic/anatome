import { a as bind_props, i as attributes, o as derived, s as element } from "./dev.js";
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
//#region src/lib/components/ui/Button.svelte
function Button_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type = "button", tone = "paper", size = "md", href, disabled = false, onclick, class: className = "", children } = $$props;
		const classes = derived(() => `hb-button hb-button--${tone} hb-button--${size} ${className}`.trim());
		if (href) {
			$$renderer.push("<!--[0-->");
			if (Button) {
				$$renderer.push("<!--[-->");
				Button($$renderer, {
					class: classes(),
					href,
					disabled,
					onclick,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		} else {
			$$renderer.push("<!--[-1-->");
			if (Button) {
				$$renderer.push("<!--[-->");
				Button($$renderer, {
					class: classes(),
					type,
					disabled,
					onclick,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { Button_1 as t };
