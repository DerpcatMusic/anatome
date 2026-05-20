import { a as unmount, n as mount } from "./index-server.js";
import { o as derived, vt as getAllContexts } from "./dev.js";
import { r as on } from "./events.js";
import { l as SvelteMap } from "./session.svelte.js";
import { D as ENTER, F as boolToStr, H as getDataTransitionAttrs, J as Context, K as watch, M as PAGE_UP, P as boolToEmptyStrOrUndef, Q as mergeProps, R as createBitsAttrs, V as getDataOpenClosed, Y as attachRef, at as simpleBox, d as isBrowser, et as executeCallbacks, f as isElement, g as isIOS, h as isHTMLElement, i as getNextMatch, it as boxWith, j as PAGE_DOWN, k as HOME, l as noop, nt as composeHandlers, p as isElementOrSVGElement, u as RovingFocusGroup, w as ARROW_UP, x as ARROW_DOWN, y as isSelectableInput } from "./arrays.js";
import { a as contains, c as afterTick, i as DOMContext, o as getDocument, r as resolvePortalToProp, t as useId } from "./use-id.js";
import { focusable, isFocusable, isTabbable, tabbable } from "tabbable";
//#region node_modules/svelte-toolbelt/dist/utils/on-destroy-effect.svelte.js
function onDestroyEffect(fn) {}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/after-sleep.js
/**
* A utility function that executes a callback after a specified number of milliseconds.
*/
function afterSleep(ms, cb) {
	return setTimeout(cb, ms);
}
//#endregion
//#region node_modules/bits-ui/dist/internal/animations-complete.js
var AnimationsComplete = class {
	#opts;
	#currentFrame = null;
	#observer = null;
	#runId = 0;
	constructor(opts) {
		this.#opts = opts;
	}
	#cleanup() {
		if (this.#currentFrame !== null) {
			window.cancelAnimationFrame(this.#currentFrame);
			this.#currentFrame = null;
		}
		this.#observer?.disconnect();
		this.#observer = null;
		this.#runId++;
	}
	run(fn) {
		this.#cleanup();
		const node = this.#opts.ref.current;
		if (!node) return;
		if (typeof node.getAnimations !== "function") {
			this.#executeCallback(fn);
			return;
		}
		const runId = this.#runId;
		const executeIfCurrent = () => {
			if (runId !== this.#runId) return;
			this.#executeCallback(fn);
		};
		const waitForAnimations = () => {
			if (runId !== this.#runId) return;
			const animations = node.getAnimations();
			if (animations.length === 0) {
				executeIfCurrent();
				return;
			}
			Promise.all(animations.map((animation) => animation.finished)).then(() => {
				executeIfCurrent();
			}).catch(() => {
				if (runId !== this.#runId) return;
				if (node.getAnimations().some((animation) => animation.pending || animation.playState !== "finished")) {
					waitForAnimations();
					return;
				}
				executeIfCurrent();
			});
		};
		const requestWaitForAnimations = () => {
			this.#currentFrame = window.requestAnimationFrame(() => {
				this.#currentFrame = null;
				waitForAnimations();
			});
		};
		if (!this.#opts.afterTick.current) {
			requestWaitForAnimations();
			return;
		}
		this.#currentFrame = window.requestAnimationFrame(() => {
			this.#currentFrame = null;
			const startingStyleAttr = "data-starting-style";
			if (!node.hasAttribute(startingStyleAttr)) {
				requestWaitForAnimations();
				return;
			}
			this.#observer = new MutationObserver(() => {
				if (runId !== this.#runId) return;
				if (node.hasAttribute(startingStyleAttr)) return;
				this.#observer?.disconnect();
				this.#observer = null;
				requestWaitForAnimations();
			});
			this.#observer.observe(node, {
				attributes: true,
				attributeFilter: [startingStyleAttr]
			});
		});
	}
	#executeCallback(fn) {
		const execute = () => {
			fn();
		};
		if (this.#opts.afterTick) afterTick(execute);
		else execute();
	}
};
//#endregion
//#region node_modules/bits-ui/dist/internal/presence-manager.svelte.js
var PresenceManager = class {
	#opts;
	#enabled;
	#afterAnimations;
	#shouldRender = false;
	#transitionStatus = void 0;
	#hasMounted = false;
	#transitionFrame = null;
	constructor(opts) {
		this.#opts = opts;
		this.#shouldRender = opts.open.current;
		this.#enabled = opts.enabled ?? true;
		this.#afterAnimations = new AnimationsComplete({
			ref: this.#opts.ref,
			afterTick: this.#opts.open
		});
		watch(() => this.#opts.open.current, (isOpen) => {
			if (!this.#hasMounted) {
				this.#hasMounted = true;
				return;
			}
			this.#clearTransitionFrame();
			if (!isOpen && this.#opts.shouldSkipExitAnimation?.()) {
				this.#shouldRender = false;
				this.#transitionStatus = void 0;
				this.#opts.onComplete?.();
				return;
			}
			if (isOpen) this.#shouldRender = true;
			this.#transitionStatus = isOpen ? "starting" : "ending";
			if (isOpen) this.#transitionFrame = window.requestAnimationFrame(() => {
				this.#transitionFrame = null;
				if (this.#opts.open.current) this.#transitionStatus = void 0;
			});
			if (!this.#enabled) {
				if (!isOpen) this.#shouldRender = false;
				this.#transitionStatus = void 0;
				this.#opts.onComplete?.();
				return;
			}
			this.#afterAnimations.run(() => {
				if (isOpen === this.#opts.open.current) {
					if (!this.#opts.open.current) this.#shouldRender = false;
					this.#transitionStatus = void 0;
					this.#opts.onComplete?.();
				}
			});
		});
	}
	get shouldRender() {
		return this.#shouldRender;
	}
	get transitionStatus() {
		return this.#transitionStatus;
	}
	#clearTransitionFrame() {
		if (this.#transitionFrame === null) return;
		window.cancelAnimationFrame(this.#transitionFrame);
		this.#transitionFrame = null;
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/portal/portal-consumer.svelte
function Portal_consumer($$renderer, $$props) {
	const { children } = $$props;
	$$renderer.push(`<!---->`);
	children?.($$renderer);
	$$renderer.push(`<!---->`);
	$$renderer.push(`<!---->`);
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/portal/portal.svelte
function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { to: toProp, children, disabled } = $$props;
		const to = resolvePortalToProp(() => toProp);
		const context = getAllContexts();
		let target = derived(getTarget);
		function getTarget() {
			if (!isBrowser || disabled) return null;
			let localTarget = null;
			if (typeof to.current === "string") localTarget = document.querySelector(to.current);
			else localTarget = to.current;
			return localTarget;
		}
		let instance;
		function unmountInstance() {
			if (instance) {
				unmount(instance);
				instance = null;
			}
		}
		watch([() => target(), () => disabled], ([target, disabled]) => {
			if (!target || disabled) {
				unmountInstance();
				return;
			}
			instance = mount(Portal_consumer, {
				target,
				props: { children },
				context
			});
			return () => {
				unmountInstance();
			};
		});
		if (disabled) {
			$$renderer.push("<!--[0-->");
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/internal/events.js
/**
* Creates a typed event dispatcher and listener pair for custom events
* @template T - The type of data that will be passed in the event detail
* @param eventName - The name of the custom event
* @param options - CustomEvent options (bubbles, cancelable, etc.)
*/
var CustomEventDispatcher = class {
	eventName;
	options;
	constructor(eventName, options = {
		bubbles: true,
		cancelable: true
	}) {
		this.eventName = eventName;
		this.options = options;
	}
	createEvent(detail) {
		return new CustomEvent(this.eventName, {
			...this.options,
			detail
		});
	}
	dispatch(element, detail) {
		const event = this.createEvent(detail);
		element.dispatchEvent(event);
		return event;
	}
	listen(element, callback, options) {
		const handler = (event) => {
			callback(event);
		};
		return on(element, this.eventName, handler, options);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/internal/debounce.js
function debounce(fn, wait = 500) {
	let timeout = null;
	const debounced = (...args) => {
		if (timeout !== null) clearTimeout(timeout);
		timeout = setTimeout(() => {
			fn(...args);
		}, wait);
	};
	debounced.destroy = () => {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}
	};
	return debounced;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/elements.js
function isOrContainsTarget(node, target) {
	return node === target || node.contains(target);
}
function getOwnerDocument(el) {
	return el?.ownerDocument ?? document;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/dom.js
/**
* Determines if the click event truly occurred outside the content node.
* This was added to handle password managers and other elements that may be injected
* into the DOM but visually appear inside the content.
*/
function isClickTrulyOutside(event, contentNode) {
	const { clientX, clientY } = event;
	const rect = contentNode.getBoundingClientRect();
	return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/utils.js
var SELECTION_KEYS = [ENTER, " "];
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
[...SELECTION_KEYS], [...SELECTION_KEYS];
function isMouseEvent(event) {
	return event.pointerType === "mouse";
}
//#endregion
//#region node_modules/bits-ui/dist/internal/focus.js
/**
* A utility function that focuses an element.
*/
function focus(element, { select = false } = {}) {
	if (!element || !element.focus) return;
	const doc = getDocument(element);
	if (doc.activeElement === element) return;
	const previouslyFocusedElement = doc.activeElement;
	element.focus({ preventScroll: true });
	if (element !== previouslyFocusedElement && isSelectableInput(element) && select) element.select();
}
/**
* Attempts to focus the first element in a list of candidates.
* Stops when focus is successful.
*/
function focusFirst(candidates, { select = false } = {}, getActiveElement) {
	const previouslyFocusedElement = getActiveElement();
	for (const candidate of candidates) {
		focus(candidate, { select });
		if (getActiveElement() !== previouslyFocusedElement) return true;
	}
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/is-using-keyboard/is-using-keyboard.svelte.js
var isUsingKeyboard = false;
var IsUsingKeyboard = class {
	static _refs = 0;
	static _cleanup;
	constructor() {}
	get current() {
		return isUsingKeyboard;
	}
	set current(value) {
		isUsingKeyboard = value;
	}
};
//#endregion
//#region node_modules/bits-ui/dist/internal/tabbable.js
function getTabbableOptions() {
	return {
		getShadowRoot: true,
		displayCheck: typeof ResizeObserver === "function" && ResizeObserver.toString().includes("[native code]") ? "full" : "none"
	};
}
/**
* Gets all tabbable elements in the body and finds the next/previous tabbable element
* from the `currentNode` based on the `direction` provided.
* @param currentNode - the node we want to get the next/previous tabbable from
*/
function getTabbableFrom(currentNode, direction) {
	if (!isTabbable(currentNode, getTabbableOptions())) return getTabbableFromFocusable(currentNode, direction);
	const doc = getDocument(currentNode);
	const allTabbable = tabbable(doc.body, getTabbableOptions());
	if (direction === "prev") allTabbable.reverse();
	const activeIndex = allTabbable.indexOf(currentNode);
	if (activeIndex === -1) return doc.body;
	return allTabbable.slice(activeIndex + 1)[0];
}
function getTabbableFromFocusable(currentNode, direction) {
	const doc = getDocument(currentNode);
	if (!isFocusable(currentNode, getTabbableOptions())) return doc.body;
	const allFocusable = focusable(doc.body, getTabbableOptions());
	if (direction === "prev") allFocusable.reverse();
	const activeIndex = allFocusable.indexOf(currentNode);
	if (activeIndex === -1) return doc.body;
	return allFocusable.slice(activeIndex + 1).find((node) => isTabbable(node, getTabbableOptions())) ?? doc.body;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/box-auto-reset.svelte.js
var defaultOptions = {
	afterMs: 1e4,
	onChange: noop
};
function boxAutoReset(defaultValue, options) {
	const { afterMs, onChange, getWindow } = {
		...defaultOptions,
		...options
	};
	let timeout = null;
	let value = defaultValue;
	function resetAfter() {
		return getWindow().setTimeout(() => {
			value = defaultValue;
			onChange?.(defaultValue);
		}, afterMs);
	}
	return boxWith(() => value, (v) => {
		value = v;
		onChange?.(v);
		if (timeout) getWindow().clearTimeout(timeout);
		timeout = resetAfter();
	});
}
//#endregion
//#region node_modules/bits-ui/dist/internal/dom-typeahead.svelte.js
var DOMTypeahead = class {
	#opts;
	#search;
	#onMatch = derived(() => {
		if (this.#opts.onMatch) return this.#opts.onMatch;
		return (node) => node.focus();
	});
	#getCurrentItem = derived(() => {
		if (this.#opts.getCurrentItem) return this.#opts.getCurrentItem;
		return this.#opts.getActiveElement;
	});
	constructor(opts) {
		this.#opts = opts;
		this.#search = boxAutoReset("", {
			afterMs: 1e3,
			getWindow: opts.getWindow
		});
		this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this);
		this.resetTypeahead = this.resetTypeahead.bind(this);
	}
	handleTypeaheadSearch(key, candidates) {
		if (!candidates.length) return;
		this.#search.current = this.#search.current + key;
		const currentItem = this.#getCurrentItem()();
		const currentMatch = candidates.find((item) => item === currentItem)?.textContent?.trim() ?? "";
		const nextMatch = getNextMatch(candidates.map((item) => item.textContent?.trim() ?? ""), this.#search.current, currentMatch);
		const newItem = candidates.find((item) => item.textContent?.trim() === nextMatch);
		if (newItem) this.#onMatch()(newItem);
		return newItem;
	}
	resetTypeahead() {
		this.#search.current = "";
	}
	get search() {
		return this.#search.current;
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/menu.svelte.js
var CONTEXT_MENU_TRIGGER_ATTR = "data-context-menu-trigger";
var CONTEXT_MENU_CONTENT_ATTR = "data-context-menu-content";
var MenuRootContext = new Context("Menu.Root");
var MenuMenuContext = new Context("Menu.Root | Menu.Sub");
var MenuContentContext = new Context("Menu.Content");
new Context("Menu.Group | Menu.RadioGroup");
new Context("Menu.RadioGroup");
new Context("Menu.CheckboxGroup");
var MenuOpenEvent = new CustomEventDispatcher("bitsmenuopen", {
	bubbles: false,
	cancelable: true
});
var menuAttrs = createBitsAttrs({
	component: "menu",
	parts: [
		"trigger",
		"content",
		"sub-trigger",
		"item",
		"group",
		"group-heading",
		"checkbox-group",
		"checkbox-item",
		"radio-group",
		"radio-item",
		"separator",
		"sub-content",
		"arrow"
	]
});
var MenuSubmenuIntent = class {
	#opts;
	#cleanupDocMove = null;
	#fallbackTimer = null;
	#active = false;
	#target = null;
	#apex = null;
	#pointerPoint = null;
	#launchPoint = null;
	constructor(opts) {
		this.#opts = opts;
		watch([
			opts.triggerNode,
			opts.contentNode,
			opts.enabled
		], ([triggerNode, contentNode, enabled]) => {
			this.#reset();
			if (!triggerNode || !contentNode || !enabled) return;
			const onTriggerMove = (e) => {
				if (!isMouseEvent(e)) return;
				this.#launchPoint = {
					x: e.clientX,
					y: e.clientY
				};
				if (!this.#active) this.#preview(e, "content");
			};
			const onTriggerLeave = (e) => {
				if (!isMouseEvent(e)) return;
				this.#engage(e, "content");
			};
			const onContentMove = (e) => {
				if (!isMouseEvent(e)) return;
				if (!this.#active) this.#preview(e, "trigger");
			};
			const onContentLeave = (e) => {
				if (!isMouseEvent(e)) return;
				if (isElement(e.relatedTarget)) {
					const selector = this.#opts.subContentSelector();
					const matchedSubContent = e.relatedTarget.closest(selector);
					if (matchedSubContent && matchedSubContent !== contentNode && matchedSubContent.id) {
						if (!!contentNode.querySelector(`[aria-controls="${matchedSubContent.id}"]`)) return;
					}
				}
				this.#engage(e, "trigger");
			};
			const onTriggerEnter = (e) => {
				if (!isMouseEvent(e)) return;
				this.#disengage();
			};
			const onContentEnter = (e) => {
				if (!isMouseEvent(e)) return;
				this.#disengage();
			};
			triggerNode.addEventListener("pointermove", onTriggerMove);
			triggerNode.addEventListener("pointerleave", onTriggerLeave);
			triggerNode.addEventListener("pointerenter", onTriggerEnter);
			contentNode.addEventListener("pointermove", onContentMove);
			contentNode.addEventListener("pointerleave", onContentLeave);
			contentNode.addEventListener("pointerenter", onContentEnter);
			return () => {
				triggerNode.removeEventListener("pointermove", onTriggerMove);
				triggerNode.removeEventListener("pointerleave", onTriggerLeave);
				triggerNode.removeEventListener("pointerenter", onTriggerEnter);
				contentNode.removeEventListener("pointermove", onContentMove);
				contentNode.removeEventListener("pointerleave", onContentLeave);
				contentNode.removeEventListener("pointerenter", onContentEnter);
				this.#reset();
			};
		});
	}
	#parentTargetRect() {
		const parent = this.#opts.parentContentNode();
		if (parent) return parent.getBoundingClientRect();
		return this.#opts.triggerNode()?.getBoundingClientRect() ?? null;
	}
	#computePolygons(pointerPt, target) {
		const triggerNode = this.#opts.triggerNode();
		const contentNode = this.#opts.contentNode();
		if (!triggerNode || !contentNode) return null;
		const triggerRect = triggerNode.getBoundingClientRect();
		const contentRect = contentNode.getBoundingClientRect();
		const side = getSide(triggerRect, contentRect);
		let apex;
		let targetRect;
		let sourceRect;
		if (target === "content") {
			apex = this.#active ? this.#apex ?? pointerPt : pointerPt;
			targetRect = contentRect;
		} else {
			apex = this.#launchPoint ?? pointerPt;
			targetRect = this.#parentTargetRect() ?? triggerRect;
			sourceRect = contentRect;
		}
		this.#apex = apex;
		return {
			corridor: getCorridorPolygon(triggerRect, contentRect, side),
			intent: getIntentPolygon(apex, targetRect, side, target, sourceRect),
			targetRect,
			side
		};
	}
	#isInSafeZone(pt, corridor, intent) {
		return isPointInPolygon(pt, corridor) || isPointInPolygon(pt, intent);
	}
	#preview(e, target) {
		const pt = {
			x: e.clientX,
			y: e.clientY
		};
		if (!this.#computePolygons(pt, target)) return;
		this.#target = target;
		this.#pointerPoint = pt;
	}
	#engage(e, target) {
		if (!this.#opts.enabled()) return;
		const triggerNode = this.#opts.triggerNode();
		const contentNode = this.#opts.contentNode();
		if (!triggerNode || !contentNode) return;
		const related = e.relatedTarget;
		if (isElement(related)) {
			if (target === "content" && contentNode.contains(related)) return;
			if (target === "trigger" && triggerNode.contains(related)) return;
		}
		const pt = {
			x: e.clientX,
			y: e.clientY
		};
		const geo = this.#computePolygons(pt, target);
		if (!geo) return;
		if (!isInsideRect(pt, geo.targetRect) && !this.#isInSafeZone(pt, geo.corridor, geo.intent)) {
			this.#clearVisuals();
			return;
		}
		this.#active = true;
		this.#target = target;
		this.#pointerPoint = pt;
		this.#opts.setIsPointerInTransit(true);
		this.#attachDocMove();
		this.#startFallback();
	}
	#disengageTimer = null;
	#disengage() {
		if (!this.#active) return;
		const wasReturning = this.#target === "trigger";
		this.#detachDocMove();
		this.#clearFallback();
		this.#active = false;
		this.#clearVisuals();
		if (wasReturning) {
			this.#clearDisengageTimer();
			this.#disengageTimer = setTimeout(() => {
				this.#disengageTimer = null;
				this.#opts.setIsPointerInTransit(false);
			}, 100);
		} else this.#opts.setIsPointerInTransit(false);
	}
	#clearDisengageTimer() {
		if (this.#disengageTimer === null) return;
		clearTimeout(this.#disengageTimer);
		this.#disengageTimer = null;
	}
	#intentExit() {
		const pointerPoint = this.#pointerPoint;
		this.#detachDocMove();
		this.#clearFallback();
		this.#clearDisengageTimer();
		this.#active = false;
		this.#opts.setIsPointerInTransit(false);
		this.#clearVisuals();
		this.#opts.onIntentExit(pointerPoint);
	}
	#reset() {
		this.#detachDocMove();
		this.#clearFallback();
		this.#clearDisengageTimer();
		if (this.#active) this.#opts.setIsPointerInTransit(false);
		this.#active = false;
		this.#target = null;
		this.#apex = null;
		this.#pointerPoint = null;
		this.#launchPoint = null;
	}
	#isPointerInDescendantSubContent(pt) {
		const contentNode = this.#opts.contentNode();
		if (!contentNode) return false;
		const el = contentNode.ownerDocument.elementFromPoint(pt.x, pt.y);
		if (!el) return false;
		const selector = this.#opts.subContentSelector();
		const subContent = el.closest(selector);
		if (!subContent || subContent === contentNode) return false;
		if (subContent.id) return !!contentNode.querySelector(`[aria-controls="${subContent.id}"]`);
		return false;
	}
	#onDocMove = (e) => {
		if (!this.#active || !this.#target) return;
		if (!isMouseEvent(e)) return;
		const triggerNode = this.#opts.triggerNode();
		const contentNode = this.#opts.contentNode();
		if (!triggerNode || !contentNode) {
			this.#intentExit();
			return;
		}
		this.#clearFallback();
		const pt = {
			x: e.clientX,
			y: e.clientY
		};
		this.#pointerPoint = pt;
		const triggerRect = triggerNode.getBoundingClientRect();
		const contentRect = contentNode.getBoundingClientRect();
		if (this.#target === "content" && isInsideRect(pt, contentRect)) {
			this.#disengage();
			return;
		}
		if (this.#target === "trigger" && isInsideInsetRect(pt, triggerRect, 4)) {
			this.#disengage();
			return;
		}
		if (this.#isPointerInDescendantSubContent(pt)) {
			this.#startFallback();
			return;
		}
		const geo = this.#computePolygons(pt, this.#target);
		if (!geo) {
			this.#intentExit();
			return;
		}
		if (this.#isInSafeZone(pt, geo.corridor, geo.intent)) {
			this.#startFallback();
			return;
		}
		this.#intentExit();
	};
	#attachDocMove() {
		if (this.#cleanupDocMove) return;
		const doc = getDocument(this.#opts.triggerNode() ?? this.#opts.contentNode());
		if (!doc) return;
		doc.addEventListener("pointermove", this.#onDocMove, true);
		this.#cleanupDocMove = () => {
			doc.removeEventListener("pointermove", this.#onDocMove, true);
			this.#cleanupDocMove = null;
		};
	}
	#detachDocMove() {
		this.#cleanupDocMove?.();
	}
	#startFallback() {
		this.#clearFallback();
		this.#fallbackTimer = setTimeout(() => {
			this.#fallbackTimer = null;
			if (this.#active) this.#intentExit();
		}, 500);
	}
	#clearFallback() {
		if (this.#fallbackTimer === null) return;
		clearTimeout(this.#fallbackTimer);
		this.#fallbackTimer = null;
	}
	#clearVisuals() {
		this.#target = null;
		this.#apex = null;
		this.#pointerPoint = null;
	}
};
function isPointInPolygon(point, polygon) {
	const { x, y } = point;
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x;
		const yi = polygon[i].y;
		const xj = polygon[j].x;
		const yj = polygon[j].y;
		if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}
function isInsideRect(point, rect) {
	return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}
function isInsideInsetRect(point, rect, inset) {
	return point.x >= rect.left + inset && point.x <= rect.right - inset && point.y >= rect.top + inset && point.y <= rect.bottom - inset;
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
function getCorridorPolygon(triggerRect, contentRect, side) {
	const buffer = 2;
	switch (side) {
		case "top": return [
			{
				x: Math.min(triggerRect.left, contentRect.left) - buffer,
				y: triggerRect.top
			},
			{
				x: Math.min(triggerRect.left, contentRect.left) - buffer,
				y: contentRect.bottom
			},
			{
				x: Math.max(triggerRect.right, contentRect.right) + buffer,
				y: contentRect.bottom
			},
			{
				x: Math.max(triggerRect.right, contentRect.right) + buffer,
				y: triggerRect.top
			}
		];
		case "bottom": return [
			{
				x: Math.min(triggerRect.left, contentRect.left) - buffer,
				y: triggerRect.bottom
			},
			{
				x: Math.min(triggerRect.left, contentRect.left) - buffer,
				y: contentRect.top
			},
			{
				x: Math.max(triggerRect.right, contentRect.right) + buffer,
				y: contentRect.top
			},
			{
				x: Math.max(triggerRect.right, contentRect.right) + buffer,
				y: triggerRect.bottom
			}
		];
		case "left": return [
			{
				x: triggerRect.left,
				y: Math.min(triggerRect.top, contentRect.top) - buffer
			},
			{
				x: contentRect.right,
				y: Math.min(triggerRect.top, contentRect.top) - buffer
			},
			{
				x: contentRect.right,
				y: Math.max(triggerRect.bottom, contentRect.bottom) + buffer
			},
			{
				x: triggerRect.left,
				y: Math.max(triggerRect.bottom, contentRect.bottom) + buffer
			}
		];
		case "right": return [
			{
				x: triggerRect.right,
				y: Math.min(triggerRect.top, contentRect.top) - buffer
			},
			{
				x: contentRect.left,
				y: Math.min(triggerRect.top, contentRect.top) - buffer
			},
			{
				x: contentRect.left,
				y: Math.max(triggerRect.bottom, contentRect.bottom) + buffer
			},
			{
				x: triggerRect.right,
				y: Math.max(triggerRect.bottom, contentRect.bottom) + buffer
			}
		];
	}
}
function getIntentPolygon(exitPoint, targetRect, side, target, sourceRect) {
	const edgeBuffer = 8;
	const effectiveSide = target === "trigger" ? flipSide(side) : side;
	const top = sourceRect ? Math.min(targetRect.top, sourceRect.top) - edgeBuffer : targetRect.top - edgeBuffer;
	const bottom = sourceRect ? Math.max(targetRect.bottom, sourceRect.bottom) + edgeBuffer : targetRect.bottom + edgeBuffer;
	const left = sourceRect ? Math.min(targetRect.left, sourceRect.left) - edgeBuffer : targetRect.left - edgeBuffer;
	const right = sourceRect ? Math.max(targetRect.right, sourceRect.right) + edgeBuffer : targetRect.right + edgeBuffer;
	switch (effectiveSide) {
		case "right": return [
			exitPoint,
			{
				x: targetRect.left,
				y: top
			},
			{
				x: targetRect.left,
				y: bottom
			}
		];
		case "left": return [
			exitPoint,
			{
				x: targetRect.right,
				y: top
			},
			{
				x: targetRect.right,
				y: bottom
			}
		];
		case "bottom": return [
			exitPoint,
			{
				x: left,
				y: targetRect.top
			},
			{
				x: right,
				y: targetRect.top
			}
		];
		case "top": return [
			exitPoint,
			{
				x: left,
				y: targetRect.bottom
			},
			{
				x: right,
				y: targetRect.bottom
			}
		];
	}
}
function flipSide(side) {
	switch (side) {
		case "top": return "bottom";
		case "bottom": return "top";
		case "left": return "right";
		case "right": return "left";
	}
}
var MenuRootState = class MenuRootState {
	static create(opts) {
		const root = new MenuRootState(opts);
		return MenuRootContext.set(root);
	}
	opts;
	isUsingKeyboard = new IsUsingKeyboard();
	ignoreCloseAutoFocus = false;
	isPointerInTransit = false;
	constructor(opts) {
		this.opts = opts;
	}
	getBitsAttr = (part) => {
		return menuAttrs.getAttr(part, this.opts.variant.current);
	};
};
var MenuMenuState = class MenuMenuState {
	static create(opts, root) {
		return MenuMenuContext.set(new MenuMenuState(opts, root, null));
	}
	opts;
	root;
	parentMenu;
	contentId = boxWith(() => "");
	contentNode = null;
	contentPresence;
	triggerNode = null;
	constructor(opts, root, parentMenu) {
		this.opts = opts;
		this.root = root;
		this.parentMenu = parentMenu;
		this.contentPresence = new PresenceManager({
			ref: boxWith(() => this.contentNode),
			open: this.opts.open,
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			},
			shouldSkipExitAnimation: () => {
				if (this.root.opts.variant.current !== "menubar" || this.parentMenu !== null) return false;
				return this.root.opts.shouldSkipExitAnimation?.() ?? false;
			}
		});
		if (parentMenu) watch(() => parentMenu.opts.open.current, () => {
			if (parentMenu.opts.open.current) return;
			this.opts.open.current = false;
		});
	}
	toggleOpen() {
		this.opts.open.current = !this.opts.open.current;
	}
	onOpen() {
		this.opts.open.current = true;
	}
	onClose() {
		this.opts.open.current = false;
	}
};
var MenuContentState = class MenuContentState {
	static create(opts) {
		return MenuContentContext.set(new MenuContentState(opts, MenuMenuContext.get()));
	}
	opts;
	parentMenu;
	rovingFocusGroup;
	domContext;
	attachment;
	search = "";
	#timer = 0;
	#handleTypeaheadSearch;
	mounted = false;
	#isSub;
	constructor(opts, parentMenu) {
		this.opts = opts;
		this.parentMenu = parentMenu;
		this.domContext = new DOMContext(opts.ref);
		this.attachment = attachRef(this.opts.ref, (v) => {
			if (this.parentMenu.contentNode !== v) this.parentMenu.contentNode = v;
		});
		parentMenu.contentId = opts.id;
		this.#isSub = opts.isSub ?? false;
		this.onkeydown = this.onkeydown.bind(this);
		this.onblur = this.onblur.bind(this);
		this.onfocus = this.onfocus.bind(this);
		this.handleInteractOutside = this.handleInteractOutside.bind(this);
		new MenuSubmenuIntent({
			contentNode: () => this.parentMenu.contentNode,
			triggerNode: () => this.parentMenu.triggerNode,
			parentContentNode: () => this.parentMenu.parentMenu?.contentNode ?? null,
			subContentSelector: () => `[${this.parentMenu.root.getBitsAttr("sub-content")}]`,
			enabled: () => this.parentMenu.opts.open.current && Boolean(this.parentMenu.triggerNode?.hasAttribute(this.parentMenu.root.getBitsAttr("sub-trigger"))),
			onIntentExit: (pointerPoint) => {
				this.parentMenu.opts.open.current = false;
				this.#dispatchPointerMoveToHoveredSubTrigger(pointerPoint);
			},
			setIsPointerInTransit: (value) => {
				this.parentMenu.root.isPointerInTransit = value;
			}
		});
		this.#handleTypeaheadSearch = new DOMTypeahead({
			getActiveElement: () => this.domContext.getActiveElement(),
			getWindow: () => this.domContext.getWindow()
		}).handleTypeaheadSearch;
		this.rovingFocusGroup = new RovingFocusGroup({
			rootNode: boxWith(() => this.parentMenu.contentNode),
			candidateAttr: this.parentMenu.root.getBitsAttr("item"),
			loop: this.opts.loop,
			orientation: boxWith(() => "vertical")
		});
		watch(() => this.parentMenu.contentNode, (contentNode) => {
			if (!contentNode) return;
			const handler = () => {
				afterTick(() => {
					if (!this.parentMenu.root.isUsingKeyboard.current) return;
					this.rovingFocusGroup.focusFirstCandidate();
				});
			};
			return MenuOpenEvent.listen(contentNode, handler);
		});
	}
	#getCandidateNodes() {
		const node = this.parentMenu.contentNode;
		if (!node) return [];
		return Array.from(node.querySelectorAll(`[${this.parentMenu.root.getBitsAttr("item")}]:not([data-disabled])`));
	}
	#isPointerMovingToSubmenu() {
		return this.parentMenu.root.isPointerInTransit;
	}
	#dispatchPointerMoveToHoveredSubTrigger(pointerPoint) {
		if (!pointerPoint) return;
		const parentContentNode = this.parentMenu.parentMenu?.contentNode;
		if (!parentContentNode) return;
		const hoveredNode = this.domContext.getDocument().elementFromPoint(pointerPoint.x, pointerPoint.y);
		if (!isElement(hoveredNode)) return;
		const hoveredSubTrigger = hoveredNode.closest(`[${this.parentMenu.root.getBitsAttr("sub-trigger")}]`);
		if (!hoveredSubTrigger || !parentContentNode.contains(hoveredSubTrigger)) return;
		if (hoveredSubTrigger === this.parentMenu.triggerNode) return;
		hoveredSubTrigger.dispatchEvent(new PointerEvent("pointermove", {
			bubbles: true,
			cancelable: true,
			pointerType: "mouse",
			clientX: pointerPoint.x,
			clientY: pointerPoint.y
		}));
	}
	onCloseAutoFocus = (e) => {
		this.opts.onCloseAutoFocus.current?.(e);
		if (e.defaultPrevented || this.#isSub) return;
		if (this.parentMenu.root.ignoreCloseAutoFocus) {
			e.preventDefault();
			return;
		}
		if (this.parentMenu.triggerNode && isTabbable(this.parentMenu.triggerNode)) {
			e.preventDefault();
			this.parentMenu.triggerNode.focus();
		}
	};
	handleTabKeyDown(e) {
		/**
		* We locate the root `menu`'s trigger by going up the tree until
		* we find a menu that has no parent. This will allow us to focus the next
		* tabbable element before/after the root trigger.
		*/
		let rootMenu = this.parentMenu;
		while (rootMenu.parentMenu !== null) rootMenu = rootMenu.parentMenu;
		if (!rootMenu.triggerNode) return;
		e.preventDefault();
		const nodeToFocus = getTabbableFrom(rootMenu.triggerNode, e.shiftKey ? "prev" : "next");
		if (nodeToFocus) {
			/**
			* We set a flag to ignore the `onCloseAutoFocus` event handler
			* as well as the fallbacks inside the focus scope to prevent
			* race conditions causing focus to fall back to the body even
			* though we're trying to focus the next tabbable element.
			*/
			this.parentMenu.root.ignoreCloseAutoFocus = true;
			rootMenu.onClose();
			afterTick(() => {
				nodeToFocus.focus();
				afterTick(() => {
					this.parentMenu.root.ignoreCloseAutoFocus = false;
				});
			});
		} else this.domContext.getDocument().body.focus();
	}
	onkeydown(e) {
		if (e.defaultPrevented) return;
		if (e.key === "Tab") {
			this.handleTabKeyDown(e);
			return;
		}
		const target = e.target;
		const currentTarget = e.currentTarget;
		if (!isHTMLElement(target) || !isHTMLElement(currentTarget)) return;
		const isKeydownInside = target.closest(`[${this.parentMenu.root.getBitsAttr("content")}]`)?.id === this.parentMenu.contentId.current;
		const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
		const isCharacterKey = e.key.length === 1;
		if (this.rovingFocusGroup.handleKeydown(target, e)) return;
		if (e.code === "Space") return;
		const candidateNodes = this.#getCandidateNodes();
		if (isKeydownInside) {
			if (!isModifierKey && isCharacterKey) this.#handleTypeaheadSearch(e.key, candidateNodes);
		}
		if (e.target?.id !== this.parentMenu.contentId.current) return;
		if (!FIRST_LAST_KEYS.includes(e.key)) return;
		e.preventDefault();
		if (LAST_KEYS.includes(e.key)) candidateNodes.reverse();
		focusFirst(candidateNodes, { select: false }, () => this.domContext.getActiveElement());
	}
	onblur(e) {
		if (!isElement(e.currentTarget)) return;
		if (!isElement(e.target)) return;
		if (!e.currentTarget.contains?.(e.target)) {
			this.domContext.getWindow().clearTimeout(this.#timer);
			this.search = "";
		}
	}
	onfocus(_) {
		if (!this.parentMenu.root.isUsingKeyboard.current) return;
		afterTick(() => this.rovingFocusGroup.focusFirstCandidate());
	}
	onItemEnter() {
		return this.#isPointerMovingToSubmenu();
	}
	onItemLeave(e) {
		if (e.currentTarget.hasAttribute(this.parentMenu.root.getBitsAttr("sub-trigger"))) return;
		if (this.#isPointerMovingToSubmenu() || this.parentMenu.root.isUsingKeyboard.current) return;
		this.parentMenu.contentNode?.focus({ preventScroll: true });
		this.rovingFocusGroup.setCurrentTabStopId("");
	}
	onTriggerLeave() {
		if (this.#isPointerMovingToSubmenu()) return true;
		return false;
	}
	handleInteractOutside(e) {
		if (!isElementOrSVGElement(e.target)) return;
		const triggerId = this.parentMenu.triggerNode?.id;
		if (e.target.id === triggerId) {
			e.preventDefault();
			return;
		}
		if (e.target.closest(`#${triggerId}`)) {
			e.preventDefault();
			return;
		}
		/**
		* when the menu closes due to an outside pointer interaction (for example,
		* clicking another dropdown trigger), avoid focusing this menu's trigger
		* to prevent stealing focus from the new interaction target.
		*/
		this.parentMenu.root.ignoreCloseAutoFocus = true;
		afterTick(() => {
			this.parentMenu.root.ignoreCloseAutoFocus = false;
		});
	}
	get shouldRender() {
		return this.parentMenu.contentPresence.shouldRender;
	}
	#snippetProps = derived(() => ({ open: this.parentMenu.opts.open.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "menu",
		"aria-orientation": "vertical",
		[this.parentMenu.root.getBitsAttr("content")]: "",
		"data-state": getDataOpenClosed(this.parentMenu.opts.open.current),
		...getDataTransitionAttrs(this.parentMenu.contentPresence.transitionStatus),
		onkeydown: this.onkeydown,
		onblur: this.onblur,
		onfocus: this.onfocus,
		dir: this.parentMenu.root.opts.dir.current,
		style: {
			pointerEvents: "auto",
			contain: "layout style"
		},
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	popperProps = { onCloseAutoFocus: (e) => this.onCloseAutoFocus(e) };
};
var MenuItemSharedState = class {
	opts;
	content;
	attachment;
	#isFocused = false;
	constructor(opts, content) {
		this.opts = opts;
		this.content = content;
		this.attachment = attachRef(this.opts.ref);
		this.onpointermove = this.onpointermove.bind(this);
		this.onpointerleave = this.onpointerleave.bind(this);
		this.onfocus = this.onfocus.bind(this);
		this.onblur = this.onblur.bind(this);
	}
	onpointermove(e) {
		if (e.defaultPrevented) return;
		if (!isMouseEvent(e)) return;
		if (this.opts.disabled.current) this.content.onItemLeave(e);
		else {
			if (this.content.onItemEnter()) return;
			const item = e.currentTarget;
			if (!isHTMLElement(item)) return;
			item.focus({ preventScroll: true });
		}
	}
	onpointerleave(e) {
		if (e.defaultPrevented) return;
		if (!isMouseEvent(e)) return;
		this.content.onItemLeave(e);
	}
	onfocus(e) {
		afterTick(() => {
			if (e.defaultPrevented || this.opts.disabled.current) return;
			this.#isFocused = true;
		});
	}
	onblur(e) {
		afterTick(() => {
			if (e.defaultPrevented) return;
			this.#isFocused = false;
		});
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		tabindex: -1,
		role: "menuitem",
		"aria-disabled": boolToStr(this.opts.disabled.current),
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		"data-highlighted": this.#isFocused ? "" : void 0,
		[this.content.parentMenu.root.getBitsAttr("item")]: "",
		onpointermove: this.onpointermove,
		onpointerleave: this.onpointerleave,
		onfocus: this.onfocus,
		onblur: this.onblur,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var MenuItemState = class MenuItemState {
	static create(opts) {
		return new MenuItemState(opts, new MenuItemSharedState(opts, MenuContentContext.get()));
	}
	opts;
	item;
	root;
	#isPointerDown = false;
	constructor(opts, item) {
		this.opts = opts;
		this.item = item;
		this.root = item.content.parentMenu.root;
		this.onkeydown = this.onkeydown.bind(this);
		this.onclick = this.onclick.bind(this);
		this.onpointerdown = this.onpointerdown.bind(this);
		this.onpointerup = this.onpointerup.bind(this);
	}
	#handleSelect() {
		if (this.item.opts.disabled.current) return;
		const selectEvent = new CustomEvent("menuitemselect", {
			bubbles: true,
			cancelable: true
		});
		this.opts.onSelect.current(selectEvent);
		if (selectEvent.defaultPrevented) {
			this.item.content.parentMenu.root.isUsingKeyboard.current = false;
			return;
		}
		if (this.opts.closeOnSelect.current) this.item.content.parentMenu.root.opts.onClose();
	}
	onkeydown(e) {
		const isTypingAhead = this.item.content.search !== "";
		if (this.item.opts.disabled.current || isTypingAhead && e.key === " ") return;
		if (SELECTION_KEYS.includes(e.key)) {
			if (!isHTMLElement(e.currentTarget)) return;
			e.currentTarget.click();
			/**
			* We prevent default browser behavior for selection keys as they should trigger
			* a selection only:
			* - prevents space from scrolling the page.
			* - if keydown causes focus to move, prevents keydown from firing on the new target.
			*/
			e.preventDefault();
		}
	}
	onclick(_) {
		if (this.item.opts.disabled.current) return;
		this.#handleSelect();
	}
	onpointerup(e) {
		if (e.defaultPrevented) return;
		if (!this.#isPointerDown) {
			if (!isHTMLElement(e.currentTarget)) return;
			e.currentTarget?.click();
		}
	}
	onpointerdown(_) {
		this.#isPointerDown = true;
	}
	#props = derived(() => mergeProps(this.item.props, {
		onclick: this.onclick,
		onpointerdown: this.onpointerdown,
		onpointerup: this.onpointerup,
		onkeydown: this.onkeydown
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var DropdownMenuTriggerState = class DropdownMenuTriggerState {
	static create(opts) {
		return new DropdownMenuTriggerState(opts, MenuMenuContext.get());
	}
	opts;
	parentMenu;
	attachment;
	constructor(opts, parentMenu) {
		this.opts = opts;
		this.parentMenu = parentMenu;
		this.attachment = attachRef(this.opts.ref, (v) => this.parentMenu.triggerNode = v);
	}
	onclick = (e) => {
		/**
		* MacOS VoiceOver sends a click in Safari/Firefox bypassing the keydown event
		* when V0+Space is pressed. Since we already handle the keydown event and the
		* pointerdown events separately, we ignore it if the detail is not 0.
		*/
		if (this.opts.disabled.current || e.detail !== 0) return;
		this.parentMenu.toggleOpen();
		e.preventDefault();
	};
	onpointerdown = (e) => {
		if (this.opts.disabled.current) return;
		if (e.pointerType === "touch") return e.preventDefault();
		if (e.button === 0 && e.ctrlKey === false) {
			this.parentMenu.toggleOpen();
			if (!this.parentMenu.opts.open.current) e.preventDefault();
		}
	};
	onpointerup = (e) => {
		if (this.opts.disabled.current) return;
		if (e.pointerType === "touch") {
			e.preventDefault();
			this.parentMenu.toggleOpen();
		}
	};
	onkeydown = (e) => {
		if (this.opts.disabled.current) return;
		if (e.key === " " || e.key === "Enter") {
			this.parentMenu.toggleOpen();
			e.preventDefault();
			return;
		}
		if (e.key === "ArrowDown") {
			this.parentMenu.onOpen();
			e.preventDefault();
		}
	};
	#ariaControls = derived(() => {
		if (this.parentMenu.opts.open.current && this.parentMenu.contentId.current) return this.parentMenu.contentId.current;
	});
	#props = derived(() => ({
		id: this.opts.id.current,
		disabled: this.opts.disabled.current,
		"aria-haspopup": "menu",
		"aria-expanded": boolToStr(this.parentMenu.opts.open.current),
		"aria-controls": this.#ariaControls(),
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		"data-state": getDataOpenClosed(this.parentMenu.opts.open.current),
		[this.parentMenu.root.getBitsAttr("trigger")]: "",
		onclick: this.onclick,
		onpointerdown: this.onpointerdown,
		onpointerup: this.onpointerup,
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
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/dismissible-layer/use-dismissable-layer.svelte.js
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
var DismissibleLayerState = class DismissibleLayerState {
	static create(opts) {
		return new DismissibleLayerState(opts);
	}
	opts;
	#interactOutsideProp;
	#behaviorType;
	#interceptedEvents = { pointerdown: false };
	#isResponsibleLayer = false;
	#isFocusInsideDOMTree = false;
	#documentObj = void 0;
	#onFocusOutside;
	#unsubClickListener = noop;
	constructor(opts) {
		this.opts = opts;
		this.#behaviorType = opts.interactOutsideBehavior;
		this.#interactOutsideProp = opts.onInteractOutside;
		this.#onFocusOutside = opts.onFocusOutside;
		let unsubEvents = noop;
		const cleanup = () => {
			this.#resetState();
			globalThis.bitsDismissableLayers.delete(this);
			this.#handleInteractOutside.destroy();
			unsubEvents();
		};
		watch([() => this.opts.enabled.current, () => this.opts.ref.current], () => {
			if (!this.opts.enabled.current || !this.opts.ref.current) return;
			afterSleep(1, () => {
				if (!this.opts.ref.current) return;
				globalThis.bitsDismissableLayers.set(this, this.#behaviorType);
				unsubEvents();
				unsubEvents = this.#addEventListeners();
			});
			return cleanup;
		});
	}
	#handleFocus = (event) => {
		if (event.defaultPrevented) return;
		if (!this.opts.ref.current) return;
		afterTick(() => {
			if (!this.opts.ref.current || this.#isTargetWithinLayer(event.target)) return;
			if (event.target && !this.#isFocusInsideDOMTree) this.#onFocusOutside.current?.(event);
		});
	};
	#addEventListeners() {
		return executeCallbacks(
			/**
			* CAPTURE INTERACTION START
			* mark interaction-start event as intercepted.
			* mark responsible layer during interaction start
			* to avoid checking if is responsible layer during interaction end
			* when a new floating element may have been opened.
			*/
			on(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), { capture: true }),
			/**
			* BUBBLE INTERACTION START
			* Mark interaction-start event as non-intercepted. Debounce `onInteractOutsideStart`
			* to avoid prematurely checking if other events were intercepted.
			*/
			on(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)),
			/**
			* HANDLE FOCUS OUTSIDE
			*/
			on(this.#documentObj, "focusin", this.#handleFocus)
		);
	}
	#handleDismiss = (e) => {
		let event = e;
		if (event.defaultPrevented) event = createWrappedEvent(e);
		this.#interactOutsideProp.current(e);
	};
	#handleInteractOutside = debounce((e) => {
		if (!this.opts.ref.current) {
			this.#unsubClickListener();
			return;
		}
		const isEventValid = this.opts.isValidEvent.current(e, this.opts.ref.current) || isValidEvent(e, this.opts.ref.current);
		if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
			this.#unsubClickListener();
			return;
		}
		let event = e;
		if (event.defaultPrevented) event = createWrappedEvent(event);
		if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
			this.#unsubClickListener();
			return;
		}
		if (e.pointerType === "touch") {
			this.#unsubClickListener();
			this.#unsubClickListener = on(this.#documentObj, "click", this.#handleDismiss, { once: true });
		} else this.#interactOutsideProp.current(event);
	}, 10);
	#markInterceptedEvent = (e) => {
		this.#interceptedEvents[e.type] = true;
	};
	#markNonInterceptedEvent = (e) => {
		this.#interceptedEvents[e.type] = false;
	};
	#markResponsibleLayer = () => {
		if (!this.opts.ref.current) return;
		this.#isResponsibleLayer = isResponsibleLayer(this.opts.ref.current);
	};
	#isTargetWithinLayer = (target) => {
		if (!this.opts.ref.current) return false;
		return isOrContainsTarget(this.opts.ref.current, target);
	};
	#resetState = debounce(() => {
		for (const eventType in this.#interceptedEvents) this.#interceptedEvents[eventType] = false;
		this.#isResponsibleLayer = false;
	}, 20);
	#isAnyEventIntercepted() {
		return Object.values(this.#interceptedEvents).some(Boolean);
	}
	#onfocuscapture = () => {
		this.#isFocusInsideDOMTree = true;
	};
	#onblurcapture = () => {
		this.#isFocusInsideDOMTree = false;
	};
	props = {
		onfocuscapture: this.#onfocuscapture,
		onblurcapture: this.#onblurcapture
	};
};
function getTopMostDismissableLayer(layersArr = [...globalThis.bitsDismissableLayers]) {
	return layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
	const layersArr = [...globalThis.bitsDismissableLayers];
	/**
	* We first check if we can find a top layer with `close` or `ignore`.
	* If that top layer was found and matches the provided node, then the node is
	* responsible for the outside interaction. Otherwise, we know that all layers defer so
	* the first layer is the responsible one.
	*/
	const topMostLayer = getTopMostDismissableLayer(layersArr);
	if (topMostLayer) return topMostLayer[0].opts.ref.current === node;
	const [firstLayerNode] = layersArr[0];
	return firstLayerNode.opts.ref.current === node;
}
function isValidEvent(e, node) {
	const target = e.target;
	if (!isElementOrSVGElement(target)) return false;
	const targetIsContextMenuTrigger = Boolean(target.closest(`[${CONTEXT_MENU_TRIGGER_ATTR}]`));
	const nodeIsContextMenu = Boolean(node.closest(`[${CONTEXT_MENU_CONTENT_ATTR}]`));
	if ("button" in e && e.button > 0 && !targetIsContextMenuTrigger) return false;
	if ("button" in e && e.button === 0 && targetIsContextMenuTrigger && nodeIsContextMenu) return true;
	if (targetIsContextMenuTrigger && nodeIsContextMenu) return false;
	return getOwnerDocument(target).documentElement.contains(target) && !isOrContainsTarget(node, target) && isClickTrulyOutside(e, node);
}
function createWrappedEvent(e) {
	const capturedCurrentTarget = e.currentTarget;
	const capturedTarget = e.target;
	let newEvent;
	if (e instanceof PointerEvent) newEvent = new PointerEvent(e.type, e);
	else newEvent = new PointerEvent("pointerdown", e);
	let isPrevented = false;
	return new Proxy(newEvent, { get: (target, prop) => {
		if (prop === "currentTarget") return capturedCurrentTarget;
		if (prop === "target") return capturedTarget;
		if (prop === "preventDefault") return () => {
			isPrevented = true;
			if (typeof target.preventDefault === "function") target.preventDefault();
		};
		if (prop === "defaultPrevented") return isPrevented;
		if (prop in target) return target[prop];
		return e[prop];
	} });
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/dismissible-layer/dismissible-layer.svelte
function Dismissible_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { interactOutsideBehavior = "close", onInteractOutside = noop, onFocusOutside = noop, id, children, enabled, isValidEvent = () => false, ref } = $$props;
		const dismissibleLayerState = DismissibleLayerState.create({
			id: boxWith(() => id),
			interactOutsideBehavior: boxWith(() => interactOutsideBehavior),
			onInteractOutside: boxWith(() => onInteractOutside),
			enabled: boxWith(() => enabled),
			onFocusOutside: boxWith(() => onFocusOutside),
			isValidEvent: boxWith(() => isValidEvent),
			ref
		});
		children?.($$renderer, { props: dismissibleLayerState.props });
		$$renderer.push(`<!---->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/escape-layer/use-escape-layer.svelte.js
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
var EscapeLayerState = class EscapeLayerState {
	static create(opts) {
		return new EscapeLayerState(opts);
	}
	opts;
	domContext;
	constructor(opts) {
		this.opts = opts;
		this.domContext = new DOMContext(this.opts.ref);
		let unsubEvents = noop;
		watch(() => opts.enabled.current, (enabled) => {
			if (enabled) {
				globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
				unsubEvents = this.#addEventListener();
			}
			return () => {
				unsubEvents();
				globalThis.bitsEscapeLayers.delete(this);
			};
		});
	}
	#addEventListener = () => {
		return on(this.domContext.getDocument(), "keydown", this.#onkeydown, { passive: false });
	};
	#onkeydown = (e) => {
		if (e.key !== "Escape" || !isResponsibleEscapeLayer(this)) return;
		const clonedEvent = new KeyboardEvent(e.type, e);
		e.preventDefault();
		const behaviorType = this.opts.escapeKeydownBehavior.current;
		if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
		this.opts.onEscapeKeydown.current(clonedEvent);
	};
};
function isResponsibleEscapeLayer(instance) {
	const layersArr = [...globalThis.bitsEscapeLayers];
	/**
	* We first check if we can find a top layer with `close` or `ignore`.
	* If that top layer was found and matches the provided node, then the node is
	* responsible for the escape. Otherwise, we know that all layers defer so
	* the first layer is the responsible one.
	*/
	const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
	if (topMostLayer) return topMostLayer[0] === instance;
	const [firstLayerNode] = layersArr[0];
	return firstLayerNode === instance;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/escape-layer/escape-layer.svelte
function Escape_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { escapeKeydownBehavior = "close", onEscapeKeydown = noop, children, enabled, ref } = $$props;
		EscapeLayerState.create({
			escapeKeydownBehavior: boxWith(() => escapeKeydownBehavior),
			onEscapeKeydown: boxWith(() => onEscapeKeydown),
			enabled: boxWith(() => enabled),
			ref
		});
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/focus-scope/focus-scope-manager.js
var FocusScopeManager = class FocusScopeManager {
	static instance;
	#scopeStack = simpleBox([]);
	#focusHistory = /* @__PURE__ */ new WeakMap();
	#preFocusHistory = /* @__PURE__ */ new WeakMap();
	static getInstance() {
		if (!this.instance) this.instance = new FocusScopeManager();
		return this.instance;
	}
	register(scope) {
		const current = this.getActive();
		if (current && current !== scope) current.pause();
		const activeElement = document.activeElement;
		if (activeElement && activeElement !== document.body) this.#preFocusHistory.set(scope, activeElement);
		this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
		this.#scopeStack.current.unshift(scope);
	}
	unregister(scope) {
		this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
		const next = this.getActive();
		if (next) next.resume();
	}
	getActive() {
		return this.#scopeStack.current[0];
	}
	setFocusMemory(scope, element) {
		this.#focusHistory.set(scope, element);
	}
	getFocusMemory(scope) {
		return this.#focusHistory.get(scope);
	}
	isActiveScope(scope) {
		return this.getActive() === scope;
	}
	setPreFocusMemory(scope, element) {
		this.#preFocusHistory.set(scope, element);
	}
	getPreFocusMemory(scope) {
		return this.#preFocusHistory.get(scope);
	}
	clearPreFocusMemory(scope) {
		this.#preFocusHistory.delete(scope);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/focus-scope/focus-scope.svelte.js
var FocusScope = class FocusScope {
	#paused = false;
	#container = null;
	#manager = FocusScopeManager.getInstance();
	#cleanupFns = [];
	#opts;
	constructor(opts) {
		this.#opts = opts;
	}
	get paused() {
		return this.#paused;
	}
	pause() {
		this.#paused = true;
	}
	resume() {
		this.#paused = false;
	}
	#cleanup() {
		for (const fn of this.#cleanupFns) fn();
		this.#cleanupFns = [];
	}
	mount(container) {
		if (this.#container) this.unmount();
		this.#container = container;
		this.#manager.register(this);
		this.#setupEventListeners();
		this.#handleOpenAutoFocus();
	}
	unmount() {
		if (!this.#container) return;
		this.#cleanup();
		this.#handleCloseAutoFocus();
		this.#manager.unregister(this);
		this.#manager.clearPreFocusMemory(this);
		this.#container = null;
	}
	#handleOpenAutoFocus() {
		if (!this.#container) return;
		const event = new CustomEvent("focusScope.onOpenAutoFocus", {
			bubbles: false,
			cancelable: true
		});
		this.#opts.onOpenAutoFocus.current(event);
		if (!event.defaultPrevented) requestAnimationFrame(() => {
			if (!this.#container) return;
			const firstTabbable = this.#getFirstTabbable();
			if (firstTabbable) {
				firstTabbable.focus();
				this.#manager.setFocusMemory(this, firstTabbable);
			} else this.#container.focus();
		});
	}
	#handleCloseAutoFocus() {
		const event = new CustomEvent("focusScope.onCloseAutoFocus", {
			bubbles: false,
			cancelable: true
		});
		this.#opts.onCloseAutoFocus.current?.(event);
		if (!event.defaultPrevented) {
			const preFocusedElement = this.#manager.getPreFocusMemory(this);
			if (preFocusedElement && document.contains(preFocusedElement)) try {
				preFocusedElement.focus();
			} catch {
				document.body.focus();
			}
		}
	}
	#setupEventListeners() {
		if (!this.#container || !this.#opts.trap.current) return;
		const container = this.#container;
		const doc = container.ownerDocument;
		const handleFocus = (e) => {
			if (this.#paused || !this.#manager.isActiveScope(this)) return;
			const target = e.target;
			if (!target) return;
			if (container.contains(target)) this.#manager.setFocusMemory(this, target);
			else {
				const lastFocused = this.#manager.getFocusMemory(this);
				if (lastFocused && container.contains(lastFocused) && isFocusable(lastFocused)) {
					e.preventDefault();
					lastFocused.focus();
				} else {
					const firstTabbable = this.#getFirstTabbable();
					const firstFocusable = this.#getAllFocusables()[0];
					(firstTabbable || firstFocusable || container).focus();
				}
			}
		};
		const handleKeydown = (e) => {
			if (!this.#opts.loop || this.#paused || e.key !== "Tab") return;
			if (!this.#manager.isActiveScope(this)) return;
			const tabbables = this.#getTabbables();
			if (tabbables.length === 0) return;
			const first = tabbables[0];
			const last = tabbables[tabbables.length - 1];
			if (!e.shiftKey && doc.activeElement === last) {
				e.preventDefault();
				first.focus();
			} else if (e.shiftKey && doc.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		};
		this.#cleanupFns.push(on(doc, "focusin", handleFocus, { capture: true }), on(container, "keydown", handleKeydown));
		const observer = new MutationObserver(() => {
			const lastFocused = this.#manager.getFocusMemory(this);
			if (lastFocused && !container.contains(lastFocused)) {
				const firstTabbable = this.#getFirstTabbable();
				const firstFocusable = this.#getAllFocusables()[0];
				const elementToFocus = firstTabbable || firstFocusable;
				if (elementToFocus) {
					elementToFocus.focus();
					this.#manager.setFocusMemory(this, elementToFocus);
				} else container.focus();
			}
		});
		observer.observe(container, {
			childList: true,
			subtree: true
		});
		this.#cleanupFns.push(() => observer.disconnect());
	}
	#getTabbables() {
		if (!this.#container) return [];
		return tabbable(this.#container, {
			includeContainer: false,
			getShadowRoot: true
		});
	}
	#getFirstTabbable() {
		return this.#getTabbables()[0] || null;
	}
	#getAllFocusables() {
		if (!this.#container) return [];
		return focusable(this.#container, {
			includeContainer: false,
			getShadowRoot: true
		});
	}
	static use(opts) {
		let scope = null;
		watch([() => opts.ref.current, () => opts.enabled.current], ([ref, enabled]) => {
			if (ref && enabled) {
				if (!scope) scope = new FocusScope(opts);
				scope.mount(ref);
			} else if (scope) {
				scope.unmount();
				scope = null;
			}
		});
		return { get props() {
			return { tabindex: -1 };
		} };
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/focus-scope/focus-scope.svelte
function Focus_scope($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { enabled = false, trapFocus = false, loop = false, onCloseAutoFocus = noop, onOpenAutoFocus = noop, focusScope, ref } = $$props;
		const focusScopeState = FocusScope.use({
			enabled: boxWith(() => enabled),
			trap: boxWith(() => trapFocus),
			loop,
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus),
			onOpenAutoFocus: boxWith(() => onOpenAutoFocus),
			ref
		});
		focusScope?.($$renderer, { props: focusScopeState.props });
		$$renderer.push(`<!---->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/text-selection-layer/use-text-selection-layer.svelte.js
var noopPointer = () => {};
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
var TextSelectionLayerState = class TextSelectionLayerState {
	static create(opts) {
		return new TextSelectionLayerState(opts);
	}
	opts;
	domContext;
	#unsubSelectionLock = noop;
	#enabledSnapshot = false;
	#onPointerDownSnapshot = noopPointer;
	#onPointerUpSnapshot = noopPointer;
	constructor(opts) {
		this.opts = opts;
		this.domContext = new DOMContext(opts.ref);
		let unsubEvents = noop;
		watch(() => [
			this.opts.enabled.current,
			this.opts.onPointerDown.current,
			this.opts.onPointerUp.current
		], ([enabled, onPointerDown, onPointerUp]) => {
			this.#enabledSnapshot = enabled;
			this.#onPointerDownSnapshot = onPointerDown;
			this.#onPointerUpSnapshot = onPointerUp;
			if (enabled) {
				globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled);
				unsubEvents();
				unsubEvents = this.#addEventListeners();
			}
			return () => {
				this.#enabledSnapshot = false;
				unsubEvents();
				this.#resetSelectionLock();
				globalThis.bitsTextSelectionLayers.delete(this);
			};
		});
	}
	#addEventListeners() {
		return executeCallbacks(on(this.domContext.getDocument(), "pointerdown", this.#pointerdown), on(this.domContext.getDocument(), "pointerup", composeHandlers(this.#resetSelectionLock, this.#pointerupUserHandler)));
	}
	#pointerupUserHandler = (e) => {
		this.#onPointerUpSnapshot(e);
	};
	#pointerdown = (e) => {
		const node = this.opts.ref.current;
		const target = e.target;
		if (!isHTMLElement(node) || !isHTMLElement(target) || !this.#enabledSnapshot) return;
		/**
		* We only lock user-selection overflow if layer is the top most layer and
		* pointerdown occurred inside the node. You are still allowed to select text
		* outside the node provided pointerdown occurs outside the node.
		*/
		if (!isHighestLayer(this) || !contains(node, target)) return;
		this.#onPointerDownSnapshot(e);
		if (e.defaultPrevented) return;
		this.#unsubSelectionLock = preventTextSelectionOverflow(node, this.domContext.getDocument().body);
	};
	#resetSelectionLock = () => {
		this.#unsubSelectionLock();
		this.#unsubSelectionLock = noop;
	};
};
var getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node, body) {
	const originalBodyUserSelect = getUserSelect(body);
	const originalNodeUserSelect = getUserSelect(node);
	setUserSelect(body, "none");
	setUserSelect(node, "text");
	return () => {
		setUserSelect(body, originalBodyUserSelect);
		setUserSelect(node, originalNodeUserSelect);
	};
}
function setUserSelect(node, value) {
	node.style.userSelect = value;
	node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
	const layersArr = [...globalThis.bitsTextSelectionLayers];
	if (!layersArr.length) return false;
	const highestLayer = layersArr.at(-1);
	if (!highestLayer) return false;
	return highestLayer[0] === instance;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/text-selection-layer/text-selection-layer.svelte
function Text_selection_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { preventOverflowTextSelection = true, onPointerDown = noop, onPointerUp = noop, id, children, enabled, ref } = $$props;
		TextSelectionLayerState.create({
			id: boxWith(() => id),
			onPointerDown: boxWith(() => onPointerDown),
			onPointerUp: boxWith(() => onPointerUp),
			enabled: boxWith(() => enabled && preventOverflowTextSelection),
			ref
		});
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/internal/shared-state.svelte.js
var SharedState = class {
	#factory;
	#subscribers = 0;
	#state;
	#scope;
	constructor(factory) {
		this.#factory = factory;
	}
	#dispose() {
		this.#subscribers -= 1;
		if (this.#scope && this.#subscribers <= 0) {
			this.#scope();
			this.#state = void 0;
			this.#scope = void 0;
		}
	}
	get(...args) {
		this.#subscribers += 1;
		if (this.#state === void 0) this.#scope = () => {};
		return this.#state;
	}
};
//#endregion
//#region node_modules/bits-ui/dist/internal/body-scroll-lock.svelte.js
var lockMap = new SvelteMap();
var initialBodyStyle = null;
var cleanupTimeoutId = null;
var isInCleanupTransition = false;
var anyLocked = boxWith(() => {
	for (const value of lockMap.values()) if (value) return true;
	return false;
});
/**
* We track the time we scheduled the cleanup to prevent race conditions
* when multiple locks are created/destroyed in the same tick, ensuring
* only the last one to schedule the cleanup will run.
*
* reference: https://github.com/huntabyte/bits-ui/issues/1639
*/
var cleanupScheduledAt = null;
var bodyLockStackCount = new SharedState(() => {
	function resetBodyStyle() {}
	function cancelPendingCleanup() {
		if (cleanupTimeoutId === null) return;
		window.clearTimeout(cleanupTimeoutId);
		cleanupTimeoutId = null;
	}
	function scheduleCleanupIfNoNewLocks(delay, callback) {
		cancelPendingCleanup();
		isInCleanupTransition = true;
		cleanupScheduledAt = Date.now();
		const currentCleanupId = cleanupScheduledAt;
		/**
		* We schedule the cleanup to run after a delay to allow new locks to register
		* that might have been added in the same tick as the current cleanup.
		*
		* If a new lock is added in the same tick, the cleanup will be cancelled and
		* a new cleanup will be scheduled.
		*
		* This is to prevent the cleanup from running too early and resetting the body
		* style before the new lock has had a chance to apply its styles.
		*/
		const cleanupFn = () => {
			cleanupTimeoutId = null;
			if (cleanupScheduledAt !== currentCleanupId) return;
			if (!isAnyLocked(lockMap)) {
				isInCleanupTransition = false;
				callback();
			} else isInCleanupTransition = false;
		};
		const actualDelay = delay === null ? 24 : delay;
		cleanupTimeoutId = window.setTimeout(cleanupFn, actualDelay);
	}
	function ensureInitialStyleCaptured() {
		if (initialBodyStyle === null && lockMap.size === 0 && !isInCleanupTransition) initialBodyStyle = document.body.getAttribute("style");
	}
	watch(() => anyLocked.current, () => {
		if (!anyLocked.current) return;
		ensureInitialStyleCaptured();
		isInCleanupTransition = false;
		const htmlStyle = getComputedStyle(document.documentElement);
		const bodyStyle = getComputedStyle(document.body);
		const hasStableGutter = htmlStyle.scrollbarGutter?.includes("stable") || bodyStyle.scrollbarGutter?.includes("stable");
		const verticalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		const config = {
			padding: Number.parseInt(bodyStyle.paddingRight ?? "0", 10) + verticalScrollbarWidth,
			margin: Number.parseInt(bodyStyle.marginRight ?? "0", 10)
		};
		if (verticalScrollbarWidth > 0 && !hasStableGutter) {
			document.body.style.paddingRight = `${config.padding}px`;
			document.body.style.marginRight = `${config.margin}px`;
			document.body.style.setProperty("--scrollbar-width", `${verticalScrollbarWidth}px`);
		}
		document.body.style.overflow = "hidden";
		if (isIOS) on(document, "touchmove", (e) => {
			if (e.target !== document.documentElement) return;
			if (e.touches.length > 1) return;
			e.preventDefault();
		}, { passive: false });
		/**
		* We ensure pointer-events: none is applied _after_ DOM updates, so that any focus/
		* interaction changes from opening overlays/menus complete _before_ we block pointer
		* events.
		*
		* this avoids race conditions where pointer-events could be set too early and break
		* focus/interaction.
		*/
		afterTick(() => {
			document.body.style.pointerEvents = "none";
			document.body.style.overflow = "hidden";
		});
	});
	return {
		get lockMap() {
			return lockMap;
		},
		resetBodyStyle,
		scheduleCleanupIfNoNewLocks,
		cancelPendingCleanup,
		ensureInitialStyleCaptured
	};
});
var BodyScrollLock = class {
	#id = useId();
	#initialState;
	#restoreScrollDelay = () => null;
	#countState;
	locked;
	constructor(initialState, restoreScrollDelay = () => null) {
		this.#initialState = initialState;
		this.#restoreScrollDelay = restoreScrollDelay;
		this.#countState = bodyLockStackCount.get();
		if (!this.#countState) return;
		/**
		* Since a new lock is being created, we cancel any pending cleanup to
		* prevent the cleanup from running too early and resetting the body style
		* before the new lock has had a chance to apply its styles.
		*
		* reference: https://github.com/huntabyte/bits-ui/issues/1639
		*/
		this.#countState.cancelPendingCleanup();
		this.#countState.ensureInitialStyleCaptured();
		this.#countState.lockMap.set(this.#id, this.#initialState ?? false);
		this.locked = boxWith(() => this.#countState.lockMap.get(this.#id) ?? false, (v) => this.#countState.lockMap.set(this.#id, v));
	}
};
function isAnyLocked(map) {
	for (const [_, value] of map) if (value) return true;
	return false;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/scroll-lock/scroll-lock.svelte
function Scroll_lock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { preventScroll = true, restoreScrollDelay = null } = $$props;
		if (preventScroll) new BodyScrollLock(preventScroll, () => restoreScrollDelay);
	});
}
//#endregion
export { Dismissible_layer as a, MenuItemState as c, DOMTypeahead as d, boxAutoReset as f, onDestroyEffect as g, AnimationsComplete as h, Escape_layer as i, MenuMenuState as l, PresenceManager as m, Text_selection_layer as n, DropdownMenuTriggerState as o, Portal as p, Focus_scope as r, MenuContentState as s, Scroll_lock as t, MenuRootState as u };
