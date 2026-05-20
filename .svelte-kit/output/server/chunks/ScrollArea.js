import "./index-server.js";
import { a as bind_props, f as spread_props, i as attributes, o as derived, u as props_id } from "./dev.js";
import "./session.svelte.js";
import { J as Context, K as watch, Q as mergeProps, R as createBitsAttrs, W as IsMounted, Y as attachRef, at as simpleBox, c as createId, it as boxWith, q as useDebounce } from "./arrays.js";
import { h as AnimationsComplete } from "./scroll-lock.js";
import { i as DOMContext, t as useId } from "./use-id.js";
import { t as SvelteResizeObserver } from "./svelte-resize-observer.svelte.js";
//#region node_modules/bits-ui/dist/bits/utilities/presence-layer/presence.svelte.js
var Presence = class {
	opts;
	present;
	#afterAnimations;
	#isPresent = false;
	#hasMounted = false;
	#transitionStatus = void 0;
	#transitionFrame = null;
	constructor(opts) {
		this.opts = opts;
		this.present = this.opts.open;
		this.#isPresent = opts.open.current;
		this.#afterAnimations = new AnimationsComplete({
			ref: this.opts.ref,
			afterTick: this.opts.open
		});
		watch(() => this.present.current, (isOpen) => {
			if (!this.#hasMounted) {
				this.#hasMounted = true;
				return;
			}
			this.#clearTransitionFrame();
			if (isOpen) this.#isPresent = true;
			this.#transitionStatus = isOpen ? "starting" : "ending";
			if (isOpen) this.#transitionFrame = window.requestAnimationFrame(() => {
				this.#transitionFrame = null;
				if (this.present.current) this.#transitionStatus = void 0;
			});
			this.#afterAnimations.run(() => {
				if (isOpen !== this.present.current) return;
				if (!isOpen) this.#isPresent = false;
				this.#transitionStatus = void 0;
			});
		});
	}
	#_isPresent = derived(() => {
		return this.#isPresent;
	});
	get isPresent() {
		return this.#_isPresent();
	}
	set isPresent($$value) {
		return this.#_isPresent($$value);
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
//#region node_modules/bits-ui/dist/bits/utilities/presence-layer/presence-layer.svelte
function Presence_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open, forceMount, presence, ref } = $$props;
		const presenceState = new Presence({
			open: boxWith(() => open),
			ref
		});
		if (forceMount || open || presenceState.isPresent) {
			$$renderer.push("<!--[0-->");
			presence?.($$renderer, {
				present: presenceState.isPresent,
				transitionStatus: presenceState.transitionStatus
			});
			$$renderer.push(`<!---->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/internal/clamp.js
/**
* Clamps a number between a minimum and maximum value.
*/
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
//#endregion
//#region node_modules/bits-ui/dist/internal/state-machine.js
var StateMachine = class {
	state;
	#machine;
	constructor(initialState, machine) {
		this.state = simpleBox(initialState);
		this.#machine = machine;
		this.dispatch = this.dispatch.bind(this);
	}
	#reducer(event) {
		return this.#machine[this.state.current][event] ?? this.state.current;
	}
	dispatch(event) {
		this.state.current = this.#reducer(event);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/scroll-area.svelte.js
var scrollAreaAttrs = createBitsAttrs({
	component: "scroll-area",
	parts: [
		"root",
		"viewport",
		"corner",
		"thumb",
		"scrollbar"
	]
});
var ScrollAreaRootContext = new Context("ScrollArea.Root");
var ScrollAreaScrollbarContext = new Context("ScrollArea.Scrollbar");
var ScrollAreaScrollbarVisibleContext = new Context("ScrollArea.ScrollbarVisible");
var ScrollAreaScrollbarAxisContext = new Context("ScrollArea.ScrollbarAxis");
var ScrollAreaScrollbarSharedContext = new Context("ScrollArea.ScrollbarShared");
var ScrollAreaRootState = class ScrollAreaRootState {
	static create(opts) {
		return ScrollAreaRootContext.set(new ScrollAreaRootState(opts));
	}
	opts;
	attachment;
	scrollAreaNode = null;
	viewportNode = null;
	contentNode = null;
	scrollbarXNode = null;
	scrollbarYNode = null;
	cornerWidth = 0;
	cornerHeight = 0;
	scrollbarXEnabled = false;
	scrollbarYEnabled = false;
	domContext;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(opts.ref, (v) => this.scrollAreaNode = v);
		this.domContext = new DOMContext(opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		dir: this.opts.dir.current,
		style: {
			position: "relative",
			"--bits-scroll-area-corner-height": `${this.cornerHeight}px`,
			"--bits-scroll-area-corner-width": `${this.cornerWidth}px`
		},
		[scrollAreaAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ScrollAreaViewportState = class ScrollAreaViewportState {
	static create(opts) {
		return new ScrollAreaViewportState(opts, ScrollAreaRootContext.get());
	}
	opts;
	root;
	attachment;
	#contentId = simpleBox(useId());
	#contentRef = simpleBox(null);
	contentAttachment = attachRef(this.#contentRef, (v) => this.root.contentNode = v);
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref, (v) => this.root.viewportNode = v);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		style: {
			overflowX: this.root.scrollbarXEnabled ? "scroll" : "hidden",
			overflowY: this.root.scrollbarYEnabled ? "scroll" : "hidden"
		},
		[scrollAreaAttrs.viewport]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	#contentProps = derived(() => ({
		id: this.#contentId.current,
		"data-scroll-area-content": "",
		style: { minWidth: this.root.scrollbarXEnabled ? "fit-content" : void 0 },
		...this.contentAttachment
	}));
	get contentProps() {
		return this.#contentProps();
	}
	set contentProps($$value) {
		return this.#contentProps($$value);
	}
};
var ScrollAreaScrollbarState = class ScrollAreaScrollbarState {
	static create(opts) {
		return ScrollAreaScrollbarContext.set(new ScrollAreaScrollbarState(opts, ScrollAreaRootContext.get()));
	}
	opts;
	root;
	#isHorizontal = derived(() => this.opts.orientation.current === "horizontal");
	get isHorizontal() {
		return this.#isHorizontal();
	}
	set isHorizontal($$value) {
		return this.#isHorizontal($$value);
	}
	hasThumb = false;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		watch(() => this.isHorizontal, (isHorizontal) => {
			if (isHorizontal) {
				this.root.scrollbarXEnabled = true;
				return () => {
					this.root.scrollbarXEnabled = false;
				};
			} else {
				this.root.scrollbarYEnabled = true;
				return () => {
					this.root.scrollbarYEnabled = false;
				};
			}
		});
	}
};
var ScrollAreaScrollbarHoverState = class ScrollAreaScrollbarHoverState {
	static create() {
		return new ScrollAreaScrollbarHoverState(ScrollAreaScrollbarContext.get());
	}
	scrollbar;
	root;
	isVisible = false;
	constructor(scrollbar) {
		this.scrollbar = scrollbar;
		this.root = scrollbar.root;
	}
	#props = derived(() => ({ "data-state": this.isVisible ? "visible" : "hidden" }));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ScrollAreaScrollbarScrollState = class ScrollAreaScrollbarScrollState {
	static create() {
		return new ScrollAreaScrollbarScrollState(ScrollAreaScrollbarContext.get());
	}
	scrollbar;
	root;
	machine = new StateMachine("hidden", {
		hidden: { SCROLL: "scrolling" },
		scrolling: {
			SCROLL_END: "idle",
			POINTER_ENTER: "interacting"
		},
		interacting: {
			SCROLL: "interacting",
			POINTER_LEAVE: "idle"
		},
		idle: {
			HIDE: "hidden",
			SCROLL: "scrolling",
			POINTER_ENTER: "interacting"
		}
	});
	#isHidden = derived(() => this.machine.state.current === "hidden");
	get isHidden() {
		return this.#isHidden();
	}
	set isHidden($$value) {
		return this.#isHidden($$value);
	}
	constructor(scrollbar) {
		this.scrollbar = scrollbar;
		this.root = scrollbar.root;
		useDebounce(() => this.machine.dispatch("SCROLL_END"), 100);
		this.onpointerenter = this.onpointerenter.bind(this);
		this.onpointerleave = this.onpointerleave.bind(this);
	}
	onpointerenter(_) {
		this.machine.dispatch("POINTER_ENTER");
	}
	onpointerleave(_) {
		this.machine.dispatch("POINTER_LEAVE");
	}
	#props = derived(() => ({
		"data-state": this.machine.state.current === "hidden" ? "hidden" : "visible",
		onpointerenter: this.onpointerenter,
		onpointerleave: this.onpointerleave
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ScrollAreaScrollbarAutoState = class ScrollAreaScrollbarAutoState {
	static create() {
		return new ScrollAreaScrollbarAutoState(ScrollAreaScrollbarContext.get());
	}
	scrollbar;
	root;
	isVisible = false;
	constructor(scrollbar) {
		this.scrollbar = scrollbar;
		this.root = scrollbar.root;
		const handleResize = useDebounce(() => {
			const viewportNode = this.root.viewportNode;
			if (!viewportNode) return;
			const isOverflowX = viewportNode.offsetWidth < viewportNode.scrollWidth;
			const isOverflowY = viewportNode.offsetHeight < viewportNode.scrollHeight;
			this.isVisible = this.scrollbar.isHorizontal ? isOverflowX : isOverflowY;
		}, 10);
		new SvelteResizeObserver(() => this.root.viewportNode, handleResize);
		new SvelteResizeObserver(() => this.root.contentNode, handleResize);
	}
	#props = derived(() => ({ "data-state": this.isVisible ? "visible" : "hidden" }));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ScrollAreaScrollbarVisibleState = class ScrollAreaScrollbarVisibleState {
	static create() {
		return ScrollAreaScrollbarVisibleContext.set(new ScrollAreaScrollbarVisibleState(ScrollAreaScrollbarContext.get()));
	}
	scrollbar;
	root;
	thumbNode = null;
	pointerOffset = 0;
	sizes = {
		content: 0,
		viewport: 0,
		scrollbar: {
			size: 0,
			paddingStart: 0,
			paddingEnd: 0
		}
	};
	#thumbRatio = derived(() => getThumbRatio(this.sizes.viewport, this.sizes.content));
	get thumbRatio() {
		return this.#thumbRatio();
	}
	set thumbRatio($$value) {
		return this.#thumbRatio($$value);
	}
	#hasThumb = derived(() => Boolean(this.thumbRatio > 0 && this.thumbRatio < 1));
	get hasThumb() {
		return this.#hasThumb();
	}
	set hasThumb($$value) {
		return this.#hasThumb($$value);
	}
	prevTransformStyle = "";
	constructor(scrollbar) {
		this.scrollbar = scrollbar;
		this.root = scrollbar.root;
	}
	setSizes(sizes) {
		this.sizes = sizes;
	}
	getScrollPosition(pointerPos, dir) {
		return getScrollPositionFromPointer({
			pointerPos,
			pointerOffset: this.pointerOffset,
			sizes: this.sizes,
			dir
		});
	}
	onThumbPointerUp() {
		this.pointerOffset = 0;
	}
	onThumbPointerDown(pointerPos) {
		this.pointerOffset = pointerPos;
	}
	xOnThumbPositionChange() {
		if (!(this.root.viewportNode && this.thumbNode)) return;
		const scrollPos = this.root.viewportNode.scrollLeft;
		const transformStyle = `translate3d(${getThumbOffsetFromScroll({
			scrollPos,
			sizes: this.sizes,
			dir: this.root.opts.dir.current
		})}px, 0, 0)`;
		this.thumbNode.style.transform = transformStyle;
		this.prevTransformStyle = transformStyle;
	}
	xOnWheelScroll(scrollPos) {
		if (!this.root.viewportNode) return;
		this.root.viewportNode.scrollLeft = scrollPos;
	}
	xOnDragScroll(pointerPos) {
		if (!this.root.viewportNode) return;
		this.root.viewportNode.scrollLeft = this.getScrollPosition(pointerPos, this.root.opts.dir.current);
	}
	yOnThumbPositionChange() {
		if (!(this.root.viewportNode && this.thumbNode)) return;
		const scrollPos = this.root.viewportNode.scrollTop;
		const transformStyle = `translate3d(0, ${getThumbOffsetFromScroll({
			scrollPos,
			sizes: this.sizes
		})}px, 0)`;
		this.thumbNode.style.transform = transformStyle;
		this.prevTransformStyle = transformStyle;
	}
	yOnWheelScroll(scrollPos) {
		if (!this.root.viewportNode) return;
		this.root.viewportNode.scrollTop = scrollPos;
	}
	yOnDragScroll(pointerPos) {
		if (!this.root.viewportNode) return;
		this.root.viewportNode.scrollTop = this.getScrollPosition(pointerPos, this.root.opts.dir.current);
	}
};
var ScrollAreaScrollbarXState = class ScrollAreaScrollbarXState {
	static create(opts) {
		return ScrollAreaScrollbarAxisContext.set(new ScrollAreaScrollbarXState(opts, ScrollAreaScrollbarVisibleContext.get()));
	}
	opts;
	scrollbarVis;
	root;
	scrollbar;
	attachment;
	computedStyle;
	constructor(opts, scrollbarVis) {
		this.opts = opts;
		this.scrollbarVis = scrollbarVis;
		this.root = scrollbarVis.root;
		this.scrollbar = scrollbarVis.scrollbar;
		this.attachment = attachRef(this.scrollbar.opts.ref, (v) => this.root.scrollbarXNode = v);
	}
	onThumbPointerDown = (pointerPos) => {
		this.scrollbarVis.onThumbPointerDown(pointerPos.x);
	};
	onDragScroll = (pointerPos) => {
		this.scrollbarVis.xOnDragScroll(pointerPos.x);
	};
	onThumbPointerUp = () => {
		this.scrollbarVis.onThumbPointerUp();
	};
	onThumbPositionChange = () => {
		this.scrollbarVis.xOnThumbPositionChange();
	};
	onWheelScroll = (e, maxScrollPos) => {
		if (!this.root.viewportNode) return;
		const scrollPos = this.root.viewportNode.scrollLeft + e.deltaX;
		this.scrollbarVis.xOnWheelScroll(scrollPos);
		if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) e.preventDefault();
	};
	onResize = () => {
		if (!(this.scrollbar.opts.ref.current && this.root.viewportNode && this.computedStyle)) return;
		this.scrollbarVis.setSizes({
			content: this.root.viewportNode.scrollWidth,
			viewport: this.root.viewportNode.offsetWidth,
			scrollbar: {
				size: this.scrollbar.opts.ref.current.clientWidth,
				paddingStart: toInt(this.computedStyle.paddingLeft),
				paddingEnd: toInt(this.computedStyle.paddingRight)
			}
		});
	};
	#thumbSize = derived(() => {
		return getThumbSize(this.scrollbarVis.sizes);
	});
	get thumbSize() {
		return this.#thumbSize();
	}
	set thumbSize($$value) {
		return this.#thumbSize($$value);
	}
	#props = derived(() => ({
		id: this.scrollbar.opts.id.current,
		"data-orientation": "horizontal",
		style: {
			bottom: 0,
			left: this.root.opts.dir.current === "rtl" ? "var(--bits-scroll-area-corner-width)" : 0,
			right: this.root.opts.dir.current === "ltr" ? "var(--bits-scroll-area-corner-width)" : 0,
			"--bits-scroll-area-thumb-width": `${this.thumbSize}px`
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
var ScrollAreaScrollbarYState = class ScrollAreaScrollbarYState {
	static create(opts) {
		return ScrollAreaScrollbarAxisContext.set(new ScrollAreaScrollbarYState(opts, ScrollAreaScrollbarVisibleContext.get()));
	}
	opts;
	scrollbarVis;
	root;
	scrollbar;
	attachment;
	computedStyle;
	constructor(opts, scrollbarVis) {
		this.opts = opts;
		this.scrollbarVis = scrollbarVis;
		this.root = scrollbarVis.root;
		this.scrollbar = scrollbarVis.scrollbar;
		this.attachment = attachRef(this.scrollbar.opts.ref, (v) => this.root.scrollbarYNode = v);
		this.onThumbPointerDown = this.onThumbPointerDown.bind(this);
		this.onDragScroll = this.onDragScroll.bind(this);
		this.onThumbPointerUp = this.onThumbPointerUp.bind(this);
		this.onThumbPositionChange = this.onThumbPositionChange.bind(this);
		this.onWheelScroll = this.onWheelScroll.bind(this);
		this.onResize = this.onResize.bind(this);
	}
	onThumbPointerDown(pointerPos) {
		this.scrollbarVis.onThumbPointerDown(pointerPos.y);
	}
	onDragScroll(pointerPos) {
		this.scrollbarVis.yOnDragScroll(pointerPos.y);
	}
	onThumbPointerUp() {
		this.scrollbarVis.onThumbPointerUp();
	}
	onThumbPositionChange() {
		this.scrollbarVis.yOnThumbPositionChange();
	}
	onWheelScroll(e, maxScrollPos) {
		if (!this.root.viewportNode) return;
		const scrollPos = this.root.viewportNode.scrollTop + e.deltaY;
		this.scrollbarVis.yOnWheelScroll(scrollPos);
		if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) e.preventDefault();
	}
	onResize() {
		if (!(this.scrollbar.opts.ref.current && this.root.viewportNode && this.computedStyle)) return;
		this.scrollbarVis.setSizes({
			content: this.root.viewportNode.scrollHeight,
			viewport: this.root.viewportNode.offsetHeight,
			scrollbar: {
				size: this.scrollbar.opts.ref.current.clientHeight,
				paddingStart: toInt(this.computedStyle.paddingTop),
				paddingEnd: toInt(this.computedStyle.paddingBottom)
			}
		});
	}
	#thumbSize = derived(() => {
		return getThumbSize(this.scrollbarVis.sizes);
	});
	get thumbSize() {
		return this.#thumbSize();
	}
	set thumbSize($$value) {
		return this.#thumbSize($$value);
	}
	#props = derived(() => ({
		id: this.scrollbar.opts.id.current,
		"data-orientation": "vertical",
		style: {
			top: 0,
			right: this.root.opts.dir.current === "ltr" ? 0 : void 0,
			left: this.root.opts.dir.current === "rtl" ? 0 : void 0,
			bottom: "var(--bits-scroll-area-corner-height)",
			"--bits-scroll-area-thumb-height": `${this.thumbSize}px`
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
var ScrollAreaScrollbarSharedState = class ScrollAreaScrollbarSharedState {
	static create() {
		return ScrollAreaScrollbarSharedContext.set(new ScrollAreaScrollbarSharedState(ScrollAreaScrollbarAxisContext.get()));
	}
	scrollbarState;
	root;
	scrollbarVis;
	scrollbar;
	rect = null;
	prevWebkitUserSelect = "";
	handleResize;
	handleThumbPositionChange;
	handleWheelScroll;
	handleThumbPointerDown;
	handleThumbPointerUp;
	#maxScrollPos = derived(() => this.scrollbarVis.sizes.content - this.scrollbarVis.sizes.viewport);
	get maxScrollPos() {
		return this.#maxScrollPos();
	}
	set maxScrollPos($$value) {
		return this.#maxScrollPos($$value);
	}
	constructor(scrollbarState) {
		this.scrollbarState = scrollbarState;
		this.root = scrollbarState.root;
		this.scrollbarVis = scrollbarState.scrollbarVis;
		this.scrollbar = scrollbarState.scrollbarVis.scrollbar;
		this.handleResize = useDebounce(() => this.scrollbarState.onResize(), 10);
		this.handleThumbPositionChange = this.scrollbarState.onThumbPositionChange;
		this.handleWheelScroll = this.scrollbarState.onWheelScroll;
		this.handleThumbPointerDown = this.scrollbarState.onThumbPointerDown;
		this.handleThumbPointerUp = this.scrollbarState.onThumbPointerUp;
		new SvelteResizeObserver(() => this.scrollbar.opts.ref.current, this.handleResize);
		new SvelteResizeObserver(() => this.root.contentNode, this.handleResize);
		this.onpointerdown = this.onpointerdown.bind(this);
		this.onpointermove = this.onpointermove.bind(this);
		this.onpointerup = this.onpointerup.bind(this);
		this.onlostpointercapture = this.onlostpointercapture.bind(this);
	}
	handleDragScroll(e) {
		if (!this.rect) return;
		const x = e.clientX - this.rect.left;
		const y = e.clientY - this.rect.top;
		this.scrollbarState.onDragScroll({
			x,
			y
		});
	}
	#cleanupPointerState() {
		if (this.rect === null) return;
		this.root.domContext.getDocument().body.style.webkitUserSelect = this.prevWebkitUserSelect;
		if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "";
		this.rect = null;
	}
	onpointerdown(e) {
		if (e.button !== 0) return;
		e.target.setPointerCapture(e.pointerId);
		this.rect = this.scrollbar.opts.ref.current?.getBoundingClientRect() ?? null;
		this.prevWebkitUserSelect = this.root.domContext.getDocument().body.style.webkitUserSelect;
		this.root.domContext.getDocument().body.style.webkitUserSelect = "none";
		if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "auto";
		this.handleDragScroll(e);
	}
	onpointermove(e) {
		this.handleDragScroll(e);
	}
	onpointerup(e) {
		const target = e.target;
		if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId);
		this.#cleanupPointerState();
	}
	onlostpointercapture(_) {
		this.#cleanupPointerState();
	}
	#props = derived(() => mergeProps({
		...this.scrollbarState.props,
		style: {
			position: "absolute",
			...this.scrollbarState.props.style
		},
		[scrollAreaAttrs.scrollbar]: "",
		onpointerdown: this.onpointerdown,
		onpointermove: this.onpointermove,
		onpointerup: this.onpointerup,
		onlostpointercapture: this.onlostpointercapture
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ScrollAreaThumbImplState = class ScrollAreaThumbImplState {
	static create(opts) {
		return new ScrollAreaThumbImplState(opts, ScrollAreaScrollbarSharedContext.get());
	}
	opts;
	scrollbarState;
	attachment;
	#root;
	#removeUnlinkedScrollListener;
	#debounceScrollEnd = useDebounce(() => {
		if (this.#removeUnlinkedScrollListener) {
			this.#removeUnlinkedScrollListener();
			this.#removeUnlinkedScrollListener = void 0;
		}
	}, 100);
	constructor(opts, scrollbarState) {
		this.opts = opts;
		this.scrollbarState = scrollbarState;
		this.#root = scrollbarState.root;
		this.attachment = attachRef(this.opts.ref, (v) => this.scrollbarState.scrollbarVis.thumbNode = v);
		this.onpointerdowncapture = this.onpointerdowncapture.bind(this);
		this.onpointerup = this.onpointerup.bind(this);
	}
	onpointerdowncapture(e) {
		const thumb = e.target;
		if (!thumb) return;
		const thumbRect = thumb.getBoundingClientRect();
		const x = e.clientX - thumbRect.left;
		const y = e.clientY - thumbRect.top;
		this.scrollbarState.handleThumbPointerDown({
			x,
			y
		});
	}
	onpointerup(_) {
		this.scrollbarState.handleThumbPointerUp();
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-state": this.scrollbarState.scrollbarVis.hasThumb ? "visible" : "hidden",
		style: {
			width: "var(--bits-scroll-area-thumb-width)",
			height: "var(--bits-scroll-area-thumb-height)",
			transform: this.scrollbarState.scrollbarVis.prevTransformStyle
		},
		onpointerdowncapture: this.onpointerdowncapture,
		onpointerup: this.onpointerup,
		[scrollAreaAttrs.thumb]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function toInt(value) {
	return value ? Number.parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
	const ratio = viewportSize / contentSize;
	return Number.isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
	const ratio = getThumbRatio(sizes.viewport, sizes.content);
	const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
	const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
	return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer({ pointerPos, pointerOffset, sizes, dir = "ltr" }) {
	const thumbSizePx = getThumbSize(sizes);
	const thumbCenter = thumbSizePx / 2;
	const offset = pointerOffset || thumbCenter;
	const thumbOffsetFromEnd = thumbSizePx - offset;
	const minPointerPos = sizes.scrollbar.paddingStart + offset;
	const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
	const maxScrollPos = sizes.content - sizes.viewport;
	const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
	return linearScale([minPointerPos, maxPointerPos], scrollRange)(pointerPos);
}
function getThumbOffsetFromScroll({ scrollPos, sizes, dir = "ltr" }) {
	const thumbSizePx = getThumbSize(sizes);
	const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
	const scrollbar = sizes.scrollbar.size - scrollbarPadding;
	const maxScrollPos = sizes.content - sizes.viewport;
	const maxThumbPos = scrollbar - thumbSizePx;
	const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
	const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange[0], scrollClampRange[1]);
	return linearScale([0, maxScrollPos], [0, maxThumbPos])(scrollWithoutMomentum);
}
function linearScale(input, output) {
	return (value) => {
		if (input[0] === input[1] || output[0] === output[1]) return output[0];
		const ratio = (output[1] - output[0]) / (input[1] - input[0]);
		return output[0] + ratio * (value - input[0]);
	};
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
	return scrollPos > 0 && scrollPos < maxScrollPos;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area.svelte
function Scroll_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { ref = null, id = createId(uid), type = "hover", dir = "ltr", scrollHideDelay = 600, children, child, $$slots, $$events, ...restProps } = $$props;
		const rootState = ScrollAreaRootState.create({
			type: boxWith(() => type),
			dir: boxWith(() => dir),
			scrollHideDelay: boxWith(() => scrollHideDelay),
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
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-viewport.svelte
function Scroll_area_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { ref = null, id = createId(uid), children, $$slots, $$events, ...restProps } = $$props;
		const viewportState = ScrollAreaViewportState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, viewportState.props));
		const mergedContentProps = derived(() => mergeProps({}, viewportState.contentProps));
		$$renderer.push(`<div${attributes({ ...mergedProps() })}><div${attributes({ ...mergedContentProps() })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-shared.svelte
function Scroll_area_scrollbar_shared($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { child, children, $$slots, $$events, ...restProps } = $$props;
		const scrollbarSharedState = ScrollAreaScrollbarSharedState.create();
		const mergedProps = derived(() => mergeProps(restProps, scrollbarSharedState.props));
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
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-x.svelte
function Scroll_area_scrollbar_x($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		const isMounted = new IsMounted();
		const scrollbarXState = ScrollAreaScrollbarXState.create({ mounted: boxWith(() => isMounted.current) });
		Scroll_area_scrollbar_shared($$renderer, spread_props([derived(() => mergeProps(restProps, scrollbarXState.props))()]));
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-y.svelte
function Scroll_area_scrollbar_y($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		const isMounted = new IsMounted();
		const scrollbarYState = ScrollAreaScrollbarYState.create({ mounted: boxWith(() => isMounted.current) });
		Scroll_area_scrollbar_shared($$renderer, spread_props([derived(() => mergeProps(restProps, scrollbarYState.props))()]));
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-visible.svelte
function Scroll_area_scrollbar_visible($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		if (ScrollAreaScrollbarVisibleState.create().scrollbar.opts.orientation.current === "horizontal") {
			$$renderer.push("<!--[0-->");
			Scroll_area_scrollbar_x($$renderer, spread_props([restProps]));
		} else {
			$$renderer.push("<!--[-1-->");
			Scroll_area_scrollbar_y($$renderer, spread_props([restProps]));
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-auto.svelte
function Scroll_area_scrollbar_auto($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();
		const mergedProps = derived(() => mergeProps(restProps, scrollbarAutoState.props));
		{
			function presence($$renderer) {
				Scroll_area_scrollbar_visible($$renderer, spread_props([mergedProps()]));
			}
			Presence_layer($$renderer, {
				open: forceMount || scrollbarAutoState.isVisible,
				ref: scrollbarAutoState.scrollbar.opts.ref,
				presence,
				$$slots: { presence: true }
			});
		}
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-scroll.svelte
function Scroll_area_scrollbar_scroll($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarScrollState = ScrollAreaScrollbarScrollState.create();
		const mergedProps = derived(() => mergeProps(restProps, scrollbarScrollState.props));
		{
			function presence($$renderer) {
				Scroll_area_scrollbar_visible($$renderer, spread_props([mergedProps()]));
			}
			Presence_layer($$renderer, spread_props([mergedProps(), {
				open: forceMount || !scrollbarScrollState.isHidden,
				ref: scrollbarScrollState.scrollbar.opts.ref,
				presence,
				$$slots: { presence: true }
			}]));
		}
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar-hover.svelte
function Scroll_area_scrollbar_hover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarHoverState = ScrollAreaScrollbarHoverState.create();
		const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();
		const mergedProps = derived(() => mergeProps(restProps, scrollbarHoverState.props, scrollbarAutoState.props, { "data-state": scrollbarHoverState.isVisible ? "visible" : "hidden" }));
		const open = derived(() => forceMount || scrollbarHoverState.isVisible && scrollbarAutoState.isVisible);
		{
			function presence($$renderer) {
				Scroll_area_scrollbar_visible($$renderer, spread_props([mergedProps()]));
			}
			Presence_layer($$renderer, {
				open: open(),
				ref: scrollbarAutoState.scrollbar.opts.ref,
				presence,
				$$slots: { presence: true }
			});
		}
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-scrollbar.svelte
function Scroll_area_scrollbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { ref = null, id = createId(uid), orientation, $$slots, $$events, ...restProps } = $$props;
		const scrollbarState = ScrollAreaScrollbarState.create({
			orientation: boxWith(() => orientation),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const type = derived(() => scrollbarState.root.opts.type.current);
		if (type() === "hover") {
			$$renderer.push("<!--[0-->");
			Scroll_area_scrollbar_hover($$renderer, spread_props([restProps, { id }]));
		} else if (type() === "scroll") {
			$$renderer.push("<!--[1-->");
			Scroll_area_scrollbar_scroll($$renderer, spread_props([restProps, { id }]));
		} else if (type() === "auto") {
			$$renderer.push("<!--[2-->");
			Scroll_area_scrollbar_auto($$renderer, spread_props([restProps, { id }]));
		} else if (type() === "always") {
			$$renderer.push("<!--[3-->");
			Scroll_area_scrollbar_visible($$renderer, spread_props([restProps, { id }]));
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-thumb-impl.svelte
function Scroll_area_thumb_impl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, id, child, children, present, $$slots, $$events, ...restProps } = $$props;
		const isMounted = new IsMounted();
		const thumbState = ScrollAreaThumbImplState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			mounted: boxWith(() => isMounted.current)
		});
		const mergedProps = derived(() => mergeProps(restProps, thumbState.props, { style: { hidden: !present } }));
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
//#region node_modules/bits-ui/dist/bits/scroll-area/components/scroll-area-thumb.svelte
function Scroll_area_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarState = ScrollAreaScrollbarVisibleContext.get();
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			{
				function presence($$renderer, { present }) {
					Scroll_area_thumb_impl($$renderer, spread_props([restProps, {
						id,
						present,
						get ref() {
							return ref;
						},
						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}]));
				}
				Presence_layer($$renderer, {
					open: forceMount || scrollbarState.hasThumb,
					ref: scrollbarState.scrollbar.opts.ref,
					presence,
					$$slots: { presence: true }
				});
			}
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
//#region src/lib/components/ui/ScrollArea.svelte
function ScrollArea_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, orientation = "vertical", class: className = "" } = $$props;
		if (Scroll_area) {
			$$renderer.push("<!--[-->");
			Scroll_area($$renderer, {
				class: `hb-scroll-area ${className}`.trim(),
				children: ($$renderer) => {
					if (Scroll_area_viewport) {
						$$renderer.push("<!--[-->");
						Scroll_area_viewport($$renderer, {
							class: "hb-scroll-area__viewport",
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
					$$renderer.push(` `);
					if (Scroll_area_scrollbar) {
						$$renderer.push("<!--[-->");
						Scroll_area_scrollbar($$renderer, {
							class: "hb-scroll-area__bar",
							orientation,
							children: ($$renderer) => {
								if (Scroll_area_thumb) {
									$$renderer.push("<!--[-->");
									Scroll_area_thumb($$renderer, { class: "hb-scroll-area__thumb" });
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
export { ScrollArea_1 as t };
