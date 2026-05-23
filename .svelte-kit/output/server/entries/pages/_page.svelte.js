import "../../chunks/index-server.js";
import { Q as attr, a as bind_props, c as ensure_array_like, et as escape_html, i as attributes, l as head, m as html, n as attr_class, o as derived, u as props_id } from "../../chunks/dev.js";
import { r as on } from "../../chunks/events.js";
import { t as SITE } from "../../chunks/config.js";
import { _ as useQuery, a as signOut, g as useConvexClient, o as storeTokens, r as initAuth, s as api } from "../../chunks/session.svelte.js";
import { F as boolToStr, H as getDataTransitionAttrs, J as Context, K as watch, L as boolToTrueOrUndef, P as boolToEmptyStrOrUndef, R as createBitsAttrs, U as Previous, V as getDataOpenClosed, X as mergeProps, Y as attachRef, c as createId, l as noop$1, nt as boxWith, rt as simpleBox, u as RovingFocusGroup } from "../../chunks/arrays.js";
import { m as PresenceManager, p as Portal } from "../../chunks/scroll-lock.js";
import { c as afterTick, i as DOMContext } from "../../chunks/use-id.js";
import { n as Dialog, r as Dialog_overlay, t as Dialog_content } from "../../chunks/dialog-content.js";
import { t as Button } from "../../chunks/button.js";
import { t as page } from "../../chunks/state.js";
import { t as Notice } from "../../chunks/Notice.js";
import { t as useI18n } from "../../chunks/runes.svelte.js";
//#region node_modules/bits-ui/dist/bits/accordion/accordion.svelte.js
var accordionAttrs = createBitsAttrs({
	component: "accordion",
	parts: [
		"root",
		"trigger",
		"content",
		"item",
		"header"
	]
});
var AccordionRootContext = new Context("Accordion.Root");
var AccordionItemContext = new Context("Accordion.Item");
var AccordionBaseState = class {
	opts;
	rovingFocusGroup;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.rovingFocusGroup = new RovingFocusGroup({
			rootNode: this.opts.ref,
			candidateAttr: accordionAttrs.trigger,
			loop: this.opts.loop,
			orientation: this.opts.orientation
		});
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-orientation": this.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		[accordionAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var AccordionSingleState = class extends AccordionBaseState {
	opts;
	isMulti = false;
	constructor(opts) {
		super(opts);
		this.opts = opts;
		this.includesItem = this.includesItem.bind(this);
		this.toggleItem = this.toggleItem.bind(this);
	}
	includesItem(item) {
		return this.opts.value.current === item;
	}
	toggleItem(item) {
		this.opts.value.current = this.includesItem(item) ? "" : item;
	}
};
var AccordionMultiState = class extends AccordionBaseState {
	#value;
	isMulti = true;
	constructor(props) {
		super(props);
		this.#value = props.value;
		this.includesItem = this.includesItem.bind(this);
		this.toggleItem = this.toggleItem.bind(this);
	}
	includesItem(item) {
		return this.#value.current.includes(item);
	}
	toggleItem(item) {
		this.#value.current = this.includesItem(item) ? this.#value.current.filter((v) => v !== item) : [...this.#value.current, item];
	}
};
var AccordionRootState = class {
	static create(props) {
		const { type, ...rest } = props;
		const rootState = type === "single" ? new AccordionSingleState(rest) : new AccordionMultiState(rest);
		return AccordionRootContext.set(rootState);
	}
};
var AccordionItemState = class AccordionItemState {
	static create(props) {
		return AccordionItemContext.set(new AccordionItemState({
			...props,
			rootState: AccordionRootContext.get()
		}));
	}
	opts;
	root;
	#isActive = derived(() => this.root.includesItem(this.opts.value.current));
	get isActive() {
		return this.#isActive();
	}
	set isActive($$value) {
		return this.#isActive($$value);
	}
	#isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
	get isDisabled() {
		return this.#isDisabled();
	}
	set isDisabled($$value) {
		return this.#isDisabled($$value);
	}
	attachment;
	contentNode = null;
	contentPresence;
	constructor(opts) {
		this.opts = opts;
		this.root = opts.rootState;
		this.updateValue = this.updateValue.bind(this);
		this.attachment = attachRef(this.opts.ref);
		this.contentPresence = new PresenceManager({
			ref: boxWith(() => this.contentNode),
			open: boxWith(() => this.isActive)
		});
	}
	updateValue() {
		this.root.toggleItem(this.opts.value.current);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-state": getDataOpenClosed(this.isActive),
		"data-disabled": boolToEmptyStrOrUndef(this.isDisabled),
		"data-orientation": this.root.opts.orientation.current,
		[accordionAttrs.item]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var AccordionTriggerState = class AccordionTriggerState {
	opts;
	itemState;
	#root;
	#isDisabled = derived(() => this.opts.disabled.current || this.itemState.opts.disabled.current || this.#root.opts.disabled.current);
	attachment;
	constructor(opts, itemState) {
		this.opts = opts;
		this.itemState = itemState;
		this.#root = itemState.root;
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
		this.attachment = attachRef(this.opts.ref);
	}
	static create(props) {
		return new AccordionTriggerState(props, AccordionItemContext.get());
	}
	onclick(e) {
		if (this.#isDisabled() || e.button !== 0) {
			e.preventDefault();
			return;
		}
		this.itemState.updateValue();
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault();
			this.itemState.updateValue();
			return;
		}
		this.#root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		disabled: this.#isDisabled(),
		"aria-expanded": boolToStr(this.itemState.isActive),
		"aria-disabled": boolToStr(this.#isDisabled()),
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		"data-state": getDataOpenClosed(this.itemState.isActive),
		"data-orientation": this.#root.opts.orientation.current,
		[accordionAttrs.trigger]: "",
		tabindex: this.opts.tabindex.current,
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
var AccordionContentState = class AccordionContentState {
	opts;
	item;
	attachment;
	#originalStyles = void 0;
	#isMountAnimationPrevented = false;
	#dimensions = {
		width: 0,
		height: 0
	};
	#open = derived(() => {
		if (this.opts.hiddenUntilFound.current) return this.item.isActive;
		return this.opts.forceMount.current || this.item.isActive;
	});
	get open() {
		return this.#open();
	}
	set open($$value) {
		return this.#open($$value);
	}
	constructor(opts, item) {
		this.opts = opts;
		this.item = item;
		this.#isMountAnimationPrevented = this.item.isActive;
		this.attachment = attachRef(this.opts.ref, (v) => this.item.contentNode = v);
		watch.pre([() => this.opts.ref.current, () => this.opts.hiddenUntilFound.current], ([node, hiddenUntilFound]) => {
			if (!node || !hiddenUntilFound) return;
			const handleBeforeMatch = () => {
				if (this.item.isActive) return;
				requestAnimationFrame(() => {
					this.item.updateValue();
				});
			};
			return on(node, "beforematch", handleBeforeMatch);
		});
		watch([() => this.open, () => this.opts.ref.current], this.#updateDimensions);
	}
	static create(props) {
		return new AccordionContentState(props, AccordionItemContext.get());
	}
	#updateDimensions = ([_, node]) => {
		if (!node) return;
		afterTick(() => {
			const element = this.opts.ref.current;
			if (!element) return;
			this.#originalStyles ??= {
				transitionDuration: element.style.transitionDuration,
				animationName: element.style.animationName
			};
			element.style.transitionDuration = "0s";
			element.style.animationName = "none";
			const rect = element.getBoundingClientRect();
			this.#dimensions = {
				width: rect.width,
				height: rect.height
			};
			if (!this.#isMountAnimationPrevented && this.#originalStyles) {
				element.style.transitionDuration = this.#originalStyles.transitionDuration;
				element.style.animationName = this.#originalStyles.animationName;
			}
		});
	};
	get shouldRender() {
		return this.item.contentPresence.shouldRender;
	}
	#snippetProps = derived(() => ({ open: this.item.isActive }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-state": getDataOpenClosed(this.item.isActive),
		...getDataTransitionAttrs(this.item.contentPresence.transitionStatus),
		"data-disabled": boolToEmptyStrOrUndef(this.item.isDisabled),
		"data-orientation": this.item.root.opts.orientation.current,
		[accordionAttrs.content]: "",
		style: {
			"--bits-accordion-content-height": `${this.#dimensions.height}px`,
			"--bits-accordion-content-width": `${this.#dimensions.width}px`
		},
		hidden: this.opts.hiddenUntilFound.current && !this.item.isActive ? "until-found" : void 0,
		...this.opts.hiddenUntilFound.current && !this.shouldRender ? {} : { hidden: this.opts.hiddenUntilFound.current ? !this.shouldRender : this.opts.forceMount.current ? void 0 : !this.shouldRender },
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
//#region node_modules/bits-ui/dist/bits/accordion/components/accordion.svelte
function Accordion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { disabled = false, children, child, type, value = void 0, ref = null, id = createId(uid), onValueChange = noop$1, loop = true, orientation = "vertical", $$slots, $$events, ...restProps } = $$props;
		function handleDefaultValue() {
			if (value !== void 0) return;
			value = type === "single" ? "" : [];
		}
		handleDefaultValue();
		watch.pre(() => value, () => {
			handleDefaultValue();
		});
		const rootState = AccordionRootState.create({
			type,
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			orientation: boxWith(() => orientation),
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
			value,
			ref
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/accordion/components/accordion-item.svelte
function Accordion_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defaultId = createId(props_id($$renderer));
		let { id = defaultId, disabled = false, value = defaultId, children, child, ref = null, $$slots, $$events, ...restProps } = $$props;
		const itemState = AccordionItemState.create({
			value: boxWith(() => value),
			disabled: boxWith(() => disabled),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
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
//#region node_modules/bits-ui/dist/bits/accordion/components/accordion-trigger.svelte
function Accordion_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { disabled = false, ref = null, id = createId(uid), tabindex = 0, children, child, $$slots, $$events, ...restProps } = $$props;
		const triggerState = AccordionTriggerState.create({
			disabled: boxWith(() => disabled),
			id: boxWith(() => id),
			tabindex: boxWith(() => tabindex ?? 0),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({
				type: "button",
				...mergedProps()
			})}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/accordion/components/accordion-content.svelte
function Accordion_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, ref = null, id = createId(uid), forceMount = false, children, hiddenUntilFound = false, $$slots, $$events, ...restProps } = $$props;
		const contentState = AccordionContentState.create({
			forceMount: boxWith(() => forceMount),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			hiddenUntilFound: boxWith(() => hiddenUntilFound)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...contentState.snippetProps
			});
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
//#region node_modules/bits-ui/dist/bits/pin-input/usePasswordManager.svelte.js
var PWM_BADGE_SPACE_WIDTH = `40px`;
[
	"[data-lastpass-icon-root]",
	"com-1password-button",
	"[data-dashlanecreated]",
	"[style$=\"2147483647 !important;\"]"
].join(",");
function usePasswordManagerBadge({ containerRef, inputRef, pushPasswordManagerStrategy, isFocused, domContext }) {
	let hasPwmBadge = false;
	function willPushPwmBadge() {
		const strategy = pushPasswordManagerStrategy.current;
		if (strategy === "none") return false;
		return strategy === "increase-width" && hasPwmBadge;
	}
	return {
		get hasPwmBadge() {
			return hasPwmBadge;
		},
		get willPushPwmBadge() {
			return willPushPwmBadge();
		},
		PWM_BADGE_SPACE_WIDTH
	};
}
//#endregion
//#region node_modules/bits-ui/dist/bits/pin-input/pin-input.svelte.js
var REGEXP_ONLY_DIGITS = "^\\d+$";
var pinInputAttrs = createBitsAttrs({
	component: "pin-input",
	parts: ["root", "cell"]
});
var KEYS_TO_IGNORE = [
	"Backspace",
	"Delete",
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"Home",
	"End",
	"Escape",
	"Enter",
	"Tab",
	"Shift",
	"Control",
	"Meta"
];
var PinInputRootState = class PinInputRootState {
	static create(opts) {
		return new PinInputRootState(opts);
	}
	opts;
	attachment;
	inputAttachment;
	#isHoveringInput = false;
	#isFocused = simpleBox(false);
	#mirrorSelectionStart = null;
	#mirrorSelectionEnd = null;
	#previousValue = new Previous(() => this.opts.value.current ?? "");
	#regexPattern = derived(() => {
		if (typeof this.opts.pattern.current === "string") return new RegExp(this.opts.pattern.current);
		else return this.opts.pattern.current;
	});
	#prevInputMetadata = {
		prev: [
			null,
			null,
			"none"
		],
		willSyntheticBlur: false
	};
	#pwmb;
	#initialLoad;
	domContext;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
		this.inputAttachment = attachRef(this.opts.inputRef);
		this.domContext = new DOMContext(opts.ref);
		this.#initialLoad = {
			value: this.opts.value,
			isIOS: typeof window !== "undefined" && window?.CSS?.supports("-webkit-touch-callout", "none")
		};
		this.#pwmb = usePasswordManagerBadge({
			containerRef: this.opts.ref,
			inputRef: this.opts.inputRef,
			isFocused: this.#isFocused,
			pushPasswordManagerStrategy: this.opts.pushPasswordManagerStrategy,
			domContext: this.domContext
		});
		watch([() => this.opts.value.current, () => this.opts.inputRef.current], () => {
			syncTimeouts(() => {
				const input = this.opts.inputRef.current;
				if (!input) return;
				input.dispatchEvent(new Event("input"));
				const start = input.selectionStart;
				const end = input.selectionEnd;
				const dir = input.selectionDirection ?? "none";
				if (start !== null && end !== null) {
					this.#mirrorSelectionStart = start;
					this.#mirrorSelectionEnd = end;
					this.#prevInputMetadata.prev = [
						start,
						end,
						dir
					];
				}
			}, this.domContext);
		});
	}
	onkeydown = (e) => {
		const key = e.key;
		if (KEYS_TO_IGNORE.includes(key)) return;
		if (e.ctrlKey || e.metaKey) return;
		if (key && this.#regexPattern() && !this.#regexPattern().test(key)) e.preventDefault();
	};
	#rootStyles = derived(() => ({
		position: "relative",
		cursor: this.opts.disabled.current ? "default" : "text",
		userSelect: "none",
		WebkitUserSelect: "none",
		pointerEvents: "none"
	}));
	#rootProps = derived(() => ({
		id: this.opts.id.current,
		[pinInputAttrs.root]: "",
		style: this.#rootStyles(),
		...this.attachment
	}));
	get rootProps() {
		return this.#rootProps();
	}
	set rootProps($$value) {
		return this.#rootProps($$value);
	}
	#inputWrapperProps = derived(() => ({ style: {
		position: "absolute",
		inset: 0,
		pointerEvents: "none"
	} }));
	get inputWrapperProps() {
		return this.#inputWrapperProps();
	}
	set inputWrapperProps($$value) {
		return this.#inputWrapperProps($$value);
	}
	#inputStyle = derived(() => ({
		position: "absolute",
		inset: 0,
		width: this.#pwmb.willPushPwmBadge ? `calc(100% + ${this.#pwmb.PWM_BADGE_SPACE_WIDTH})` : "100%",
		clipPath: this.#pwmb.willPushPwmBadge ? `inset(0 ${this.#pwmb.PWM_BADGE_SPACE_WIDTH} 0 0)` : void 0,
		height: "100%",
		display: "flex",
		textAlign: this.opts.textAlign.current,
		opacity: "1",
		color: "transparent",
		pointerEvents: "all",
		background: "transparent",
		caretColor: "transparent",
		border: "0 solid transparent",
		outline: "0 solid transparent",
		boxShadow: "none",
		lineHeight: "1",
		letterSpacing: "-.5em",
		fontSize: "var(--bits-pin-input-root-height)",
		fontFamily: "monospace",
		fontVariantNumeric: "tabular-nums"
	}));
	#applyStyles() {
		const doc = this.domContext.getDocument();
		const styleEl = doc.createElement("style");
		styleEl.id = "pin-input-style";
		doc.head.appendChild(styleEl);
		if (styleEl.sheet) {
			const autoFillStyles = "background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;";
			safeInsertRule(styleEl.sheet, "[data-pin-input-input]::selection { background: transparent !important; color: transparent !important; }");
			safeInsertRule(styleEl.sheet, `[data-pin-input-input]:autofill { ${autoFillStyles} }`);
			safeInsertRule(styleEl.sheet, `[data-pin-input-input]:-webkit-autofill { ${autoFillStyles} }`);
			safeInsertRule(styleEl.sheet, `@supports (-webkit-touch-callout: none) { [data-pin-input-input] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }`);
			safeInsertRule(styleEl.sheet, `[data-pin-input-input] + * { pointer-events: all !important; }`);
		}
	}
	#onDocumentSelectionChange = () => {
		const input = this.opts.inputRef.current;
		const container = this.opts.ref.current;
		if (!input || !container) return;
		if (this.domContext.getActiveElement() !== input) {
			this.#mirrorSelectionStart = null;
			this.#mirrorSelectionEnd = null;
			return;
		}
		const selStart = input.selectionStart;
		const selEnd = input.selectionEnd;
		const selDir = input.selectionDirection ?? "none";
		const maxLength = input.maxLength;
		const val = input.value;
		const prev = this.#prevInputMetadata.prev;
		let start = -1;
		let end = -1;
		let direction;
		if (val.length !== 0 && selStart !== null && selEnd !== null) {
			const isSingleCaret = selStart === selEnd;
			const isInsertMode = selStart === val.length && val.length < maxLength;
			if (isSingleCaret && !isInsertMode) {
				const c = selStart;
				if (c === 0) {
					start = 0;
					end = 1;
					direction = "forward";
				} else if (c === maxLength) {
					start = c - 1;
					end = c;
					direction = "backward";
				} else if (maxLength > 1 && val.length > 1) {
					let offset = 0;
					if (prev[0] !== null && prev[1] !== null) {
						direction = c < prev[1] ? "backward" : "forward";
						const wasPreviouslyInserting = prev[0] === prev[1] && prev[0] < maxLength;
						if (direction === "backward" && !wasPreviouslyInserting) offset = -1;
					}
					start = offset + c;
					end = offset + c + 1;
				}
			}
			if (start !== -1 && end !== -1 && start !== end) this.opts.inputRef.current?.setSelectionRange(start, end, direction);
		}
		const s = start !== -1 ? start : selStart;
		const e = end !== -1 ? end : selEnd;
		const dir = direction ?? selDir;
		this.#mirrorSelectionStart = s;
		this.#mirrorSelectionEnd = e;
		this.#prevInputMetadata.prev = [
			s,
			e,
			dir
		];
	};
	oninput = (e) => {
		const newValue = e.currentTarget.value.slice(0, this.opts.maxLength.current);
		if (newValue.length > 0 && this.#regexPattern() && !this.#regexPattern().test(newValue)) {
			e.preventDefault();
			return;
		}
		if (typeof this.#previousValue.current === "string" && newValue.length < this.#previousValue.current.length) this.domContext.getDocument().dispatchEvent(new Event("selectionchange"));
		this.opts.value.current = newValue;
	};
	onfocus = (_) => {
		const input = this.opts.inputRef.current;
		if (input) {
			const start = Math.min(input.value.length, this.opts.maxLength.current - 1);
			const end = input.value.length;
			input.setSelectionRange(start, end);
			this.#mirrorSelectionStart = start;
			this.#mirrorSelectionEnd = end;
		}
		this.#isFocused.current = true;
	};
	onpaste = (e) => {
		const input = this.opts.inputRef.current;
		if (!input) return;
		const getNewValue = (finalContent) => {
			const start = input.selectionStart === null ? void 0 : input.selectionStart;
			const end = input.selectionEnd === null ? void 0 : input.selectionEnd;
			const isReplacing = start !== end;
			const initNewVal = this.opts.value.current;
			return (isReplacing ? initNewVal.slice(0, start) + finalContent + initNewVal.slice(end) : initNewVal.slice(0, start) + finalContent + initNewVal.slice(start)).slice(0, this.opts.maxLength.current);
		};
		const isValueInvalid = (newValue) => {
			return newValue.length > 0 && this.#regexPattern() && !this.#regexPattern().test(newValue);
		};
		if (!this.opts.pasteTransformer?.current && (!this.#initialLoad.isIOS || !e.clipboardData || !input)) {
			if (isValueInvalid(getNewValue(e.clipboardData?.getData("text/plain")))) e.preventDefault();
			return;
		}
		const _content = e.clipboardData?.getData("text/plain") ?? "";
		const content = this.opts.pasteTransformer?.current ? this.opts.pasteTransformer.current(_content) : _content;
		e.preventDefault();
		const newValue = getNewValue(content);
		if (isValueInvalid(newValue)) return;
		input.value = newValue;
		this.opts.value.current = newValue;
		const selStart = Math.min(newValue.length, this.opts.maxLength.current - 1);
		const selEnd = newValue.length;
		input.setSelectionRange(selStart, selEnd);
		this.#mirrorSelectionStart = selStart;
		this.#mirrorSelectionEnd = selEnd;
	};
	onmouseover = (_) => {
		this.#isHoveringInput = true;
	};
	onmouseleave = (_) => {
		this.#isHoveringInput = false;
	};
	onblur = (_) => {
		if (this.#prevInputMetadata.willSyntheticBlur) {
			this.#prevInputMetadata.willSyntheticBlur = false;
			return;
		}
		this.#isFocused.current = false;
	};
	#inputProps = derived(() => ({
		id: this.opts.inputId.current,
		style: this.#inputStyle(),
		autocomplete: this.opts.autocomplete.current || "one-time-code",
		"data-pin-input-input": "",
		"data-pin-input-input-mss": this.#mirrorSelectionStart,
		"data-pin-input-input-mse": this.#mirrorSelectionEnd,
		inputmode: this.opts.inputmode.current,
		pattern: this.#regexPattern()?.source,
		maxlength: this.opts.maxLength.current,
		value: this.opts.value.current,
		disabled: boolToTrueOrUndef(this.opts.disabled.current),
		onpaste: this.onpaste,
		oninput: this.oninput,
		onkeydown: this.onkeydown,
		onmouseover: this.onmouseover,
		onmouseleave: this.onmouseleave,
		onfocus: this.onfocus,
		onblur: this.onblur,
		...this.inputAttachment
	}));
	get inputProps() {
		return this.#inputProps();
	}
	set inputProps($$value) {
		return this.#inputProps($$value);
	}
	#cells = derived(() => Array.from({ length: this.opts.maxLength.current }).map((_, idx) => {
		const isActive = this.#isFocused.current && this.#mirrorSelectionStart !== null && this.#mirrorSelectionEnd !== null && (this.#mirrorSelectionStart === this.#mirrorSelectionEnd && idx === this.#mirrorSelectionStart || idx >= this.#mirrorSelectionStart && idx < this.#mirrorSelectionEnd);
		const char = this.opts.value.current[idx] !== void 0 ? this.opts.value.current[idx] : null;
		return {
			char,
			isActive,
			hasFakeCaret: isActive && char === null
		};
	}));
	#snippetProps = derived(() => ({
		cells: this.#cells(),
		isFocused: this.#isFocused.current,
		isHovering: this.#isHoveringInput
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
};
var PinInputCellState = class PinInputCellState {
	static create(opts) {
		return new PinInputCellState(opts);
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		[pinInputAttrs.cell]: "",
		"data-active": this.opts.cell.current.isActive ? "" : void 0,
		"data-inactive": !this.opts.cell.current.isActive ? "" : void 0,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function syncTimeouts(cb, domContext) {
	return [
		domContext.setTimeout(cb, 0),
		domContext.setTimeout(cb, 10),
		domContext.setTimeout(cb, 50)
	];
}
function safeInsertRule(sheet, rule) {
	try {
		sheet.insertRule(rule);
	} catch {
		console.error("pin input could not insert CSS rule:", rule);
	}
}
//#endregion
//#region node_modules/bits-ui/dist/bits/pin-input/components/pin-input.svelte
function Pin_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), inputId = `${createId(uid)}-input`, ref = null, inputRef = null, maxlength = 6, textalign = "left", pattern, inputmode = "numeric", onComplete = noop$1, pushPasswordManagerStrategy = "increase-width", class: containerClass = "", children, autocomplete = "one-time-code", disabled = false, value = "", onValueChange = noop$1, pasteTransformer, $$slots, $$events, ...restProps } = $$props;
		const rootState = PinInputRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			inputRef: boxWith(() => inputRef, (v) => inputRef = v),
			inputId: boxWith(() => inputId),
			autocomplete: boxWith(() => autocomplete),
			maxLength: boxWith(() => maxlength),
			textAlign: boxWith(() => textalign),
			disabled: boxWith(() => disabled),
			inputmode: boxWith(() => inputmode),
			pattern: boxWith(() => pattern),
			onComplete: boxWith(() => onComplete),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			pushPasswordManagerStrategy: boxWith(() => pushPasswordManagerStrategy),
			pasteTransformer: boxWith(() => pasteTransformer)
		});
		const mergedInputProps = derived(() => mergeProps(restProps, rootState.inputProps));
		const mergedRootProps = derived(() => mergeProps(rootState.rootProps, { class: containerClass }));
		const mergedInputWrapperProps = derived(() => mergeProps(rootState.inputWrapperProps, {}));
		$$renderer.push(`<div${attributes({ ...mergedRootProps() })}>`);
		children?.($$renderer, rootState.snippetProps);
		$$renderer.push(`<!----> <div${attributes({ ...mergedInputWrapperProps() })}><input${attributes({ ...mergedInputProps() }, void 0, void 0, void 0, 4)}/></div></div>`);
		bind_props($$props, {
			ref,
			inputRef,
			value
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/pin-input/components/pin-input-cell.svelte
function Pin_input_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, cell, child, children, $$slots, $$events, ...restProps } = $$props;
		const cellState = PinInputCellState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			cell: boxWith(() => cell)
		});
		const mergedProps = derived(() => mergeProps(restProps, cellState.props));
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
//#region src/lib/components/seo/SEO.svelte
function SEO($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title, description = SITE.description, keywords = SITE.keywords, ogType = "website", ogImage = SITE.ogImage, canonical, noindex = false, nofollow = false, robotsMaxSnippet, robotsMaxImagePreview, jsonLd, breadcrumbs, alternateLanguages, article, video } = $$props;
		const fullTitle = derived(() => title.includes(SITE.name) ? title : `${title} | ${SITE.name}`);
		const canonicalUrl = derived(() => canonical ?? `${SITE.domain}${page.url.pathname}`);
		const ogImageUrl = derived(() => ogImage.startsWith("http") ? ogImage : `${SITE.domain}${ogImage}`);
		const robotsDirectives = derived(() => {
			const parts = [];
			if (noindex) parts.push("noindex");
			if (nofollow) parts.push("nofollow");
			if (!noindex && !nofollow) parts.push("index, follow");
			if (robotsMaxSnippet !== void 0) parts.push(`max-snippet:${robotsMaxSnippet}`);
			if (robotsMaxImagePreview) parts.push(`max-image-preview:${robotsMaxImagePreview}`);
			return parts.join(", ");
		});
		const allLd = derived(() => {
			const out = [];
			if (breadcrumbs) out.push({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: breadcrumbs.map((c, i) => ({
					"@type": "ListItem",
					position: i + 1,
					name: c.name,
					item: c.url
				}))
			});
			if (jsonLd) out.push(...Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
			return out;
		});
		head("4zaoqz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(fullTitle())}</title>`);
			});
			$$renderer.push(`<meta name="description"${attr("content", description)}/> <meta name="keywords"${attr("content", keywords)}/> <link rel="canonical"${attr("href", canonicalUrl())}/> <meta name="robots"${attr("content", robotsDirectives())}/> <meta name="googlebot"${attr("content", robotsDirectives())}/> <meta name="language"${attr("content", SITE.lang)}/> <meta name="author"${attr("content", SITE.name)}/> <meta name="publisher"${attr("content", SITE.name)}/> <meta name="copyright"${attr("content", `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${SITE.name}`)}/> <meta property="og:site_name"${attr("content", SITE.name)}/> <meta property="og:title"${attr("content", fullTitle())}/> <meta property="og:description"${attr("content", description)}/> <meta property="og:type"${attr("content", ogType)}/> <meta property="og:url"${attr("content", canonicalUrl())}/> <meta property="og:locale"${attr("content", SITE.locale)}/> <meta property="og:image"${attr("content", ogImageUrl())}/> <meta property="og:image:alt"${attr("content", fullTitle())}/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site"${attr("content", SITE.twitterHandle)}/> <meta name="twitter:creator"${attr("content", SITE.twitterHandle)}/> <meta name="twitter:title"${attr("content", fullTitle())}/> <meta name="twitter:description"${attr("content", description)}/> <meta name="twitter:image"${attr("content", ogImageUrl())}/> <meta name="twitter:image:alt"${attr("content", fullTitle())}/> `);
			if (article) {
				$$renderer.push("<!--[0-->");
				if (article.publishedTime) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:published_time"${attr("content", article.publishedTime)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.modifiedTime) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:modified_time"${attr("content", article.modifiedTime)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.author) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:author"${attr("content", article.author)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.section) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:section"${attr("content", article.section)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.tags) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<!--[-->`);
					const each_array = ensure_array_like(article.tags);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let tag = each_array[$$index];
						$$renderer.push(`<meta property="article:tag"${attr("content", tag)}/>`);
					}
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (video) {
				$$renderer.push("<!--[0-->");
				if (video.duration) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="video:duration"${attr("content", video.duration)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (video.releaseDate) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="video:release_date"${attr("content", video.releaseDate)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (alternateLanguages) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<!--[-->`);
				const each_array_1 = ensure_array_like(alternateLanguages);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let alt = each_array_1[$$index_1];
					$$renderer.push(`<link rel="alternate"${attr("hreflang", alt.lang)}${attr("href", alt.url)}/>`);
				}
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <link rel="alternate" hreflang="x-default"${attr("href", SITE.domain)}/>`);
		});
		$$renderer.push(`<!--[-->`);
		const each_array_2 = ensure_array_like(allLd());
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let item = each_array_2[$$index_2];
			const json = JSON.stringify(item);
			$$renderer.push(`${html(`<script type="application/ld+json">${json}<\/script>`)}`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/seo/schema.ts
function ld(type, rest) {
	return {
		"@context": "https://schema.org",
		"@type": type,
		...rest
	};
}
function websiteSchema(searchUrl) {
	const base = ld("WebSite", {
		name: `${SITE.name} | ${SITE.tagline}`,
		url: SITE.domain,
		inLanguage: SITE.locale,
		description: SITE.description,
		publisher: { "@id": `${SITE.domain}/#organization` }
	});
	if (searchUrl) base.potentialAction = {
		"@type": "SearchAction",
		target: {
			"@type": "EntryPoint",
			urlTemplate: `${SITE.domain}/search?q={search_term_string}`
		},
		"query-input": "required name=search_term_string"
	};
	return base;
}
function organizationSchema() {
	return ld("Organization", {
		"@id": `${SITE.domain}/#organization`,
		name: SITE.name,
		alternateName: SITE.nameHebrew,
		url: SITE.domain,
		logo: `${SITE.domain}/favicon.svg`,
		description: SITE.description,
		foundingDate: SITE.founded,
		sameAs: Object.values(SITE.social).filter(Boolean),
		contactPoint: {
			"@type": "ContactPoint",
			telephone: SITE.phone,
			contactType: "customer service",
			availableLanguage: ["Hebrew", "English"]
		}
	});
}
function localBusinessSchema() {
	return ld("ExerciseGym", {
		"@id": `${SITE.domain}/#business`,
		name: `${SITE.name} — ${SITE.tagline}`,
		alternateName: SITE.nameHebrew,
		url: SITE.domain,
		logo: `${SITE.domain}/favicon.svg`,
		description: SITE.description,
		image: `${SITE.domain}${SITE.ogImage}`,
		priceRange: SITE.priceRange,
		telephone: SITE.phone,
		email: SITE.email,
		address: {
			"@type": "PostalAddress",
			addressLocality: SITE.address.city,
			addressRegion: SITE.address.region,
			addressCountry: SITE.address.country
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: SITE.geo.latitude,
			longitude: SITE.geo.longitude
		},
		openingHoursSpecification: SITE.openingHours.map((h) => ({
			"@type": "OpeningHoursSpecification",
			dayOfWeek: h.dayOfWeek,
			opens: h.opens,
			closes: h.closes
		})),
		sameAs: Object.values(SITE.social).filter(Boolean),
		areaServed: {
			"@type": "Country",
			name: "Israel"
		},
		hasOfferCatalog: { "@id": `${SITE.domain}/#offers` }
	});
}
function offerCatalogSchema() {
	return ld("OfferCatalog", {
		"@id": `${SITE.domain}/#offers`,
		name: "שירותי פילאטיס אונליין",
		itemListElement: [
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "שיעורי פילאטיס מוקלטים",
					description: "מאות שיעורים מוקלטים בכל רמה — 15, 30, 45 דקות. עם גרפיקת פטולוגיה אנטומית.",
					provider: { "@id": `${SITE.domain}/#organization` },
					areaServed: {
						"@type": "Country",
						name: "Israel"
					},
					audience: {
						"@type": "PeopleAudience",
						audienceType: "מבוגרים עם כאבים או מגבלות תנועה"
					}
				}
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "שיעורי פילאטיס חיים בקבוצה",
					description: "שיעורים חיים בקבוצות קטנות עד 12 משתתפים, עם תיקון בזמן אמת.",
					provider: { "@id": `${SITE.domain}/#organization` },
					areaServed: {
						"@type": "Country",
						name: "Israel"
					}
				}
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "שיעור פילאטיס פרטי אונליין",
					description: "שיעור אחד על אחד עם התאמה מלאה לגוף, לכאבים ולמטרות האישיות.",
					provider: { "@id": `${SITE.domain}/#organization` },
					areaServed: {
						"@type": "Country",
						name: "Israel"
					}
				}
			}
		]
	});
}
function courseSchema() {
	return ld("Course", {
		"@id": `${SITE.domain}/#course`,
		name: "קורס פילאטיס שיקומי אונליין",
		description: "קורס פילאטיס מקיף באנגלית/עברית עם התמחות בפתולוגיות, כאבי גב, דיסק, כתף קפואה ושיקום אחרי ניתוח.",
		provider: { "@id": `${SITE.domain}/#organization` },
		inLanguage: "he",
		educationalLevel: "מתחילים עד מתקדמים",
		teaches: [
			"פילאטיס קלאסי",
			"פילאטיס שיקומי",
			"הבנת אנטומיה בתנועה",
			"תרגילים לכאבי גב",
			"תרגילים לדיסק",
			"תרגילים לכתף קפואה"
		],
		hasCourseInstance: [
			{
				"@type": "CourseInstance",
				courseMode: "online",
				courseWorkload: "PT15M",
				inLanguage: "he"
			},
			{
				"@type": "CourseInstance",
				courseMode: "online",
				courseWorkload: "PT30M",
				inLanguage: "he"
			},
			{
				"@type": "CourseInstance",
				courseMode: "online",
				courseWorkload: "PT45M",
				inLanguage: "he"
			},
			{
				"@type": "CourseInstance",
				courseMode: ["online", "synchronous"],
				courseWorkload: "PT60M",
				inLanguage: "he"
			}
		]
	});
}
function faqPageSchema(items) {
	return ld("FAQPage", { mainEntity: items.map((item) => ({
		"@type": "Question",
		name: item.question,
		acceptedAnswer: {
			"@type": "Answer",
			text: item.answer
		}
	})) });
}
function howToSchema(name, description, steps) {
	return ld("HowTo", {
		name,
		description,
		inLanguage: "he",
		step: steps.map((s) => ({
			"@type": "HowToStep",
			position: s.position,
			name: s.name,
			text: s.text
		}))
	});
}
function breadcrumbSchema(crumbs) {
	return ld("BreadcrumbList", { itemListElement: crumbs.map((c, i) => ({
		"@type": "ListItem",
		position: i + 1,
		name: c.name,
		item: c.url
	})) });
}
function medicalWebPageSchema(title, description, url, lastReviewed) {
	return ld("MedicalWebPage", {
		"@id": `${url}#webpage`,
		name: title,
		description,
		url,
		inLanguage: SITE.locale,
		lastReviewed: lastReviewed ?? (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reviewedBy: {
			"@type": "Person",
			name: "מדריכת פילאטיס מוסמכת",
			description: "מדריכת פילאטיס עם הסמכה מבית מרתה פילאטיס והתמחות בפתולוגיות ושיקום."
		},
		about: {
			"@type": "MedicalCondition",
			name: "כאבי גב כרוניים, מגבלות תנועה, שיקום אורתופדי",
			description: "פילאטיס שיקומי כטיפול תומך בכאבי גב, דיסק, כתף קפואה ומגבלות תנועה נוספות."
		},
		isPartOf: { "@id": `${SITE.domain}/#website` },
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: `${SITE.domain}${SITE.ogImage}`
		},
		speakable: {
			"@type": "SpeakableSpecification",
			cssSelector: [
				".hero h1",
				".lead",
				"#content"
			]
		}
	});
}
function personSchema(name, description, jobTitle, alumniOf) {
	return ld("Person", {
		name,
		description,
		jobTitle,
		alumniOf: alumniOf ? {
			"@type": "Organization",
			name: alumniOf
		} : void 0,
		worksFor: { "@id": `${SITE.domain}/#organization` },
		knowsAbout: [
			"פילאטיס קלאסי",
			"פילאטיס שיקומי",
			"פתולוגיות של מערכת תנועה",
			"אנטומיה פונקציונלית",
			"שיקום אורתופדי"
		]
	});
}
function schemaGraph(...schemas) {
	return {
		"@context": "https://schema.org",
		"@graph": schemas.map((s) => {
			const { "@context": _, ...rest } = s;
			return rest;
		})
	};
}
//#endregion
//#region src/lib/features/auth/components/EmailStep.svelte
function EmailStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { email = void 0, pending, method, sendCode, sendLink } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<label class="hb-input-field"><span class="hb-field__label">${escape_html(t.auth.emailLabel())}</span> <input class="hb-input" type="email" name="email" autocomplete="email" required=""${attr("value", email)}/></label> <div class="method-buttons grid gap-3 svelte-115ousx">`);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--ink",
				type: "button",
				disabled: pending,
				onclick: sendCode,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(pending && method === "code" ? t.auth.pendingSendCode() : t.auth.submitSendCode())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` `);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--paper",
				type: "button",
				disabled: pending,
				onclick: sendLink,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(pending && method === "link" ? t.auth.pendingSendLink() : t.auth.submitSendLink())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(`</div>`);
		bind_props($$props, { email });
	});
}
//#endregion
//#region src/lib/features/auth/components/CodeStep.svelte
function Cell($$renderer, cell) {
	if (Pin_input_cell) {
		$$renderer.push("<!--[-->");
		Pin_input_cell($$renderer, {
			cell,
			class: "otp-cell",
			children: ($$renderer) => {
				if (cell.char !== null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span>${escape_html(cell.char)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (cell.hasFakeCaret) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="otp-caret" aria-hidden="true"></span>`);
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
function CodeStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code = void 0, email, pending, method, reset, switchToCode, submitCode } = $$props;
		const { t } = useI18n();
		function openEmailApp() {
			window.location.href = "mailto:";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (method === "code") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="hb-input-field"><label class="hb-field__label" for="auth-code-input">${escape_html(t.auth.codeLabel())}</label> `);
				{
					function children($$renderer, { cells }) {
						$$renderer.push(`<div class="otp-cells svelte-2pyi9i" dir="ltr"><!--[-->`);
						const each_array = ensure_array_like(cells);
						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let cell = each_array[index];
							Cell($$renderer, cell);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					if (Pin_input) {
						$$renderer.push("<!--[-->");
						Pin_input($$renderer, {
							inputId: "auth-code-input",
							maxlength: 6,
							pattern: REGEXP_ONLY_DIGITS,
							textalign: "center",
							onComplete: submitCode,
							get value() {
								return code;
							},
							set value($$value) {
								code = $$value;
								$$settled = false;
							},
							children,
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				}
				$$renderer.push(`</div> `);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--ink",
						type: "submit",
						disabled: pending,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(pending ? t.auth.pendingVerify() : t.auth.submitEnter())}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(` <div class="auth-links svelte-2pyi9i">`);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--ghost",
						type: "button",
						onclick: reset,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(t.auth.switchEmail())}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(`</div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="link-sent svelte-2pyi9i"><p class="svelte-2pyi9i">${escape_html(t.auth.linkSentText())}</p> `);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--paper",
						type: "button",
						onclick: openEmailApp,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(t.auth.openEmailApp())}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(`</div> <div class="auth-divider svelte-2pyi9i"><span>${escape_html(t.misc.or())}</span></div> <div class="auth-links svelte-2pyi9i">`);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--ghost",
						type: "button",
						onclick: switchToCode,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(t.auth.enterCodeManually())}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(` `);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--ghost",
						type: "button",
						onclick: reset,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(t.auth.switchEmail())}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(`</div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { code });
	});
}
//#endregion
//#region src/lib/features/auth/components/LoggedInState.svelte
function LoggedInState($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { signOut, closeModal } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="auth-state grid gap-4"><div class="auth-state__text grid gap-2 svelte-1si2n1d"><p class="kicker svelte-1si2n1d">${escape_html(t.auth.loggedIn.kicker())}</p> <h2 class="svelte-1si2n1d">${escape_html(t.auth.loggedIn.title())}</h2> <p class="intro svelte-1si2n1d">${escape_html(t.auth.loggedIn.subtitle())}</p></div> `);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--ink",
				href: "/u/dashboard",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.auth.loggedIn.cta())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` `);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--paper",
				type: "button",
				onclick: () => {
					signOut();
					closeModal();
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.auth.loggedIn.signOut())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(`</div>`);
	});
}
//#endregion
//#region src/lib/features/auth/components/AuthPanel.svelte
function AuthPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let step = "email";
		let method = null;
		let email = "";
		let code = "";
		let status = "";
		let pending = false;
		const auth = initAuth();
		const client = useConvexClient();
		const { t } = useI18n();
		async function sendCode() {
			if (!email.trim()) {
				status = t.auth.validation.emailRequired();
				return;
			}
			method = "code";
			await submitRequest();
		}
		async function sendLink() {
			if (!email.trim()) {
				status = t.auth.validation.emailRequired();
				return;
			}
			method = "link";
			await submitRequest();
		}
		async function submitRequest() {
			status = "";
			pending = true;
			try {
				await client.action(api.auth.signIn, {
					provider: "email",
					params: { email: email.trim().toLowerCase() }
				});
				step = "verify";
				if (method === "code") status = t.auth.statusCodeSent();
				else status = t.auth.statusLinkSent();
			} catch (reason) {
				status = reason instanceof Error ? reason.message : t.auth.statusSendError();
				method = null;
			} finally {
				pending = false;
			}
		}
		async function verifyCode() {
			if (!code.trim()) return;
			status = "";
			pending = true;
			try {
				storeTokens((await client.action(api.auth.signIn, {
					provider: "email",
					params: {
						email,
						code: code.trim()
					}
				})).tokens ?? null);
				window.location.assign("/onboarding");
			} catch (reason) {
				status = reason instanceof Error ? reason.message : t.auth.statusCodeError();
			} finally {
				pending = false;
			}
		}
		function reset() {
			step = "email";
			method = null;
			status = "";
			code = "";
		}
		function closeModal() {
			window.dispatchEvent(new CustomEvent("homebody:auth-close"));
		}
		function switchToCode() {
			method = "code";
			code = "";
			status = "";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (auth.isLoading) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="auth-state svelte-1afm3hr">`);
				Notice($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.auth.loading())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			} else if (auth.isAuthenticated) {
				$$renderer.push("<!--[1-->");
				LoggedInState($$renderer, {
					signOut,
					closeModal
				});
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<form class="auth-form svelte-1afm3hr"><div class="auth-form__header svelte-1afm3hr"><p class="kicker svelte-1afm3hr">${escape_html(t.auth.title())}</p> `);
				if (step === "email") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<h2 class="svelte-1afm3hr">${escape_html(t.auth.emailStepTitle())}</h2> <p class="intro svelte-1afm3hr">${escape_html(t.auth.emailStepIntro())}</p>`);
				} else if (method === "code") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<h2 class="svelte-1afm3hr">${escape_html(t.auth.codeStepTitle())}</h2> <p class="intro svelte-1afm3hr">${escape_html(t.auth.codeStepIntro({ email }))}</p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<h2 class="svelte-1afm3hr">${escape_html(t.auth.codeStepTitle())}</h2> <p class="intro svelte-1afm3hr">${escape_html(t.auth.linkStepIntro({ email }))}</p>`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (step === "email") {
					$$renderer.push("<!--[0-->");
					EmailStep($$renderer, {
						pending,
						method,
						sendCode,
						sendLink,
						get email() {
							return email;
						},
						set email($$value) {
							email = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push("<!--[-1-->");
					CodeStep($$renderer, {
						email,
						pending,
						method,
						reset,
						switchToCode,
						submitCode: verifyCode,
						get code() {
							return code;
						},
						set code($$value) {
							code = $$value;
							$$settled = false;
						}
					});
				}
				$$renderer.push(`<!--]--> `);
				if (auth.error) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "danger",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(auth.error)}`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (status) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: status.includes("לא הצלחנו") || status.includes("שגוי") || status.includes("נא להזין") ? "danger" : "neutral",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(status)}`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></form>`);
			}
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
//#region src/lib/components/layout/Footer.svelte
function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		$$renderer.push(`<footer class="site-footer svelte-7lfk2o"><div class="footer-inner svelte-7lfk2o"><div class="footer-brand svelte-7lfk2o"><span class="footer-logo svelte-7lfk2o">HomeBody</span> <span class="footer-tagline svelte-7lfk2o">פילאטיס שיקומי אונליין</span></div> <div class="footer-links svelte-7lfk2o"><a href="/" class="svelte-7lfk2o">דף הבית</a> <a href="/legal/terms" class="svelte-7lfk2o">תנאי שימוש</a> <a href="/legal/privacy" class="svelte-7lfk2o">מדיניות פרטיות</a> <a href="/legal/cancellations" class="svelte-7lfk2o">ביטולים</a> <a href="/legal/accessibility" class="svelte-7lfk2o">נגישות</a></div> <div class="footer-contact svelte-7lfk2o"><a href="mailto:hello@homebody.fitness" class="svelte-7lfk2o">hello@homebody.fitness</a> <span dir="ltr" class="svelte-7lfk2o">+972-50-000-0000</span></div></div> <div class="footer-legal svelte-7lfk2o"><span>© ${escape_html(year)} HomeBody</span> <a href="/legal/health" class="svelte-7lfk2o">הצהרת בריאות</a> <a href="/legal/privacy" class="svelte-7lfk2o">פרטיות</a></div></footer>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/HeroSection.svelte
function HeroSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { openAuthOverlay } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="hero" aria-label="ראשי"><div class="hero__inner"><p class="eyebrow">${escape_html(t.landing.hero.eyebrow())}</p> <h1>${escape_html(t.landing.hero.headline())}</h1> <p class="lead">${escape_html(t.landing.hero.lead())}</p> <div class="actions">`);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--ink",
				type: "button",
				onclick: openAuthOverlay,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.landing.hero.ctaPrimary())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` `);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--paper",
				href: "#instructor",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.landing.hero.ctaSecondary())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(`</div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PhilosophySection.svelte
function PhilosophySection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--philosophy" aria-label="הגישה שלנו"><div class="philosophy-inner"><span class="section-tag">${escape_html(t.landing.philosophy.tag())}</span> <h2>${escape_html(t.landing.philosophy.headline())}</h2> <p class="philosophy-body">${escape_html(t.landing.philosophy.body())}</p></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/InstructorSection.svelte
function InstructorSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { instructor } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section id="instructor" class="content-section section--instructor" aria-label="המדריכה"><div class="instructor-split"><div class="instructor-visual"><div class="instructor-photo-placeholder"><span class="instructor-photo-label">${escape_html(t.landing.instructor.photoPlaceholder())}</span></div></div> <div class="instructor-text"><span class="section-tag">${escape_html(t.landing.instructor.tag())}</span> <h2>${escape_html(instructor.name)} — ${escape_html(t.landing.instructor.subtitle())}</h2> <p class="instructor-lead">${escape_html(t.landing.instructor.lead())}</p> <p class="instructor-body">${escape_html(t.landing.instructor.body({ years: instructor.years }))}</p> <p class="instructor-story">${escape_html(instructor.story)}</p> <div class="instructor-creds"><div class="cred-item"><span class="cred-num">01</span> <span class="cred-label">${escape_html(t.landing.instructor.cred1())}</span></div> <div class="cred-item"><span class="cred-num">02</span> <span class="cred-label">${escape_html(t.landing.instructor.cred2())}</span></div> <div class="cred-item"><span class="cred-num">03</span> <span class="cred-label">${escape_html(t.landing.instructor.cred3({ years: instructor.years }))}</span></div></div></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PreviewSection.svelte
function PreviewSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--preview" aria-label="תצוגה מקדימה"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.preview.tag())}</span> <h2>${escape_html(t.landing.preview.headline())}</h2></div> <div class="preview-frame"><div class="preview-placeholder"><div class="preview-label"><strong>${escape_html(t.landing.preview.videoPlaceholderTitle())}</strong> <span>${escape_html(t.landing.preview.videoPlaceholderSubtitle())}</span></div></div> <div class="preview-caption">${escape_html(t.landing.preview.caption())}</div></div> <div class="preview-features"><div class="preview-feature"><span class="preview-feature-num">01</span> <h3>${escape_html(t.landing.preview.feature1Title())}</h3> <p>${escape_html(t.landing.preview.feature1Desc())}</p></div> <div class="preview-feature"><span class="preview-feature-num">02</span> <h3>${escape_html(t.landing.preview.feature2Title())}</h3> <p>${escape_html(t.landing.preview.feature2Desc())}</p></div> <div class="preview-feature"><span class="preview-feature-num">03</span> <h3>${escape_html(t.landing.preview.feature3Title())}</h3> <p>${escape_html(t.landing.preview.feature3Desc())}</p></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PillarsSection.svelte
function PillarsSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--pillars" aria-label="השירותים"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.pillars.tag())}</span> <h2>${escape_html(t.landing.pillars.headline())}</h2></div> <div class="pillars-grid"><article class="pillar"><span class="pillar-num">01</span> <h3>${escape_html(t.landing.pillars.macroTitle())}</h3> <p class="pillar-lead">${escape_html(t.landing.pillars.macroLead())}</p> <p class="pillar-body">${escape_html(t.landing.pillars.macroBody())}</p></article> <article class="pillar"><span class="pillar-num">02</span> <h3>${escape_html(t.landing.pillars.microTitle())}</h3> <p class="pillar-lead">${escape_html(t.landing.pillars.microLead())}</p> <p class="pillar-body">${escape_html(t.landing.pillars.microBody())}</p></article> <article class="pillar"><span class="pillar-num">03</span> <h3>${escape_html(t.landing.pillars.liveTitle())}</h3> <p class="pillar-lead">${escape_html(t.landing.pillars.liveLead())}</p> <p class="pillar-body">${escape_html(t.landing.pillars.liveBody())}</p></article></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/StepsSection.svelte
function StepsSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--steps" aria-label="איך זה עובד"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.steps.tag())}</span> <h2>${escape_html(t.landing.steps.headline())}</h2></div> <div class="steps-grid"><div class="step"><span class="step-num">01</span> <h3>${escape_html(t.landing.steps.step1Title())}</h3> <p>${escape_html(t.landing.steps.step1Desc())}</p></div> <div class="step"><span class="step-num">02</span> <h3>${escape_html(t.landing.steps.step2Title())}</h3> <p>${escape_html(t.landing.steps.step2Desc())}</p></div> <div class="step"><span class="step-num">03</span> <h3>${escape_html(t.landing.steps.step3Title())}</h3> <p>${escape_html(t.landing.steps.step3Desc())}</p></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PricingSection.svelte
function PricingSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { openAuthOverlay } = $$props;
		const { t } = useI18n();
		const auth = initAuth();
		const client = useConvexClient();
		const plansQuery = useQuery(api.subscriptions.customer.listPlans, {});
		let pendingPlan = null;
		let status = "";
		const planDescriptions = {
			starter: "כולל את דמי הפלטפורמה, 4 סרטוני macroflow, ושיעור לייב קבוצתי אחד.",
			steady: "למי שרוצה קצב שבועי: 8 סרטוני macroflow ו-2 לייבים קבוצתיים.",
			guided: "מוסיף קרדיט 1:1 חודשי לליווי אישי לצד וידאו ולייבים.",
			intensive: "מסלול כמעט מלא עם יותר פגישות אישיות ויותר תרגול חודשי."
		};
		async function subscribe(planSlug) {
			status = "";
			if (!auth.isAuthenticated) {
				openAuthOverlay();
				return;
			}
			pendingPlan = planSlug;
			try {
				await client.mutation(api.subscriptions.customer.activatePlan, { planSlug });
				window.location.assign("/u/dashboard");
			} catch (reason) {
				status = reason instanceof Error ? reason.message : "לא הצלחנו להפעיל מנוי כרגע.";
			} finally {
				pendingPlan = null;
			}
		}
		$$renderer.push(`<section class="content-section section--pricing" aria-label="מחירים"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.pricing.tag())}</span> <h2>${escape_html(t.landing.pricing.headline())}</h2></div> <div class="pricing-grid"><!--[-->`);
		const each_array = ensure_array_like(plansQuery.data ?? []);
		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let plan = each_array[index];
			$$renderer.push(`<div${attr_class("pricing-card", void 0, { "pricing-card--featured": index === 1 })}><div class="pricing-header"><span class="pricing-label">${escape_html(plan.nameHe)}</span> <span${attr_class("pricing-price", void 0, { "pricing-price--highlight": index !== 1 })}>${escape_html(plan.monthlyPriceIls)} ₪/חודש</span></div> <p class="pricing-note">${escape_html(planDescriptions[plan.slug] ?? "מסלול חודשי עם קרדיטים לתרגול.")}</p> <div class="pricing-breakdown"><span>פלטפורמה: ${escape_html(plan.platformFeeIls ?? 40)} ₪</span> <span>Macroflow: ${escape_html(plan.vodCreditsPerMonth)} קרדיטים</span> <span>לייב קבוצתי: ${escape_html(plan.liveCreditsPerMonth)} קרדיטים</span> <span>1:1 אישי: ${escape_html(plan.oneOnOneCreditsPerMonth)} קרדיטים</span></div> `);
			if (Button) {
				$$renderer.push("<!--[-->");
				Button($$renderer, {
					class: "hb-button hb-button--ink",
					type: "button",
					disabled: pendingPlan !== null,
					onclick: () => subscribe(plan.slug),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(pendingPlan === plan.slug ? "מפעילים..." : "הפעלת מסלול")}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
			$$renderer.push(`</div>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (status) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="pricing-status">${escape_html(status)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <p class="pricing-guarantee">כרגע אין ספק תשלום מחובר: המסלולים אמיתיים, והחיוב יחובר בהמשך דרך ספק סליקה ישראלי.</p></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/FAQSection.svelte
function FAQSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--faq" aria-label="שאלות נפוצות"><div class="section-header"><span class="section-tag">${escape_html(t.landing.faq.tag())}</span> <h2>${escape_html(t.landing.faq.headline())}</h2></div> `);
		if (Accordion) {
			$$renderer.push("<!--[-->");
			Accordion($$renderer, {
				type: "single",
				class: "faq-list",
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);
					const each_array = ensure_array_like(items);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];
						if (Accordion_item) {
							$$renderer.push("<!--[-->");
							Accordion_item($$renderer, {
								value: item.question,
								class: "faq-item",
								children: ($$renderer) => {
									if (Accordion_trigger) {
										$$renderer.push("<!--[-->");
										Accordion_trigger($$renderer, {
											class: "faq-trigger",
											children: ($$renderer) => {
												$$renderer.push(`<!---->${escape_html(item.question)}`);
											},
											$$slots: { default: true }
										});
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
									$$renderer.push(` `);
									if (Accordion_content) {
										$$renderer.push("<!--[-->");
										Accordion_content($$renderer, {
											class: "faq-answer",
											children: ($$renderer) => {
												$$renderer.push(`<p>${escape_html(item.answer)}</p>`);
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
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(`</section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/CTASection.svelte
function CTASection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { openAuthOverlay } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--final-cta" aria-label="התחילי עכשיו"><div class="final-cta-inner"><h2>${escape_html(t.landing.cta.headlineLine1())}<br/>${escape_html(t.landing.cta.headlineLine2())}</h2> <p>${escape_html(t.landing.cta.subheadline())}</p> `);
		if (Button) {
			$$renderer.push("<!--[-->");
			Button($$renderer, {
				class: "hb-button hb-button--ink",
				type: "button",
				onclick: openAuthOverlay,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.landing.cta.button())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` <p class="final-cta-note">${escape_html(t.landing.cta.note())}</p></div></section>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		let authOpen = false;
		const INSTRUCTOR = {
			name: "[שם המדריכה]",
			years: "X",
			story: "[סיפור אישי קצר — למה התחלת ללמד פילאטיס, מה הוביל אותך לפתוח HomeBody, איך הירושה ממרתה פילאטיס מעצבת את השיטה שלך. 2-3 משפטים אמיתיים.]"
		};
		function openAuthOverlay() {
			authOpen = true;
		}
		const pageUrl = SITE.domain;
		const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const faqItems = [
			{
				question: "אני מתחילה לגמרי — זה מתאים לי?",
				answer: "לגמרי. יש שיעורי מבוא שמסבירים את הבסיס — איך לנשום, איך להפעיל את ליבת הגוף, איך להתאים כל תרגיל לרמה שלך. אם יש לך מגבלה פיזית ספציפית (דיסק, כתף קפואה, כאבי ברכיים), תמיד אפשר לשאול לפני השיעור איזה תרגילים להימנע מהם."
			},
			{
				question: "האם השיעורים מתאימים לכאבי גב / דיסק / כתף קפואה?",
				answer: `כן — זה בדיוק התמחות שלנו. כל שיעור מלווה בהסברים על איזה תרגיל מתאים לאיזו פתולוגיה, ומה לעשות אם משהו כואב. אנחנו לא עושים "תעשי איתי" בלי הסבר. אם יש לך אבחון רפואי ספציפי, מומלץ לשלוח אותו לפני השיעור הראשון כדי שהמדריכה תוכל להתאים את התוכנית.`
			},
			{
				question: "מה ההבדל בין מקרופלואו למיקרופלואו?",
				answer: "מקרופלואו — סרטוני פילאטיס פלואו שלם בין חצי שעה לשעה. כל סרטון עולה קרדיט אחד ונשאר אצלך לתמיד, גם אחרי שאת כבר לא רשומה. מיקרופלואו — סרטונים קצרים של תרגיל או שניים, מתמקדים על שריר או גיד או פטולוגיה אחת. זמין לכל מי שמשלם מנוי. כשמפסיקים להיות רשומים — אין גישה אליהם יותר."
			},
			{
				question: "איך עובד הלייב? זום? גוגל מיט?",
				answer: "בכלל לא. הכל בפלטפורמה שלנו. נרשמת? את כבר בפנים. בלי להסתבך עם אימייל וקישורים ובלאגן. שיעורים קבוצתיים בלייב — אנחנו רואים אותם, הם רואים אותנו, והמדריכה נותנת תיקונים בזמן אמת. יש גם אפשרות לאחד על אחד."
			},
			{
				question: "איזה ציוד אני צריכה?",
				answer: "רק מזרן. אין צורך בציוד מקצועי או בסטודיו יקר. חלק מהשיעורים משתמשים בחפצים פשוטים מהבית — כרית, מגבת מגולגלת, כדור טניס. כל מה שצריך מופיע בתיאור השיעור לפני שמתחילים."
			},
			{
				question: "איך עובד השיעור הפרטי?",
				answer: "תואמים זמן דרך המערכת, מתחברים בווידאו, והמדריכה בונה שיעור מותאם אישית — על בסיס אבחון קצר שתמלאי לפני השיעור. אחרי השיעור תקבלי תכנית עבודה אישית עם תרגילים לשבוע הקרוב."
			},
			{
				question: "איך נראית הגרפיקה האנטומית בפועל?",
				answer: "בכל שיעור מוקלט מופיעים חצים ותוויות על גבי הסרטון שמראים בדיוק איזו שריר מופעל באותו רגע. אם התרגיל מיועד לדיסק צווארי — תראי בדיוק איזה חלק בגוף עובד ולמה. זה לא אנטומיה גנרית — זה מותאם לתרגיל הספציפי."
			}
		];
		const howToSteps = [
			{
				position: 1,
				name: t.landing.schema.step1Name(),
				text: t.landing.schema.step1Text()
			},
			{
				position: 2,
				name: t.landing.schema.step2Name(),
				text: t.landing.schema.step2Text()
			},
			{
				position: 3,
				name: t.landing.schema.step3Name(),
				text: t.landing.schema.step3Text()
			}
		];
		const jsonLd = schemaGraph(websiteSchema(), organizationSchema(), localBusinessSchema(), offerCatalogSchema(), courseSchema(), faqPageSchema(faqItems), howToSchema(t.landing.schema.howToTitle(), t.landing.schema.howToDescription(), howToSteps), medicalWebPageSchema(t.landing.seo.pageTitle(), SITE.description, pageUrl, today), personSchema(INSTRUCTOR.name, INSTRUCTOR.story, t.landing.instructor.subtitle(), t.landing.schema.instructorMentor()), breadcrumbSchema([{
			name: t.landing.seo.breadcrumbHome(),
			url: SITE.domain
		}]));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			SEO($$renderer, {
				title: t.landing.seo.pageTitle(),
				description: t.landing.seo.pageDescription(),
				keywords: SITE.keywords,
				ogType: "website",
				canonical: SITE.domain,
				jsonLd,
				breadcrumbs: [{
					name: t.landing.seo.breadcrumbHome(),
					url: SITE.domain
				}]
			});
			$$renderer.push(`<!----> <main class="landing" id="main-content">`);
			HeroSection($$renderer, { openAuthOverlay });
			$$renderer.push(`<!----> `);
			PhilosophySection($$renderer, {});
			$$renderer.push(`<!----> `);
			InstructorSection($$renderer, { instructor: INSTRUCTOR });
			$$renderer.push(`<!----> `);
			PreviewSection($$renderer, {});
			$$renderer.push(`<!----> `);
			PillarsSection($$renderer, {});
			$$renderer.push(`<!----> `);
			StepsSection($$renderer, {});
			$$renderer.push(`<!----> `);
			PricingSection($$renderer, { openAuthOverlay });
			$$renderer.push(`<!----> `);
			FAQSection($$renderer, { items: faqItems });
			$$renderer.push(`<!----> `);
			CTASection($$renderer, { openAuthOverlay });
			$$renderer.push(`<!----></main> `);
			Footer($$renderer, {});
			$$renderer.push(`<!----> `);
			if (Dialog) {
				$$renderer.push("<!--[-->");
				Dialog($$renderer, {
					get open() {
						return authOpen;
					},
					set open($$value) {
						authOpen = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						if (Portal) {
							$$renderer.push("<!--[-->");
							Portal($$renderer, {
								children: ($$renderer) => {
									if (Dialog_overlay) {
										$$renderer.push("<!--[-->");
										Dialog_overlay($$renderer, { class: "auth-overlay" });
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
									$$renderer.push(` `);
									if (Dialog_content) {
										$$renderer.push("<!--[-->");
										Dialog_content($$renderer, {
											class: "auth-card",
											"aria-label": "כניסה והרשמה",
											children: ($$renderer) => {
												AuthPanel($$renderer, {});
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
export { _page as default };
