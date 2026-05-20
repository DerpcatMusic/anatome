import { U as snapshot, a as bind_props, c as ensure_array_like, f as spread_props, g as html, i as attributes, nt as escape_html, o as derived, u as props_id } from "./dev.js";
import { G as watch, J as attachRef, L as createBitsAttrs, N as boolToEmptyStrOrUndef, P as boolToStr, R as getAriaChecked, Z as mergeProps, at as boxWith, c as createId, l as noop, m as isHTMLElement, q as Context } from "./arrays.js";
import { t as RovingFocusGroup } from "./roving-focus-group.js";
import { t as Hidden_input } from "./hidden-input.js";
//#region node_modules/bits-ui/dist/bits/checkbox/checkbox.svelte.js
var checkboxAttrs = createBitsAttrs({
	component: "checkbox",
	parts: [
		"root",
		"group",
		"group-label",
		"input"
	]
});
var CheckboxGroupContext = new Context("Checkbox.Group");
var CheckboxRootContext = new Context("Checkbox.Root");
var CheckboxRootState = class CheckboxRootState {
	static create(opts, group = null) {
		return CheckboxRootContext.set(new CheckboxRootState(opts, group));
	}
	opts;
	group;
	#trueName = derived(() => {
		if (this.group && this.group.opts.name.current) return this.group.opts.name.current;
		return this.opts.name.current;
	});
	get trueName() {
		return this.#trueName();
	}
	set trueName($$value) {
		return this.#trueName($$value);
	}
	#trueRequired = derived(() => {
		if (this.group && this.group.opts.required.current) return true;
		return this.opts.required.current;
	});
	get trueRequired() {
		return this.#trueRequired();
	}
	set trueRequired($$value) {
		return this.#trueRequired($$value);
	}
	#trueDisabled = derived(() => {
		if (this.group && this.group.opts.disabled.current) return true;
		return this.opts.disabled.current;
	});
	get trueDisabled() {
		return this.#trueDisabled();
	}
	set trueDisabled($$value) {
		return this.#trueDisabled($$value);
	}
	#trueReadonly = derived(() => {
		if (this.group && this.group.opts.readonly.current) return true;
		return this.opts.readonly.current;
	});
	get trueReadonly() {
		return this.#trueReadonly();
	}
	set trueReadonly($$value) {
		return this.#trueReadonly($$value);
	}
	attachment;
	constructor(opts, group) {
		this.opts = opts;
		this.group = group;
		this.attachment = attachRef(this.opts.ref);
		this.onkeydown = this.onkeydown.bind(this);
		this.onclick = this.onclick.bind(this);
		watch.pre([() => snapshot(this.group?.opts.value.current), () => this.opts.value.current], ([groupValue, value]) => {
			if (!groupValue || !value) return;
			this.opts.checked.current = groupValue.includes(value);
		});
		watch.pre(() => this.opts.checked.current, (checked) => {
			if (!this.group) return;
			if (checked) this.group?.addValue(this.opts.value.current);
			else this.group?.removeValue(this.opts.value.current);
		});
	}
	onkeydown(e) {
		if (this.trueDisabled || this.trueReadonly) return;
		if (e.key === "Enter") {
			e.preventDefault();
			if (this.opts.type.current === "submit") e.currentTarget.closest("form")?.requestSubmit();
			return;
		}
		if (e.key === " ") {
			e.preventDefault();
			this.#toggle();
		}
	}
	#toggle() {
		if (this.opts.indeterminate.current) {
			this.opts.indeterminate.current = false;
			this.opts.checked.current = true;
		} else this.opts.checked.current = !this.opts.checked.current;
	}
	onclick(e) {
		if (this.trueDisabled || this.trueReadonly) return;
		if (this.opts.type.current === "submit") {
			this.#toggle();
			return;
		}
		e.preventDefault();
		this.#toggle();
	}
	#snippetProps = derived(() => ({
		checked: this.opts.checked.current,
		indeterminate: this.opts.indeterminate.current
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "checkbox",
		type: this.opts.type.current,
		disabled: this.trueDisabled,
		"aria-checked": getAriaChecked(this.opts.checked.current, this.opts.indeterminate.current),
		"aria-required": boolToStr(this.trueRequired),
		"aria-readonly": boolToStr(this.trueReadonly),
		"data-disabled": boolToEmptyStrOrUndef(this.trueDisabled),
		"data-readonly": boolToEmptyStrOrUndef(this.trueReadonly),
		"data-state": getCheckboxDataState(this.opts.checked.current, this.opts.indeterminate.current),
		[checkboxAttrs.root]: "",
		onclick: this.onclick,
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
var CheckboxInputState = class CheckboxInputState {
	static create() {
		return new CheckboxInputState(CheckboxRootContext.get());
	}
	root;
	#trueChecked = derived(() => {
		if (!this.root.group) return this.root.opts.checked.current;
		if (this.root.opts.value.current !== void 0 && this.root.group.opts.value.current.includes(this.root.opts.value.current)) return true;
		return false;
	});
	get trueChecked() {
		return this.#trueChecked();
	}
	set trueChecked($$value) {
		return this.#trueChecked($$value);
	}
	#shouldRender = derived(() => Boolean(this.root.trueName));
	get shouldRender() {
		return this.#shouldRender();
	}
	set shouldRender($$value) {
		return this.#shouldRender($$value);
	}
	constructor(root) {
		this.root = root;
		this.onfocus = this.onfocus.bind(this);
	}
	onfocus(_) {
		if (!isHTMLElement(this.root.opts.ref.current)) return;
		this.root.opts.ref.current.focus();
	}
	#props = derived(() => ({
		type: "checkbox",
		checked: this.root.opts.checked.current === true,
		disabled: this.root.trueDisabled,
		required: this.root.trueRequired,
		name: this.root.trueName,
		value: this.root.opts.value.current,
		readonly: this.root.trueReadonly,
		onfocus: this.onfocus
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getCheckboxDataState(checked, indeterminate) {
	if (indeterminate) return "indeterminate";
	return checked ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/bits-ui/dist/bits/checkbox/components/checkbox-input.svelte
function Checkbox_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = CheckboxInputState.create();
		if (inputState.shouldRender) {
			$$renderer.push("<!--[0-->");
			Hidden_input($$renderer, spread_props([inputState.props]));
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/checkbox/components/checkbox.svelte
function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { checked = false, ref = null, onCheckedChange, children, disabled = false, required = false, name = void 0, value = "on", id = createId(uid), indeterminate = false, onIndeterminateChange, child, type = "button", readonly, $$slots, $$events, ...restProps } = $$props;
		const group = CheckboxGroupContext.getOr(null);
		if (group && value) if (group.opts.value.current.includes(value)) checked = true;
		else checked = false;
		watch.pre(() => value, () => {
			if (group && value) if (group.opts.value.current.includes(value)) checked = true;
			else checked = false;
		});
		const rootState = CheckboxRootState.create({
			checked: boxWith(() => checked, (v) => {
				checked = v;
				onCheckedChange?.(v);
			}),
			disabled: boxWith(() => disabled ?? false),
			required: boxWith(() => required),
			name: boxWith(() => name),
			value: boxWith(() => value),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			indeterminate: boxWith(() => indeterminate, (v) => {
				indeterminate = v;
				onIndeterminateChange?.(v);
			}),
			type: boxWith(() => type),
			readonly: boxWith(() => Boolean(readonly))
		}, group);
		const mergedProps = derived(() => mergeProps({ ...restProps }, rootState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...rootState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]--> `);
		Checkbox_input($$renderer, {});
		$$renderer.push(`<!---->`);
		bind_props($$props, {
			checked,
			ref,
			indeterminate
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/radio-group/radio-group.svelte.js
var radioGroupAttrs = createBitsAttrs({
	component: "radio-group",
	parts: ["root", "item"]
});
var RadioGroupRootContext = new Context("RadioGroup.Root");
var RadioGroupRootState = class RadioGroupRootState {
	static create(opts) {
		return RadioGroupRootContext.set(new RadioGroupRootState(opts));
	}
	opts;
	#hasValue = derived(() => this.opts.value.current !== "");
	get hasValue() {
		return this.#hasValue();
	}
	set hasValue($$value) {
		return this.#hasValue($$value);
	}
	rovingFocusGroup;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
		this.rovingFocusGroup = new RovingFocusGroup({
			rootNode: this.opts.ref,
			candidateAttr: radioGroupAttrs.item,
			loop: this.opts.loop,
			orientation: this.opts.orientation
		});
	}
	isChecked(value) {
		return this.opts.value.current === value;
	}
	setValue(value) {
		this.opts.value.current = value;
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "radiogroup",
		"aria-required": boolToStr(this.opts.required.current),
		"aria-disabled": boolToStr(this.opts.disabled.current),
		"aria-readonly": this.opts.readonly.current ? "true" : void 0,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.opts.readonly.current),
		"data-orientation": this.opts.orientation.current,
		[radioGroupAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var RadioGroupItemState = class RadioGroupItemState {
	static create(opts) {
		return new RadioGroupItemState(opts, RadioGroupRootContext.get());
	}
	opts;
	root;
	attachment;
	#checked = derived(() => this.root.opts.value.current === this.opts.value.current);
	get checked() {
		return this.#checked();
	}
	set checked($$value) {
		return this.#checked($$value);
	}
	#isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#isReadonly = derived(() => this.root.opts.readonly.current);
	#isChecked = derived(() => this.root.isChecked(this.opts.value.current));
	#tabIndex = -1;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
		if (this.opts.value.current === this.root.opts.value.current) {
			this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current);
			this.#tabIndex = 0;
		} else if (!this.root.opts.value.current) this.#tabIndex = 0;
		watch([() => this.opts.value.current, () => this.root.opts.value.current], () => {
			if (this.opts.value.current === this.root.opts.value.current) {
				this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current);
				this.#tabIndex = 0;
			}
		});
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
		this.onfocus = this.onfocus.bind(this);
	}
	onclick(_) {
		if (this.opts.disabled.current || this.#isReadonly()) return;
		this.root.setValue(this.opts.value.current);
	}
	onfocus(_) {
		if (!this.root.hasValue || this.#isReadonly()) return;
		this.root.setValue(this.opts.value.current);
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		if (e.key === " ") {
			e.preventDefault();
			if (!this.#isReadonly()) this.root.setValue(this.opts.value.current);
			return;
		}
		this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e, true);
	}
	#snippetProps = derived(() => ({ checked: this.#isChecked() }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		disabled: this.#isDisabled() ? true : void 0,
		"data-value": this.opts.value.current,
		"data-orientation": this.root.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		"data-readonly": boolToEmptyStrOrUndef(this.#isReadonly()),
		"data-state": this.#isChecked() ? "checked" : "unchecked",
		"aria-checked": getAriaChecked(this.#isChecked(), false),
		[radioGroupAttrs.item]: "",
		type: "button",
		role: "radio",
		tabindex: this.#tabIndex,
		onkeydown: this.onkeydown,
		onfocus: this.onfocus,
		onclick: this.onclick,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var RadioGroupInputState = class RadioGroupInputState {
	static create() {
		return new RadioGroupInputState(RadioGroupRootContext.get());
	}
	root;
	#shouldRender = derived(() => this.root.opts.name.current !== void 0);
	get shouldRender() {
		return this.#shouldRender();
	}
	set shouldRender($$value) {
		return this.#shouldRender($$value);
	}
	constructor(root) {
		this.root = root;
		this.onfocus = this.onfocus.bind(this);
	}
	onfocus(_) {
		this.root.rovingFocusGroup.focusCurrentTabStop();
	}
	#props = derived(() => ({
		name: this.root.opts.name.current,
		value: this.root.opts.value.current,
		required: this.root.opts.required.current,
		disabled: this.root.opts.disabled.current,
		onfocus: this.onfocus
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/radio-group/components/radio-group-input.svelte
function Radio_group_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = RadioGroupInputState.create();
		if (inputState.shouldRender) {
			$$renderer.push("<!--[0-->");
			Hidden_input($$renderer, spread_props([inputState.props]));
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/radio-group/components/radio-group.svelte
function Radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { disabled = false, children, child, value = "", ref = null, orientation = "vertical", loop = true, name = void 0, required = false, readonly = false, id = createId(uid), onValueChange = noop, $$slots, $$events, ...restProps } = $$props;
		const rootState = RadioGroupRootState.create({
			orientation: boxWith(() => orientation),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			name: boxWith(() => name),
			required: boxWith(() => required),
			readonly: boxWith(() => readonly),
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				if (v === value) return;
				value = v;
				onValueChange?.(v);
			}),
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
		$$renderer.push(`<!--]--> `);
		Radio_group_input($$renderer, {});
		$$renderer.push(`<!---->`);
		bind_props($$props, {
			value,
			ref
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/radio-group/components/radio-group-item.svelte
function Radio_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), children, child, value, disabled = false, ref = null, $$slots, $$events, ...restProps } = $$props;
		const itemState = RadioGroupItemState.create({
			value: boxWith(() => value),
			disabled: boxWith(() => disabled ?? false),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, itemState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...itemState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, itemState.snippetProps);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region src/lib/components/ui/Checkbox.svelte
function Checkbox_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { checked = false, value, disabled = false, readonly = false, class: className = "", onchange, children } = $$props;
		function updateChecked(next) {
			checked = next;
			onchange?.(next);
		}
		if (Checkbox) {
			$$renderer.push("<!--[-->");
			Checkbox($$renderer, {
				class: `hb-choice ${className}`,
				value,
				checked,
				disabled,
				readonly,
				onCheckedChange: updateChecked,
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
		bind_props($$props, { checked });
	});
}
//#endregion
//#region src/lib/components/icons/EquipmentIcon.svelte
function EquipmentIcon($$renderer, $$props) {
	let { name } = $$props;
	const icons = {
		mat: `<rect x="4" y="14" width="56" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="34" x2="48" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,
		reformer: `<rect x="6" y="20" width="48" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="16" width="20" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="36" x2="10" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="36" x2="50" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="42" x2="54" y2="42" stroke="currentColor" stroke-width="2"/>`,
		cadillac: `<rect x="8" y="12" width="44" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="20" x2="52" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="8" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="18" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="42" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="52" y1="12" x2="52" y2="6" stroke="currentColor" stroke-width="2"/>`,
		chair: `<rect x="20" y="12" width="20" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="22" x2="40" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="40" x2="24" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="36" y1="40" x2="36" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="48" x2="38" y2="48" stroke="currentColor" stroke-width="2"/>`,
		barrel: `<path d="M16 12 C12 12, 8 24, 8 30 C8 36, 12 48, 16 48 L48 48 C52 48, 56 36, 56 30 C56 24, 52 12, 48 12 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="10" y1="30" x2="54" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="38" x2="52" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,
		magic_circle: `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="10" r="3" fill="currentColor"/><circle cx="32" cy="54" r="3" fill="currentColor"/><circle cx="10" cy="32" r="3" fill="currentColor"/><circle cx="54" cy="32" r="3" fill="currentColor"/>`,
		small_ball: `<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 24 Q32 18, 46 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><path d="M16 34 Q32 28, 48 34" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,
		resistance_band: `<path d="M12 16 Q32 8, 52 16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 32 Q32 24, 52 32" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 48 Q32 40, 52 48" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="16" x2="12" y2="48" stroke="currentColor" stroke-width="2"/><line x1="52" y1="16" x2="52" y2="48" stroke="currentColor" stroke-width="2"/>`,
		light_weights: `<rect x="12" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="40" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2.5"/><rect x="24" y="12" width="12" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>`
	};
	const svgContent = derived(() => icons[name] ?? icons.mat);
	$$renderer.push(`<svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${html(svgContent())}</svg>`);
}
//#endregion
//#region src/lib/components/ui/RadioGroup.svelte
function RadioGroup_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, options, orientation = "horizontal", class: className = "", onchange } = $$props;
		const stringValue = derived(() => String(value ?? ""));
		function updateValue(next) {
			const option = options.find((item) => String(item.value) === next);
			if (!option) return;
			value = option.value;
			onchange?.(option.value);
		}
		if (Radio_group) {
			$$renderer.push("<!--[-->");
			Radio_group($$renderer, {
				class: `hb-choice-grid ${className}`,
				orientation,
				value: stringValue(),
				onValueChange: updateValue,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);
					const each_array = ensure_array_like(options);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let option = each_array[$$index];
						if (Radio_group_item) {
							$$renderer.push("<!--[-->");
							Radio_group_item($$renderer, {
								class: "hb-choice",
								value: String(option.value),
								disabled: option.disabled,
								children: ($$renderer) => {
									$$renderer.push(`<span class="hb-choice__title">${escape_html(option.label)}</span> `);
									if (option.description) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<span class="hb-choice__description">${escape_html(option.description)}</span>`);
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
		bind_props($$props, { value });
	});
}
//#endregion
export { EquipmentIcon as n, Checkbox_1 as r, RadioGroup_1 as t };
