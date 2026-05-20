import { R as writable, a as bind_props, c as ensure_array_like, et as attr, f as spread_props, h as unsubscribe_stores, i as attributes, m as stringify, n as attr_class, nt as escape_html, o as derived, p as store_get, r as attr_style, u as props_id } from "./dev.js";
import { c as resource, f as useConvexClient, l as SvelteMap, p as useQuery, r as initAuth, s as api, t as authQuery } from "./session.svelte.js";
import { G as watch, I as boolToTrueOrUndef, J as attachRef, L as createBitsAttrs, N as boolToEmptyStrOrUndef, P as boolToStr, X as raf, Y as loop, Z as mergeProps, at as boxWith, c as createId, l as noop, q as Context } from "./arrays.js";
import { t as RovingFocusGroup } from "./roving-focus-group.js";
import { c as MenuItemState, l as MenuMenuState, o as DropdownMenuTriggerState, p as Portal, s as MenuContentState, u as MenuRootState } from "./scroll-lock.js";
import { a as getFloatingContentCSSVars, i as Floating_layer, n as Popper_layer, r as Floating_layer_anchor, t as Popper_layer_force_mount } from "./popper-layer-force-mount.js";
import { a as DialogTitleState, i as DialogCloseState, n as Dialog, r as Dialog_overlay, t as Dialog_content } from "./dialog-content.js";
import { t as Button_1 } from "./Button.js";
import { t as RadioGroup_1 } from "./RadioGroup.js";
import "./Select.js";
import { t as ScrollArea_1 } from "./ScrollArea.js";
import { t as Notice } from "./Notice.js";
import { t as PageShell } from "./PageShell.js";
import { i as equipmentLabel, r as durationLabel } from "./labels.js";
import { t as EquipmentPicker } from "./EquipmentPicker.js";
//#region node_modules/bits-ui/dist/bits/dialog/components/dialog-title.svelte
function Dialog_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, child, children, level = 2, $$slots, $$events, ...restProps } = $$props;
		const titleState = DialogTitleState.create({
			id: boxWith(() => id),
			level: boxWith(() => level),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, titleState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/aspect-ratio/aspect-ratio.svelte.js
var aspectRatioAttrs = createBitsAttrs({
	component: "aspect-ratio",
	parts: ["root"]
});
var AspectRatioRootState = class AspectRatioRootState {
	static create(opts) {
		return new AspectRatioRootState(opts);
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		style: {
			position: "absolute",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		[aspectRatioAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/aspect-ratio/components/aspect-ratio.svelte
function Aspect_ratio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { ref = null, id = createId(uid), ratio = 1, children, child, $$slots, $$events, ...restProps } = $$props;
		const rootState = AspectRatioRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			ratio: boxWith(() => ratio)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		$$renderer.push(`<div${attr_style("", {
			position: "relative",
			width: "100%",
			"padding-bottom": `${stringify(ratio ? 100 / ratio : 0)}%`
		})}>`);
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/components/menu-item.svelte
function Menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, ref = null, id = createId(uid), disabled = false, onSelect = noop, closeOnSelect = true, $$slots, $$events, ...restProps } = $$props;
		const itemState = MenuItemState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			onSelect: boxWith(() => onSelect),
			ref: boxWith(() => ref, (v) => ref = v),
			closeOnSelect: boxWith(() => closeOnSelect)
		});
		const mergedProps = derived(() => mergeProps(restProps, itemState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/dialog/components/dialog-close.svelte
function Dialog_close($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, disabled = false, $$slots, $$events, ...restProps } = $$props;
		const closeState = DialogCloseState.create({
			variant: boxWith(() => "close"),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled))
		});
		const mergedProps = derived(() => mergeProps(restProps, closeState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/components/menu.svelte
function Menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, dir = "ltr", onOpenChange = noop, onOpenChangeComplete = noop, _internal_variant: variant = "dropdown-menu", _internal_should_skip_exit_animation: shouldSkipExitAnimation = void 0, children } = $$props;
		const root = MenuRootState.create({
			variant: boxWith(() => variant),
			dir: boxWith(() => dir),
			onClose: () => {
				open = false;
				onOpenChange(false);
			},
			shouldSkipExitAnimation: () => shouldSkipExitAnimation?.() ?? false
		});
		MenuMenuState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		}, root);
		Floating_layer($$renderer, {
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		bind_props($$props, { open });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/dropdown-menu/components/dropdown-menu-content.svelte
function Dropdown_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), child, children, ref = null, loop = true, onInteractOutside = noop, onEscapeKeydown = noop, onCloseAutoFocus = noop, forceMount = false, trapFocus = false, style, $$slots, $$events, ...restProps } = $$props;
		const contentState = MenuContentState.create({
			id: boxWith(() => id),
			loop: boxWith(() => loop),
			ref: boxWith(() => ref, (v) => ref = v),
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		function handleInteractOutside(e) {
			contentState.handleInteractOutside(e);
			if (e.defaultPrevented) return;
			onInteractOutside(e);
			if (e.defaultPrevented) return;
			if (e.target && e.target instanceof Element) {
				const subContentSelector = `[${contentState.parentMenu.root.getBitsAttr("sub-content")}]`;
				if (e.target.closest(subContentSelector)) return;
			}
			contentState.parentMenu.onClose();
		}
		function handleEscapeKeydown(e) {
			onEscapeKeydown(e);
			if (e.defaultPrevented) return;
			contentState.parentMenu.onClose();
		}
		if (forceMount) {
			$$renderer.push("<!--[0-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") }, { style });
					if (child) {
						$$renderer.push("<!--[0-->");
						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...contentState.snippetProps
						});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				Popper_layer_force_mount($$renderer, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						enabled: contentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						trapFocus,
						loop,
						forceMount: true,
						id,
						shouldRender: contentState.shouldRender,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push("<!--[1-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") }, { style });
					if (child) {
						$$renderer.push("<!--[0-->");
						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...contentState.snippetProps
						});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				Popper_layer($$renderer, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						open: contentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						trapFocus,
						loop,
						forceMount: false,
						id,
						shouldRender: contentState.shouldRender,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/components/menu-trigger.svelte
function Menu_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, child, children, disabled = false, type = "button", $$slots, $$events, ...restProps } = $$props;
		const triggerState = DropdownMenuTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
		Floating_layer_anchor($$renderer, {
			id,
			ref: triggerState.opts.ref,
			children: ($$renderer) => {
				if (child) {
					$$renderer.push("<!--[0-->");
					child($$renderer, { props: mergedProps() });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></button>`);
				}
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/progress/progress.svelte.js
var progressAttrs = createBitsAttrs({
	component: "progress",
	parts: ["root"]
});
var ProgressRootState = class ProgressRootState {
	static create(opts) {
		return new ProgressRootState(opts);
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		role: "progressbar",
		value: this.opts.value.current,
		"aria-valuemin": this.opts.min.current,
		"aria-valuemax": this.opts.max.current,
		"aria-valuenow": this.opts.value.current === null ? void 0 : this.opts.value.current,
		"data-value": this.opts.value.current === null ? void 0 : this.opts.value.current,
		"data-state": getProgressDataState(this.opts.value.current, this.opts.max.current),
		"data-max": this.opts.max.current,
		"data-min": this.opts.min.current,
		"data-indeterminate": this.opts.value.current === null ? "" : void 0,
		[progressAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getProgressDataState(value, max) {
	if (value === null) return "indeterminate";
	return value === max ? "loaded" : "loading";
}
//#endregion
//#region node_modules/bits-ui/dist/bits/progress/components/progress.svelte
function Progress($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, value = 0, max = 100, min = 0, id = createId(uid), ref = null, $$slots, $$events, ...restProps } = $$props;
		const rootState = ProgressRootState.create({
			value: boxWith(() => value),
			max: boxWith(() => max),
			min: boxWith(() => min),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tabs/tabs.svelte.js
var tabsAttrs = createBitsAttrs({
	component: "tabs",
	parts: [
		"root",
		"list",
		"trigger",
		"content"
	]
});
var TabsRootContext = new Context("Tabs.Root");
var TabsRootState = class TabsRootState {
	static create(opts) {
		return TabsRootContext.set(new TabsRootState(opts));
	}
	opts;
	attachment;
	rovingFocusGroup;
	triggerIds = [];
	valueToTriggerId = new SvelteMap();
	valueToContentId = new SvelteMap();
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(opts.ref);
		this.rovingFocusGroup = new RovingFocusGroup({
			candidateAttr: tabsAttrs.trigger,
			rootNode: this.opts.ref,
			loop: this.opts.loop,
			orientation: this.opts.orientation
		});
	}
	registerTrigger(id, value) {
		this.triggerIds.push(id);
		this.valueToTriggerId.set(value, id);
		return () => {
			this.triggerIds = this.triggerIds.filter((triggerId) => triggerId !== id);
			this.valueToTriggerId.delete(value);
		};
	}
	registerContent(id, value) {
		this.valueToContentId.set(value, id);
		return () => {
			this.valueToContentId.delete(value);
		};
	}
	setValue(v) {
		this.opts.value.current = v;
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-orientation": this.opts.orientation.current,
		[tabsAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TabsListState = class TabsListState {
	static create(opts) {
		return new TabsListState(opts, TabsRootContext.get());
	}
	opts;
	root;
	attachment;
	#isDisabled = derived(() => this.root.opts.disabled.current);
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "tablist",
		"aria-orientation": this.root.opts.orientation.current,
		"data-orientation": this.root.opts.orientation.current,
		[tabsAttrs.list]: "",
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TabsTriggerState = class TabsTriggerState {
	static create(opts) {
		return new TabsTriggerState(opts, TabsRootContext.get());
	}
	opts;
	root;
	attachment;
	#tabIndex = 0;
	#isActive = derived(() => this.root.opts.value.current === this.opts.value.current);
	#isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#ariaControls = derived(() => this.root.valueToContentId.get(this.opts.value.current));
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
		watch([() => this.opts.id.current, () => this.opts.value.current], ([id, value]) => {
			return this.root.registerTrigger(id, value);
		});
		this.onfocus = this.onfocus.bind(this);
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
	}
	#activate() {
		if (this.root.opts.value.current === this.opts.value.current) return;
		this.root.setValue(this.opts.value.current);
	}
	onfocus(_) {
		if (this.root.opts.activationMode.current !== "automatic" || this.#isDisabled()) return;
		this.#activate();
	}
	onclick(_) {
		if (this.#isDisabled()) return;
		this.#activate();
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault();
			this.#activate();
			return;
		}
		this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "tab",
		"data-state": getTabDataState(this.#isActive()),
		"data-value": this.opts.value.current,
		"data-orientation": this.root.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		"aria-selected": boolToStr(this.#isActive()),
		"aria-controls": this.#ariaControls(),
		[tabsAttrs.trigger]: "",
		disabled: boolToTrueOrUndef(this.#isDisabled()),
		tabindex: this.#tabIndex,
		onclick: this.onclick,
		onfocus: this.onfocus,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TabsContentState = class TabsContentState {
	static create(opts) {
		return new TabsContentState(opts, TabsRootContext.get());
	}
	opts;
	root;
	attachment;
	#isActive = derived(() => this.root.opts.value.current === this.opts.value.current);
	#ariaLabelledBy = derived(() => this.root.valueToTriggerId.get(this.opts.value.current));
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
		watch([() => this.opts.id.current, () => this.opts.value.current], ([id, value]) => {
			return this.root.registerContent(id, value);
		});
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "tabpanel",
		hidden: boolToTrueOrUndef(!this.#isActive()),
		tabindex: 0,
		"data-value": this.opts.value.current,
		"data-state": getTabDataState(this.#isActive()),
		"aria-labelledby": this.#ariaLabelledBy(),
		"data-orientation": this.root.opts.orientation.current,
		[tabsAttrs.content]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getTabDataState(condition) {
	return condition ? "active" : "inactive";
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tabs/components/tabs.svelte
function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, value = "", onValueChange = noop, orientation = "horizontal", loop = true, activationMode = "automatic", disabled = false, children, child, $$slots, $$events, ...restProps } = $$props;
		const rootState = TabsRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			orientation: boxWith(() => orientation),
			loop: boxWith(() => loop),
			activationMode: boxWith(() => activationMode),
			disabled: boxWith(() => disabled),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			ref,
			value
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tabs/components/tabs-content.svelte
function Tabs_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, value, $$slots, $$events, ...restProps } = $$props;
		const contentState = TabsContentState.create({
			value: boxWith(() => value),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tabs/components/tabs-list.svelte
function Tabs_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, id = createId(uid), ref = null, $$slots, $$events, ...restProps } = $$props;
		const listState = TabsListState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, listState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tabs/components/tabs-trigger.svelte
function Tabs_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, disabled = false, id = createId(uid), type = "button", value, ref = null, $$slots, $$events, ...restProps } = $$props;
		const triggerState = TabsTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			value: boxWith(() => value),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/svelte/src/motion/utils.js
/**
* @param {any} obj
* @returns {obj is Date}
*/
function is_date(obj) {
	return Object.prototype.toString.call(obj) === "[object Date]";
}
//#endregion
//#region node_modules/svelte/src/motion/spring.js
/** @import { Task } from '#client' */
/** @import { TickContext } from './private.js' */
/** @import { Spring as SpringStore, SpringOptions, SpringUpdateOptions } from './public.js' */
/**
* @template T
* @param {TickContext} ctx
* @param {T} last_value
* @param {T} current_value
* @param {T} target_value
* @returns {T}
*/
function tick_spring(ctx, last_value, current_value, target_value) {
	if (typeof current_value === "number" || is_date(current_value)) {
		const delta = target_value - current_value;
		const velocity = (current_value - last_value) / (ctx.dt || 1 / 60);
		const d = (velocity + (ctx.opts.stiffness * delta - ctx.opts.damping * velocity) * ctx.inv_mass) * ctx.dt;
		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) return target_value;
		else {
			ctx.settled = false;
			return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
		}
	} else if (Array.isArray(current_value)) return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
	else if (typeof current_value === "object") {
		const next_value = {};
		for (const k in current_value) next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
		return next_value;
	} else throw new Error(`Cannot spring ${typeof current_value} values`);
}
/**
* The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
*
* @deprecated Use [`Spring`](https://svelte.dev/docs/svelte/svelte-motion#Spring) instead
* @template [T=any]
* @param {T} [value]
* @param {SpringOptions} [opts]
* @returns {SpringStore<T>}
*/
function spring(value, opts = {}) {
	const store = writable(value);
	const { stiffness = .15, damping = .8, precision = .01 } = opts;
	/** @type {number} */
	let last_time;
	/** @type {Task | null} */
	let task;
	/** @type {object} */
	let current_token;
	let last_value = value;
	let target_value = value;
	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;
	/**
	* @param {T} new_value
	* @param {SpringUpdateOptions} opts
	* @returns {Promise<void>}
	*/
	function set(new_value, opts = {}) {
		target_value = new_value;
		const token = current_token = {};
		if (value == null || opts.hard || spring.stiffness >= 1 && spring.damping >= 1) {
			cancel_task = true;
			last_time = raf.now();
			last_value = new_value;
			store.set(value = target_value);
			return Promise.resolve();
		} else if (opts.soft) {
			inv_mass_recovery_rate = 1 / ((opts.soft === true ? .5 : +opts.soft) * 60);
			inv_mass = 0;
		}
		if (!task) {
			last_time = raf.now();
			cancel_task = false;
			task = loop((now) => {
				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}
				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
				const elapsed = Math.min(now - last_time, 1e3 / 30);
				/** @type {TickContext} */
				const ctx = {
					inv_mass,
					opts: spring,
					settled: true,
					dt: elapsed * 60 / 1e3
				};
				const next_value = tick_spring(ctx, last_value, value, target_value);
				last_time = now;
				last_value = value;
				store.set(value = next_value);
				if (ctx.settled) task = null;
				return !ctx.settled;
			});
		}
		return new Promise((fulfil) => {
			/** @type {Task} */ task.promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}
	/** @type {SpringStore<T>} */
	const spring = {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};
	return spring;
}
//#endregion
//#region src/lib/components/ui/Tabs.svelte
function Tabs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { value = void 0, items, children, ariaLabel, activationMode = "automatic" } = $$props;
		let listEl = null;
		let triggerElements = {};
		const position = spring({
			left: 0,
			width: 0
		}, {
			stiffness: .12,
			damping: .65
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (Tabs) {
				$$renderer.push("<!--[-->");
				Tabs($$renderer, {
					activationMode,
					get value() {
						return value;
					},
					set value($$value) {
						value = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						if (Tabs_list) {
							$$renderer.push("<!--[-->");
							Tabs_list($$renderer, {
								class: "hb-tabs-list",
								style: "position: relative;",
								"aria-label": ariaLabel,
								get ref() {
									return listEl;
								},
								set ref($$value) {
									listEl = $$value;
									$$settled = false;
								},
								children: ($$renderer) => {
									if (store_get($$store_subs ??= {}, "$position", position).width > 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<div class="hb-tab-indicator"${attr_style(` position: absolute; top: 0; bottom: 0; left: 0; width: ${stringify(store_get($$store_subs ??= {}, "$position", position).width)}px; transform: translateX(${stringify(store_get($$store_subs ??= {}, "$position", position).left)}px); background: var(--ink); border: var(--border); pointer-events: none; z-index: 0; `)}></div>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--> <!--[-->`);
									const each_array = ensure_array_like(items);
									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let item = each_array[$$index];
										if (Tabs_trigger) {
											$$renderer.push("<!--[-->");
											Tabs_trigger($$renderer, {
												class: "hb-tab",
												value: item.value,
												style: "position: relative; z-index: 1; background: transparent; transition: color var(--duration-base);",
												get ref() {
													return triggerElements[item.value];
												},
												set ref($$value) {
													triggerElements[item.value] = $$value;
													$$settled = false;
												},
												children: ($$renderer) => {
													$$renderer.push(`<span${attr_style(`color: ${stringify(value === item.value ? "var(--white)" : "var(--ink)")}; transition: color var(--duration-fast) var(--ease-out);`)}>${escape_html(item.label)}</span>`);
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
								},
								$$slots: { default: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
						$$renderer.push(` `);
						children($$renderer);
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
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		if ($$store_subs) unsubscribe_stores($$store_subs);
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/components/ui/Progress.svelte
function Progress_1($$renderer, $$props) {
	let { value = 0, max = 100, label } = $$props;
	const percent = derived(() => Math.min(100, Math.max(0, Math.round(value / max * 100))));
	if (Progress) {
		$$renderer.push("<!--[-->");
		Progress($$renderer, {
			class: "hb-progress-track",
			value,
			max,
			"aria-label": label,
			children: ($$renderer) => {
				$$renderer.push(`<div class="hb-progress-fill"${attr_style(`transform: translateX(-${stringify(100 - percent())}%)`)}></div>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
}
//#endregion
//#region src/lib/features/studio/components/VideoUploadForm.svelte
function VideoUploadForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { categories = [], uploadStatus = "idle", uploadProgress = 0, uploadError = "", creatingCategory = false, categoryError = "", onCreateCategory, onSubmit } = $$props;
		let showAdvanced = false;
		let title = "";
		let description = "";
		let requiredEquipment = ["mat"];
		let accessKind = "macroflow";
		let selectedCategoryIds = [];
		let newCategoryName = "";
		let videoFile = null;
		const accessOptions = [{
			value: "macroflow",
			label: "Macroflow",
			description: "רכישה חד-פעמית וגישה קבועה ללקוחה."
		}, {
			value: "microflow",
			label: "Microflow",
			description: "פתוח למנויות פעילות בלבד, בלי צריכת קרדיט."
		}];
		const canSubmit = derived(() => Boolean(videoFile) && title.trim().length >= 3 && selectedCategoryIds.length > 0 && uploadStatus !== "uploading" && uploadStatus !== "processing");
		async function handleAddCategory() {
			const name = newCategoryName.trim();
			if (!name) return;
			await onCreateCategory(name);
			newCategoryName = "";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="video-upload-form svelte-15vosdj">`);
			if (uploadStatus === "ready") {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					tone: "success",
					children: ($$renderer) => {
						$$renderer.push(`<!---->הווידאו הועלה בהצלחה! מעבדים אותו עכשיו — יופיע בספריה תוך כמה דקות.`);
					},
					$$slots: { default: true }
				});
			} else if (uploadStatus === "processing") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="upload-processing-notice svelte-15vosdj"><span class="material-symbols-rounded spinner svelte-15vosdj">sync</span> <p>הקובץ הועלה בהצלחה. מעבדים בשרתי Mux...</p></div>`);
			} else if (uploadStatus === "error" || categoryError) {
				$$renderer.push("<!--[2-->");
				Notice($$renderer, {
					tone: "danger",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(uploadError || categoryError)}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <form><div class="uploader-grid svelte-15vosdj"><div class="uploader-column svelte-15vosdj"><label${attr_class("file-drop svelte-15vosdj", void 0, { "has-file": Boolean(videoFile) })}><input type="file" accept="video/*"${attr("disabled", uploadStatus === "uploading", true)} class="svelte-15vosdj"/> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span class="material-symbols-rounded drop-icon svelte-15vosdj">video_library</span> <span class="drop-text svelte-15vosdj">גררי קובץ וידאו לכאן<br/><small class="svelte-15vosdj">או לחצי לבחירה מהמחשב</small></span>`);
			$$renderer.push(`<!--]--></label> `);
			if (uploadStatus === "uploading") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="progress-container svelte-15vosdj"><div class="progress-meta svelte-15vosdj"><span>מעלה קובץ...</span> <span>${escape_html(uploadProgress)}%</span></div> `);
				Progress_1($$renderer, {
					value: uploadProgress,
					max: 100,
					label: `העלאה ${uploadProgress}%`
				});
				$$renderer.push(`<!----></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="form-field-group svelte-15vosdj"><label class="form-field-label svelte-15vosdj" for="equipment"><span class="material-symbols-rounded svelte-15vosdj">fitness_center</span> ציוד נדרש לשיעור</label> `);
			EquipmentPicker($$renderer, {
				disabled: uploadStatus === "uploading",
				get selected() {
					return requiredEquipment;
				},
				set selected($$value) {
					requiredEquipment = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></div></div> <div class="uploader-column svelte-15vosdj"><label class="field"><span class="field__label">כותרת השיעור</span> <input${attr("value", title)} required="" maxlength="120" placeholder="למשל: יסודות הרפורמר למתחילות"${attr("disabled", uploadStatus === "uploading", true)}/></label> <label class="field"><span class="field__label">תיאור קצר</span> <textarea rows="3" maxlength="500" placeholder="ספרי למתאמנות מה נעשה בשיעור זה..."${attr("disabled", uploadStatus === "uploading", true)}>`);
			const $$body = escape_html(description);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></label> <div class="form-field-group svelte-15vosdj"><label class="form-field-label svelte-15vosdj" for="access"><span class="material-symbols-rounded svelte-15vosdj">key</span> מודל גישה לספרייה</label> `);
			RadioGroup_1($$renderer, {
				options: accessOptions,
				orientation: "horizontal",
				class: "studio-choice-grid",
				get value() {
					return accessKind;
				},
				set value($$value) {
					accessKind = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></div> <div class="form-field-group svelte-15vosdj"><label class="form-field-label svelte-15vosdj" for="categories"><span class="material-symbols-rounded svelte-15vosdj">folder_open</span> שיוך לקטגוריות <span class="count-badge svelte-15vosdj">${escape_html(selectedCategoryIds.length)}</span></label> `);
			if (categories.length === 0) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					tone: "neutral",
					children: ($$renderer) => {
						$$renderer.push(`<!---->אין קטגוריות זמינות. צרי קטגוריה ראשונה למטה.`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="category-grid svelte-15vosdj"><!--[-->`);
				const each_array = ensure_array_like(categories);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let category = each_array[$$index];
					$$renderer.push(`<button${attr_class("category-token svelte-15vosdj", void 0, { "selected": selectedCategoryIds.includes(category._id) })} type="button"${attr("disabled", uploadStatus === "uploading", true)}><span>${escape_html(category.name)}</span></button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--> <div class="new-category-input-row svelte-15vosdj"><input type="text"${attr("value", newCategoryName)} placeholder="שם קטגוריה חדשה..."${attr("disabled", creatingCategory || uploadStatus === "uploading", true)} class="svelte-15vosdj"/> `);
			Button_1($$renderer, {
				tone: "paper",
				type: "button",
				onclick: handleAddCategory,
				disabled: creatingCategory || !newCategoryName.trim() || uploadStatus === "uploading",
				children: ($$renderer) => {
					$$renderer.push(`<!---->הוסף`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div> <div class="advanced-collapsible-wrapper svelte-15vosdj"><button type="button" class="advanced-toggle svelte-15vosdj"><span>הגדרות קידוד מתקדמות (Mux)</span> <span${attr_class("material-symbols-rounded arrow-icon svelte-15vosdj", void 0, { "rotated": showAdvanced })}>expand_more</span></button> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="submit-action-row svelte-15vosdj">`);
			Button_1($$renderer, {
				tone: "ink",
				type: "submit",
				disabled: !canSubmit() || uploadStatus === "uploading",
				class: "upload-submit-button",
				children: ($$renderer) => {
					if (uploadStatus === "uploading") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`מעלה קובץ...`);
					} else if (uploadStatus === "processing") {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`מעבד בשרת...`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span class="material-symbols-rounded">cloud_upload</span> התחילי העלאה לספריה`);
					}
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div></div></form></div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
//#region src/lib/components/ui/AspectRatio.svelte
function AspectRatio_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ratio = 16 / 9, children, class: className = "" } = $$props;
		if (Aspect_ratio) {
			$$renderer.push("<!--[-->");
			Aspect_ratio($$renderer, {
				class: `hb-aspect-ratio ${className}`.trim(),
				ratio,
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
	});
}
//#endregion
//#region src/lib/components/ui/DropdownMenu.svelte
function DropdownMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, items, trigger, side = "bottom", align = "end", sideOffset = 6 } = $$props;
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (Menu) {
				$$renderer.push("<!--[-->");
				Menu($$renderer, {
					get open() {
						return open;
					},
					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<span${attributes({
									...props,
									class: "hb-dropdown-trigger"
								})}>`);
								trigger($$renderer);
								$$renderer.push(`<!----></span>`);
							}
							if (Menu_trigger) {
								$$renderer.push("<!--[-->");
								Menu_trigger($$renderer, {
									child,
									$$slots: { child: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
						}
						$$renderer.push(` `);
						if (Portal) {
							$$renderer.push("<!--[-->");
							Portal($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { wrapperProps, props, open: isOpen }) {
											if (isOpen) {
												$$renderer.push("<!--[0-->");
												$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({
													...props,
													class: "hb-dropdown-content"
												})}><!--[-->`);
												const each_array = ensure_array_like(items);
												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let item = each_array[$$index];
													if (Menu_item) {
														$$renderer.push("<!--[-->");
														Menu_item($$renderer, {
															class: `hb-dropdown-item ${item.danger ? "hb-dropdown-item--danger" : ""}`.trim(),
															disabled: item.disabled,
															onclick: item.onclick,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${escape_html(item.label)}`);
															},
															$$slots: { default: true }
														});
														$$renderer.push("<!--]-->");
													} else {
														$$renderer.push("<!--[!-->");
														$$renderer.push("<!--]-->");
													}
												}
												$$renderer.push(`<!--]--></div></div>`);
											} else $$renderer.push("<!--[-1-->");
											$$renderer.push(`<!--]-->`);
										}
										if (Dropdown_menu_content) {
											$$renderer.push("<!--[-->");
											Dropdown_menu_content($$renderer, {
												side,
												align,
												sideOffset,
												child,
												$$slots: { child: true }
											});
											$$renderer.push("<!--]-->");
										} else {
											$$renderer.push("<!--[!-->");
											$$renderer.push("<!--]-->");
										}
									}
								},
								$$slots: { default: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { open });
	});
}
//#endregion
//#region src/lib/features/studio/components/VideoCard.svelte
function VideoCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video, actionId = null, onEdit, onPublish, onDelete } = $$props;
		const isPending = derived(() => actionId === video._id);
		function getStatusLabel(status) {
			if (status === "published") return "פעיל";
			if (status === "draft") return "טיוטה";
			return "בארכיון";
		}
		$$renderer.push(`<article${attr_class("video-card svelte-avpgnm", void 0, {
			"is-draft": video.status === "draft",
			"is-pending": isPending()
		})}><div class="thumbnail-wrapper svelte-avpgnm">`);
		AspectRatio_1($$renderer, {
			ratio: 16 / 9,
			children: ($$renderer) => {
				if (video.thumbnailUrl) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<img${attr("src", video.thumbnailUrl)}${attr("alt", video.title)} loading="lazy" class="thumbnail-img svelte-avpgnm"/>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="thumbnail-placeholder svelte-avpgnm"><span class="material-symbols-rounded placeholder-icon svelte-avpgnm">movie</span> <span class="placeholder-duration svelte-avpgnm">${escape_html(durationLabel(video.durationSeconds))}</span></div>`);
				}
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> <span${attr_class("status-badge svelte-avpgnm", void 0, {
			"published": video.status === "published",
			"draft": video.status === "draft"
		})}>${escape_html(getStatusLabel(video.status))}</span></div> <div class="card-body svelte-avpgnm"><div class="card-header svelte-avpgnm"><h3 class="video-title svelte-avpgnm">${escape_html(video.title)}</h3> `);
		{
			function trigger($$renderer) {
				$$renderer.push(`<button class="menu-trigger-button svelte-avpgnm" type="button" aria-label="תפריט פעולות"><span class="material-symbols-rounded">more_vert</span></button>`);
			}
			DropdownMenu_1($$renderer, {
				items: [
					{
						label: "ערוך פרטים",
						onclick: () => onEdit(video)
					},
					{
						label: "פרסם שיעור",
						onclick: () => onPublish(video._id),
						disabled: isPending() || video.status === "published"
					},
					{
						label: "מחק וידאו",
						danger: true,
						onclick: () => onDelete(video._id),
						disabled: isPending()
					}
				],
				trigger,
				$$slots: { trigger: true }
			});
		}
		$$renderer.push(`<!----></div> <p class="video-desc svelte-avpgnm">${escape_html(video.description || "אין תיאור לשיעור זה.")}</p> <div class="metadata-tags svelte-avpgnm"><span class="meta-tag duration svelte-avpgnm">${escape_html(durationLabel(video.durationSeconds))}</span> <span${attr_class("meta-tag access svelte-avpgnm", void 0, {
			"macroflow": video.accessKind === "macroflow",
			"microflow": video.accessKind === "microflow"
		})}>${escape_html(video.accessKind === "macroflow" ? "Macroflow" : "Microflow")}</span> <span class="meta-tag quality svelte-avpgnm">${escape_html(video.muxVideoQuality)}</span> <span class="meta-tag resolution svelte-avpgnm">${escape_html(video.muxMaxResolutionTier)}</span> <!--[-->`);
		const each_array = ensure_array_like(video.requiredEquipment);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let eq = each_array[$$index];
			$$renderer.push(`<span class="meta-tag equipment svelte-avpgnm">${escape_html(equipmentLabel(eq))}</span>`);
		}
		$$renderer.push(`<!--]--></div></div></article>`);
	});
}
//#endregion
//#region src/lib/features/studio/components/VideoList.svelte
function VideoList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { library = null, actionId = null, onEdit, onPublish, onDelete } = $$props;
		let searchQuery = "";
		let selectedAccessFilter = "all";
		function filterVideos(list) {
			return list.filter((video) => {
				const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || video.description.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesAccess = selectedAccessFilter === "all" || video.accessKind === selectedAccessFilter;
				return matchesSearch && matchesAccess;
			});
		}
		const filteredPublished = derived(() => library ? filterVideos(library.published) : []);
		const filteredDrafts = derived(() => library ? filterVideos(library.drafts) : []);
		const totalPublishedCount = derived(() => library?.published.length ?? 0);
		const totalDraftsCount = derived(() => library?.drafts.length ?? 0);
		$$renderer.push(`<div class="video-library-list svelte-1sltbmw"><div class="filter-controls-row svelte-1sltbmw"><div class="search-input-wrapper svelte-1sltbmw"><span class="material-symbols-rounded search-icon svelte-1sltbmw">search</span> <input type="text"${attr("value", searchQuery)} placeholder="חיפוש שיעורים לפי כותרת או תיאור..." class="search-input svelte-1sltbmw"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="access-filter-chips svelte-1sltbmw"><button${attr_class("filter-chip svelte-1sltbmw", void 0, { "active": selectedAccessFilter === "all" })}>הכל</button> <button${attr_class("filter-chip macro svelte-1sltbmw", void 0, { "active": selectedAccessFilter === "macroflow" })}>Macroflow</button> <button${attr_class("filter-chip micro svelte-1sltbmw", void 0, { "active": selectedAccessFilter === "microflow" })}>Microflow</button></div></div> `);
		if (!library) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="skeleton-grid svelte-1sltbmw"><div class="skeleton-card svelte-1sltbmw"></div> <div class="skeleton-card svelte-1sltbmw"></div> <div class="skeleton-card svelte-1sltbmw"></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			ScrollArea_1($$renderer, {
				class: "library-scroll-container",
				children: ($$renderer) => {
					$$renderer.push(`<div class="sections-stack svelte-1sltbmw">`);
					if (filteredDrafts().length > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<section class="library-group svelte-1sltbmw"><div class="group-header svelte-1sltbmw"><span class="material-symbols-rounded group-icon draft svelte-1sltbmw">edit_document</span> <h2 class="group-title svelte-1sltbmw">שיעורים בטיוטה (${escape_html(filteredDrafts().length)})</h2> `);
						if (totalDraftsCount() !== filteredDrafts().length) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="filtered-badge svelte-1sltbmw">מסונן</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div> <div class="video-grid svelte-1sltbmw"><!--[-->`);
						const each_array = ensure_array_like(filteredDrafts());
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let video = each_array[$$index];
							VideoCard($$renderer, {
								video,
								actionId,
								onEdit,
								onPublish,
								onDelete
							});
						}
						$$renderer.push(`<!--]--></div></section>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (filteredPublished().length > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<section class="library-group svelte-1sltbmw"><div class="group-header svelte-1sltbmw"><span class="material-symbols-rounded group-icon published svelte-1sltbmw">check_circle</span> <h2 class="group-title svelte-1sltbmw">שיעורים פעילים בספרייה (${escape_html(filteredPublished().length)})</h2> `);
						if (totalPublishedCount() !== filteredPublished().length) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="filtered-badge svelte-1sltbmw">מסונן</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div> <div class="video-grid svelte-1sltbmw"><!--[-->`);
						const each_array_1 = ensure_array_like(filteredPublished());
						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let video = each_array_1[$$index_1];
							VideoCard($$renderer, {
								video,
								actionId,
								onEdit,
								onPublish,
								onDelete
							});
						}
						$$renderer.push(`<!--]--></div></section>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (totalPublishedCount() === 0 && totalDraftsCount() === 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="empty-state-notice svelte-1sltbmw"><span class="material-symbols-rounded empty-icon svelte-1sltbmw">video_library</span> <h3 class="svelte-1sltbmw">אין עדיין שיעורים בספרייה</h3> <p class="svelte-1sltbmw">העלי את השיעור הראשון שלך באמצעות כרטיסיית "העלאה חדשה" למעלה.</p></div>`);
					} else if (filteredPublished().length === 0 && filteredDrafts().length === 0) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<div class="empty-state-notice svelte-1sltbmw"><span class="material-symbols-rounded empty-icon svelte-1sltbmw">search_off</span> <h3 class="svelte-1sltbmw">לא נמצאו תוצאות</h3> <p class="svelte-1sltbmw">נסי לשנות את מונח החיפוש או פילטר מודל הגישה.</p></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
//#region src/lib/features/studio/components/VideoEditModal.svelte
function VideoEditModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video, actionId = null, onClose, onSave } = $$props;
		let title = "";
		let description = "";
		let isSaving = false;
		const isPending = derived(() => actionId === video?._id || isSaving);
		if (Dialog) {
			$$renderer.push("<!--[-->");
			Dialog($$renderer, {
				open: video !== null,
				onOpenChange: (open) => {
					if (!open) onClose();
				},
				children: ($$renderer) => {
					if (Portal) {
						$$renderer.push("<!--[-->");
						Portal($$renderer, {
							children: ($$renderer) => {
								if (Dialog_overlay) {
									$$renderer.push("<!--[-->");
									Dialog_overlay($$renderer, { class: "edit-modal-backdrop" });
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
								$$renderer.push(` `);
								if (Dialog_content) {
									$$renderer.push("<!--[-->");
									Dialog_content($$renderer, {
										class: "edit-modal-card",
										"aria-label": "עריכת פרטי שיעור",
										children: ($$renderer) => {
											if (video) {
												$$renderer.push("<!--[0-->");
												$$renderer.push(`<div class="modal-header"><span class="material-symbols-rounded header-icon">edit_note</span> `);
												if (Dialog_title) {
													$$renderer.push("<!--[-->");
													Dialog_title($$renderer, {
														class: "modal-title",
														level: 2,
														children: ($$renderer) => {
															$$renderer.push(`<!---->עריכת פרטי שיעור`);
														},
														$$slots: { default: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
												$$renderer.push(` `);
												if (Dialog_close) {
													$$renderer.push("<!--[-->");
													Dialog_close($$renderer, {
														class: "close-button",
														"aria-label": "סגור",
														children: ($$renderer) => {
															$$renderer.push(`<span class="material-symbols-rounded">close</span>`);
														},
														$$slots: { default: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
												$$renderer.push(`</div> <form class="modal-form"><label class="field"><span class="field__label">כותרת השיעור</span> <input${attr("value", title)} required="" maxlength="120"${attr("disabled", isPending(), true)}/></label> <label class="field"><span class="field__label">תיאור השיעור</span> <textarea rows="4" maxlength="500"${attr("disabled", isPending(), true)}>`);
												const $$body = escape_html(description);
												if ($$body) $$renderer.push(`${$$body}`);
												$$renderer.push(`</textarea></label> <div class="modal-actions">`);
												Button_1($$renderer, {
													tone: "ink",
													type: "submit",
													disabled: isPending() || !title.trim(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->${escape_html(isPending() ? "שומר..." : "שמירת שינויים")}`);
													},
													$$slots: { default: true }
												});
												$$renderer.push(`<!----> `);
												Button_1($$renderer, {
													tone: "paper",
													type: "button",
													onclick: onClose,
													disabled: isPending(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->ביטול`);
													},
													$$slots: { default: true }
												});
												$$renderer.push(`<!----></div></form>`);
											} else $$renderer.push("<!--[-1-->");
											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
	});
}
//#endregion
//#region src/lib/features/studio/components/InstructorVideoManager.svelte
function InstructorVideoManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		let tab = "library";
		let actionId = null;
		let actionError = "";
		let uploadStatus = "idle";
		let uploadProgress = 0;
		let uploadError = "";
		let creatingCategory = false;
		let categoryError = "";
		let editingVideoObj = null;
		const client = useConvexClient();
		const listQuery = useQuery(api.video.admin.listAll, () => auth.isAuthenticated ? {} : "skip");
		const library = derived(() => listQuery.data ?? null);
		const categoriesResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return [];
			return await authQuery(api.video.categories.listCategories, {});
		}, { initialValue: [] });
		const categories = derived(() => categoriesResource.current ?? []);
		async function handleCreateCategory(name) {
			creatingCategory = true;
			categoryError = "";
			try {
				await client.mutation(api.video.categories.createCategory, { name });
				await categoriesResource.refetch();
			} catch (reason) {
				categoryError = reason instanceof Error ? reason.message : "לא הצלחנו ליצור קטגוריה.";
			} finally {
				creatingCategory = false;
			}
		}
		async function handleStartUpload(data) {
			uploadStatus = "uploading";
			uploadProgress = 0;
			uploadError = "";
			try {
				const result = await client.action(api.video.uploads.requestUpload, {
					title: data.title,
					description: data.description,
					requiredEquipment: data.requiredEquipment,
					accessKind: data.accessKind,
					categoryIds: data.categoryIds,
					muxVideoQuality: data.muxVideoQuality,
					muxMaxResolutionTier: data.muxMaxResolutionTier,
					staticRendition: data.staticRendition
				});
				if (!result?.uploadUrl) {
					uploadStatus = "error";
					uploadError = "לא הצלחנו ליצור כתובת העלאה משרת Mux.";
					return;
				}
				await uploadToMux(result.uploadUrl, data.file);
				uploadStatus = "processing";
				setTimeout(() => {
					if (uploadStatus === "processing") {
						uploadStatus = "ready";
						tab = "library";
						uploadProgress = 0;
					}
				}, 2500);
			} catch (reason) {
				uploadStatus = "error";
				uploadError = reason instanceof Error ? reason.message : "העלאת קובץ הווידאו נכשלה.";
			}
		}
		function uploadToMux(url, file) {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", (e) => {
					if (e.lengthComputable) uploadProgress = Math.round(e.loaded / e.total * 100);
				});
				xhr.addEventListener("load", () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(/* @__PURE__ */ new Error(`Mux returned failure code: ${xhr.status}`));
				});
				xhr.addEventListener("error", () => reject(/* @__PURE__ */ new Error("שגיאת רשת במהלך העלאת קובץ.")));
				xhr.open("PUT", url);
				xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
				xhr.send(file);
			});
		}
		async function handlePublishVideo(videoId) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.admin.updateMetadata, {
					videoId,
					status: "published"
				});
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לפרסם את השיעור.";
			} finally {
				actionId = null;
			}
		}
		async function handleDeleteVideo(videoId) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.admin.updateMetadata, {
					videoId,
					status: "archived"
				});
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו להעביר לארכיון.";
			} finally {
				actionId = null;
			}
		}
		async function handleSaveEdit(videoId, editTitle, editDescription) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.admin.updateMetadata, {
					videoId,
					title: editTitle,
					description: editDescription
				});
				editingVideoObj = null;
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור שינויים.";
				throw reason;
			} finally {
				actionId = null;
			}
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			PageShell($$renderer, {
				title: "ספריית שיעורי וידאו",
				description: "העלאת שיעורים חדשים, שיוך לקטגוריות Macroflow/Microflow, וניהול תוכן מתוזמן.",
				children: ($$renderer) => {
					if (actionError) {
						$$renderer.push("<!--[0-->");
						Notice($$renderer, {
							tone: "danger",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(actionError)}`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					Tabs_1($$renderer, {
						items: [{
							value: "library",
							label: "ספריית שיעורים"
						}, {
							value: "upload",
							label: "העלאת וידאו חדש"
						}],
						ariaLabel: "ניהול סרטוני וידאו",
						get value() {
							return tab;
						},
						set value($$value) {
							tab = $$value;
							$$settled = false;
						},
						children: ($$renderer) => {
							if (Tabs_content) {
								$$renderer.push("<!--[-->");
								Tabs_content($$renderer, {
									value: "library",
									children: ($$renderer) => {
										$$renderer.push(`<div class="library-tab-content svelte-19auows">`);
										VideoList($$renderer, {
											library: library(),
											actionId,
											onEdit: (video) => editingVideoObj = video,
											onPublish: handlePublishVideo,
											onDelete: handleDeleteVideo
										});
										$$renderer.push(`<!----></div>`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
							$$renderer.push(` `);
							if (Tabs_content) {
								$$renderer.push("<!--[-->");
								Tabs_content($$renderer, {
									value: "upload",
									children: ($$renderer) => {
										$$renderer.push(`<div class="upload-tab-content svelte-19auows">`);
										VideoUploadForm($$renderer, {
											categories: categories(),
											uploadStatus,
											uploadProgress,
											uploadError,
											creatingCategory,
											categoryError,
											onCreateCategory: handleCreateCategory,
											onSubmit: handleStartUpload
										});
										$$renderer.push(`<!----></div>`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			if (editingVideoObj) {
				$$renderer.push("<!--[0-->");
				VideoEditModal($$renderer, {
					video: editingVideoObj,
					actionId,
					onClose: () => editingVideoObj = null,
					onSave: handleSaveEdit
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
export { InstructorVideoManager as t };
