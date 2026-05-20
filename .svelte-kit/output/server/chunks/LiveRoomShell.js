import "./index-server.js";
import { a as bind_props, c as ensure_array_like, et as attr, f as spread_props, i as attributes, m as stringify, n as attr_class, nt as escape_html, o as derived, r as attr_style, tt as clsx, u as props_id } from "./dev.js";
import "./events.js";
import { f as useDebounce, g as useConvexClient, l as ScrollState, n as getCachedRole, r as initAuth, s as api } from "./session.svelte.js";
import { G as watch, I as boolToTrueOrUndef, J as attachRef, L as createBitsAttrs, N as boolToEmptyStrOrUndef, P as boolToStr, R as getAriaChecked, V as getDataTransitionAttrs, Z as mergeProps, at as boxWith, c as createId, d as isElement, l as noop, lt as simpleBox, p as isFocusVisible, q as Context, z as getDataChecked } from "./arrays.js";
import { m as PresenceManager, p as Portal } from "./scroll-lock.js";
import { a as getFloatingContentCSSVars, i as Floating_layer, n as Popper_layer, t as Popper_layer_force_mount } from "./popper-layer-force-mount.js";
import { i as DOMContext } from "./use-id.js";
import { t as Button_1 } from "./Button.js";
import { t as Hidden_input } from "./hidden-input.js";
import { t as Select_1 } from "./Select.js";
import { i as SafePolygon, n as Popover_content, r as PopoverRootState, t as Popover_trigger } from "./popover-trigger.js";
import { t as ScrollArea_1 } from "./ScrollArea.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
//#region node_modules/bits-ui/dist/bits/meter/meter.svelte.js
var meterAttrs = createBitsAttrs({
	component: "meter",
	parts: ["root"]
});
var MeterRootState = class MeterRootState {
	static create(opts) {
		return new MeterRootState(opts);
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		role: "meter",
		value: this.opts.value.current,
		"aria-valuemin": this.opts.min.current,
		"aria-valuemax": this.opts.max.current,
		"aria-valuenow": this.opts.value.current,
		"data-value": this.opts.value.current,
		"data-max": this.opts.max.current,
		"data-min": this.opts.min.current,
		[meterAttrs.root]: "",
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
//#region node_modules/bits-ui/dist/bits/meter/components/meter.svelte
function Meter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, value = 0, max = 100, min = 0, id = createId(uid), ref = null, $$slots, $$events, ...restProps } = $$props;
		const rootState = MeterRootState.create({
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
//#region node_modules/bits-ui/dist/bits/popover/components/popover.svelte
function Popover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, onOpenChange = noop, onOpenChangeComplete = noop, children } = $$props;
		PopoverRootState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});
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
//#region node_modules/bits-ui/dist/bits/switch/switch.svelte.js
var switchAttrs = createBitsAttrs({
	component: "switch",
	parts: ["root", "thumb"]
});
var SwitchRootContext = new Context("Switch.Root");
var SwitchRootState = class SwitchRootState {
	static create(opts) {
		return SwitchRootContext.set(new SwitchRootState(opts));
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(opts.ref);
		this.onkeydown = this.onkeydown.bind(this);
		this.onclick = this.onclick.bind(this);
	}
	#toggle() {
		this.opts.checked.current = !this.opts.checked.current;
	}
	onkeydown(e) {
		if (!(e.key === "Enter" || e.key === " ") || this.opts.disabled.current) return;
		e.preventDefault();
		this.#toggle();
	}
	onclick(_) {
		if (this.opts.disabled.current) return;
		this.#toggle();
	}
	#sharedProps = derived(() => ({
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		"data-state": getDataChecked(this.opts.checked.current),
		"data-required": boolToEmptyStrOrUndef(this.opts.required.current)
	}));
	get sharedProps() {
		return this.#sharedProps();
	}
	set sharedProps($$value) {
		return this.#sharedProps($$value);
	}
	#snippetProps = derived(() => ({ checked: this.opts.checked.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		...this.sharedProps,
		id: this.opts.id.current,
		role: "switch",
		disabled: boolToTrueOrUndef(this.opts.disabled.current),
		"aria-checked": getAriaChecked(this.opts.checked.current, false),
		"aria-required": boolToStr(this.opts.required.current),
		[switchAttrs.root]: "",
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
var SwitchInputState = class SwitchInputState {
	static create() {
		return new SwitchInputState(SwitchRootContext.get());
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
	}
	#props = derived(() => ({
		type: "checkbox",
		name: this.root.opts.name.current,
		value: this.root.opts.value.current,
		checked: this.root.opts.checked.current,
		disabled: this.root.opts.disabled.current,
		required: this.root.opts.required.current
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SwitchThumbState = class SwitchThumbState {
	static create(opts) {
		return new SwitchThumbState(opts, SwitchRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
	}
	#snippetProps = derived(() => ({ checked: this.root.opts.checked.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		...this.root.sharedProps,
		id: this.opts.id.current,
		[switchAttrs.thumb]: "",
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
//#region node_modules/bits-ui/dist/bits/switch/components/switch-input.svelte
function Switch_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = SwitchInputState.create();
		if (inputState.shouldRender) {
			$$renderer.push("<!--[0-->");
			Hidden_input($$renderer, spread_props([inputState.props]));
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/switch/components/switch.svelte
function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, ref = null, id = createId(uid), disabled = false, required = false, checked = false, value = "on", name = void 0, type = "button", onCheckedChange = noop, $$slots, $$events, ...restProps } = $$props;
		const rootState = SwitchRootState.create({
			checked: boxWith(() => checked, (v) => {
				checked = v;
				onCheckedChange?.(v);
			}),
			disabled: boxWith(() => disabled ?? false),
			required: boxWith(() => required),
			value: boxWith(() => value),
			name: boxWith(() => name),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props, { type }));
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
		Switch_input($$renderer, {});
		$$renderer.push(`<!---->`);
		bind_props($$props, {
			ref,
			checked
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/switch/components/switch-thumb.svelte
function Switch_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const thumbState = SwitchThumbState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, thumbState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...thumbState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, thumbState.snippetProps);
			$$renderer.push(`<!----></span>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/internal/timeout-fn.js
var TimeoutFn = class {
	#interval;
	#cb;
	#timer = null;
	constructor(cb, interval) {
		this.#cb = cb;
		this.#interval = interval;
		this.stop = this.stop.bind(this);
		this.start = this.start.bind(this);
		this.stop;
	}
	#clear() {
		if (this.#timer !== null) {
			window.clearTimeout(this.#timer);
			this.#timer = null;
		}
	}
	stop() {
		this.#clear();
	}
	start(...args) {
		this.#clear();
		this.#timer = window.setTimeout(() => {
			this.#timer = null;
			this.#cb(...args);
		}, this.#interval);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/tooltip.svelte.js
var tooltipAttrs = createBitsAttrs({
	component: "tooltip",
	parts: ["content", "trigger"]
});
var TooltipProviderContext = new Context("Tooltip.Provider");
var TooltipRootContext = new Context("Tooltip.Root");
var TooltipTriggerRegistryState = class {
	triggers = /* @__PURE__ */ new Map();
	activeTriggerId = null;
	#activeTriggerNode = derived(() => {
		const activeTriggerId = this.activeTriggerId;
		if (activeTriggerId === null) return null;
		return this.triggers.get(activeTriggerId)?.node ?? null;
	});
	get activeTriggerNode() {
		return this.#activeTriggerNode();
	}
	set activeTriggerNode($$value) {
		return this.#activeTriggerNode($$value);
	}
	#activePayload = derived(() => {
		const activeTriggerId = this.activeTriggerId;
		if (activeTriggerId === null) return null;
		return this.triggers.get(activeTriggerId)?.payload ?? null;
	});
	get activePayload() {
		return this.#activePayload();
	}
	set activePayload($$value) {
		return this.#activePayload($$value);
	}
	register = (record) => {
		const next = new Map(this.triggers);
		next.set(record.id, record);
		this.triggers = next;
		this.#coerceActiveTrigger();
	};
	update = (record) => {
		const next = new Map(this.triggers);
		next.set(record.id, record);
		this.triggers = next;
		this.#coerceActiveTrigger();
	};
	unregister = (id) => {
		if (!this.triggers.has(id)) return;
		const next = new Map(this.triggers);
		next.delete(id);
		this.triggers = next;
		if (this.activeTriggerId === id) this.activeTriggerId = null;
	};
	setActiveTrigger = (id) => {
		if (id === null) {
			this.activeTriggerId = null;
			return;
		}
		if (!this.triggers.has(id)) {
			this.activeTriggerId = null;
			return;
		}
		this.activeTriggerId = id;
	};
	get = (id) => {
		return this.triggers.get(id);
	};
	has = (id) => {
		return this.triggers.has(id);
	};
	getFirstTriggerId = () => {
		const firstEntry = this.triggers.entries().next();
		if (firstEntry.done) return null;
		return firstEntry.value[0];
	};
	#coerceActiveTrigger = () => {
		const activeTriggerId = this.activeTriggerId;
		if (activeTriggerId === null) return;
		if (!this.triggers.has(activeTriggerId)) this.activeTriggerId = null;
	};
};
var TooltipProviderState = class TooltipProviderState {
	static create(opts) {
		return TooltipProviderContext.set(new TooltipProviderState(opts));
	}
	opts;
	isOpenDelayed = true;
	isPointerInTransit = simpleBox(false);
	#timerFn;
	#openTooltip = null;
	constructor(opts) {
		this.opts = opts;
		this.#timerFn = new TimeoutFn(() => {
			this.isOpenDelayed = true;
		}, this.opts.skipDelayDuration.current);
	}
	#startTimer = () => {
		if (this.opts.skipDelayDuration.current === 0) {
			this.isOpenDelayed = true;
			return;
		} else this.#timerFn.start();
	};
	#clearTimer = () => {
		this.#timerFn.stop();
	};
	onOpen = (tooltip) => {
		if (this.#openTooltip && this.#openTooltip !== tooltip) this.#openTooltip.handleClose();
		this.#clearTimer();
		this.isOpenDelayed = false;
		this.#openTooltip = tooltip;
	};
	onClose = (tooltip) => {
		if (this.#openTooltip === tooltip) {
			this.#openTooltip = null;
			this.#startTimer();
		}
	};
	isTooltipOpen = (tooltip) => {
		return this.#openTooltip === tooltip;
	};
};
var TooltipRootState = class TooltipRootState {
	static create(opts) {
		return TooltipRootContext.set(new TooltipRootState(opts, TooltipProviderContext.get()));
	}
	opts;
	provider;
	#delayDuration = derived(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
	get delayDuration() {
		return this.#delayDuration();
	}
	set delayDuration($$value) {
		return this.#delayDuration($$value);
	}
	#disableHoverableContent = derived(() => this.opts.disableHoverableContent.current ?? this.provider.opts.disableHoverableContent.current);
	get disableHoverableContent() {
		return this.#disableHoverableContent();
	}
	set disableHoverableContent($$value) {
		return this.#disableHoverableContent($$value);
	}
	#disableCloseOnTriggerClick = derived(() => this.opts.disableCloseOnTriggerClick.current ?? this.provider.opts.disableCloseOnTriggerClick.current);
	get disableCloseOnTriggerClick() {
		return this.#disableCloseOnTriggerClick();
	}
	set disableCloseOnTriggerClick($$value) {
		return this.#disableCloseOnTriggerClick($$value);
	}
	#disabled = derived(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
	get disabled() {
		return this.#disabled();
	}
	set disabled($$value) {
		return this.#disabled($$value);
	}
	#ignoreNonKeyboardFocus = derived(() => this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current);
	get ignoreNonKeyboardFocus() {
		return this.#ignoreNonKeyboardFocus();
	}
	set ignoreNonKeyboardFocus($$value) {
		return this.#ignoreNonKeyboardFocus($$value);
	}
	registry;
	tether;
	contentNode = null;
	contentPresence;
	#wasOpenDelayed = false;
	#timerFn;
	#stateAttr = derived(() => {
		if (!this.opts.open.current) return "closed";
		return this.#wasOpenDelayed ? "delayed-open" : "instant-open";
	});
	get stateAttr() {
		return this.#stateAttr();
	}
	set stateAttr($$value) {
		return this.#stateAttr($$value);
	}
	constructor(opts, provider) {
		this.opts = opts;
		this.provider = provider;
		this.tether = opts.tether.current?.state ?? null;
		this.registry = this.tether?.registry ?? new TooltipTriggerRegistryState();
		this.#timerFn = new TimeoutFn(() => {
			this.#wasOpenDelayed = true;
			this.opts.open.current = true;
		}, this.delayDuration ?? 0);
		if (this.tether) this.tether.root = this;
		this.contentPresence = new PresenceManager({
			open: this.opts.open,
			ref: boxWith(() => this.contentNode),
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			}
		});
		watch(() => this.delayDuration, () => {
			if (this.delayDuration === void 0) return;
			this.#timerFn = new TimeoutFn(() => {
				this.#wasOpenDelayed = true;
				this.opts.open.current = true;
			}, this.delayDuration);
		});
		watch(() => this.opts.open.current, (isOpen) => {
			if (isOpen) {
				this.ensureActiveTrigger();
				this.provider.onOpen(this);
			} else this.provider.onClose(this);
		}, { lazy: true });
		watch(() => this.opts.triggerId.current, (triggerId) => {
			if (triggerId === this.registry.activeTriggerId) return;
			this.registry.setActiveTrigger(triggerId);
		});
		watch(() => this.registry.activeTriggerId, (activeTriggerId) => {
			if (this.opts.triggerId.current === activeTriggerId) return;
			this.opts.triggerId.current = activeTriggerId;
		});
	}
	handleOpen = () => {
		this.#timerFn.stop();
		this.#wasOpenDelayed = false;
		this.ensureActiveTrigger();
		this.opts.open.current = true;
	};
	handleClose = () => {
		this.#timerFn.stop();
		this.opts.open.current = false;
	};
	#handleDelayedOpen = () => {
		this.#timerFn.stop();
		const shouldSkipDelay = !this.provider.isOpenDelayed;
		const delayDuration = this.delayDuration ?? 0;
		if (shouldSkipDelay || delayDuration === 0) {
			this.#wasOpenDelayed = false;
			this.opts.open.current = true;
		} else this.#timerFn.start();
	};
	onTriggerEnter = (triggerId) => {
		this.setActiveTrigger(triggerId);
		this.#handleDelayedOpen();
	};
	onTriggerLeave = () => {
		if (this.disableHoverableContent) this.handleClose();
		else this.#timerFn.stop();
	};
	ensureActiveTrigger = () => {
		if (this.registry.activeTriggerId !== null && this.registry.has(this.registry.activeTriggerId)) return;
		if (this.opts.triggerId.current !== null && this.registry.has(this.opts.triggerId.current)) {
			this.registry.setActiveTrigger(this.opts.triggerId.current);
			return;
		}
		const firstTriggerId = this.registry.getFirstTriggerId();
		this.registry.setActiveTrigger(firstTriggerId);
	};
	setActiveTrigger = (triggerId) => {
		this.registry.setActiveTrigger(triggerId);
	};
	registerTrigger = (trigger) => {
		this.registry.register(trigger);
		if (trigger.disabled && this.registry.activeTriggerId === trigger.id && this.opts.open.current) this.handleClose();
	};
	updateTrigger = (trigger) => {
		this.registry.update(trigger);
		if (trigger.disabled && this.registry.activeTriggerId === trigger.id && this.opts.open.current) this.handleClose();
	};
	unregisterTrigger = (id) => {
		const isActive = this.registry.activeTriggerId === id;
		this.registry.unregister(id);
		if (isActive && this.opts.open.current) this.handleClose();
	};
	isActiveTrigger = (triggerId) => {
		return this.registry.activeTriggerId === triggerId;
	};
	get triggerNode() {
		return this.registry.activeTriggerNode;
	}
	get activePayload() {
		return this.registry.activePayload;
	}
	get activeTriggerId() {
		return this.registry.activeTriggerId;
	}
};
var TooltipTriggerState = class TooltipTriggerState {
	static create(opts) {
		if (opts.tether.current) return new TooltipTriggerState(opts, null, opts.tether.current.state);
		return new TooltipTriggerState(opts, TooltipRootContext.get(), null);
	}
	opts;
	root;
	tether;
	attachment;
	#isPointerDown = simpleBox(false);
	#hasPointerMoveOpened = false;
	domContext;
	#transitCheckTimeout = null;
	#mounted = false;
	#lastRegisteredId = null;
	constructor(opts, root, tether) {
		this.opts = opts;
		this.root = root;
		this.tether = tether;
		this.domContext = new DOMContext(opts.ref);
		this.attachment = attachRef(this.opts.ref, (v) => this.#register(v));
		watch(() => this.opts.id.current, () => {
			this.#register(this.opts.ref.current);
		});
		watch(() => this.opts.payload.current, () => {
			this.#register(this.opts.ref.current);
		});
		watch(() => this.opts.disabled.current, () => {
			this.#register(this.opts.ref.current);
		});
	}
	#getRoot = () => {
		return this.tether?.root ?? this.root;
	};
	#isDisabled = () => {
		const root = this.#getRoot();
		return this.opts.disabled.current || Boolean(root?.disabled);
	};
	#register = (node) => {
		if (!this.#mounted) return;
		const id = this.opts.id.current;
		const payload = this.opts.payload.current;
		const disabled = this.opts.disabled.current;
		if (this.#lastRegisteredId && this.#lastRegisteredId !== id) {
			const root = this.#getRoot();
			if (this.tether) this.tether.registry.unregister(this.#lastRegisteredId);
			else root?.unregisterTrigger(this.#lastRegisteredId);
		}
		const triggerRecord = {
			id,
			node,
			payload,
			disabled
		};
		const root = this.#getRoot();
		if (this.tether) {
			if (this.tether.registry.has(id)) this.tether.registry.update(triggerRecord);
			else this.tether.registry.register(triggerRecord);
			if (disabled && this.tether.registry.activeTriggerId === id && root?.opts.open.current) root.handleClose();
		} else if (root?.registry.has(id)) root.updateTrigger(triggerRecord);
		else root?.registerTrigger(triggerRecord);
		this.#lastRegisteredId = id;
	};
	#clearTransitCheck = () => {
		if (this.#transitCheckTimeout !== null) {
			clearTimeout(this.#transitCheckTimeout);
			this.#transitCheckTimeout = null;
		}
	};
	handlePointerUp = () => {
		this.#isPointerDown.current = false;
	};
	#onpointerup = () => {
		if (this.#isDisabled()) return;
		this.#isPointerDown.current = false;
	};
	#onpointerdown = () => {
		if (this.#isDisabled()) return;
		this.#isPointerDown.current = true;
		this.domContext.getDocument().addEventListener("pointerup", () => {
			this.handlePointerUp();
		}, { once: true });
	};
	#onpointerenter = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isDisabled()) {
			if (root.opts.open.current) root.handleClose();
			return;
		}
		if (e.pointerType === "touch") return;
		if (root.provider.isPointerInTransit.current) {
			this.#clearTransitCheck();
			this.#transitCheckTimeout = window.setTimeout(() => {
				if (root.provider.isPointerInTransit.current) {
					root.provider.isPointerInTransit.current = false;
					root.onTriggerEnter(this.opts.id.current);
					this.#hasPointerMoveOpened = true;
				}
			}, 250);
			return;
		}
		root.onTriggerEnter(this.opts.id.current);
		this.#hasPointerMoveOpened = true;
	};
	#onpointermove = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isDisabled()) {
			if (root.opts.open.current) root.handleClose();
			return;
		}
		if (e.pointerType === "touch") return;
		if (this.#hasPointerMoveOpened) return;
		this.#clearTransitCheck();
		root.provider.isPointerInTransit.current = false;
		root.onTriggerEnter(this.opts.id.current);
		this.#hasPointerMoveOpened = true;
	};
	#onpointerleave = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isDisabled()) return;
		this.#clearTransitCheck();
		if (!root.isActiveTrigger(this.opts.id.current)) {
			this.#hasPointerMoveOpened = false;
			return;
		}
		const relatedTarget = e.relatedTarget;
		if (isElement(relatedTarget)) for (const record of root.registry.triggers.values()) {
			if (record.node !== relatedTarget) continue;
			if (root.provider.opts.skipDelayDuration.current > 0) {
				this.#hasPointerMoveOpened = false;
				return;
			}
			root.handleClose();
			this.#hasPointerMoveOpened = false;
			return;
		}
		root.onTriggerLeave();
		this.#hasPointerMoveOpened = false;
	};
	#onfocus = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isPointerDown.current) return;
		if (this.#isDisabled()) {
			if (root.opts.open.current) root.handleClose();
			return;
		}
		if (root.ignoreNonKeyboardFocus && !isFocusVisible(e.currentTarget)) return;
		root.setActiveTrigger(this.opts.id.current);
		root.handleOpen();
	};
	#onblur = () => {
		const root = this.#getRoot();
		if (!root || this.#isDisabled()) return;
		root.handleClose();
	};
	#onclick = () => {
		const root = this.#getRoot();
		if (!root || root.disableCloseOnTriggerClick || this.#isDisabled()) return;
		root.handleClose();
	};
	#props = derived(() => {
		const root = this.#getRoot();
		const isOpenForTrigger = Boolean(root?.opts.open.current && root.isActiveTrigger(this.opts.id.current));
		const isDisabled = this.#isDisabled();
		return {
			id: this.opts.id.current,
			"aria-describedby": isOpenForTrigger ? root?.contentNode?.id : void 0,
			"data-state": isOpenForTrigger ? root?.stateAttr : "closed",
			"data-disabled": boolToEmptyStrOrUndef(isDisabled),
			"data-delay-duration": `${root?.delayDuration ?? 0}`,
			[tooltipAttrs.trigger]: "",
			tabindex: isDisabled ? void 0 : this.opts.tabindex.current,
			disabled: this.opts.disabled.current,
			onpointerup: this.#onpointerup,
			onpointerdown: this.#onpointerdown,
			onpointerenter: this.#onpointerenter,
			onpointermove: this.#onpointermove,
			onpointerleave: this.#onpointerleave,
			onfocus: this.#onfocus,
			onblur: this.#onblur,
			onclick: this.#onclick,
			...this.attachment
		};
	});
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TooltipContentState = class TooltipContentState {
	static create(opts) {
		return new TooltipContentState(opts, TooltipRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
		new SafePolygon({
			triggerNode: () => this.root.triggerNode,
			contentNode: () => this.root.contentNode,
			enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
			transitIntentTimeout: 180,
			ignoredTargets: () => {
				if (this.root.provider.opts.skipDelayDuration.current === 0) return [];
				const nodes = [];
				const activeTriggerNode = this.root.triggerNode;
				for (const record of this.root.registry.triggers.values()) if (record.node && record.node !== activeTriggerNode) nodes.push(record.node);
				return nodes;
			},
			onPointerExit: () => {
				if (this.root.provider.isTooltipOpen(this.root)) this.root.handleClose();
			}
		});
	}
	onInteractOutside = (e) => {
		if (isElement(e.target) && this.root.triggerNode?.contains(e.target) && this.root.disableCloseOnTriggerClick) {
			e.preventDefault();
			return;
		}
		this.opts.onInteractOutside.current(e);
		if (e.defaultPrevented) return;
		this.root.handleClose();
	};
	onEscapeKeydown = (e) => {
		this.opts.onEscapeKeydown.current?.(e);
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
		"data-state": this.root.stateAttr,
		"data-disabled": boolToEmptyStrOrUndef(this.root.disabled),
		...getDataTransitionAttrs(this.root.contentPresence.transitionStatus),
		style: { outline: "none" },
		[tooltipAttrs.content]: "",
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
		onCloseAutoFocus: this.onCloseAutoFocus
	};
};
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip.svelte
function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, triggerId = null, onOpenChange = noop, onOpenChangeComplete = noop, disabled, delayDuration, disableCloseOnTriggerClick, disableHoverableContent, ignoreNonKeyboardFocus, tether, children } = $$props;
		const rootState = TooltipRootState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			triggerId: boxWith(() => triggerId, (v) => {
				triggerId = v;
			}),
			delayDuration: boxWith(() => delayDuration),
			disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
			disableHoverableContent: boxWith(() => disableHoverableContent),
			ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
			disabled: boxWith(() => disabled),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete),
			tether: boxWith(() => tether)
		});
		Floating_layer($$renderer, {
			tooltip: true,
			children: ($$renderer) => {
				children?.($$renderer, {
					open: rootState.opts.open.current,
					triggerId: rootState.activeTriggerId,
					payload: rootState.activePayload
				});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		bind_props($$props, {
			open,
			triggerId
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip-content.svelte
function Tooltip_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, side = "top", sideOffset = 0, align = "center", avoidCollisions = true, arrowPadding = 0, sticky = "partial", strategy, hideWhenDetached = false, customAnchor, collisionPadding = 0, onInteractOutside = noop, onEscapeKeydown = noop, forceMount = false, style, $$slots, $$events, ...restProps } = $$props;
		const contentState = TooltipContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown)
		});
		const floatingProps = derived(() => ({
			side,
			sideOffset,
			align,
			avoidCollisions,
			arrowPadding,
			sticky,
			hideWhenDetached,
			collisionPadding,
			strategy,
			customAnchor: customAnchor ?? contentState.root.triggerNode
		}));
		const mergedProps = derived(() => mergeProps(restProps, floatingProps(), contentState.props));
		if (forceMount) {
			$$renderer.push("<!--[0-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalWrapperProps = mergeProps(wrapperProps, { style: { pointerEvents: contentState.root.disableHoverableContent ? "none" : void 0 } });
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") }, { style });
					if (child) {
						$$renderer.push("<!--[0-->");
						child($$renderer, {
							props: finalProps,
							wrapperProps: finalWrapperProps,
							...contentState.snippetProps
						});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div${attributes({ ...finalWrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				Popper_layer_force_mount($$renderer, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						enabled: contentState.root.opts.open.current,
						id,
						trapFocus: false,
						loop: false,
						preventScroll: false,
						forceMount: true,
						ref: contentState.opts.ref,
						tooltip: true,
						shouldRender: contentState.shouldRender,
						contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push("<!--[1-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalWrapperProps = mergeProps(wrapperProps, { style: { pointerEvents: contentState.root.disableHoverableContent ? "none" : void 0 } });
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") }, { style });
					if (child) {
						$$renderer.push("<!--[0-->");
						child($$renderer, {
							props: finalProps,
							wrapperProps: finalWrapperProps,
							...contentState.snippetProps
						});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div${attributes({ ...finalWrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				Popper_layer($$renderer, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						open: contentState.root.opts.open.current,
						id,
						trapFocus: false,
						loop: false,
						preventScroll: false,
						forceMount: false,
						ref: contentState.opts.ref,
						tooltip: true,
						shouldRender: contentState.shouldRender,
						contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
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
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip-trigger.svelte
function Tooltip_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), disabled = false, payload, tether, type = "button", tabindex = 0, ref = null, $$slots, $$events, ...restProps } = $$props;
		const triggerState = TooltipTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			tabindex: boxWith(() => tabindex ?? 0),
			payload: boxWith(() => payload),
			tether: boxWith(() => tether),
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
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip-provider.svelte
function Tooltip_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, delayDuration = 700, disableCloseOnTriggerClick = false, disableHoverableContent = false, disabled = false, ignoreNonKeyboardFocus = false, skipDelayDuration = 300 } = $$props;
		TooltipProviderState.create({
			delayDuration: boxWith(() => delayDuration),
			disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
			disableHoverableContent: boxWith(() => disableHoverableContent),
			disabled: boxWith(() => disabled),
			ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
			skipDelayDuration: boxWith(() => skipDelayDuration)
		});
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
//#endregion
//#region src/lib/features/live/room.svelte.ts
var i18n = useI18n();
var LiveRoom = class {
	client;
	auth = initAuth();
	status = "checking";
	connectionState = "idle";
	error = "";
	mediaError = "";
	joinInfo = null;
	_room = null;
	mediaTiles = [];
	participants = [];
	micEnabled = false;
	cameraEnabled = false;
	screenShareEnabled = false;
	pendingControl = null;
	streamStats = {
		bitrateMbps: null,
		packetLoss: null,
		width: null,
		height: null,
		fps: null,
		videoTracks: 0,
		audioTracks: 0
	};
	trackStats = [];
	activeSpeakerIdentity = null;
	showParticipants = false;
	showChat = false;
	showQualityPanel = false;
	statsTimer = null;
	debouncedRefreshParticipants = useDebounce(() => this._refreshParticipants(), 80);
	expiryTimer = null;
	clockTimer = null;
	nowMs = Date.now();
	previousStats = /* @__PURE__ */ new Map();
	preConnectStep = "idle";
	previewStream = null;
	audioLevel = 0;
	audioInterval = null;
	audioContext = null;
	videoDevices = [];
	audioDevices = [];
	selectedVideoDevice = "";
	selectedAudioDevice = "";
	selectedCodec = "h264";
	selectedResolution = "1080p";
	selectedFramerate = 30;
	selectedBitrateMbps = 4.5;
	selectedAudioPreset = "musicHighQuality";
	simulcastEnabled = true;
	forceStereo = false;
	degradationPreference = "maintain-framerate";
	audioProcessingEnabled = true;
	cameraAccess = "unknown";
	micAccess = "unknown";
	wantsCameraOnJoin = false;
	wantsMicOnJoin = false;
	publishCameraOnNextJoin = false;
	publishMicOnNextJoin = false;
	chatMessages = [];
	chatDraft = "";
	tileSort = (a, b) => {
		if (a.source === "screen_share" && b.source !== "screen_share") return -1;
		if (a.source !== "screen_share" && b.source === "screen_share") return 1;
		if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
		return a.name.localeCompare(b.name);
	};
	#isInstructorRoom = derived(() => {
		if (this.joinInfo) return this.joinInfo.participantRole === "instructor" || this.joinInfo.participantRole === "admin";
		const role = getCachedRole();
		return role === "instructor" || role === "admin";
	});
	get isInstructorRoom() {
		return this.#isInstructorRoom();
	}
	set isInstructorRoom($$value) {
		return this.#isInstructorRoom($$value);
	}
	#videoTiles = derived(() => this.mediaTiles.filter((tile) => tile.kind === "video"));
	get videoTiles() {
		return this.#videoTiles();
	}
	set videoTiles($$value) {
		return this.#videoTiles($$value);
	}
	#audioTiles = derived(() => this.mediaTiles.filter((tile) => tile.kind === "audio"));
	get audioTiles() {
		return this.#audioTiles();
	}
	set audioTiles($$value) {
		return this.#audioTiles($$value);
	}
	#screenShareTiles = derived(() => this.mediaTiles.filter((t) => t.kind === "video" && t.source === "screen_share"));
	get screenShareTiles() {
		return this.#screenShareTiles();
	}
	set screenShareTiles($$value) {
		return this.#screenShareTiles($$value);
	}
	#hasScreenShare = derived(() => this.screenShareTiles.length > 0);
	get hasScreenShare() {
		return this.#hasScreenShare();
	}
	set hasScreenShare($$value) {
		return this.#hasScreenShare($$value);
	}
	#instructorVideos = derived(() => this.mediaTiles.filter((tile) => tile.kind === "video" && tile.isInstructor && tile.source !== "screen_share").sort(this.tileSort));
	get instructorVideos() {
		return this.#instructorVideos();
	}
	set instructorVideos($$value) {
		return this.#instructorVideos($$value);
	}
	#studentVideos = derived(() => this.mediaTiles.filter((tile) => tile.kind === "video" && !tile.isInstructor).sort(this.tileSort));
	get studentVideos() {
		return this.#studentVideos();
	}
	set studentVideos($$value) {
		return this.#studentVideos($$value);
	}
	#primaryInstructorVideo = derived(() => {
		const screenShares = this.mediaTiles.filter((t) => t.kind === "video" && t.source === "screen_share");
		if (screenShares.length > 0) return screenShares[0];
		const instructors = this.mediaTiles.filter((t) => t.kind === "video" && t.isInstructor && t.source !== "screen_share").sort(this.tileSort);
		return instructors.find((t) => !t.isLocal) ?? instructors[0] ?? null;
	});
	get primaryInstructorVideo() {
		return this.#primaryInstructorVideo();
	}
	set primaryInstructorVideo($$value) {
		return this.#primaryInstructorVideo($$value);
	}
	#selfVideo = derived(() => this.mediaTiles.find((tile) => tile.kind === "video" && tile.isLocal && tile.source !== "screen_share") ?? null);
	get selfVideo() {
		return this.#selfVideo();
	}
	set selfVideo($$value) {
		return this.#selfVideo($$value);
	}
	#connectionLabel = derived(() => this.connectionState === "connected" ? i18n.t.live.room.connected() : this.connectionState === "reconnecting" ? i18n.t.live.room.reconnecting() : this.connectionState === "connecting" ? i18n.t.live.room.connecting() : i18n.t.live.room.disconnected());
	get connectionLabel() {
		return this.#connectionLabel();
	}
	set connectionLabel($$value) {
		return this.#connectionLabel($$value);
	}
	#formattedBitrate = derived(() => this.streamStats.bitrateMbps === null ? "—" : `${this.streamStats.bitrateMbps.toFixed(1)} Mbps`);
	get formattedBitrate() {
		return this.#formattedBitrate();
	}
	set formattedBitrate($$value) {
		return this.#formattedBitrate($$value);
	}
	#formattedResolution = derived(() => this.streamStats.width && this.streamStats.height ? `${this.streamStats.width}×${this.streamStats.height}` : "—");
	get formattedResolution() {
		return this.#formattedResolution();
	}
	set formattedResolution($$value) {
		return this.#formattedResolution($$value);
	}
	#formattedFps = derived(() => this.streamStats.fps === null ? "—" : `${Math.round(this.streamStats.fps)} fps`);
	get formattedFps() {
		return this.#formattedFps();
	}
	set formattedFps($$value) {
		return this.#formattedFps($$value);
	}
	#formattedPacketLoss = derived(() => this.streamStats.packetLoss === null ? "—" : `${this.streamStats.packetLoss.toFixed(1)}%`);
	get formattedPacketLoss() {
		return this.#formattedPacketLoss();
	}
	set formattedPacketLoss($$value) {
		return this.#formattedPacketLoss($$value);
	}
	#gridCols = derived(() => () => {
		const count = this.videoTiles.length;
		if (count <= 1) return 1;
		if (count <= 4) return 2;
		if (count <= 9) return 3;
		return 4;
	});
	get gridCols() {
		return this.#gridCols();
	}
	set gridCols($$value) {
		return this.#gridCols($$value);
	}
	#hasPreviewCamera = derived(() => Boolean(this.previewStream?.getVideoTracks().length));
	get hasPreviewCamera() {
		return this.#hasPreviewCamera();
	}
	set hasPreviewCamera($$value) {
		return this.#hasPreviewCamera($$value);
	}
	#hasPreviewMic = derived(() => Boolean(this.previewStream?.getAudioTracks().length));
	get hasPreviewMic() {
		return this.#hasPreviewMic();
	}
	set hasPreviewMic($$value) {
		return this.#hasPreviewMic($$value);
	}
	#expiresAt = derived(() => this.joinInfo?.joinClosesAt ?? null);
	get expiresAt() {
		return this.#expiresAt();
	}
	set expiresAt($$value) {
		return this.#expiresAt($$value);
	}
	#secondsUntilExpiry = derived(() => this.expiresAt === null ? null : Math.max(0, Math.floor((this.expiresAt - this.nowMs) / 1e3)));
	get secondsUntilExpiry() {
		return this.#secondsUntilExpiry();
	}
	set secondsUntilExpiry($$value) {
		return this.#secondsUntilExpiry($$value);
	}
	constructor(client) {
		this.client = client;
	}
	getClassId() {
		return new URLSearchParams(window.location.search).get("classId");
	}
	isInstructorIdentity(identity) {
		return identity.startsWith("instructor_") || identity.startsWith("admin_");
	}
	participantName(participant) {
		const value = participant;
		return value.name || value.identity || i18n.t.live.room.fallbackName();
	}
	participantIdentity(participant) {
		return participant.identity ?? "unknown";
	}
	participantIsLocal(participant) {
		return Boolean(participant.isLocal);
	}
	publicationId(publication, track, fallback) {
		const pub = publication;
		const value = track;
		return pub.trackSid ?? pub.sid ?? value.sid ?? value.mediaStreamTrack?.id ?? fallback;
	}
	trackSource(publication) {
		const source = String(publication.source ?? "unknown");
		if (source === "camera" || source === "microphone" || source === "screen_share" || source === "screen_share_audio") return source;
		return "unknown";
	}
	upsertTile(tile) {
		const existing = this.mediaTiles.find((item) => item.id === tile.id);
		if (existing) existing.element.remove();
		this.mediaTiles = [...this.mediaTiles.filter((item) => item.id !== tile.id), tile];
	}
	detachTrack(track) {
		track.detach?.().forEach((element) => element.remove());
	}
	removeTiles(predicate) {
		this.mediaTiles.filter(predicate).forEach((tile) => tile.element.remove());
		this.mediaTiles = this.mediaTiles.filter((tile) => !predicate(tile));
	}
	removeTileByPublication(participant, publication, track) {
		const identity = this.participantIdentity(participant);
		const source = this.trackSource(publication);
		const id = `${identity}_${source}_${this.publicationId(publication, track, "track")}`;
		this.removeTiles((tile) => tile.id === id || tile.identity === identity && tile.source === source);
		this.detachTrack(track);
	}
	clearMediaTiles() {
		this.mediaTiles.forEach((tile) => tile.element.remove());
		this.mediaTiles = [];
	}
	addTrackTile(track, publication, participant, prefix) {
		const value = track;
		if (typeof value.attach !== "function") return;
		const identity = this.participantIdentity(participant);
		const source = this.trackSource(publication);
		const tileId = `${identity}_${source}_${this.publicationId(publication, track, prefix)}`;
		this.detachTrack(track);
		const element = value.attach();
		const kind = element instanceof HTMLAudioElement ? "audio" : "video";
		const isLocal = this.participantIsLocal(participant);
		if (kind === "video") {
			element.setAttribute("playsinline", "true");
			element.setAttribute("data-source", source);
			element.muted = isLocal;
		}
		this.upsertTile({
			id: tileId,
			identity,
			name: this.participantName(participant),
			element,
			kind,
			source,
			isLocal,
			isInstructor: this.isInstructorIdentity(identity)
		});
	}
	shouldSubscribeToPublication(participant) {
		if (this.isInstructorRoom) return true;
		return this.isInstructorIdentity(this.participantIdentity(participant));
	}
	targetQualityForPublication(participant) {
		return this.isInstructorIdentity(this.participantIdentity(participant)) ? 2 : 0;
	}
	subscribeIfAllowed(publication, participant) {
		const pub = publication;
		if (typeof pub.setSubscribed !== "function") return;
		const shouldSubscribe = this.shouldSubscribeToPublication(participant);
		pub.setSubscribed(shouldSubscribe);
		if (shouldSubscribe && pub.kind === "video" && typeof pub.setVideoQuality === "function") pub.setVideoQuality(this.targetQualityForPublication(participant));
	}
	attachParticipantListeners(participant, participantEvent) {
		const value = participant;
		value.on?.(participantEvent.IsSpeakingChanged, () => this.refreshParticipants());
		value.trackPublications?.forEach((publication) => {
			this.subscribeIfAllowed(publication, participant);
			const track = publication.track;
			if (track) this.addTrackTile(track, publication, participant, "remote");
		});
	}
	refreshParticipants() {
		this.debouncedRefreshParticipants();
	}
	_refreshParticipants() {
		if (this._room === null) return;
		const local = this._room.localParticipant;
		const next = [{
			identity: local.identity,
			name: local.name || local.identity,
			isInstructor: this.isInstructorIdentity(local.identity),
			isLocal: true,
			isSpeaking: Boolean(local.isSpeaking),
			hasCamera: Boolean([...local.trackPublications.values()].some((p) => this.trackSource(p) === "camera" && p.track)),
			hasMic: Boolean([...local.trackPublications.values()].some((p) => this.trackSource(p) === "microphone" && p.track))
		}];
		this._room.remoteParticipants.forEach((participant) => {
			const value = participant;
			next.push({
				identity: value.identity,
				name: value.name || value.identity,
				isInstructor: this.isInstructorIdentity(value.identity),
				isLocal: false,
				isSpeaking: Boolean(value.isSpeaking),
				hasCamera: Boolean([...value.trackPublications?.values() ?? []].some((p) => this.trackSource(p) === "camera" && p.track)),
				hasMic: Boolean([...value.trackPublications?.values() ?? []].some((p) => this.trackSource(p) === "microphone" && p.track))
			});
		});
		this.participants = next.sort((a, b) => Number(b.isInstructor) - Number(a.isInstructor) || a.name.localeCompare(b.name));
	}
	async collectTrackStats(track, id, name, source, kind) {
		const value = track;
		const settings = value.mediaStreamTrack?.getSettings?.();
		let bitrate = 0;
		let packetsLost = 0;
		let packetsTotal = 0;
		(await value.getRTCStatsReport?.())?.forEach((entry) => {
			const stats = entry;
			if (stats.type !== "outbound-rtp" && stats.type !== "inbound-rtp") return;
			const bytes = stats.bytesSent ?? stats.bytesReceived;
			if (typeof bytes === "number" && typeof stats.timestamp === "number") {
				const key = `${id}:${entry.id}`;
				const previous = this.previousStats.get(key);
				if (previous && stats.timestamp > previous.timestamp) bitrate += (bytes - previous.bytes) * 8 / ((stats.timestamp - previous.timestamp) / 1e3);
				this.previousStats.set(key, {
					timestamp: stats.timestamp,
					bytes
				});
			}
			if (typeof stats.packetsLost === "number") packetsLost += Math.max(0, stats.packetsLost);
			if (typeof stats.packetsReceived === "number") packetsTotal += stats.packetsReceived + Math.max(0, stats.packetsLost ?? 0);
		});
		return {
			id,
			name,
			kind,
			source,
			bitrateKbps: Math.round(bitrate / 1e3),
			packetLoss: packetsTotal > 0 ? packetsLost / packetsTotal * 100 : null,
			width: settings?.width ?? null,
			height: settings?.height ?? null,
			fps: settings?.frameRate ?? null
		};
	}
	async refreshStreamStats() {
		if (this._room === null) return;
		const publications = [];
		const local = this._room.localParticipant;
		local.trackPublications?.forEach((publication, id) => {
			const track = publication.track;
			const kind = String(publication.kind ?? "");
			if (track && (kind === "video" || kind === "audio")) publications.push({
				id: `local:${id}`,
				track,
				kind,
				name: local.name || local.identity || i18n.t.live.room.you(),
				source: this.trackSource(publication)
			});
		});
		this._room.remoteParticipants.forEach((participant) => {
			const remote = participant;
			remote.trackPublications?.forEach((publication, id) => {
				const track = publication.track;
				const kind = String(publication.kind ?? "");
				if (track && (kind === "video" || kind === "audio")) publications.push({
					id: `${remote.identity ?? "remote"}:${id}`,
					track,
					kind,
					name: remote.name || remote.identity || i18n.t.live.room.fallbackName(),
					source: this.trackSource(publication)
				});
			});
		});
		const results = await Promise.all(publications.map((p) => this.collectTrackStats(p.track, p.id, p.name, p.source, p.kind)));
		const activeIds = new Set(publications.map((p) => p.id));
		for (const key of this.previousStats.keys()) {
			const baseId = key.split(":")[0];
			if (!activeIds.has(baseId)) this.previousStats.delete(key);
		}
		this.trackStats = results;
		const videoResults = results.filter((r) => r.kind === "video");
		const primaryVideo = videoResults.find((r) => r.source === "screen_share") ?? videoResults.find((r) => !r.id.startsWith("local:")) ?? videoResults[0];
		const totalBitrate = videoResults.reduce((sum, r) => sum + r.bitrateKbps, 0);
		this.streamStats = {
			bitrateMbps: totalBitrate > 0 ? totalBitrate / 1e3 : null,
			packetLoss: primaryVideo?.packetLoss ?? null,
			width: primaryVideo?.width ?? null,
			height: primaryVideo?.height ?? null,
			fps: primaryVideo?.fps ?? null,
			videoTracks: this.videoTiles.length,
			audioTracks: this.audioTiles.length
		};
	}
	startStatsTimer() {
		if (this.statsTimer !== null) return;
		this.statsTimer = window.setInterval(() => {
			if (this.showQualityPanel) this.refreshStreamStats();
		}, 5e3);
	}
	stopStatsTimer() {
		if (this.statsTimer !== null) window.clearInterval(this.statsTimer);
		this.statsTimer = null;
		this.previousStats.clear();
	}
	startExpiryTimer(expiresAt) {
		this.stopExpiryTimer();
		this.nowMs = Date.now();
		this.clockTimer = window.setInterval(() => {
			this.nowMs = Date.now();
		}, 1e3);
		this.expiryTimer = window.setTimeout(() => this.expireLocalRoom(), Math.max(0, expiresAt - Date.now()));
	}
	stopExpiryTimer() {
		if (this.expiryTimer !== null) window.clearTimeout(this.expiryTimer);
		if (this.clockTimer !== null) window.clearInterval(this.clockTimer);
		this.expiryTimer = null;
		this.clockTimer = null;
	}
	expireLocalRoom() {
		this.mediaError = "השיעור הסתיים והחיבור נסגר.";
		this.connectionState = "disconnected";
		this.stopStatsTimer();
		this.clearMediaTiles();
		this._room?.disconnect();
		this._room = null;
	}
	getMediaErrorMessage(kind, reason) {
		const errName = reason instanceof DOMException ? reason.name : "";
		if (errName === "NotAllowedError" || errName === "PermissionDeniedError") return kind === "camera" ? i18n.t.live.preConnect.cameraNotAllowed() : i18n.t.live.preConnect.micNotAllowed();
		if (errName === "NotFoundError" || errName === "DevicesNotFoundError") return kind === "camera" ? i18n.t.live.preConnect.cameraNotFound() : i18n.t.live.preConnect.micNotFound();
		if (errName === "NotReadableError" || errName === "TrackStartError") return kind === "camera" ? i18n.t.live.preConnect.cameraNotReadable() : i18n.t.live.preConnect.micNotReadable();
		if (errName === "AbortError") return kind === "camera" ? i18n.t.live.preConnect.cameraAborted() : i18n.t.live.preConnect.micAborted();
		return kind === "camera" ? i18n.t.live.preConnect.cameraGeneric() : i18n.t.live.preConnect.micGeneric();
	}
	accessStateFromError(reason) {
		const errName = reason instanceof DOMException ? reason.name : "";
		if (errName === "NotAllowedError" || errName === "PermissionDeniedError") return "denied";
		if (errName === "NotFoundError" || errName === "DevicesNotFoundError") return "missing";
		return "failed";
	}
	async enumerateDevices() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		this.videoDevices = devices.filter((d) => d.kind === "videoinput").map((d) => ({
			deviceId: d.deviceId,
			label: d.label || i18n.t.live.preConnect.cameraLabel()
		}));
		this.audioDevices = devices.filter((d) => d.kind === "audioinput").map((d) => ({
			deviceId: d.deviceId,
			label: d.label || i18n.t.live.preConnect.micLabel()
		}));
	}
	buildPreviewStream(videoTrack, audioTrack) {
		const tracks = [videoTrack, audioTrack].filter((track) => Boolean(track));
		this.previewStream = tracks.length > 0 ? new MediaStream(tracks) : null;
	}
	startAudioMeter(stream) {
		if (!stream.getAudioTracks()[0]) return;
		this.audioContext = new AudioContext();
		const source = this.audioContext.createMediaStreamSource(stream);
		const analyser = this.audioContext.createAnalyser();
		analyser.fftSize = 256;
		source.connect(analyser);
		const data = new Uint8Array(analyser.frequencyBinCount);
		this.audioInterval = window.setInterval(() => {
			analyser.getByteFrequencyData(data);
			const avg = data.reduce((a, b) => a + b, 0) / data.length;
			this.audioLevel = avg / 255;
		}, 100);
	}
	async requestPreviewTracks() {
		const messages = [];
		let videoTrack;
		let audioTrack;
		try {
			const constraints = {
				video: this.selectedVideoDevice ? { deviceId: { exact: this.selectedVideoDevice } } : true,
				audio: false
			};
			videoTrack = (await navigator.mediaDevices.getUserMedia(constraints)).getVideoTracks()[0];
			this.cameraAccess = videoTrack ? "ready" : "missing";
			this.wantsCameraOnJoin = Boolean(videoTrack);
			const settings = videoTrack?.getSettings();
			if (settings?.deviceId) this.selectedVideoDevice = settings.deviceId;
		} catch (reason) {
			console.warn("[LiveKit] Camera preview failed:", reason);
			this.cameraAccess = this.accessStateFromError(reason);
			this.wantsCameraOnJoin = false;
			messages.push(this.getMediaErrorMessage("camera", reason));
		}
		try {
			const constraints = {
				video: false,
				audio: this.selectedAudioDevice ? {
					deviceId: { exact: this.selectedAudioDevice },
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				} : {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			};
			audioTrack = (await navigator.mediaDevices.getUserMedia(constraints)).getAudioTracks()[0];
			this.micAccess = audioTrack ? "ready" : "missing";
			this.wantsMicOnJoin = Boolean(audioTrack);
			const settings = audioTrack?.getSettings();
			if (settings?.deviceId) this.selectedAudioDevice = settings.deviceId;
		} catch (reason) {
			console.warn("[LiveKit] Microphone preview failed:", reason);
			this.micAccess = this.accessStateFromError(reason);
			this.wantsMicOnJoin = false;
			messages.push(this.getMediaErrorMessage("microphone", reason));
		}
		this.buildPreviewStream(videoTrack, audioTrack);
		await this.enumerateDevices();
		return messages;
	}
	async startPreview() {
		this.stopPreview();
		this.preConnectStep = "requesting";
		this.mediaError = "";
		this.cameraAccess = "unknown";
		this.micAccess = "unknown";
		const messages = await this.requestPreviewTracks();
		if (this.previewStream) {
			this.preConnectStep = "preview";
			this.startAudioMeter(this.previewStream);
			this.mediaError = messages.join(" ");
		} else {
			this.mediaError = messages.length > 0 ? `${messages.join(" ")} ${i18n.t.live.preConnect.enterWithoutCamera()}` : i18n.t.live.preConnect.noCameraOrMic();
			this.preConnectStep = "no-devices";
		}
	}
	async switchPreviewDevice() {
		this.stopPreview();
		this.preConnectStep = "requesting";
		this.mediaError = "";
		const messages = await this.requestPreviewTracks();
		if (this.previewStream) {
			this.preConnectStep = "preview";
			this.startAudioMeter(this.previewStream);
			this.mediaError = messages.join(" ");
		} else {
			this.mediaError = messages.length > 0 ? `${messages.join(" ")} ${i18n.t.live.preConnect.enterWithoutCamera()}` : i18n.t.live.preConnect.noDevicesAccess();
			this.preConnectStep = "no-devices";
		}
	}
	async retryCamera() {
		this.selectedVideoDevice = "";
		await this.switchPreviewDevice();
	}
	async switchStreamDevice(kind, deviceId) {
		if (!this._room) return;
		try {
			await this._room.switchActiveDevice(kind, deviceId, true);
			if (kind === "audioinput") this.selectedAudioDevice = deviceId;
			if (kind === "videoinput") this.selectedVideoDevice = deviceId;
		} catch (reason) {
			console.warn(`[LiveKit] Failed to switch ${kind}:`, reason);
		}
	}
	stopPreview() {
		if (this.previewStream) {
			this.previewStream.getTracks().forEach((t) => t.stop());
			this.previewStream = null;
		}
		if (this.audioInterval !== null) {
			window.clearInterval(this.audioInterval);
			this.audioInterval = null;
		}
		if (this.audioContext !== null) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.audioLevel = 0;
	}
	resolutionDimensions(isInstructor) {
		const frameRate = this.selectedFramerate;
		if (this.selectedResolution === "1080p" && isInstructor) return {
			width: 1920,
			height: 1080,
			frameRate
		};
		if (this.selectedResolution === "720p" || isInstructor) return {
			width: 1280,
			height: 720,
			frameRate
		};
		return {
			width: 640,
			height: 360,
			frameRate: Math.min(frameRate, 30)
		};
	}
	cameraCaptureOptions(isInstructor) {
		return {
			resolution: this.resolutionDimensions(isInstructor),
			frameRate: this.selectedFramerate,
			...this.selectedVideoDevice ? { deviceId: this.selectedVideoDevice } : {}
		};
	}
	microphoneCaptureOptions() {
		return {
			echoCancellation: this.audioProcessingEnabled,
			noiseSuppression: this.audioProcessingEnabled,
			autoGainControl: this.audioProcessingEnabled,
			...this.selectedAudioDevice ? { deviceId: this.selectedAudioDevice } : {}
		};
	}
	publishProfile(isInstructor, VideoPreset, AudioPresets) {
		const targetBitrate = Math.round(this.selectedBitrateMbps * 1e6);
		const frameRate = this.selectedFramerate;
		const isSvc = this.selectedCodec === "vp9" || this.selectedCodec === "av1";
		const audioPresets = {
			speech: AudioPresets.speech,
			music: AudioPresets.music,
			musicStereo: AudioPresets.musicStereo,
			musicHighQuality: AudioPresets.musicHighQuality,
			musicHighQualityStereo: AudioPresets.musicHighQualityStereo
		};
		const scalabilityMode = isSvc ? this.selectedResolution === "1080p" ? "L3T3_KEY" : "L2T3_KEY" : void 0;
		return {
			simulcast: this.simulcastEnabled && !isSvc,
			videoCodec: this.selectedCodec,
			videoEncoding: {
				maxBitrate: targetBitrate,
				maxFramerate: frameRate
			},
			videoSimulcastLayers: this.simulcastEnabled && !isSvc ? [new VideoPreset(1280, 720, Math.round(targetBitrate * .4), Math.min(frameRate, 30)), new VideoPreset(640, 360, Math.round(targetBitrate * .15), Math.min(frameRate, 30))] : void 0,
			screenShareEncoding: {
				maxBitrate: 4e6,
				maxFramerate: 15
			},
			screenShareSimulcastLayers: [new VideoPreset(1280, 720, 2e6, 15), new VideoPreset(640, 360, 8e5, 15)],
			audioPreset: audioPresets[this.selectedAudioPreset],
			red: true,
			dtx: this.selectedAudioPreset === "speech",
			forceStereo: this.forceStereo,
			degradationPreference: this.degradationPreference,
			scalabilityMode,
			backupCodec: {
				codec: this.selectedCodec === "h264" ? "vp8" : "h264",
				encoding: {
					maxBitrate: Math.round(targetBitrate * .7),
					maxFramerate: frameRate
				}
			}
		};
	}
	async enterRoom(publishAvailableDevices = true) {
		this.publishCameraOnNextJoin = publishAvailableDevices && this.wantsCameraOnJoin;
		this.publishMicOnNextJoin = publishAvailableDevices && this.wantsMicOnJoin;
		this.stopPreview();
		this.mediaError = "";
		if (typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox")) await new Promise((r) => setTimeout(r, 500));
		if (this.joinInfo) this.connectRoom(this.joinInfo);
	}
	async reconnect() {
		if (!this.joinInfo || Date.now() >= this.joinInfo.joinClosesAt) return;
		this.error = "";
		this.mediaError = "";
		this.connectionState = "idle";
		await this.loadToken();
		if (this.status === "ready" && this.joinInfo) await this.enterRoom(true);
	}
	async startLiveAndConnect(publishAvailableDevices = true) {
		const liveClassId = this.getClassId();
		if (liveClassId === null) return;
		this.status = "checking";
		this.error = "";
		try {
			await this.client.mutation(api.live.class.start, { liveClassId });
			await this.loadToken();
			if (this.status === "ready") await this.enterRoom(publishAvailableDevices);
		} catch (reason) {
			console.error("[LiveKit] Start live failed:", reason);
			this.error = reason instanceof Error ? reason.message : i18n.t.live.room.startLiveError();
			this.status = "error";
		}
	}
	async endLive() {
		const liveClassId = this.getClassId();
		if (liveClassId === null) return;
		try {
			await this.client.mutation(api.live.class.end, { liveClassId });
			this.destroy();
			window.location.assign("/i/live");
		} catch (reason) {
			console.error("[LiveKit] End live failed:", reason);
			this.mediaError = reason instanceof Error ? reason.message : i18n.t.live.room.endLiveError();
		}
	}
	async loadToken() {
		if (!this.auth.isAuthenticated) {
			this.status = "locked";
			return;
		}
		const liveClassId = this.getClassId();
		if (liveClassId === null) {
			this.status = "missing";
			return;
		}
		this.status = "checking";
		this.error = "";
		this.mediaError = "";
		try {
			const joinInfo = await this.client.action(api.livekit.token.issueJoin, { liveClassId });
			this.joinInfo = joinInfo;
			this.startExpiryTimer(joinInfo.joinClosesAt);
			this.status = "ready";
		} catch (reason) {
			console.error("[LiveKit] Token fetch failed:", reason);
			if (!this.auth.isAuthenticated) {
				this.status = "locked";
				return;
			}
			const message = reason instanceof Error ? reason.message : String(reason);
			if (message.includes("Class is not live")) {
				const role = getCachedRole();
				if (role === "instructor" || role === "admin") {
					this.status = "prep";
					return;
				}
			}
			this.error = this.auth.error || message || i18n.t.live.room.tokenError();
			this.status = "error";
		}
	}
	async connectRoom(info) {
		this.connectionState = "connecting";
		try {
			const { Room, RoomEvent, ParticipantEvent, VideoPreset, AudioPresets } = await import("livekit-client");
			const isInstructor = info.participantRole === "instructor" || info.participantRole === "admin";
			const lkRoom = new Room({
				adaptiveStream: true,
				dynacast: true,
				disconnectOnPageLeave: false,
				stopLocalTrackOnUnpublish: false,
				reconnectPolicy: { nextRetryDelayInMs(ctx) {
					if (ctx.retryCount >= 10) return null;
					return Math.min(3e3 * (ctx.retryCount + 1), 15e3);
				} },
				audioCaptureDefaults: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				},
				videoCaptureDefaults: { resolution: this.resolutionDimensions(isInstructor) },
				publishDefaults: this.publishProfile(isInstructor, VideoPreset, AudioPresets)
			});
			this._room = lkRoom;
			lkRoom.registerTextStreamHandler("homebody.chat", (reader, participantInfo) => {
				(async () => {
					const text = await reader.readAll();
					const participant = participantInfo.identity === lkRoom.localParticipant.identity ? lkRoom.localParticipant : lkRoom.remoteParticipants.get(participantInfo.identity);
					const next = [...this.chatMessages, {
						id: reader.info?.id ?? `${participantInfo.identity}:${Date.now()}`,
						identity: participantInfo.identity,
						name: participant?.name || participantInfo.identity,
						text,
						createdAt: reader.info?.timestamp ?? Date.now(),
						isLocal: participantInfo.identity === lkRoom.localParticipant.identity
					}];
					this.chatMessages = next.length > 200 ? next.slice(-200) : next;
				})();
			});
			lkRoom.on(RoomEvent.Reconnecting, () => {
				this.connectionState = "reconnecting";
			}).on(RoomEvent.Reconnected, () => {
				this.connectionState = "connected";
				this.refreshParticipants();
			}).on(RoomEvent.Disconnected, () => {
				if (this.joinInfo && Date.now() < this.joinInfo.joinClosesAt) {
					this.connectionState = "idle";
					this.status = "ready";
				} else this.connectionState = "disconnected";
			}).on(RoomEvent.ParticipantConnected, (participant) => {
				this.attachParticipantListeners(participant, ParticipantEvent);
				this.refreshParticipants();
			}).on(RoomEvent.ParticipantDisconnected, (participant) => {
				this.removeTiles((tile) => tile.identity === this.participantIdentity(participant));
				this.refreshParticipants();
			}).on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
				this.activeSpeakerIdentity = speakers.find((s) => s.isSpeaking)?.identity ?? null;
				this.refreshParticipants();
			}).on(RoomEvent.LocalTrackPublished, (publication, participant) => {
				this.addTrackTile(publication.track, publication, participant, "local");
			}).on(RoomEvent.LocalTrackUnpublished, (publication, participant) => {
				this.removeTileByPublication(participant, publication, publication.track);
				const source = this.trackSource(publication);
				if (source === "screen_share" || source === "screen_share_audio") this.screenShareEnabled = false;
			}).on(RoomEvent.TrackUnpublished, (publication, participant) => {
				this.removeTileByPublication(participant, publication, publication.track);
			}).on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
				this.addTrackTile(track, publication, participant, "remote");
			}).on(RoomEvent.TrackPublished, (publication, participant) => {
				this.subscribeIfAllowed(publication, participant);
			}).on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
				this.removeTileByPublication(participant, publication, track);
			});
			await lkRoom.connect(info.wsUrl, info.token);
			if (this.publishCameraOnNextJoin) try {
				await lkRoom.localParticipant.setCameraEnabled(true, this.cameraCaptureOptions(isInstructor));
				this.cameraEnabled = true;
			} catch (cameraReason) {
				this.cameraEnabled = false;
				console.warn("[LiveKit] Camera failed:", cameraReason);
				this.mediaError = this.getMediaErrorMessage("camera", cameraReason);
			}
			if (this.publishMicOnNextJoin) try {
				await lkRoom.localParticipant.setMicrophoneEnabled(true, this.microphoneCaptureOptions());
				this.micEnabled = true;
			} catch (micReason) {
				this.micEnabled = false;
				console.warn("[LiveKit] Microphone failed:", micReason);
				this.mediaError = [this.mediaError, this.getMediaErrorMessage("microphone", micReason)].filter(Boolean).join(" ");
			}
			this.connectionState = "connected";
			this.refreshParticipants();
			this.startStatsTimer();
			lkRoom.remoteParticipants.forEach((participant) => this.attachParticipantListeners(participant, ParticipantEvent));
		} catch (reason) {
			this.connectionState = "disconnected";
			throw reason;
		}
	}
	async toggleCamera() {
		if (this._room === null || this.pendingControl !== null) return;
		const next = !this.cameraEnabled;
		this.pendingControl = "camera";
		try {
			await this._room.localParticipant.setCameraEnabled(next, this.cameraCaptureOptions(this.isInstructorRoom));
			this.cameraEnabled = next;
			this.mediaError = "";
		} catch (reason) {
			this.mediaError = this.getMediaErrorMessage("camera", reason);
		} finally {
			this.pendingControl = null;
		}
	}
	async toggleMic() {
		if (this._room === null || this.pendingControl !== null) return;
		const next = !this.micEnabled;
		this.pendingControl = "mic";
		try {
			await this._room.localParticipant.setMicrophoneEnabled(next, this.microphoneCaptureOptions());
			this.micEnabled = next;
			this.mediaError = "";
		} catch (reason) {
			this.mediaError = this.getMediaErrorMessage("microphone", reason);
		} finally {
			this.pendingControl = null;
		}
	}
	async toggleScreenShare() {
		if (this._room === null || !this.isInstructorRoom || !this._room.localParticipant.setScreenShareEnabled || this.pendingControl !== null) return;
		const next = !this.screenShareEnabled;
		this.pendingControl = "screen";
		try {
			await this._room.localParticipant.setScreenShareEnabled(next);
			this.screenShareEnabled = next;
			if (!next) this.removeTiles((tile) => tile.isLocal && tile.source === "screen_share");
		} catch (reason) {
			this.mediaError = i18n.t.live.room.screenShareError();
		} finally {
			this.pendingControl = null;
		}
	}
	async sendChatMessage() {
		if (this._room === null) return;
		const text = this.chatDraft.trim();
		if (!text) return;
		this.chatDraft = "";
		await this._room.localParticipant.sendText(text, { topic: "homebody.chat" });
	}
	destroy() {
		this.stopPreview();
		this.stopExpiryTimer();
		this.clearMediaTiles();
		this.stopStatsTimer();
		this._room?.unregisterTextStreamHandler("homebody.chat");
		this._room?.disconnect();
		this._room = null;
	}
};
//#endregion
//#region src/lib/features/live/components/room/ui/LiveAudioMeter.svelte
function LiveAudioMeter($$renderer, $$props) {
	let { label, level } = $$props;
	const scale = derived(() => Math.max(0, Math.min(1, level)));
	$$renderer.push(`<div class="hb-meter"><span class="hb-meter__label">${escape_html(label)}</span> `);
	if (Meter) {
		$$renderer.push("<!--[-->");
		Meter($$renderer, {
			class: "hb-meter__track",
			value: Math.round(scale() * 100),
			max: 100,
			"aria-label": label,
			children: ($$renderer) => {
				$$renderer.push(`<div class="hb-meter__fill"${attr_style(`transform: scaleX(${stringify(scale())})`)}></div>`);
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
//#endregion
//#region src/lib/features/live/components/room/PreConnectFrame.svelte
function PreConnectFrame($$renderer, $$props) {
	let { title, backHref, children } = $$props;
	$$renderer.push(`<section class="live-entry svelte-sl1xo9"${attr("aria-label", title)}><div class="live-entry__mesh svelte-sl1xo9" aria-hidden="true"></div> <div class="live-entry__shell svelte-sl1xo9"><header class="live-entry__header svelte-sl1xo9"><a class="live-entry__close svelte-sl1xo9"${attr("href", backHref)} aria-label="חזרה"><span class="material-symbols-rounded svelte-sl1xo9" aria-hidden="true">close</span></a> <h1 class="live-entry__title svelte-sl1xo9">${escape_html(title)}</h1></header> `);
	children($$renderer);
	$$renderer.push(`<!----></div></section>`);
}
//#endregion
//#region src/lib/features/live/components/room/PreConnectPreview.svelte
function PreConnectPreview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { previewStream, hasPreviewCamera } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="preview-panel svelte-1tsbpt6"${attr("aria-label", t.live.preConnect.title())}>`);
		if (hasPreviewCamera) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="preview-panel__video svelte-1tsbpt6"><video autoplay="" playsinline="" muted="" class="svelte-1tsbpt6"></video></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="preview-panel__placeholder svelte-1tsbpt6"><span class="material-symbols-rounded svelte-1tsbpt6" aria-hidden="true">videocam_off</span> <span>${escape_html(t.live.room.noVideo())}</span></div>`);
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
//#region src/lib/components/ui/Switch.svelte
function Switch_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, checked = false, disabled = false, class: className = "", onchange } = $$props;
		function updateChecked(next) {
			checked = next;
			onchange?.();
		}
		$$renderer.push(`<span${attr_class(clsx(`hb-switch ${className}`.trim()))}>`);
		if (Switch) {
			$$renderer.push("<!--[-->");
			Switch($$renderer, {
				class: "hb-switch__root",
				"aria-label": label,
				checked,
				disabled,
				onCheckedChange: updateChecked,
				children: ($$renderer) => {
					if (Switch_thumb) {
						$$renderer.push("<!--[-->");
						Switch_thumb($$renderer, { class: "hb-switch__thumb" });
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
		$$renderer.push(` <span>${escape_html(label)}</span></span>`);
		bind_props($$props, { checked });
	});
}
//#endregion
//#region src/lib/features/live/components/room/PreConnectSettings.svelte
function PreConnectSettings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		const customerResolutionOptions = [{
			value: "720p",
			label: "720p"
		}, {
			value: "360p",
			label: "360p"
		}];
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<section class="settings-panel svelte-arx5f7"${attr("aria-label", t.live.room.settingsTitle())}><div class="settings-panel__head svelte-arx5f7"><span class="svelte-arx5f7">${escape_html(t.live.room.settingsTitle())}</span> <strong class="svelte-arx5f7">${escape_html(room.isInstructorRoom ? t.live.preConnect.qualityTitle() : t.live.preConnect.devicesCheckTitle())}</strong></div> <div class="settings-panel__grid svelte-arx5f7">`);
			if (room.isInstructorRoom) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="preset-row svelte-arx5f7"><button type="button"${attr_class("preset-btn svelte-arx5f7", void 0, { "preset-btn--active": room.selectedResolution === "720p" && room.selectedBitrateMbps === 4.5 })}><span class="preset-btn__title svelte-arx5f7">סטנדרטי</span> <span class="preset-btn__desc svelte-arx5f7">720p · 4.5 Mbps</span></button> <button type="button"${attr_class("preset-btn svelte-arx5f7", void 0, { "preset-btn--active": room.selectedResolution === "1080p" && room.selectedBitrateMbps === 6 })}><span class="preset-btn__title svelte-arx5f7">איכות גבוהה</span> <span class="preset-btn__desc svelte-arx5f7">1080p · 6 Mbps</span></button> <button type="button"${attr_class("preset-btn svelte-arx5f7", void 0, { "preset-btn--active": room.selectedCodec === "vp9" && room.selectedBitrateMbps === 2.5 })}><span class="preset-btn__title svelte-arx5f7">רוחב פס נמוך</span> <span class="preset-btn__desc svelte-arx5f7">720p · 2.5 Mbps</span></button></div> <button type="button" class="advanced-toggle svelte-arx5f7"><span class="material-symbols-rounded" aria-hidden="true">${escape_html("expand_more")}</span> <span>הגדרות מתקדמות</span></button> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push("<!--[-1-->");
				Select_1($$renderer, {
					label: t.live.preConnect.resolutionLabel(),
					options: customerResolutionOptions,
					get value() {
						return room.selectedResolution;
					},
					set value($$value) {
						room.selectedResolution = $$value;
						$$settled = false;
					}
				});
			}
			$$renderer.push(`<!--]--> `);
			if (room.videoDevices.length > 1) {
				$$renderer.push("<!--[0-->");
				Select_1($$renderer, {
					label: t.live.preConnect.cameraLabel(),
					options: room.videoDevices.map((d) => ({
						value: d.deviceId,
						label: d.label
					})),
					onchange: () => room.switchPreviewDevice(),
					get value() {
						return room.selectedVideoDevice;
					},
					set value($$value) {
						room.selectedVideoDevice = $$value;
						$$settled = false;
					}
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (room.audioDevices.length > 1) {
				$$renderer.push("<!--[0-->");
				Select_1($$renderer, {
					label: t.live.preConnect.micLabel(),
					options: room.audioDevices.map((d) => ({
						value: d.deviceId,
						label: d.label
					})),
					onchange: () => room.switchPreviewDevice(),
					get value() {
						return room.selectedAudioDevice;
					},
					set value($$value) {
						room.selectedAudioDevice = $$value;
						$$settled = false;
					}
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="settings-panel__toggles svelte-arx5f7">`);
			Switch_1($$renderer, {
				label: t.live.room.echoCancel(),
				onchange: () => room.switchPreviewDevice(),
				get checked() {
					return room.audioProcessingEnabled;
				},
				set checked($$value) {
					room.audioProcessingEnabled = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></div> `);
			if (room.hasPreviewMic) {
				$$renderer.push("<!--[0-->");
				LiveAudioMeter($$renderer, {
					label: t.live.preConnect.audioLevel(),
					level: room.audioLevel
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></section>`);
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
//#region src/lib/features/live/components/room/PreConnectState.svelte
function PreConnectState($$renderer, $$props) {
	let { title, message = "", tone = "neutral", actionLabel, actionHref, onAction, secondaryLabel, secondaryHref, loading = false } = $$props;
	$$renderer.push(`<div class="entry-state svelte-17jvehl">`);
	if (loading) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="entry-state__spinner svelte-17jvehl"></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (title) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<h2 class="svelte-17jvehl">${escape_html(title)}</h2>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (message) {
		$$renderer.push("<!--[0-->");
		if (tone === "neutral") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="svelte-17jvehl">${escape_html(message)}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			Notice($$renderer, {
				tone,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(message)}`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]-->`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (actionLabel || secondaryLabel) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="entry-state__actions svelte-17jvehl">`);
		if (actionLabel) {
			$$renderer.push("<!--[0-->");
			Button_1($$renderer, {
				tone: "primary",
				href: actionHref,
				onclick: onAction,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(actionLabel)}`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (secondaryLabel && secondaryHref) {
			$$renderer.push("<!--[0-->");
			Button_1($$renderer, {
				tone: "secondary",
				href: secondaryHref,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(secondaryLabel)}`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
//#region src/lib/features/live/components/room/PreConnectOverlay.svelte
function PreConnectOverlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		const backHref = derived(() => room.isInstructorRoom ? "/i/live" : "/u/calendar");
		const isPrep = derived(() => room.status === "prep");
		const isReady = derived(() => room.status === "ready" && room.joinInfo && room.connectionState === "idle");
		const showSetup = derived(() => isPrep() || isReady());
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			PreConnectFrame($$renderer, {
				title: t.live.preConnect.title(),
				backHref: backHref(),
				children: ($$renderer) => {
					if (room.status === "checking") {
						$$renderer.push("<!--[0-->");
						PreConnectState($$renderer, {
							loading: true,
							message: t.live.preConnect.checking()
						});
					} else if (room.status === "locked") {
						$$renderer.push("<!--[1-->");
						PreConnectState($$renderer, {
							title: t.live.preConnect.lockedTitle(),
							message: room.auth.error,
							actionLabel: t.live.preConnect.lockedCta(),
							actionHref: "/"
						});
					} else if (room.status === "missing") {
						$$renderer.push("<!--[2-->");
						PreConnectState($$renderer, {
							title: t.live.preConnect.missingTitle(),
							actionLabel: t.live.preConnect.missingCta(),
							actionHref: "/u/calendar"
						});
					} else if (room.status === "error") {
						$$renderer.push("<!--[3-->");
						PreConnectState($$renderer, {
							title: t.live.preConnect.errorTitle(),
							message: room.error,
							tone: "danger",
							actionLabel: t.live.preConnect.retry(),
							onAction: () => room.loadToken(),
							secondaryLabel: t.live.preConnect.backCalendar(),
							secondaryHref: "/u/calendar"
						});
					} else if (showSetup()) {
						$$renderer.push("<!--[4-->");
						$$renderer.push(`<div class="entry-stack svelte-ikmx6e">`);
						if (room.preConnectStep === "requesting") {
							$$renderer.push("<!--[0-->");
							PreConnectState($$renderer, {
								loading: true,
								message: t.live.preConnect.requesting()
							});
						} else if (room.preConnectStep === "preview" && room.previewStream) {
							$$renderer.push("<!--[1-->");
							if (room.isInstructorRoom) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<div class="entry-console svelte-ikmx6e"><aside class="entry-console__side svelte-ikmx6e">`);
								PreConnectSettings($$renderer, { room });
								$$renderer.push(`<!----> <div class="entry-actions svelte-ikmx6e">`);
								if (isPrep()) {
									$$renderer.push("<!--[0-->");
									Button_1($$renderer, {
										tone: "primary",
										size: "lg",
										onclick: () => room.startLiveAndConnect(true),
										children: ($$renderer) => {
											$$renderer.push(`<!---->${escape_html(t.live.preConnect.startLive())}`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push("<!--[-1-->");
									Button_1($$renderer, {
										tone: "primary",
										size: "lg",
										onclick: () => room.enterRoom(true),
										children: ($$renderer) => {
											$$renderer.push(`<!---->${escape_html(t.live.preConnect.enterRoom())}`);
										},
										$$slots: { default: true }
									});
								}
								$$renderer.push(`<!--]--> `);
								Button_1($$renderer, {
									tone: "ghost",
									onclick: () => isPrep() ? room.startLiveAndConnect(false) : room.enterRoom(false),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${escape_html(t.live.preConnect.enterWithoutDevices())}`);
									},
									$$slots: { default: true }
								});
								$$renderer.push(`<!----></div></aside> <div class="entry-console__main svelte-ikmx6e">`);
								PreConnectPreview($$renderer, {
									previewStream: room.previewStream,
									hasPreviewCamera: room.hasPreviewCamera
								});
								$$renderer.push(`<!----></div></div>`);
							} else {
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`<div class="customer-connect svelte-ikmx6e"><div class="customer-connect__preview svelte-ikmx6e">`);
								PreConnectPreview($$renderer, {
									previewStream: room.previewStream,
									hasPreviewCamera: room.hasPreviewCamera
								});
								$$renderer.push(`<!----></div> <div class="customer-connect__tools svelte-ikmx6e">`);
								if (room.videoDevices.length > 1) {
									$$renderer.push("<!--[0-->");
									Select_1($$renderer, {
										label: t.live.preConnect.cameraLabel(),
										options: room.videoDevices.map((d) => ({
											value: d.deviceId,
											label: d.label
										})),
										onchange: () => room.switchPreviewDevice(),
										get value() {
											return room.selectedVideoDevice;
										},
										set value($$value) {
											room.selectedVideoDevice = $$value;
											$$settled = false;
										}
									});
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> `);
								if (room.audioDevices.length > 1) {
									$$renderer.push("<!--[0-->");
									Select_1($$renderer, {
										label: t.live.preConnect.micLabel(),
										options: room.audioDevices.map((d) => ({
											value: d.deviceId,
											label: d.label
										})),
										onchange: () => room.switchPreviewDevice(),
										get value() {
											return room.selectedAudioDevice;
										},
										set value($$value) {
											room.selectedAudioDevice = $$value;
											$$settled = false;
										}
									});
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> `);
								if (room.hasPreviewMic) {
									$$renderer.push("<!--[0-->");
									LiveAudioMeter($$renderer, {
										label: t.live.preConnect.audioLevel(),
										level: room.audioLevel
									});
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> <div class="customer-connect__actions svelte-ikmx6e">`);
								Button_1($$renderer, {
									tone: "primary",
									size: "lg",
									onclick: () => room.enterRoom(true),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${escape_html(t.live.preConnect.enterRoom())}`);
									},
									$$slots: { default: true }
								});
								$$renderer.push(`<!----> `);
								Button_1($$renderer, {
									tone: "ghost",
									onclick: () => room.enterRoom(false),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${escape_html(t.live.preConnect.enterWithoutDevices())}`);
									},
									$$slots: { default: true }
								});
								$$renderer.push(`<!----></div></div></div>`);
							}
							$$renderer.push(`<!--]-->`);
						} else if (room.preConnectStep === "denied" || room.preConnectStep === "no-devices") {
							$$renderer.push("<!--[2-->");
							PreConnectState($$renderer, {
								title: t.live.preConnect.enterNoDevices(),
								message: room.mediaError,
								tone: "caution",
								actionLabel: t.live.preConnect.retryDevices(),
								onAction: () => room.startPreview()
							});
							$$renderer.push(`<!----> <div class="entry-actions entry-actions--single svelte-ikmx6e">`);
							Button_1($$renderer, {
								tone: "ghost",
								onclick: () => isPrep() ? room.startLiveAndConnect(false) : room.enterRoom(false),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${escape_html(t.live.preConnect.enterWithoutCamera())}`);
								},
								$$slots: { default: true }
							});
							$$renderer.push(`<!----></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
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
//#region src/lib/components/ui/Tooltip.svelte
function Tooltip_1($$renderer, $$props) {
	let { label, children, sideOffset = 8, openDelay = 160, side = "top", align = "center" } = $$props;
	if (Tooltip) {
		$$renderer.push("<!--[-->");
		Tooltip($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						$$renderer.push(`<span${attributes({
							...props,
							class: "hb-tooltip-trigger"
						})}>`);
						children($$renderer);
						$$renderer.push(`<!----></span>`);
					}
					if (Tooltip_trigger) {
						$$renderer.push("<!--[-->");
						Tooltip_trigger($$renderer, {
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
								function child($$renderer, { wrapperProps, props, open }) {
									if (open) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({
											...props,
											class: "hb-tooltip-content"
										})}>${escape_html(label)}</div></div>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]-->`);
								}
								if (Tooltip_content) {
									$$renderer.push("<!--[-->");
									Tooltip_content($$renderer, {
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
//#endregion
//#region src/lib/features/live/components/room/LeaveModal.svelte
function LeaveModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isInstructorRoom, open = false, onLeave, onEndLive } = $$props;
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="leave-modal-backdrop svelte-1hgbduj" role="dialog" aria-modal="true" aria-label="יציאה מהחדר"><div class="leave-modal svelte-1hgbduj"><h2 class="svelte-1hgbduj">${escape_html(isInstructorRoom ? "סיום שידור" : "יציאה מהחדר")}</h2> <p class="svelte-1hgbduj">${escape_html(isInstructorRoom ? "האם לסיים את השידור לכל המשתתפות?" : "האם לצאת מהחדר? תוכלי להיכנס שוב דרך הלוח.")}</p> <div class="leave-modal__actions svelte-1hgbduj">`);
			if (isInstructorRoom && onEndLive) {
				$$renderer.push("<!--[0-->");
				Button_1($$renderer, {
					tone: "danger",
					size: "md",
					onclick: onEndLive,
					children: ($$renderer) => {
						$$renderer.push(`<!---->סיום שידור`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> `);
				Button_1($$renderer, {
					tone: "paper",
					size: "md",
					onclick: onLeave,
					children: ($$renderer) => {
						$$renderer.push(`<!---->יציאה בלבד`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push("<!--[-1-->");
				Button_1($$renderer, {
					tone: "ink",
					size: "md",
					onclick: onLeave,
					children: ($$renderer) => {
						$$renderer.push(`<!---->יציאה מהחדר`);
					},
					$$slots: { default: true }
				});
			}
			$$renderer.push(`<!--]--> `);
			Button_1($$renderer, {
				tone: "ghost",
				size: "sm",
				onclick: () => {
					open = false;
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->ביטול`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { open });
	});
}
//#endregion
//#region src/lib/features/live/components/room/RoomHeader.svelte
function RoomHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { connectionState, connectionLabel, participantCount, isInstructorRoom, showQualityPanel, showParticipants, onToggleParticipants, onToggleQualityPanel, onLeave, onEndLive } = $$props;
		const { t } = useI18n();
		let showLeaveModal = false;
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			LeaveModal($$renderer, {
				isInstructorRoom,
				onLeave,
				onEndLive,
				get open() {
					return showLeaveModal;
				},
				set open($$value) {
					showLeaveModal = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> <header class="lr-header lr-glass"><div class="lr-header__group"><button type="button" class="lr-header__back"><span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span> <span>${escape_html(t.live.room.back())}</span></button> <div class="lr-header__divider"></div> <div class="lr-header__status"><span${attr_class("lr-header__status-dot", void 0, { "lr-header__status-dot--on": connectionState === "connected" })}></span> <span class="lr-header__status-label">${escape_html(connectionLabel)}</span></div> `);
			Tooltip_1($$renderer, {
				label: t.live.room.participantsTitle(),
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="lr-header__pill"${attr("aria-label", t.live.room.participantsTitle())}><span class="material-symbols-rounded" aria-hidden="true">people</span> <span>${escape_html(participantCount)}</span></button>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div> <div class="lr-header__group">`);
			if (isInstructorRoom) {
				$$renderer.push("<!--[0-->");
				Tooltip_1($$renderer, {
					label: t.live.stats.title(),
					children: ($$renderer) => {
						$$renderer.push(`<button type="button" class="hb-button hb-button--icon"${attr("aria-label", t.live.stats.title())}><span class="material-symbols-rounded" aria-hidden="true">monitoring</span></button>`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			Tooltip_1($$renderer, {
				label: t.live.room.leave(),
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="hb-button hb-button--icon-danger"${attr("aria-label", t.live.room.leave())}><span class="material-symbols-rounded" aria-hidden="true">logout</span></button>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></header>`);
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
//#region src/lib/features/live/components/room/VideoStage.svelte
function VideoStage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isInstructorRoom, videoTiles, screenShareTiles, hasScreenShare, activeSpeakerIdentity, tileSort, primaryInstructorVideo, selfVideo } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<main class="lr-stage">`);
		if (isInstructorRoom) {
			$$renderer.push("<!--[0-->");
			if (hasScreenShare) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="spotlight-layout svelte-1ows5l0"><div class="spotlight-main svelte-1ows5l0"><!--[-->`);
				const each_array = ensure_array_like(screenShareTiles);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let tile = each_array[$$index];
					$$renderer.push(`<figure class="lr-tile"><div class="lr-tile__video"></div> <span class="lr-badge lr-badge--screen">${escape_html(t.live.room.screenShare())}</span> <figcaption class="lr-tile__name">${escape_html(tile.name)}</figcaption></figure>`);
				}
				$$renderer.push(`<!--]--></div> <div class="spotlight-strip svelte-1ows5l0"><!--[-->`);
				const each_array_1 = ensure_array_like(videoTiles.filter((t) => t.source !== "screen_share").sort(tileSort));
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let tile = each_array_1[$$index_1];
					$$renderer.push(`<figure${attr_class("lr-tile", void 0, {
						"lr-tile--self": tile.isLocal,
						"lr-tile--speaking": tile.identity === activeSpeakerIdentity
					})}><div class="lr-tile__video"></div> <figcaption class="lr-tile__name">${escape_html(tile.name)}</figcaption></figure>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="lr-grid"${attr_style(`--grid-cols: ${stringify((() => {
					const count = videoTiles.length;
					if (count <= 1) return 1;
					if (count <= 4) return 2;
					if (count <= 9) return 3;
					return 4;
				})())}`)}>`);
				if (videoTiles.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="lr-stage__empty">${escape_html(t.live.room.waitingForCameras())}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <!--[-->`);
				const each_array_2 = ensure_array_like(videoTiles.sort(tileSort));
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let tile = each_array_2[$$index_2];
					$$renderer.push(`<figure${attr_class("lr-tile", void 0, {
						"lr-tile--self": tile.isLocal,
						"lr-tile--speaking": tile.identity === activeSpeakerIdentity
					})}><div class="lr-tile__video"></div> `);
					if (tile.source === "screen_share") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="lr-badge lr-badge--screen">${escape_html(t.live.room.screenShare())}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <figcaption class="lr-tile__name">${escape_html(tile.name)}</figcaption></figure>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="student-stage svelte-1ows5l0">`);
			if (primaryInstructorVideo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<figure class="student-main svelte-1ows5l0"><div class="lr-tile__video"></div> `);
				if (primaryInstructorVideo.source === "screen_share") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="lr-badge lr-badge--screen">${escape_html(t.live.room.screenShare())}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <figcaption class="lr-tile__name">${escape_html(primaryInstructorVideo.name)}</figcaption></figure>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="lr-stage__empty">${escape_html(t.live.room.waitingForInstructor())}</div>`);
			}
			$$renderer.push(`<!--]--> `);
			if (selfVideo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<figure class="student-pip svelte-1ows5l0"><div class="lr-tile__video"></div> <figcaption class="lr-tile__name">${escape_html(selfVideo.name)}</figcaption></figure>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></main>`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/ParticipantSidebar.svelte
function ParticipantSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open, participants, onClose } = $$props;
		const { t } = useI18n();
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<aside class="lr-panel lr-glass lr-panel--participants"${attr("aria-label", t.live.room.participantsTitle())}><div class="lr-panel__header"><h3>${escape_html(t.live.room.participantsTitle())}</h3> <button type="button" class="hb-button hb-button--close"${attr("aria-label", t.live.room.close())}><span class="material-symbols-rounded">close</span></button></div> `);
			ScrollArea_1($$renderer, {
				class: "lr-panel__scroll",
				children: ($$renderer) => {
					$$renderer.push(`<div class="lr-participant-list"><!--[-->`);
					const each_array = ensure_array_like(participants);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let p = each_array[$$index];
						$$renderer.push(`<div${attr_class("lr-participant", void 0, {
							"lr-participant--speaking": p.isSpeaking,
							"lr-participant--instructor": p.isInstructor
						})}><div class="lr-participant__left"><span class="lr-participant__name">${escape_html(p.name)}</span> `);
						if (p.isInstructor) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="lr-participant__role">${escape_html(t.live.room.instructor())}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (p.isLocal) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="lr-participant__role">${escape_html(t.live.room.you())}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div> <div class="lr-participant__indicators"><span${attr_class("lr-indicator", void 0, {
							"lr-indicator--on": p.hasMic,
							"lr-indicator--off": !p.hasMic
						})}${attr("title", p.hasMic ? t.live.room.micOn() : t.live.room.micOff())}><span class="material-symbols-rounded" aria-hidden="true">${escape_html(p.hasMic ? "mic" : "mic_off")}</span></span> <span${attr_class("lr-indicator", void 0, {
							"lr-indicator--on": p.hasCamera,
							"lr-indicator--off": !p.hasCamera
						})}${attr("title", p.hasCamera ? t.live.room.cameraOn() : t.live.room.cameraOff())}><span class="material-symbols-rounded" aria-hidden="true">${escape_html(p.hasCamera ? "videocam" : "videocam_off")}</span></span></div></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></aside>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/RoomChat.svelte
function RoomChat($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open, messages, draft = "", onSend, onClose } = $$props;
		const { t } = useI18n();
		let scrollEl = null;
		const scroll = new ScrollState({ element: () => scrollEl });
		const showScrollButton = derived(() => !scroll.arrived.bottom);
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<aside class="lr-chat lr-glass svelte-1ss84dm"${attr("aria-label", t.live.room.chatTitle())}><div class="lr-panel__header"><h3>${escape_html(t.live.room.chatTitle())}</h3> <button type="button" class="hb-button hb-button--close"${attr("aria-label", t.live.room.close())}><span class="material-symbols-rounded">close</span></button></div> <div class="lr-chat__scroll svelte-1ss84dm"><div class="lr-chat__list">`);
			if (messages.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="lr-chat__empty">${escape_html(t.live.room.chatEmpty())}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <!--[-->`);
			const each_array = ensure_array_like(messages);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let message = each_array[$$index];
				$$renderer.push(`<article${attr_class("lr-chat-message", void 0, { "lr-chat-message--local": message.isLocal })}><div class="lr-chat-message__meta"><span>${escape_html(message.name)}</span> <time>${escape_html(new Intl.DateTimeFormat("he-IL", {
					hour: "2-digit",
					minute: "2-digit"
				}).format(new Date(message.createdAt)))}</time></div> <p class="lr-chat-message__text">${escape_html(message.text)}</p></article>`);
			}
			$$renderer.push(`<!--]--></div></div> `);
			if (showScrollButton()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button type="button" class="lr-chat__scroll-btn svelte-1ss84dm"${attr("aria-label", t.live.room.newMessages())}><span class="material-symbols-rounded">arrow_downward</span></button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <form class="lr-chat__form"><input class="lr-chat__input"${attr("value", draft)} maxlength="500"${attr("placeholder", t.live.room.chatPlaceholder())}${attr("aria-label", t.live.room.chatPlaceholder())}/> `);
			Button_1($$renderer, {
				type: "submit",
				tone: "ink",
				size: "sm",
				disabled: !draft.trim(),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.live.room.chatSend())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></form></aside>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { draft });
	});
}
//#endregion
//#region src/lib/components/ui/Popover.svelte
function Popover_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, children, trigger, side = "bottom", align = "center", sideOffset = 6 } = $$props;
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (Popover) {
				$$renderer.push("<!--[-->");
				Popover($$renderer, {
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
									class: "hb-popover-trigger"
								})}>`);
								trigger($$renderer);
								$$renderer.push(`<!----></span>`);
							}
							if (Popover_trigger) {
								$$renderer.push("<!--[-->");
								Popover_trigger($$renderer, {
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
													class: "hb-popover-content"
												})}>`);
												children($$renderer);
												$$renderer.push(`<!----></div></div>`);
											} else $$renderer.push("<!--[-1-->");
											$$renderer.push(`<!--]-->`);
										}
										if (Popover_content) {
											$$renderer.push("<!--[-->");
											Popover_content($$renderer, {
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
//#region src/lib/features/live/components/room/ControlBar.svelte
function ControlBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<footer class="lr-control-bar"><div${attr_class("lr-control", void 0, {
				"lr-control--on": room.micEnabled,
				"lr-control--off": !room.micEnabled
			})}>`);
			Tooltip_1($$renderer, {
				label: room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic(),
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="lr-control__main"${attr("disabled", room.pendingControl !== null, true)}${attr("aria-label", room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic())}><span class="material-symbols-rounded" aria-hidden="true">${escape_html(room.micEnabled ? "mic" : "mic_off")}</span> <span class="lr-control__label">${escape_html(room.micEnabled ? t.live.controls.micOnLabel() : t.live.controls.micOffLabel())}</span></button>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			if (room.audioDevices.length > 1) {
				$$renderer.push("<!--[0-->");
				{
					function trigger($$renderer) {
						$$renderer.push(`<button type="button" class="lr-control__arrow"${attr("aria-label", t.live.preConnect.micLabel())}><span class="material-symbols-rounded" aria-hidden="true">expand_more</span></button>`);
					}
					function children($$renderer) {
						$$renderer.push(`<div class="lr-device-list"><!--[-->`);
						const each_array = ensure_array_like(room.audioDevices);
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let device = each_array[$$index];
							$$renderer.push(`<button type="button"${attr_class("lr-device-row", void 0, { "lr-device-row--active": room.selectedAudioDevice === device.deviceId })}>${escape_html(device.label)}</button>`);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					Popover_1($$renderer, {
						side: "top",
						align: "center",
						sideOffset: 8,
						trigger,
						children,
						$$slots: {
							trigger: true,
							default: true
						}
					});
				}
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div${attr_class("lr-control", void 0, {
				"lr-control--on": room.cameraEnabled,
				"lr-control--off": !room.cameraEnabled
			})}>`);
			Tooltip_1($$renderer, {
				label: room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera(),
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="lr-control__main"${attr("disabled", room.pendingControl !== null, true)}${attr("aria-label", room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera())}><span class="material-symbols-rounded" aria-hidden="true">${escape_html(room.cameraEnabled ? "videocam" : "videocam_off")}</span> <span class="lr-control__label">${escape_html(room.cameraEnabled ? t.live.controls.cameraOnLabel() : t.live.controls.cameraOffLabel())}</span></button>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			if (room.videoDevices.length > 1) {
				$$renderer.push("<!--[0-->");
				{
					function trigger($$renderer) {
						$$renderer.push(`<button type="button" class="lr-control__arrow"${attr("aria-label", t.live.preConnect.cameraLabel())}><span class="material-symbols-rounded" aria-hidden="true">expand_more</span></button>`);
					}
					function children($$renderer) {
						$$renderer.push(`<div class="lr-device-list"><!--[-->`);
						const each_array_1 = ensure_array_like(room.videoDevices);
						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let device = each_array_1[$$index_1];
							$$renderer.push(`<button type="button"${attr_class("lr-device-row", void 0, { "lr-device-row--active": room.selectedVideoDevice === device.deviceId })}>${escape_html(device.label)}</button>`);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					Popover_1($$renderer, {
						side: "top",
						align: "center",
						sideOffset: 8,
						trigger,
						children,
						$$slots: {
							trigger: true,
							default: true
						}
					});
				}
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (room.isInstructorRoom) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class("lr-control", void 0, {
					"lr-control--on": room.screenShareEnabled,
					"lr-control--off": !room.screenShareEnabled
				})}>`);
				Tooltip_1($$renderer, {
					label: room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen(),
					children: ($$renderer) => {
						$$renderer.push(`<button type="button" class="lr-control__main"${attr("disabled", room.pendingControl !== null, true)}${attr("aria-label", room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen())}><span class="material-symbols-rounded" aria-hidden="true">${escape_html(room.screenShareEnabled ? "stop_screen_share" : "screen_share")}</span> <span class="lr-control__label">${escape_html(room.screenShareEnabled ? t.live.controls.screenOnLabel() : t.live.controls.screenOffLabel())}</span></button>`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div${attr_class("lr-control", void 0, {
				"lr-control--active": room.showParticipants,
				"lr-control--off": !room.showParticipants
			})}>`);
			Tooltip_1($$renderer, {
				label: room.showParticipants ? t.live.room.hideParticipants() : t.live.room.showParticipants(),
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="lr-control__main"${attr("aria-label", t.live.room.participantsTitle())}><span class="material-symbols-rounded" aria-hidden="true">people</span> <span class="lr-control__label">${escape_html(t.live.room.participantsTitle())}</span></button>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div> <div${attr_class("lr-control", void 0, {
				"lr-control--active": room.showChat,
				"lr-control--off": !room.showChat
			})}>`);
			Tooltip_1($$renderer, {
				label: room.showChat ? t.live.room.hideChat() : t.live.room.showChat(),
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="lr-control__main"${attr("aria-label", t.live.room.showChat())}><span class="material-symbols-rounded" aria-hidden="true">${escape_html(room.showChat ? "chat" : "chat_bubble_outline")}</span> <span class="lr-control__label">${escape_html(t.live.room.chatTitle())}</span></button>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div> `);
			{
				function trigger($$renderer) {
					$$renderer.push(`<div class="lr-control lr-control--off"><button type="button" class="lr-control__main"${attr("aria-label", t.live.room.settingsTitle())}><span class="material-symbols-rounded" aria-hidden="true">settings</span> <span class="lr-control__label">${escape_html(t.live.room.settingsTitle())}</span></button></div>`);
				}
				function children($$renderer) {
					$$renderer.push(`<div class="lr-settings"><strong class="lr-settings__title">${escape_html(t.live.room.settingsTitle())}</strong> `);
					Switch_1($$renderer, {
						label: t.live.room.echoCancel(),
						onchange: () => room.switchPreviewDevice(),
						get checked() {
							return room.audioProcessingEnabled;
						},
						set checked($$value) {
							room.audioProcessingEnabled = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> `);
					if (room.isInstructorRoom) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="button" class="lr-settings__link">${escape_html(t.live.stats.title())}</button>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				Popover_1($$renderer, {
					side: "top",
					align: "end",
					sideOffset: 8,
					trigger,
					children,
					$$slots: {
						trigger: true,
						default: true
					}
				});
			}
			$$renderer.push(`<!----></footer>`);
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
//#region src/lib/features/live/components/room/QualityPanel.svelte
function QualityPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		if (room.isInstructorRoom && room.showQualityPanel) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<aside class="lr-quality lr-glass"${attr("aria-label", t.live.stats.title())}><div class="lr-panel__header"><h3>${escape_html(t.live.stats.title())}</h3> <button type="button" class="hb-button hb-button--close"${attr("aria-label", t.live.room.close())}><span class="material-symbols-rounded">close</span></button></div> `);
			ScrollArea_1($$renderer, {
				class: "lr-panel__scroll",
				children: ($$renderer) => {
					$$renderer.push(`<dl class="lr-quality__headline"><div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.participants())}</dt> <dd class="lr-quality__value">${escape_html(room.participants.length)}</dd></div> <div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.video())}</dt> <dd class="lr-quality__value">${escape_html(room.streamStats.videoTracks)}</dd></div> <div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.audio())}</dt> <dd class="lr-quality__value">${escape_html(room.streamStats.audioTracks)}</dd></div> <div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.bitrate())}</dt> <dd class="lr-quality__value">${escape_html(room.formattedBitrate)}</dd></div> <div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.resolution())}</dt> <dd class="lr-quality__value">${escape_html(room.formattedResolution)}</dd></div> <div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.fps())}</dt> <dd class="lr-quality__value">${escape_html(room.formattedFps)}</dd></div> <div class="lr-quality__row"><dt class="lr-quality__label">${escape_html(t.live.stats.packetLoss())}</dt> <dd class="lr-quality__value">${escape_html(room.formattedPacketLoss)}</dd></div></dl> `);
					if (room.trackStats.length > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<details class="lr-quality__track-list" open=""><summary>${escape_html(t.live.stats.videoSources())}</summary> <div class="lr-quality__tracks"><!--[-->`);
						const each_array = ensure_array_like(room.trackStats.filter((t) => t.kind === "video"));
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let stat = each_array[$$index];
							$$renderer.push(`<div class="lr-track-stat"><span class="lr-track-stat__name">${escape_html(stat.name)}</span> <span${attr_class("lr-track-stat__badge", void 0, { "lr-track-stat__badge--screen": stat.source === "screen_share" })}>${escape_html(stat.source === "screen_share" ? t.live.stats.sourceScreen() : stat.source === "camera" ? t.live.stats.sourceCamera() : t.live.stats.sourceUnknown())}</span> <span class="lr-track-stat__detail">${escape_html(stat.width ?? "—")}×${escape_html(stat.height ?? "—")} @ ${escape_html(stat.bitrateKbps > 0 ? `${stat.bitrateKbps} kbps` : "—")}</span></div>`);
						}
						$$renderer.push(`<!--]--></div></details>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></aside>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/LiveRoomShell.svelte
function LiveRoomShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const room = new LiveRoom(useConvexClient());
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (room.auth.isLoading || room.status === "checking") {
				$$renderer.push("<!--[0-->");
				PreConnectOverlay($$renderer, { room });
			} else if (room.status === "locked" || room.status === "missing" || room.status === "prep" || room.status === "error") {
				$$renderer.push("<!--[1-->");
				PreConnectOverlay($$renderer, { room });
			} else if (room.connectionState === "disconnected") {
				$$renderer.push("<!--[2-->");
				$$renderer.push(`<div class="disconnect-overlay svelte-8bmq7k"><div class="disconnect-card svelte-8bmq7k"><span class="material-symbols-rounded svelte-8bmq7k" aria-hidden="true">wifi_off</span> <h2 class="svelte-8bmq7k">החיבור נותק</h2> <p class="svelte-8bmq7k">ניתן לנסות להתחבר שוב או לצאת מהחדר.</p> <div class="disconnect-actions svelte-8bmq7k">`);
				Button_1($$renderer, {
					tone: "ink",
					size: "md",
					onclick: () => room.reconnect(),
					children: ($$renderer) => {
						$$renderer.push(`<!---->התחברות מחדש`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> `);
				Button_1($$renderer, {
					tone: "ghost",
					size: "sm",
					onclick: () => {
						room.destroy();
						window.location.href = room.isInstructorRoom ? "/i/live" : "/u/calendar";
					},
					children: ($$renderer) => {
						$$renderer.push(`<!---->יציאה`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div></div></div>`);
			} else if (room.status === "ready" && room.joinInfo && room.connectionState === "idle") {
				$$renderer.push("<!--[3-->");
				PreConnectOverlay($$renderer, { room });
			} else if (room.connectionState !== "idle") {
				$$renderer.push("<!--[4-->");
				if (Tooltip_provider) {
					$$renderer.push("<!--[-->");
					Tooltip_provider($$renderer, {
						delayDuration: 160,
						children: ($$renderer) => {
							$$renderer.push(`<div class="lr-room">`);
							RoomHeader($$renderer, {
								connectionState: room.connectionState,
								connectionLabel: room.connectionLabel,
								participantCount: room.participants.length,
								isInstructorRoom: room.isInstructorRoom,
								showQualityPanel: room.showQualityPanel,
								showParticipants: room.showParticipants,
								onToggleParticipants: () => room.showParticipants = !room.showParticipants,
								onToggleQualityPanel: () => room.showQualityPanel = !room.showQualityPanel,
								onLeave: () => {
									room.destroy();
									window.location.href = room.isInstructorRoom ? "/i/live" : "/u/calendar";
								},
								onEndLive: room.isInstructorRoom ? () => room.endLive() : void 0
							});
							$$renderer.push(`<!----> <div class="lr-room__body">`);
							VideoStage($$renderer, {
								isInstructorRoom: room.isInstructorRoom,
								videoTiles: room.videoTiles,
								screenShareTiles: room.screenShareTiles,
								hasScreenShare: room.hasScreenShare,
								activeSpeakerIdentity: room.activeSpeakerIdentity,
								tileSort: room.tileSort,
								primaryInstructorVideo: room.primaryInstructorVideo,
								selfVideo: room.selfVideo
							});
							$$renderer.push(`<!----> `);
							ParticipantSidebar($$renderer, {
								open: room.showParticipants,
								participants: room.participants,
								onClose: () => room.showParticipants = false
							});
							$$renderer.push(`<!----> `);
							RoomChat($$renderer, {
								open: room.showChat,
								messages: room.chatMessages,
								onSend: () => room.sendChatMessage(),
								onClose: () => room.showChat = false,
								get draft() {
									return room.chatDraft;
								},
								set draft($$value) {
									room.chatDraft = $$value;
									$$settled = false;
								}
							});
							$$renderer.push(`<!----></div> `);
							if (room.mediaError) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<div class="lr-media-error" role="alert">${escape_html(room.mediaError)}</div>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> `);
							ControlBar($$renderer, { room });
							$$renderer.push(`<!----> `);
							QualityPanel($$renderer, { room });
							$$renderer.push(`<!----> <div class="lr-audio-sink" aria-hidden="true"><!--[-->`);
							const each_array = ensure_array_like(room.audioTiles);
							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								each_array[$$index];
								$$renderer.push(`<div></div>`);
							}
							$$renderer.push(`<!--]--></div></div>`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
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
export { LiveRoomShell as t };
