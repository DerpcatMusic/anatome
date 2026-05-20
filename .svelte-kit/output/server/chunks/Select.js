import { a as bind_props, c as ensure_array_like, f as spread_props, i as attributes, n as attr_class, nt as escape_html, o as derived, u as props_id } from "./dev.js";
import { r as on } from "./events.js";
import "./session.svelte.js";
import { A as PAGE_DOWN, B as getDataOpenClosed, C as ARROW_UP, G as watch, H as Previous, I as boolToTrueOrUndef, J as attachRef, L as createBitsAttrs, N as boolToEmptyStrOrUndef, O as HOME, P as boolToStr, V as getDataTransitionAttrs, Z as mergeProps, at as boxWith, b as ARROW_DOWN, c as createId, h as isIOS, i as getNextMatch, j as PAGE_UP, l as noop, o as next, q as Context, r as forward, s as prev, t as backward } from "./arrays.js";
import { d as DOMTypeahead, f as boxAutoReset, m as PresenceManager, p as Portal } from "./scroll-lock.js";
import { a as getFloatingContentCSSVars, i as Floating_layer, n as Popper_layer, r as Floating_layer_anchor, t as Popper_layer_force_mount } from "./popper-layer-force-mount.js";
import { c as afterTick, i as DOMContext } from "./use-id.js";
import { t as Hidden_input } from "./hidden-input.js";
//#region node_modules/bits-ui/dist/internal/data-typeahead.svelte.js
var DataTypeahead = class {
	#opts;
	#candidateValues = derived(() => this.#opts.candidateValues());
	#search;
	constructor(opts) {
		this.#opts = opts;
		this.#search = boxAutoReset("", {
			afterMs: 1e3,
			getWindow: this.#opts.getWindow
		});
		this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this);
		this.resetTypeahead = this.resetTypeahead.bind(this);
	}
	handleTypeaheadSearch(key) {
		if (!this.#opts.enabled() || !this.#candidateValues().length) return;
		this.#search.current = this.#search.current + key;
		const currentItem = this.#opts.getCurrentItem();
		const currentMatch = this.#candidateValues().find((item) => item === currentItem) ?? "";
		const nextMatch = getNextMatch(this.#candidateValues().map((item) => item ?? ""), this.#search.current, currentMatch);
		const newItem = this.#candidateValues().find((item) => item === nextMatch);
		if (newItem) this.#opts.onMatch(newItem);
		return newItem;
	}
	resetTypeahead() {
		this.#search.current = "";
	}
};
var FIRST_KEYS = [
	ARROW_DOWN,
	PAGE_UP,
	HOME
];
var LAST_KEYS = [
	ARROW_UP,
	PAGE_DOWN,
	"End"
];
var FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
var selectAttrs = createBitsAttrs({
	component: "select",
	parts: [
		"trigger",
		"content",
		"item",
		"viewport",
		"scroll-up-button",
		"scroll-down-button",
		"group",
		"group-label",
		"separator",
		"arrow",
		"input",
		"content-wrapper",
		"item-text",
		"value"
	]
});
var SelectRootContext = new Context("Select.Root | Combobox.Root");
new Context("Select.Group | Combobox.Group");
var SelectContentContext = new Context("Select.Content | Combobox.Content");
var SelectBaseRootState = class {
	opts;
	touchedInput = false;
	inputNode = null;
	contentNode = null;
	contentPresence;
	viewportNode = null;
	triggerNode = null;
	valueNode = null;
	valueId = "";
	highlightedNode = null;
	#highlightedValue = derived(() => {
		if (!this.highlightedNode) return null;
		return this.highlightedNode.getAttribute("data-value");
	});
	get highlightedValue() {
		return this.#highlightedValue();
	}
	set highlightedValue($$value) {
		return this.#highlightedValue($$value);
	}
	#highlightedId = derived(() => {
		if (!this.highlightedNode) return void 0;
		return this.highlightedNode.id;
	});
	get highlightedId() {
		return this.#highlightedId();
	}
	set highlightedId($$value) {
		return this.#highlightedId($$value);
	}
	#highlightedLabel = derived(() => {
		if (!this.highlightedNode) return null;
		return this.highlightedNode.getAttribute("data-label");
	});
	get highlightedLabel() {
		return this.#highlightedLabel();
	}
	set highlightedLabel($$value) {
		return this.#highlightedLabel($$value);
	}
	contentIsPositioned = false;
	isUsingKeyboard = false;
	isCombobox = false;
	domContext = new DOMContext(() => null);
	constructor(opts) {
		this.opts = opts;
		this.isCombobox = opts.isCombobox;
		this.contentPresence = new PresenceManager({
			ref: boxWith(() => this.contentNode),
			open: this.opts.open,
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			}
		});
	}
	setHighlightedNode(node, initial = false) {
		this.highlightedNode = node;
		if (node && (this.isUsingKeyboard || initial)) this.scrollHighlightedNodeIntoView(node);
	}
	scrollHighlightedNodeIntoView(node) {
		if (!this.viewportNode || !this.contentIsPositioned) return;
		node.scrollIntoView({ block: this.opts.scrollAlignment.current });
	}
	getCandidateNodes() {
		const node = this.contentNode;
		if (!node) return [];
		return Array.from(node.querySelectorAll(`[${this.getBitsAttr("item")}]:not([data-disabled])`));
	}
	setHighlightedToFirstCandidate(initial = false) {
		this.setHighlightedNode(null);
		let nodes = this.getCandidateNodes();
		if (!nodes.length) return;
		if (this.viewportNode) {
			const viewportRect = this.viewportNode.getBoundingClientRect();
			nodes = nodes.filter((node) => {
				if (!this.viewportNode) return false;
				const nodeRect = node.getBoundingClientRect();
				return nodeRect.right <= viewportRect.right && nodeRect.left >= viewportRect.left && nodeRect.bottom <= viewportRect.bottom && nodeRect.top >= viewportRect.top;
			});
		}
		this.setHighlightedNode(nodes[0], initial);
	}
	getNodeByValue(value) {
		return this.getCandidateNodes().find((node) => node.dataset.value === value) ?? null;
	}
	/**
	* Resolves the display label for a value: `items` entry when present, otherwise the
	* mounted item's `data-label` or its text content.
	*/
	getLabelForValue(value) {
		if (value === "") return "";
		const fromItems = this.opts.items.current.find((item) => item.value === value)?.label;
		if (fromItems !== void 0) return fromItems;
		const node = this.getNodeByValue(value);
		if (node) {
			const dataLabel = node.getAttribute("data-label");
			if (dataLabel !== null && dataLabel !== "") return dataLabel;
			return node.textContent?.trim() ?? value;
		}
		return value;
	}
	setOpen(open) {
		this.opts.open.current = open;
	}
	toggleOpen() {
		this.opts.open.current = !this.opts.open.current;
	}
	handleOpen() {
		this.setOpen(true);
	}
	handleClose() {
		this.setHighlightedNode(null);
		this.setOpen(false);
	}
	toggleMenu() {
		this.toggleOpen();
	}
	getBitsAttr = (part) => {
		return selectAttrs.getAttr(part, this.isCombobox ? "combobox" : void 0);
	};
};
var SelectSingleRootState = class extends SelectBaseRootState {
	opts;
	isMulti = false;
	#hasValue = derived(() => this.opts.value.current !== "");
	get hasValue() {
		return this.#hasValue();
	}
	set hasValue($$value) {
		return this.#hasValue($$value);
	}
	#currentLabel = derived(() => {
		if (!this.opts.items.current.length) return "";
		return this.opts.items.current.find((item) => item.value === this.opts.value.current)?.label ?? "";
	});
	get currentLabel() {
		return this.#currentLabel();
	}
	set currentLabel($$value) {
		return this.#currentLabel($$value);
	}
	#candidateLabels = derived(() => {
		if (!this.opts.items.current.length) return [];
		return this.opts.items.current.filter((item) => !item.disabled).map((item) => item.label);
	});
	get candidateLabels() {
		return this.#candidateLabels();
	}
	set candidateLabels($$value) {
		return this.#candidateLabels($$value);
	}
	#dataTypeaheadEnabled = derived(() => {
		if (this.isMulti) return false;
		if (this.opts.items.current.length === 0) return false;
		return true;
	});
	get dataTypeaheadEnabled() {
		return this.#dataTypeaheadEnabled();
	}
	set dataTypeaheadEnabled($$value) {
		return this.#dataTypeaheadEnabled($$value);
	}
	constructor(opts) {
		super(opts);
		this.opts = opts;
		watch(() => this.opts.open.current, () => {
			if (!this.opts.open.current) return;
			this.setInitialHighlightedNode();
		});
	}
	includesItem(itemValue) {
		return this.opts.value.current === itemValue;
	}
	toggleItem(itemValue, itemLabel = itemValue) {
		const newValue = this.includesItem(itemValue) ? "" : itemValue;
		this.opts.value.current = newValue;
		if (newValue !== "") this.opts.inputValue.current = itemLabel;
	}
	setInitialHighlightedNode() {
		afterTick(() => {
			if (this.highlightedNode && this.domContext.getDocument().contains(this.highlightedNode)) return;
			if (this.opts.value.current !== "") {
				const node = this.getNodeByValue(this.opts.value.current);
				if (node) {
					this.setHighlightedNode(node, true);
					return;
				}
			}
			this.setHighlightedToFirstCandidate(true);
		});
	}
};
var SelectMultipleRootState = class extends SelectBaseRootState {
	opts;
	isMulti = true;
	#hasValue = derived(() => this.opts.value.current.length > 0);
	get hasValue() {
		return this.#hasValue();
	}
	set hasValue($$value) {
		return this.#hasValue($$value);
	}
	constructor(opts) {
		super(opts);
		this.opts = opts;
		watch(() => this.opts.open.current, () => {
			if (!this.opts.open.current) return;
			this.setInitialHighlightedNode();
		});
	}
	includesItem(itemValue) {
		return this.opts.value.current.includes(itemValue);
	}
	toggleItem(itemValue, itemLabel = itemValue) {
		if (this.includesItem(itemValue)) this.opts.value.current = this.opts.value.current.filter((v) => v !== itemValue);
		else this.opts.value.current = [...this.opts.value.current, itemValue];
		this.opts.inputValue.current = itemLabel;
	}
	setInitialHighlightedNode() {
		afterTick(() => {
			if (!this.domContext) return;
			if (this.highlightedNode && this.domContext.getDocument().contains(this.highlightedNode)) return;
			if (this.opts.value.current.length && this.opts.value.current[0] !== "") {
				const node = this.getNodeByValue(this.opts.value.current[0]);
				if (node) {
					this.setHighlightedNode(node, true);
					return;
				}
			}
			this.setHighlightedToFirstCandidate(true);
		});
	}
};
var SelectRootState = class {
	static create(props) {
		const { type, ...rest } = props;
		const rootState = type === "single" ? new SelectSingleRootState(rest) : new SelectMultipleRootState(rest);
		return SelectRootContext.set(rootState);
	}
};
var SelectTriggerState = class SelectTriggerState {
	static create(opts) {
		return new SelectTriggerState(opts, SelectRootContext.get());
	}
	opts;
	root;
	attachment;
	#domTypeahead;
	#dataTypeahead;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref, (v) => this.root.triggerNode = v);
		this.root.domContext = new DOMContext(opts.ref);
		this.#domTypeahead = new DOMTypeahead({
			getCurrentItem: () => this.root.highlightedNode,
			onMatch: (node) => {
				this.root.setHighlightedNode(node);
			},
			getActiveElement: () => this.root.domContext.getActiveElement(),
			getWindow: () => this.root.domContext.getWindow()
		});
		this.#dataTypeahead = new DataTypeahead({
			getCurrentItem: () => {
				if (this.root.isMulti) return "";
				return this.root.currentLabel;
			},
			onMatch: (label) => {
				if (this.root.isMulti) return;
				if (!this.root.opts.items.current) return;
				const matchedItem = this.root.opts.items.current.find((item) => item.label === label);
				if (!matchedItem) return;
				this.root.opts.value.current = matchedItem.value;
			},
			enabled: () => !this.root.isMulti && this.root.dataTypeaheadEnabled,
			candidateValues: () => this.root.isMulti ? [] : this.root.candidateLabels,
			getWindow: () => this.root.domContext.getWindow()
		});
		this.onkeydown = this.onkeydown.bind(this);
		this.onpointerdown = this.onpointerdown.bind(this);
		this.onpointerup = this.onpointerup.bind(this);
		this.onclick = this.onclick.bind(this);
	}
	#handleOpen() {
		this.root.opts.open.current = true;
		this.#dataTypeahead.resetTypeahead();
		this.#domTypeahead.resetTypeahead();
	}
	#handlePointerOpen(_) {
		this.#handleOpen();
	}
	/**
	* Logic used to handle keyboard selection/deselection.
	*
	* If it returns true, it means the item was selected and whatever is calling
	* this function should return early
	*
	*/
	#handleKeyboardSelection() {
		const isCurrentSelectedValue = this.root.highlightedValue === this.root.opts.value.current;
		if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
			this.root.handleClose();
			return true;
		}
		if (this.root.highlightedValue !== null) this.root.toggleItem(this.root.highlightedValue, this.root.highlightedLabel ?? void 0);
		if (!this.root.isMulti && !isCurrentSelectedValue) {
			this.root.handleClose();
			return true;
		}
		return false;
	}
	onkeydown(e) {
		this.root.isUsingKeyboard = true;
		if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
		if (!this.root.opts.open.current) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				this.root.handleOpen();
			} else if (!this.root.isMulti && this.root.dataTypeaheadEnabled) {
				this.#dataTypeahead.handleTypeaheadSearch(e.key);
				return;
			}
			if (this.root.hasValue) return;
			const candidateNodes = this.root.getCandidateNodes();
			if (!candidateNodes.length) return;
			if (e.key === "ArrowDown") {
				const firstCandidate = candidateNodes[0];
				this.root.setHighlightedNode(firstCandidate);
			} else if (e.key === "ArrowUp") {
				const lastCandidate = candidateNodes[candidateNodes.length - 1];
				this.root.setHighlightedNode(lastCandidate);
			}
			return;
		}
		if (e.key === "Tab") {
			this.root.handleClose();
			return;
		}
		if ((e.key === "Enter" || e.key === " " && this.#domTypeahead.search === "") && !e.isComposing) {
			e.preventDefault();
			if (this.#handleKeyboardSelection()) return;
		}
		if (e.key === "ArrowUp" && e.altKey) this.root.handleClose();
		if (FIRST_LAST_KEYS.includes(e.key)) {
			e.preventDefault();
			const candidateNodes = this.root.getCandidateNodes();
			const currHighlightedNode = this.root.highlightedNode;
			const currIndex = currHighlightedNode ? candidateNodes.indexOf(currHighlightedNode) : -1;
			const loop = this.root.opts.loop.current;
			let nextItem;
			if (e.key === "ArrowDown") nextItem = next(candidateNodes, currIndex, loop);
			else if (e.key === "ArrowUp") nextItem = prev(candidateNodes, currIndex, loop);
			else if (e.key === "PageDown") nextItem = forward(candidateNodes, currIndex, 10, loop);
			else if (e.key === "PageUp") nextItem = backward(candidateNodes, currIndex, 10, loop);
			else if (e.key === "Home") nextItem = candidateNodes[0];
			else if (e.key === "End") nextItem = candidateNodes[candidateNodes.length - 1];
			if (!nextItem) return;
			this.root.setHighlightedNode(nextItem);
			return;
		}
		const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
		const isCharacterKey = e.key.length === 1;
		const isSpaceKey = e.key === " ";
		const candidateNodes = this.root.getCandidateNodes();
		if (e.key === "Tab") return;
		if (!isModifierKey && (isCharacterKey || isSpaceKey)) {
			if (!this.#domTypeahead.handleTypeaheadSearch(e.key, candidateNodes) && isSpaceKey) {
				e.preventDefault();
				this.#handleKeyboardSelection();
			}
			return;
		}
		if (!this.root.highlightedNode) this.root.setHighlightedToFirstCandidate();
	}
	onclick(e) {
		e.currentTarget.focus();
	}
	onpointerdown(e) {
		if (this.root.opts.disabled.current) return;
		if (e.pointerType === "touch") return e.preventDefault();
		const target = e.target;
		if (target?.hasPointerCapture(e.pointerId)) target?.releasePointerCapture(e.pointerId);
		if (e.button === 0 && e.ctrlKey === false) if (this.root.opts.open.current === false) this.#handlePointerOpen(e);
		else this.root.handleClose();
	}
	onpointerup(e) {
		if (this.root.opts.disabled.current) return;
		e.preventDefault();
		if (e.pointerType === "touch") if (this.root.opts.open.current === false) this.#handlePointerOpen(e);
		else this.root.handleClose();
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		disabled: this.root.opts.disabled.current ? true : void 0,
		"aria-haspopup": "listbox",
		"aria-expanded": boolToStr(this.root.opts.open.current),
		"aria-activedescendant": this.root.highlightedId,
		"data-state": getDataOpenClosed(this.root.opts.open.current),
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-placeholder": this.root.hasValue ? void 0 : "",
		[this.root.getBitsAttr("trigger")]: "",
		onpointerdown: this.onpointerdown,
		onkeydown: this.onkeydown,
		onclick: this.onclick,
		onpointerup: this.onpointerup,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SelectContentState = class SelectContentState {
	static create(opts) {
		return SelectContentContext.set(new SelectContentState(opts, SelectRootContext.get()));
	}
	opts;
	root;
	attachment;
	isPositioned = false;
	domContext;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref, (v) => this.root.contentNode = v);
		this.domContext = new DOMContext(this.opts.ref);
		if (this.root.domContext === null) this.root.domContext = this.domContext;
		watch(() => this.root.opts.open.current, () => {
			if (this.root.opts.open.current) return;
			this.root.contentIsPositioned = false;
			this.isPositioned = false;
		});
		watch([() => this.isPositioned, () => this.root.highlightedNode], () => {
			if (!this.isPositioned || !this.root.highlightedNode) return;
			this.root.scrollHighlightedNodeIntoView(this.root.highlightedNode);
		});
		this.onpointermove = this.onpointermove.bind(this);
	}
	onpointermove(_) {
		this.root.isUsingKeyboard = false;
	}
	#styles = derived(() => {
		return getFloatingContentCSSVars(this.root.isCombobox ? "combobox" : "select");
	});
	onInteractOutside = (e) => {
		if (e.target === this.root.triggerNode || e.target === this.root.inputNode) {
			e.preventDefault();
			return;
		}
		this.opts.onInteractOutside.current(e);
		if (e.defaultPrevented) return;
		this.root.handleClose();
	};
	onEscapeKeydown = (e) => {
		this.opts.onEscapeKeydown.current(e);
		if (e.defaultPrevented) return;
		this.root.handleClose();
	};
	onOpenAutoFocus = (e) => {
		e.preventDefault();
	};
	onCloseAutoFocus = (e) => {
		e.preventDefault();
	};
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
	#snippetProps = derived(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "listbox",
		"aria-multiselectable": this.root.isMulti ? "true" : void 0,
		"data-state": getDataOpenClosed(this.root.opts.open.current),
		...getDataTransitionAttrs(this.root.contentPresence.transitionStatus),
		[this.root.getBitsAttr("content")]: "",
		style: {
			display: "flex",
			flexDirection: "column",
			outline: "none",
			boxSizing: "border-box",
			pointerEvents: "auto",
			...this.#styles()
		},
		onpointermove: this.onpointermove,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	popperProps = {
		onInteractOutside: this.onInteractOutside,
		onEscapeKeydown: this.onEscapeKeydown,
		onOpenAutoFocus: this.onOpenAutoFocus,
		onCloseAutoFocus: this.onCloseAutoFocus,
		trapFocus: false,
		loop: false,
		onPlaced: () => {
			if (this.root.opts.open.current) {
				this.root.contentIsPositioned = true;
				this.isPositioned = true;
			}
		}
	};
};
var SelectItemState = class SelectItemState {
	static create(opts) {
		return new SelectItemState(opts, SelectRootContext.get());
	}
	opts;
	root;
	attachment;
	#isSelected = derived(() => this.root.includesItem(this.opts.value.current));
	get isSelected() {
		return this.#isSelected();
	}
	set isSelected($$value) {
		return this.#isSelected($$value);
	}
	#isHighlighted = derived(() => this.root.highlightedValue === this.opts.value.current);
	get isHighlighted() {
		return this.#isHighlighted();
	}
	set isHighlighted($$value) {
		return this.#isHighlighted($$value);
	}
	prevHighlighted = new Previous(() => this.isHighlighted);
	mounted = false;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
		watch([() => this.isHighlighted, () => this.prevHighlighted.current], () => {
			if (this.isHighlighted) this.opts.onHighlight.current();
			else if (this.prevHighlighted.current) this.opts.onUnhighlight.current();
		});
		watch(() => this.mounted, () => {
			if (!this.mounted) return;
			this.root.setInitialHighlightedNode();
		});
		this.onpointerdown = this.onpointerdown.bind(this);
		this.onpointerup = this.onpointerup.bind(this);
		this.onpointermove = this.onpointermove.bind(this);
	}
	handleSelect() {
		if (this.opts.disabled.current) return;
		const isCurrentSelectedValue = this.opts.value.current === this.root.opts.value.current;
		if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
			this.root.handleClose();
			return;
		}
		this.root.toggleItem(this.opts.value.current, this.opts.label.current);
		if (!this.root.isMulti && !isCurrentSelectedValue) this.root.handleClose();
	}
	#snippetProps = derived(() => ({
		selected: this.isSelected,
		highlighted: this.isHighlighted
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	onpointerdown(e) {
		e.preventDefault();
	}
	/**
	* Using `pointerup` instead of `click` allows power users to pointerdown
	* the trigger, then release pointerup on an item to select it vs having to do
	* multiple clicks.
	*/
	onpointerup(e) {
		if (e.defaultPrevented || !this.opts.ref.current) return;
		/**
		* For one reason or another, when it's a touch pointer and _not_ on IOS,
		* we need to listen for the immediate click event to handle the selection,
		* otherwise a click event will fire on the element _behind_ the item.
		*/
		if (e.pointerType === "touch" && !isIOS) {
			on(this.opts.ref.current, "click", () => {
				this.handleSelect();
				this.root.setHighlightedNode(this.opts.ref.current);
			}, { once: true });
			return;
		}
		e.preventDefault();
		this.handleSelect();
		if (e.pointerType === "touch") this.root.setHighlightedNode(this.opts.ref.current);
	}
	onpointermove(e) {
		/**
		* We don't want to highlight items on touch devices when scrolling,
		* as this is confusing behavior, so we return here and instead handle
		* the highlighting on the `pointerup` (or following `click`) event for
		* touch devices only.
		*/
		if (e.pointerType === "touch") return;
		if (this.root.highlightedNode !== this.opts.ref.current) this.root.setHighlightedNode(this.opts.ref.current);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "option",
		"aria-selected": this.root.includesItem(this.opts.value.current) ? "true" : void 0,
		"data-value": this.opts.value.current,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		"data-highlighted": this.root.highlightedValue === this.opts.value.current && !this.opts.disabled.current ? "" : void 0,
		"data-selected": this.root.includesItem(this.opts.value.current) ? "" : void 0,
		"data-label": this.opts.label.current,
		[this.root.getBitsAttr("item")]: "",
		onpointermove: this.onpointermove,
		onpointerdown: this.onpointerdown,
		onpointerup: this.onpointerup,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SelectHiddenInputState = class SelectHiddenInputState {
	static create(opts) {
		return new SelectHiddenInputState(opts, SelectRootContext.get());
	}
	opts;
	root;
	#shouldRender = derived(() => this.root.opts.name.current !== "");
	get shouldRender() {
		return this.#shouldRender();
	}
	set shouldRender($$value) {
		return this.#shouldRender($$value);
	}
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.onfocus = this.onfocus.bind(this);
	}
	onfocus(e) {
		e.preventDefault();
		if (!this.root.isCombobox) this.root.triggerNode?.focus();
		else this.root.inputNode?.focus();
	}
	#props = derived(() => ({
		disabled: boolToTrueOrUndef(this.root.opts.disabled.current),
		required: boolToTrueOrUndef(this.root.opts.required.current),
		name: this.root.opts.name.current,
		value: this.opts.value.current,
		onfocus: this.onfocus
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SelectViewportState = class SelectViewportState {
	static create(opts) {
		return new SelectViewportState(opts, SelectContentContext.get());
	}
	opts;
	content;
	root;
	attachment;
	prevScrollTop = 0;
	constructor(opts, content) {
		this.opts = opts;
		this.content = content;
		this.root = content.root;
		this.attachment = attachRef(opts.ref, (v) => {
			this.root.viewportNode = v;
		});
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "presentation",
		[this.root.getBitsAttr("viewport")]: "",
		style: {
			position: "relative",
			flex: 1,
			overflow: "auto"
		},
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
//#region node_modules/bits-ui/dist/bits/select/components/select-hidden-input.svelte
function Select_hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, autocomplete } = $$props;
		const hiddenInputState = SelectHiddenInputState.create({ value: boxWith(() => value) });
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (hiddenInputState.shouldRender) {
				$$renderer.push("<!--[0-->");
				Hidden_input($$renderer, spread_props([hiddenInputState.props, {
					autocomplete,
					get value() {
						return value;
					},
					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				}]));
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { value });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/select/components/select-content.svelte
function Select_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, forceMount = false, side = "bottom", onInteractOutside = noop, onEscapeKeydown = noop, children, child, preventScroll = false, style, $$slots, $$events, ...restProps } = $$props;
		const contentState = SelectContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		if (forceMount) {
			$$renderer.push("<!--[0-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: contentState.props.style }, { style });
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
						side,
						enabled: contentState.root.opts.open.current,
						id,
						preventScroll,
						forceMount: true,
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
					const finalProps = mergeProps(props, { style: contentState.props.style }, { style });
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
						side,
						open: contentState.root.opts.open.current,
						id,
						preventScroll,
						forceMount: false,
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
//#region node_modules/bits-ui/dist/bits/utilities/mounted.svelte
function Mounted($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { mounted = false, onMountedChange = noop } = $$props;
		bind_props($$props, { mounted });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/select/components/select-item.svelte
function Select_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, value, label = value, disabled = false, children, child, onHighlight = noop, onUnhighlight = noop, $$slots, $$events, ...restProps } = $$props;
		const itemState = SelectItemState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value),
			disabled: boxWith(() => disabled),
			label: boxWith(() => label),
			onHighlight: boxWith(() => onHighlight),
			onUnhighlight: boxWith(() => onUnhighlight)
		});
		const mergedProps = derived(() => mergeProps(restProps, itemState.props));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (child) {
				$$renderer.push("<!--[0-->");
				child($$renderer, {
					props: mergedProps(),
					...itemState.snippetProps
				});
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
				children?.($$renderer, itemState.snippetProps);
				$$renderer.push(`<!----></div>`);
			}
			$$renderer.push(`<!--]--> `);
			Mounted($$renderer, {
				get mounted() {
					return itemState.mounted;
				},
				set mounted($$value) {
					itemState.mounted = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!---->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/select/components/select-viewport.svelte
function Select_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, children, child, $$slots, $$events, ...restProps } = $$props;
		const viewportState = SelectViewportState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, viewportState.props));
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
//#region node_modules/bits-ui/dist/bits/select/components/select.svelte
function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, onValueChange = noop, name = "", disabled = false, type, open = false, onOpenChange = noop, onOpenChangeComplete = noop, loop = false, scrollAlignment = "nearest", required = false, items = [], allowDeselect = false, autocomplete, children } = $$props;
		function handleDefaultValue() {
			if (value !== void 0) return;
			value = type === "single" ? "" : [];
		}
		handleDefaultValue();
		watch.pre(() => value, () => {
			handleDefaultValue();
		});
		let inputValue = "";
		const rootState = SelectRootState.create({
			type,
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			disabled: boxWith(() => disabled),
			required: boxWith(() => required),
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			loop: boxWith(() => loop),
			scrollAlignment: boxWith(() => scrollAlignment),
			name: boxWith(() => name),
			isCombobox: false,
			items: boxWith(() => items),
			allowDeselect: boxWith(() => allowDeselect),
			inputValue: boxWith(() => inputValue, (v) => inputValue = v),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			Floating_layer($$renderer, {
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			if (Array.isArray(rootState.opts.value.current)) {
				$$renderer.push("<!--[0-->");
				if (rootState.opts.value.current.length === 0) {
					$$renderer.push("<!--[0-->");
					Select_hidden_input($$renderer, { autocomplete });
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--[-->`);
					const each_array = ensure_array_like(rootState.opts.value.current);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];
						Select_hidden_input($$renderer, {
							value: item,
							autocomplete
						});
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push("<!--[-1-->");
				Select_hidden_input($$renderer, {
					autocomplete,
					get value() {
						return rootState.opts.value.current;
					},
					set value($$value) {
						rootState.opts.value.current = $$value;
						$$settled = false;
					}
				});
			}
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, {
			value,
			open
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/select/components/select-trigger.svelte
function Select_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, child, children, type = "button", $$slots, $$events, ...restProps } = $$props;
		const triggerState = SelectTriggerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
		if (Floating_layer_anchor) {
			$$renderer.push("<!--[-->");
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
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		bind_props($$props, { ref });
	});
}
//#endregion
//#region src/lib/components/ui/Select.svelte
function Select_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, value = void 0, options, compact = false, disabled = false, placeholder = "בחרו אפשרות", onchange } = $$props;
		const bitsItems = derived(() => options.map((option) => ({
			value: String(option.value),
			label: option.label,
			disabled: option.disabled
		})));
		const stringValue = derived(() => String(value ?? ""));
		const selectedLabel = derived(() => options.find((option) => option.value === value)?.label ?? placeholder);
		function updateValue(next) {
			const nextOption = options.find((option) => String(option.value) === next);
			if (!nextOption) return;
			value = nextOption.value;
			onchange?.();
		}
		$$renderer.push(`<label${attr_class("hb-field", void 0, { "hb-field--compact": compact })}><span class="hb-field__label">${escape_html(label)}</span> `);
		if (Select) {
			$$renderer.push("<!--[-->");
			Select($$renderer, {
				type: "single",
				value: stringValue(),
				items: bitsItems(),
				disabled,
				onValueChange: updateValue,
				children: ($$renderer) => {
					if (Select_trigger) {
						$$renderer.push("<!--[-->");
						Select_trigger($$renderer, {
							class: "hb-select__trigger",
							"aria-label": label,
							children: ($$renderer) => {
								$$renderer.push(`<span class="hb-select__value">${escape_html(selectedLabel())}</span> <span class="hb-select__chevron" aria-hidden="true"></span>`);
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
					$$renderer.push(` `);
					if (Portal) {
						$$renderer.push("<!--[-->");
						Portal($$renderer, {
							children: ($$renderer) => {
								if (Select_content) {
									$$renderer.push("<!--[-->");
									Select_content($$renderer, {
										class: "hb-select__content",
										sideOffset: 6,
										children: ($$renderer) => {
											if (Select_viewport) {
												$$renderer.push("<!--[-->");
												Select_viewport($$renderer, {
													class: "hb-select__viewport",
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);
														const each_array = ensure_array_like(options);
														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let option = each_array[$$index];
															{
																function children($$renderer, { selected }) {
																	$$renderer.push(`<span>${escape_html(option.label)}</span> `);
																	if (selected) {
																		$$renderer.push("<!--[0-->");
																		$$renderer.push(`<span class="hb-select__check" aria-hidden="true"></span>`);
																	} else $$renderer.push("<!--[-1-->");
																	$$renderer.push(`<!--]-->`);
																}
																if (Select_item) {
																	$$renderer.push("<!--[-->");
																	Select_item($$renderer, {
																		class: "hb-select__item",
																		value: String(option.value),
																		label: option.label,
																		disabled: option.disabled,
																		children,
																		$$slots: { default: true }
																	});
																	$$renderer.push("<!--]-->");
																} else {
																	$$renderer.push("<!--[!-->");
																	$$renderer.push("<!--]-->");
																}
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
		$$renderer.push(`</label>`);
		bind_props($$props, { value });
	});
}
//#endregion
export { Select_1 as t };
