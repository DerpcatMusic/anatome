import { a as bind_props, f as spread_props, i as attributes, o as derived, u as props_id } from "./dev.js";
import { r as on } from "./events.js";
import "./session.svelte.js";
import { B as getDataOpenClosed, G as watch, J as attachRef, L as createBitsAttrs, P as boolToStr, V as getDataTransitionAttrs, Z as mergeProps, at as boxWith, c as createId, d as isElement, l as noop, q as Context, y as isTouch } from "./arrays.js";
import { m as PresenceManager } from "./scroll-lock.js";
import { a as getFloatingContentCSSVars, n as Popper_layer, r as Floating_layer_anchor, t as Popper_layer_force_mount } from "./popper-layer-force-mount.js";
import { i as DOMContext, o as getDocument } from "./use-id.js";
import { isTabbable } from "tabbable";
//#region node_modules/bits-ui/dist/internal/safe-polygon.svelte.js
function isPointInPolygon(point, polygon) {
	const [x, y] = point;
	let isInside = false;
	const length = polygon.length;
	for (let i = 0, j = length - 1; i < length; j = i++) {
		const [xi, yi] = polygon[i] ?? [0, 0];
		const [xj, yj] = polygon[j] ?? [0, 0];
		if (yi >= y !== yj >= y && x <= (xj - xi) * (y - yi) / (yj - yi) + xi) isInside = !isInside;
	}
	return isInside;
}
function isInsideRect(point, rect) {
	return point[0] >= rect.left && point[0] <= rect.right && point[1] >= rect.top && point[1] <= rect.bottom;
}
function getSide(triggerRect, contentRect) {
	const triggerCenterX = triggerRect.left + triggerRect.width / 2;
	const triggerCenterY = triggerRect.top + triggerRect.height / 2;
	const contentCenterX = contentRect.left + contentRect.width / 2;
	const contentCenterY = contentRect.top + contentRect.height / 2;
	const deltaX = contentCenterX - triggerCenterX;
	const deltaY = contentCenterY - triggerCenterY;
	if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? "right" : "left";
	return deltaY > 0 ? "bottom" : "top";
}
/**
* Creates a safe polygon area that allows users to move their cursor between
* the trigger and floating content without closing it.
*/
var SafePolygon = class {
	#opts;
	#buffer;
	#transitIntentTimeout;
	#exitPoint = null;
	#exitTarget = null;
	#transitTargets = [];
	#trackedTriggerNode = null;
	#leaveFallbackRafId = null;
	#transitIntentTimeoutId = null;
	#cancelLeaveFallback() {
		if (this.#leaveFallbackRafId !== null) {
			cancelAnimationFrame(this.#leaveFallbackRafId);
			this.#leaveFallbackRafId = null;
		}
	}
	#scheduleLeaveFallback() {
		this.#cancelLeaveFallback();
		this.#leaveFallbackRafId = requestAnimationFrame(() => {
			this.#leaveFallbackRafId = null;
			if (!this.#exitPoint || !this.#exitTarget) return;
			this.#clearTracking();
			this.#opts.onPointerExit();
		});
	}
	#cancelTransitIntentTimeout() {
		if (this.#transitIntentTimeoutId !== null) {
			clearTimeout(this.#transitIntentTimeoutId);
			this.#transitIntentTimeoutId = null;
		}
	}
	#scheduleTransitIntentTimeout() {
		if (this.#transitIntentTimeout === null) return;
		this.#cancelTransitIntentTimeout();
		this.#transitIntentTimeoutId = window.setTimeout(() => {
			this.#transitIntentTimeoutId = null;
			if (!this.#exitPoint || !this.#exitTarget) return;
			this.#clearTracking();
			this.#opts.onPointerExit();
		}, this.#transitIntentTimeout);
	}
	constructor(opts) {
		this.#opts = opts;
		this.#buffer = opts.buffer ?? 1;
		const transitIntentTimeout = opts.transitIntentTimeout;
		this.#transitIntentTimeout = typeof transitIntentTimeout === "number" && transitIntentTimeout > 0 ? transitIntentTimeout : null;
		watch([
			opts.triggerNode,
			opts.contentNode,
			opts.enabled
		], ([triggerNode, contentNode, enabled]) => {
			if (!triggerNode || !contentNode || !enabled) {
				this.#trackedTriggerNode = null;
				this.#clearTracking();
				return;
			}
			if (this.#trackedTriggerNode && this.#trackedTriggerNode !== triggerNode) this.#clearTracking();
			this.#trackedTriggerNode = triggerNode;
			const doc = getDocument(triggerNode);
			const handlePointerMove = (e) => {
				this.#onPointerMove([e.clientX, e.clientY], triggerNode, contentNode);
			};
			const handleTriggerLeave = (e) => {
				const target = e.relatedTarget;
				if (isElement(target) && contentNode.contains(target)) return;
				const ignoredTargets = this.#opts.ignoredTargets?.() ?? [];
				if (isElement(target) && ignoredTargets.some((n) => n === target || n.contains(target))) return;
				this.#transitTargets = isElement(target) && ignoredTargets.length > 0 ? ignoredTargets.filter((n) => target.contains(n)) : [];
				this.#exitPoint = [e.clientX, e.clientY];
				this.#exitTarget = "content";
				this.#scheduleLeaveFallback();
			};
			const handleTriggerEnter = () => {
				this.#clearTracking();
			};
			const handleContentEnter = () => {
				this.#clearTracking();
			};
			const handleContentLeave = (e) => {
				const target = e.relatedTarget;
				if (isElement(target) && triggerNode.contains(target)) return;
				this.#exitPoint = [e.clientX, e.clientY];
				this.#exitTarget = "trigger";
				this.#scheduleLeaveFallback();
			};
			return [
				on(doc, "pointermove", handlePointerMove),
				on(triggerNode, "pointerleave", handleTriggerLeave),
				on(triggerNode, "pointerenter", handleTriggerEnter),
				on(contentNode, "pointerenter", handleContentEnter),
				on(contentNode, "pointerleave", handleContentLeave)
			].reduce((acc, cleanup) => () => {
				acc();
				cleanup();
			}, () => {});
		});
	}
	#onPointerMove(clientPoint, triggerNode, contentNode) {
		if (!this.#exitPoint || !this.#exitTarget) return;
		this.#cancelLeaveFallback();
		this.#scheduleTransitIntentTimeout();
		const triggerRect = triggerNode.getBoundingClientRect();
		const contentRect = contentNode.getBoundingClientRect();
		if (this.#exitTarget === "content" && isInsideRect(clientPoint, contentRect)) {
			this.#clearTracking();
			return;
		}
		if (this.#exitTarget === "trigger" && isInsideRect(clientPoint, triggerRect)) {
			this.#clearTracking();
			return;
		}
		if (this.#exitTarget === "content" && this.#transitTargets.length > 0) for (const transitTarget of this.#transitTargets) {
			const transitRect = transitTarget.getBoundingClientRect();
			if (isInsideRect(clientPoint, transitRect)) return;
			const transitSide = getSide(triggerRect, transitRect);
			const transitCorridor = this.#getCorridorPolygon(triggerRect, transitRect, transitSide);
			if (transitCorridor && isPointInPolygon(clientPoint, transitCorridor)) return;
		}
		const side = getSide(triggerRect, contentRect);
		const corridorPoly = this.#getCorridorPolygon(triggerRect, contentRect, side);
		if (corridorPoly && isPointInPolygon(clientPoint, corridorPoly)) return;
		const targetRect = this.#exitTarget === "content" ? contentRect : triggerRect;
		if (isPointInPolygon(clientPoint, this.#getSafePolygon(this.#exitPoint, targetRect, side, this.#exitTarget))) return;
		this.#clearTracking();
		this.#opts.onPointerExit();
	}
	#clearTracking() {
		this.#exitPoint = null;
		this.#exitTarget = null;
		this.#transitTargets = [];
		this.#cancelLeaveFallback();
		this.#cancelTransitIntentTimeout();
	}
	/**
	* Creates a rectangular corridor between trigger and content
	* This prevents closing when cursor is in the gap between them
	*/
	#getCorridorPolygon(triggerRect, contentRect, side) {
		const buffer = this.#buffer;
		switch (side) {
			case "top": return [
				[Math.min(triggerRect.left, contentRect.left) - buffer, triggerRect.top],
				[Math.min(triggerRect.left, contentRect.left) - buffer, contentRect.bottom],
				[Math.max(triggerRect.right, contentRect.right) + buffer, contentRect.bottom],
				[Math.max(triggerRect.right, contentRect.right) + buffer, triggerRect.top]
			];
			case "bottom": return [
				[Math.min(triggerRect.left, contentRect.left) - buffer, triggerRect.bottom],
				[Math.min(triggerRect.left, contentRect.left) - buffer, contentRect.top],
				[Math.max(triggerRect.right, contentRect.right) + buffer, contentRect.top],
				[Math.max(triggerRect.right, contentRect.right) + buffer, triggerRect.bottom]
			];
			case "left": return [
				[triggerRect.left, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.right, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.right, Math.max(triggerRect.bottom, contentRect.bottom) + buffer],
				[triggerRect.left, Math.max(triggerRect.bottom, contentRect.bottom) + buffer]
			];
			case "right": return [
				[triggerRect.right, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.left, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.left, Math.max(triggerRect.bottom, contentRect.bottom) + buffer],
				[triggerRect.right, Math.max(triggerRect.bottom, contentRect.bottom) + buffer]
			];
		}
	}
	/**
	* Creates a triangular/trapezoidal safe zone from the exit point to the target
	*/
	#getSafePolygon(exitPoint, targetRect, side, exitTarget) {
		const buffer = this.#buffer * 4;
		const [x, y] = exitPoint;
		switch (exitTarget === "trigger" ? this.#flipSide(side) : side) {
			case "top": return [
				[x - buffer, y + buffer],
				[x + buffer, y + buffer],
				[targetRect.right + buffer, targetRect.bottom],
				[targetRect.right + buffer, targetRect.top],
				[targetRect.left - buffer, targetRect.top],
				[targetRect.left - buffer, targetRect.bottom]
			];
			case "bottom": return [
				[x - buffer, y - buffer],
				[x + buffer, y - buffer],
				[targetRect.right + buffer, targetRect.top],
				[targetRect.right + buffer, targetRect.bottom],
				[targetRect.left - buffer, targetRect.bottom],
				[targetRect.left - buffer, targetRect.top]
			];
			case "left": return [
				[x + buffer, y - buffer],
				[x + buffer, y + buffer],
				[targetRect.right, targetRect.bottom + buffer],
				[targetRect.left, targetRect.bottom + buffer],
				[targetRect.left, targetRect.top - buffer],
				[targetRect.right, targetRect.top - buffer]
			];
			case "right": return [
				[x - buffer, y - buffer],
				[x - buffer, y + buffer],
				[targetRect.left, targetRect.bottom + buffer],
				[targetRect.right, targetRect.bottom + buffer],
				[targetRect.right, targetRect.top - buffer],
				[targetRect.left, targetRect.top - buffer]
			];
		}
	}
	#flipSide(side) {
		switch (side) {
			case "top": return "bottom";
			case "bottom": return "top";
			case "left": return "right";
			case "right": return "left";
		}
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/popover/popover.svelte.js
var popoverAttrs = createBitsAttrs({
	component: "popover",
	parts: [
		"root",
		"trigger",
		"content",
		"close",
		"overlay"
	]
});
var PopoverRootContext = new Context("Popover.Root");
var PopoverRootState = class PopoverRootState {
	static create(opts) {
		return PopoverRootContext.set(new PopoverRootState(opts));
	}
	opts;
	contentNode = null;
	contentPresence;
	triggerNode = null;
	overlayNode = null;
	overlayPresence;
	openedViaHover = false;
	hasInteractedWithContent = false;
	hoverCooldown = false;
	closeDelay = 0;
	#closeTimeout = null;
	#domContext = null;
	constructor(opts) {
		this.opts = opts;
		this.contentPresence = new PresenceManager({
			ref: boxWith(() => this.contentNode),
			open: this.opts.open,
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			}
		});
		this.overlayPresence = new PresenceManager({
			ref: boxWith(() => this.overlayNode),
			open: this.opts.open
		});
		watch(() => this.opts.open.current, (isOpen) => {
			if (!isOpen) {
				this.openedViaHover = false;
				this.hasInteractedWithContent = false;
				this.#clearCloseTimeout();
			}
		});
	}
	setDomContext(ctx) {
		this.#domContext = ctx;
	}
	#clearCloseTimeout() {
		if (this.#closeTimeout !== null && this.#domContext) {
			this.#domContext.clearTimeout(this.#closeTimeout);
			this.#closeTimeout = null;
		}
	}
	toggleOpen() {
		this.#clearCloseTimeout();
		this.opts.open.current = !this.opts.open.current;
	}
	handleClose() {
		this.#clearCloseTimeout();
		if (!this.opts.open.current) return;
		this.opts.open.current = false;
	}
	handleHoverOpen() {
		this.#clearCloseTimeout();
		if (this.opts.open.current) return;
		this.openedViaHover = true;
		this.opts.open.current = true;
	}
	handleHoverClose() {
		if (!this.opts.open.current) return;
		if (this.openedViaHover && !this.hasInteractedWithContent) this.opts.open.current = false;
	}
	handleDelayedHoverClose() {
		if (!this.opts.open.current) return;
		if (!this.openedViaHover || this.hasInteractedWithContent) return;
		this.#clearCloseTimeout();
		if (this.closeDelay <= 0) this.opts.open.current = false;
		else if (this.#domContext) this.#closeTimeout = this.#domContext.setTimeout(() => {
			if (this.openedViaHover && !this.hasInteractedWithContent) this.opts.open.current = false;
			this.#closeTimeout = null;
		}, this.closeDelay);
	}
	cancelDelayedClose() {
		this.#clearCloseTimeout();
	}
	markInteraction() {
		this.hasInteractedWithContent = true;
		this.#clearCloseTimeout();
	}
};
var PopoverTriggerState = class PopoverTriggerState {
	static create(opts) {
		return new PopoverTriggerState(opts, PopoverRootContext.get());
	}
	opts;
	root;
	attachment;
	domContext;
	#openTimeout = null;
	#closeTimeout = null;
	#isHovering = false;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => this.root.triggerNode = v);
		this.domContext = new DOMContext(opts.ref);
		this.root.setDomContext(this.domContext);
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
		this.onpointerenter = this.onpointerenter.bind(this);
		this.onpointerleave = this.onpointerleave.bind(this);
		watch(() => this.opts.closeDelay.current, (delay) => {
			this.root.closeDelay = delay;
		});
	}
	#clearOpenTimeout() {
		if (this.#openTimeout !== null) {
			this.domContext.clearTimeout(this.#openTimeout);
			this.#openTimeout = null;
		}
	}
	#clearCloseTimeout() {
		if (this.#closeTimeout !== null) {
			this.domContext.clearTimeout(this.#closeTimeout);
			this.#closeTimeout = null;
		}
	}
	#clearAllTimeouts() {
		this.#clearOpenTimeout();
		this.#clearCloseTimeout();
	}
	onpointerenter(e) {
		if (this.opts.disabled.current) return;
		if (!this.opts.openOnHover.current) return;
		if (isTouch(e)) return;
		this.#isHovering = true;
		this.#clearCloseTimeout();
		this.root.cancelDelayedClose();
		if (this.root.opts.open.current || this.root.hoverCooldown) return;
		const delay = this.opts.openDelay.current;
		if (delay <= 0) this.root.handleHoverOpen();
		else this.#openTimeout = this.domContext.setTimeout(() => {
			this.root.handleHoverOpen();
			this.#openTimeout = null;
		}, delay);
	}
	onpointerleave(e) {
		if (this.opts.disabled.current) return;
		if (!this.opts.openOnHover.current) return;
		if (isTouch(e)) return;
		this.#isHovering = false;
		this.#clearOpenTimeout();
		this.root.hoverCooldown = false;
	}
	onclick(e) {
		if (this.opts.disabled.current) return;
		if (e.button !== 0) return;
		this.#clearAllTimeouts();
		if (this.#isHovering && this.root.opts.open.current && this.root.openedViaHover) {
			this.root.openedViaHover = false;
			this.root.hasInteractedWithContent = true;
			return;
		}
		if (this.#isHovering && this.opts.openOnHover.current && this.root.opts.open.current) this.root.hoverCooldown = true;
		if (this.root.hoverCooldown && !this.root.opts.open.current) this.root.hoverCooldown = false;
		this.root.toggleOpen();
	}
	onkeydown(e) {
		if (this.opts.disabled.current) return;
		if (!(e.key === "Enter" || e.key === " ")) return;
		e.preventDefault();
		this.#clearAllTimeouts();
		this.root.toggleOpen();
	}
	#getAriaControls() {
		if (this.root.opts.open.current && this.root.contentNode?.id) return this.root.contentNode?.id;
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"aria-haspopup": "dialog",
		"aria-expanded": boolToStr(this.root.opts.open.current),
		"data-state": getDataOpenClosed(this.root.opts.open.current),
		"aria-controls": this.#getAriaControls(),
		[popoverAttrs.trigger]: "",
		disabled: this.opts.disabled.current,
		onkeydown: this.onkeydown,
		onclick: this.onclick,
		onpointerenter: this.onpointerenter,
		onpointerleave: this.onpointerleave,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var PopoverContentState = class PopoverContentState {
	static create(opts) {
		return new PopoverContentState(opts, PopoverRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
		this.onpointerdown = this.onpointerdown.bind(this);
		this.onfocusin = this.onfocusin.bind(this);
		this.onpointerenter = this.onpointerenter.bind(this);
		this.onpointerleave = this.onpointerleave.bind(this);
		new SafePolygon({
			triggerNode: () => this.root.triggerNode,
			contentNode: () => this.root.contentNode,
			enabled: () => this.root.opts.open.current && this.root.openedViaHover && !this.root.hasInteractedWithContent,
			onPointerExit: () => {
				this.root.handleDelayedHoverClose();
			}
		});
	}
	onpointerdown(_) {
		this.root.markInteraction();
	}
	onfocusin(e) {
		const target = e.target;
		if (isElement(target) && isTabbable(target)) this.root.markInteraction();
	}
	onpointerenter(e) {
		if (isTouch(e)) return;
		this.root.cancelDelayedClose();
	}
	onpointerleave(e) {
		if (isTouch(e)) return;
	}
	onInteractOutside = (e) => {
		this.opts.onInteractOutside.current(e);
		if (e.defaultPrevented) return;
		if (!isElement(e.target)) return;
		const closestTrigger = e.target.closest(popoverAttrs.selector("trigger"));
		if (closestTrigger && closestTrigger === this.root.triggerNode) return;
		if (this.opts.customAnchor.current) {
			if (isElement(this.opts.customAnchor.current)) {
				if (this.opts.customAnchor.current.contains(e.target)) return;
			} else if (typeof this.opts.customAnchor.current === "string") {
				const el = document.querySelector(this.opts.customAnchor.current);
				if (el && el.contains(e.target)) return;
			}
		}
		this.root.handleClose();
	};
	onEscapeKeydown = (e) => {
		this.opts.onEscapeKeydown.current(e);
		if (e.defaultPrevented) return;
		this.root.handleClose();
	};
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
	get shouldTrapFocus() {
		if (this.root.openedViaHover && !this.root.hasInteractedWithContent) return false;
		return true;
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
		tabindex: -1,
		"data-state": getDataOpenClosed(this.root.opts.open.current),
		...getDataTransitionAttrs(this.root.contentPresence.transitionStatus),
		[popoverAttrs.content]: "",
		style: {
			pointerEvents: "auto",
			contain: "layout style"
		},
		onpointerdown: this.onpointerdown,
		onfocusin: this.onfocusin,
		onpointerenter: this.onpointerenter,
		onpointerleave: this.onpointerleave,
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
		onEscapeKeydown: this.onEscapeKeydown
	};
};
//#endregion
//#region node_modules/bits-ui/dist/bits/popover/components/popover-content.svelte
function Popover_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, ref = null, id = createId(uid), forceMount = false, onOpenAutoFocus = noop, onCloseAutoFocus = noop, onEscapeKeydown = noop, onInteractOutside = noop, trapFocus = true, preventScroll = false, customAnchor = null, style, $$slots, $$events, ...restProps } = $$props;
		const contentState = PopoverContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown),
			customAnchor: boxWith(() => customAnchor)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		const effectiveTrapFocus = derived(() => trapFocus && contentState.shouldTrapFocus);
		function handleOpenAutoFocus(e) {
			if (!contentState.shouldTrapFocus) e.preventDefault();
			onOpenAutoFocus(e);
		}
		if (forceMount) {
			$$renderer.push("<!--[0-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("popover") }, { style });
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
						enabled: contentState.root.opts.open.current,
						id,
						trapFocus: effectiveTrapFocus(),
						preventScroll,
						loop: true,
						forceMount: true,
						customAnchor,
						onOpenAutoFocus: handleOpenAutoFocus,
						onCloseAutoFocus,
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
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("popover") }, { style });
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
						open: contentState.root.opts.open.current,
						id,
						trapFocus: effectiveTrapFocus(),
						preventScroll,
						loop: true,
						forceMount: false,
						customAnchor,
						onOpenAutoFocus: handleOpenAutoFocus,
						onCloseAutoFocus,
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
//#region node_modules/bits-ui/dist/bits/popover/components/popover-trigger.svelte
function Popover_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, type = "button", disabled = false, openOnHover = false, openDelay = 700, closeDelay = 300, $$slots, $$events, ...restProps } = $$props;
		const triggerState = PopoverTriggerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled)),
			openOnHover: boxWith(() => openOnHover),
			openDelay: boxWith(() => openDelay),
			closeDelay: boxWith(() => closeDelay)
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
export { SafePolygon as i, Popover_content as n, PopoverRootState as r, Popover_trigger as t };
