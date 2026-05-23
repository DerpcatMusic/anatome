import { r as tick } from "./index-server.js";
import { V as snapshot, _t as getContext, o as derived, yt as setContext } from "./dev.js";
import { r as on } from "./events.js";
import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { anyApi, componentsGeneric, getFunctionName } from "convex/server";
import { convexToJson } from "convex/values";
//#region \0virtual:env/static/public
/** @type {import('$env/static/public').PUBLIC_CONVEX_CLIENT_URL} */
var PUBLIC_CONVEX_CLIENT_URL = "https://honorable-woodpecker-450.eu-west-1.convex.cloud";
/** @type {import('$env/static/public').PUBLIC_MUX_ENV_KEY} */
var PUBLIC_MUX_ENV_KEY = "207m4eoo0h6dnrqh4b2u41adu";
//#endregion
//#region node_modules/convex-svelte/dist/client.svelte.js
var _contextKey = "$$_convexClient";
var useConvexClient = () => {
	const client = getContext(_contextKey);
	if (!client) throw new Error("No ConvexClient was found in Svelte context. Did you forget to call setupConvex() in a parent component?");
	return client;
};
var setConvexClientContext = (client) => {
	setContext(_contextKey, client);
};
var setupConvex = (url, options = {}) => {
	if (!url || typeof url !== "string") throw new Error("Expected string url property for setupConvex");
	setConvexClientContext(new ConvexClient(url, {
		disabled: true,
		...options
	}));
};
var SKIP = Symbol("convex.useQuery.skip");
/**
* Subscribe to a Convex query and return a reactive query result object.
* Pass reactive args object or a closure returning args to update args reactively.
*
* Supports React-style `"skip"` to avoid subscribing:
*   useQuery(api.users.get, () => (isAuthed ? {} : 'skip'))
*
* @param query - a FunctionReference like `api.dir1.dir2.filename.func`.
* @param args - Arguments object / closure, or the string `"skip"` (or a closure returning it).
* @param options - UseQueryOptions like `initialData` and `keepPreviousData`.
* @returns an object containing data, isLoading, error, and isStale.
*/
function useQuery(query, args = {}, options = {}) {
	const client = useConvexClient();
	if (typeof query === "string") throw new Error("Query must be a functionReference object, not a string");
	const state = {
		result: parseOptions(options).initialData,
		lastResult: void 0,
		argsForLastResult: void 0,
		haveArgsEverChanged: false
	};
	const currentArgs = derived(() => parseArgs(args));
	parseArgs(args);
	const sameArgsAsLastResult = derived(() => state.argsForLastResult !== void 0 && currentArgs() !== SKIP && state.argsForLastResult !== SKIP && jsonEqualArgs(state.argsForLastResult, currentArgs()));
	const staleAllowed = derived(() => !!(parseOptions(options).keepPreviousData && state.lastResult));
	const isSkipped = derived(() => currentArgs() === SKIP);
	const syncResult = derived(() => {
		if (isSkipped()) return void 0;
		if (parseOptions(options).initialData && !state.haveArgsEverChanged) return state.result;
		let value;
		try {
			value = client.disabled ? void 0 : client.client.localQueryResult(getFunctionName(query), currentArgs());
		} catch (e) {
			if (!(e instanceof Error)) {
				console.error("threw non-Error instance", e);
				throw e;
			}
			value = e;
		}
		state.result;
		return value;
	});
	const result = derived(() => {
		return syncResult() !== void 0 ? syncResult() : staleAllowed() ? state.lastResult : void 0;
	});
	const isStale = derived(() => !isSkipped() && syncResult() === void 0 && staleAllowed() && !sameArgsAsLastResult() && result() !== void 0);
	const data = derived(() => {
		if (result() instanceof Error) return void 0;
		return result();
	});
	const error = derived(() => {
		if (result() instanceof Error) return result();
	});
	return {
		get data() {
			return data();
		},
		get isLoading() {
			return isSkipped() ? false : error() === void 0 && data() === void 0;
		},
		get error() {
			return error();
		},
		get isStale() {
			return isSkipped() ? false : isStale();
		}
	};
}
/**
*  args can be an object, "skip", or a closure returning either
**/
function parseArgs(args) {
	if (typeof args === "function") args = args();
	if (args === "skip") return SKIP;
	return snapshot(args);
}
function parseOptions(options) {
	if (typeof options === "function") options = options();
	return snapshot(options);
}
function jsonEqualArgs(a, b) {
	return JSON.stringify(convexToJson(a)) === JSON.stringify(convexToJson(b));
}
//#endregion
//#region node_modules/runed/dist/internal/configurable-globals.js
var defaultWindow = void 0;
//#endregion
//#region node_modules/runed/dist/internal/utils/dom.js
/**
* Handles getting the active element in a document or shadow root.
* If the active element is within a shadow root, it will traverse the shadow root
* to find the active element.
* If not, it will return the active element in the document.
*
* @param document A document or shadow root to get the active element from.
* @returns The active element in the document or shadow root.
*/
function getActiveElement(document) {
	let activeElement = document.activeElement;
	while (activeElement?.shadowRoot) {
		const node = activeElement.shadowRoot.activeElement;
		if (node === activeElement) break;
		else activeElement = node;
	}
	return activeElement;
}
globalThis.Date;
globalThis.Set;
var SvelteMap = globalThis.Map;
globalThis.URL;
globalThis.URLSearchParams;
/**
* @param {any} _
*/
function createSubscriber(_) {
	return () => {};
}
//#endregion
//#region node_modules/runed/dist/utilities/active-element/active-element.svelte.js
var ActiveElement = class {
	#document;
	#subscribe;
	constructor(options = {}) {
		const { window = defaultWindow, document = window?.document } = options;
		if (window === void 0) return;
		this.#document = document;
		this.#subscribe = createSubscriber((update) => {
			const cleanupFocusIn = on(window, "focusin", update);
			const cleanupFocusOut = on(window, "focusout", update);
			return () => {
				cleanupFocusIn();
				cleanupFocusOut();
			};
		});
	}
	get current() {
		this.#subscribe?.();
		if (!this.#document) return null;
		return getActiveElement(this.#document);
	}
};
new ActiveElement();
//#endregion
//#region node_modules/runed/dist/internal/utils/is.js
function isFunction(value) {
	return typeof value === "function";
}
//#endregion
//#region node_modules/runed/dist/utilities/extract/extract.svelte.js
function extract(value, defaultValue) {
	if (isFunction(value)) {
		const gotten = value();
		if (gotten === void 0) return defaultValue;
		return gotten;
	}
	if (value === void 0) return defaultValue;
	return value;
}
//#endregion
//#region node_modules/runed/dist/utilities/animation-frames/animation-frames.svelte.js
var AnimationFrames = class {
	#callback;
	#fpsLimitOption = 0;
	#fpsLimit = derived(() => extract(this.#fpsLimitOption) ?? 0);
	#previousTimestamp = null;
	#frame = null;
	#fps = 0;
	#running = false;
	#window = defaultWindow;
	constructor(callback, options = {}) {
		if (options.window) this.#window = options.window;
		this.#fpsLimitOption = options.fpsLimit;
		this.#callback = callback;
		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);
		this.toggle = this.toggle.bind(this);
	}
	#loop(timestamp) {
		if (!this.#running || !this.#window) return;
		if (this.#previousTimestamp === null) this.#previousTimestamp = timestamp;
		const delta = timestamp - this.#previousTimestamp;
		const fps = 1e3 / delta;
		if (this.#fpsLimit() && fps > this.#fpsLimit()) {
			this.#frame = this.#window.requestAnimationFrame(this.#loop.bind(this));
			return;
		}
		this.#fps = fps;
		this.#previousTimestamp = timestamp;
		this.#callback({
			delta,
			timestamp
		});
		this.#frame = this.#window.requestAnimationFrame(this.#loop.bind(this));
	}
	start() {
		if (!this.#window) return;
		this.#running = true;
		this.#previousTimestamp = 0;
		this.#frame = this.#window.requestAnimationFrame(this.#loop.bind(this));
	}
	stop() {
		if (!this.#frame || !this.#window) return;
		this.#running = false;
		this.#window.cancelAnimationFrame(this.#frame);
		this.#frame = null;
	}
	toggle() {
		this.#running ? this.stop() : this.start();
	}
	get fps() {
		return !this.#running ? 0 : this.#fps;
	}
	get running() {
		return this.#running;
	}
};
//#endregion
//#region node_modules/runed/dist/utilities/use-debounce/use-debounce.svelte.js
function useDebounce(callback, wait) {
	let context = null;
	const wait$ = derived(() => extract(wait, 250));
	function debounced(...args) {
		if (context) {
			if (context.timeout) clearTimeout(context.timeout);
		} else {
			let resolve;
			let reject;
			context = {
				timeout: null,
				runner: null,
				promise: new Promise((res, rej) => {
					resolve = res;
					reject = rej;
				}),
				resolve,
				reject
			};
		}
		context.runner = async () => {
			if (!context) return;
			const ctx = context;
			context = null;
			try {
				ctx.resolve(await callback.apply(this, args));
			} catch (error) {
				ctx.reject(error);
			}
		};
		context.timeout = setTimeout(context.runner, wait$());
		return context.promise;
	}
	debounced.cancel = async () => {
		if (!context || context.timeout === null) {
			await new Promise((resolve) => setTimeout(resolve, 0));
			if (!context || context.timeout === null) return;
		}
		clearTimeout(context.timeout);
		context.reject("Cancelled");
		context = null;
	};
	debounced.runScheduledNow = async () => {
		if (!context || !context.timeout) {
			await new Promise((resolve) => setTimeout(resolve, 0));
			if (!context || !context.timeout) return;
		}
		clearTimeout(context.timeout);
		context.timeout = null;
		await context.runner?.();
	};
	Object.defineProperty(debounced, "pending", {
		enumerable: true,
		get() {
			return !!context?.timeout;
		}
	});
	return debounced;
}
//#endregion
//#region node_modules/runed/dist/utilities/watch/watch.svelte.js
function runWatcher(sources, flush, effect, options = {}) {
	const { lazy = false } = options;
}
function watch(sources, effect, options) {
	runWatcher(sources, "post", effect, options);
}
function watchPre(sources, effect, options) {
	runWatcher(sources, "pre", effect, options);
}
watch.pre = watchPre;
function watchOnce(source, effect) {}
function watchOncePre(source, effect) {}
watchOnce.pre = watchOncePre;
//#endregion
//#region node_modules/runed/dist/internal/utils/function.js
function noop() {}
//#endregion
//#region node_modules/runed/dist/utilities/use-resize-observer/use-resize-observer.svelte.js
function useResizeObserver(target, callback, options = {}) {
	const { window = defaultWindow } = options;
	derived(() => {
		const value = extract(target);
		return new Set(value ? Array.isArray(value) ? value : [value] : []);
	});
	const stop = () => {};
	return { stop };
}
//#endregion
//#region node_modules/runed/dist/utilities/use-event-listener/use-event-listener.svelte.js
function useEventListener(_target, _events, handler, options) {}
//#endregion
//#region node_modules/runed/dist/utilities/persisted-state/persisted-state.svelte.js
function getStorage(storageType, window) {
	switch (storageType) {
		case "local": return window.localStorage;
		case "session": return window.sessionStorage;
	}
}
function proxy(value, root, proxies, subscribe, update, serialize) {
	if (value === null || typeof value !== "object") return value;
	const proto = Object.getPrototypeOf(value);
	if (proto !== null && proto !== Object.prototype && !Array.isArray(value)) return value;
	let p = proxies.get(value);
	if (!p) {
		p = new Proxy(value, {
			get: (target, property) => {
				subscribe?.();
				return proxy(Reflect.get(target, property), root, proxies, subscribe, update, serialize);
			},
			set: (target, property, value) => {
				update?.();
				Reflect.set(target, property, value);
				serialize(root);
				return true;
			}
		});
		proxies.set(value, p);
	}
	return p;
}
/**
* Creates reactive state that is persisted and synchronized across browser sessions and tabs using Web Storage.
* @param key The unique key used to store the state in the storage.
* @param initialValue The initial value of the state if not already present in the storage.
* @param options Configuration options including storage type, serializer for complex data types, and whether to sync state changes across tabs.
*
* @see {@link https://runed.dev/docs/utilities/persisted-state}
*/
var PersistedState = class {
	#current;
	#key;
	#serializer;
	#storage;
	#subscribe;
	#update;
	#proxies = /* @__PURE__ */ new WeakMap();
	#connected;
	#storageCleanup;
	#window;
	#syncTabs;
	#storageType;
	constructor(key, initialValue, options = {}) {
		const { storage: storageType = "local", serializer = {
			serialize: JSON.stringify,
			deserialize: JSON.parse
		}, syncTabs = true, connected = true } = options;
		const window = "window" in options ? options.window : defaultWindow;
		this.#current = initialValue;
		this.#key = key;
		this.#serializer = serializer;
		this.#connected = connected;
		this.#window = window;
		this.#syncTabs = syncTabs;
		this.#storageType = storageType;
		if (window === void 0) return;
		const storage = getStorage(storageType, window);
		this.#storage = storage;
		const existingValue = storage.getItem(key);
		if (existingValue !== null) this.#current = this.#deserialize(existingValue);
		else if (connected) this.#serialize(initialValue);
		this.#setupStorageListener();
	}
	get current() {
		this.#subscribe?.();
		let root;
		if (this.#connected) {
			const storageItem = this.#storage?.getItem(this.#key);
			root = storageItem ? this.#deserialize(storageItem) : this.#current;
		} else root = this.#current;
		return proxy(root, root, this.#proxies, this.#subscribe?.bind(this), this.#update?.bind(this), this.#serialize.bind(this));
	}
	set current(newValue) {
		this.#serialize(newValue);
		this.#update?.();
	}
	#handleStorageEvent = (event) => {
		if (event.key !== this.#key || event.newValue === null) return;
		this.#current = this.#deserialize(event.newValue);
		this.#update?.();
	};
	#deserialize(value) {
		try {
			return this.#serializer.deserialize(value);
		} catch (error) {
			console.error(`Error when parsing "${value}" from persisted store "${this.#key}"`, error);
			return;
		}
	}
	#serialize(value) {
		if (!this.#connected) {
			this.#current = value;
			return;
		}
		try {
			if (value !== void 0) this.#storage?.setItem(this.#key, this.#serializer.serialize(value));
		} catch (error) {
			console.error(`Error when writing value from persisted store "${this.#key}" to ${this.#storage}`, error);
		}
	}
	#setupStorageListener() {
		if (!this.#window || !this.#connected) return;
		this.#subscribe = createSubscriber((update) => {
			this.#update = update;
			this.#storageCleanup = this.#connected && this.#syncTabs && this.#storageType === "local" ? on(this.#window, "storage", this.#handleStorageEvent) : void 0;
			return () => {
				this.#storageCleanup?.();
				this.#storageCleanup = void 0;
				this.#update = void 0;
			};
		});
	}
	#teardownStorageListener() {
		this.#storageCleanup?.();
		this.#storageCleanup = void 0;
		this.#subscribe = void 0;
	}
	/**
	* Returns whether the state is currently connected to storage.
	*
	* When `connected` is `false`, the state is not connected to storage and any
	* changes to the state will not be persisted to storage and any changes to storage
	* will not be reflected in the state.
	*/
	get connected() {
		return this.#connected;
	}
	/**
	* Disconnects the state from storage, preventing updates to storage and stopping
	* cross-tab synchronization. The current value in storage is removed.
	*
	* Call `.connect()` to re-enable storage persistence.
	*/
	disconnect() {
		if (!this.#connected) return;
		const storageItem = this.#storage?.getItem(this.#key);
		if (storageItem) this.#current = this.#deserialize(storageItem);
		this.#connected = false;
		this.#storage?.removeItem(this.#key);
		this.#teardownStorageListener();
	}
	/**
	* Reconnects the state to storage, enabling storage persistence and cross-tab
	* synchronization. The current value is immediately persisted to storage.
	*
	* **NOTE**: By default, the state is already connected to storage and this method is
	* only useful to re-enable storage persistence after calling `disconnect()`
	* or starting with `connected: false` as an option.
	*/
	connect() {
		if (this.#connected) return;
		this.#connected = true;
		this.#serialize(this.#current);
		this.#setupStorageListener();
	}
};
//#endregion
//#region node_modules/runed/dist/utilities/resource/resource.svelte.js
function debounce(fn, delay) {
	let timeoutId;
	let lastResolve = null;
	return (...args) => {
		return new Promise((resolve) => {
			if (lastResolve) lastResolve(void 0);
			lastResolve = resolve;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(async () => {
				const result = await fn(...args);
				if (lastResolve) {
					lastResolve(result);
					lastResolve = null;
				}
			}, delay);
		});
	};
}
function throttle(fn, delay) {
	let lastRun = 0;
	let lastPromise = null;
	return (...args) => {
		const now = Date.now();
		if (lastRun && now - lastRun < delay) return lastPromise ?? Promise.resolve(void 0);
		lastRun = now;
		lastPromise = fn(...args);
		return lastPromise;
	};
}
function runResource(source, fetcher, options = {}, effectFn) {
	const { lazy = false, once = false, initialValue, debounce: debounceTime, throttle: throttleTime } = options;
	let current = initialValue;
	let loading = initialValue === void 0 && !lazy;
	let error = void 0;
	let cleanupFns = [];
	const runCleanup = () => {
		cleanupFns.forEach((fn) => fn());
		cleanupFns = [];
	};
	const onCleanup = (fn) => {
		cleanupFns = [...cleanupFns, fn];
	};
	const baseFetcher = async (value, previousValue, refetching = false) => {
		try {
			loading = true;
			error = void 0;
			runCleanup();
			const controller = new AbortController();
			onCleanup(() => controller.abort());
			const result = await fetcher(value, previousValue, {
				data: current,
				refetching,
				onCleanup,
				signal: controller.signal
			});
			current = result;
			return result;
		} catch (e) {
			if (!(e instanceof DOMException && e.name === "AbortError")) error = e;
			return;
		} finally {
			loading = false;
		}
	};
	const runFetcher = debounceTime ? debounce(baseFetcher, debounceTime) : throttleTime ? throttle(baseFetcher, throttleTime) : baseFetcher;
	const sources = Array.isArray(source) ? source : [source];
	let prevValues;
	effectFn((values, previousValues) => {
		if (once && prevValues) return;
		prevValues = values;
		runFetcher(Array.isArray(source) ? values : values[0], Array.isArray(source) ? previousValues : previousValues?.[0]);
	}, { lazy });
	return {
		get current() {
			return current;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		mutate: (value) => {
			current = value;
		},
		refetch: (info) => {
			const values = sources.map((s) => s());
			return runFetcher(Array.isArray(source) ? values : values[0], Array.isArray(source) ? values : values[0], info ?? true);
		}
	};
}
function resource(source, fetcher, options) {
	return runResource(source, fetcher, options, (fn, options) => {
		const sources = Array.isArray(source) ? source : [source];
		const getters = () => sources.map((s) => s());
		watch(getters, (values, previousValues) => {
			fn(values, previousValues ?? []);
		}, options);
	});
}
function resourcePre(source, fetcher, options) {
	return runResource(source, fetcher, options, (fn, options) => {
		const sources = Array.isArray(source) ? source : [source];
		const getter = () => sources.map((s) => s());
		watch.pre(getter, (values, previousValues) => {
			fn(values, previousValues ?? []);
		}, options);
	});
}
resource.pre = resourcePre;
//#endregion
//#region node_modules/runed/dist/utilities/scroll-state/scroll-state.svelte.js
var ARRIVED_STATE_THRESHOLD_PIXELS = 1;
var ScrollState = class {
	#options;
	#element = derived(() => extract(this.#options.element));
	get element() {
		return this.#element();
	}
	set element($$value) {
		return this.#element($$value);
	}
	#idle = derived(() => extract(this.#options?.idle, 200));
	get idle() {
		return this.#idle();
	}
	set idle($$value) {
		return this.#idle($$value);
	}
	#offset = derived(() => extract(this.#options.offset, {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	}));
	get offset() {
		return this.#offset();
	}
	set offset($$value) {
		return this.#offset($$value);
	}
	#onScroll = derived(() => this.#options.onScroll ?? noop);
	get onScroll() {
		return this.#onScroll();
	}
	set onScroll($$value) {
		return this.#onScroll($$value);
	}
	#onStop = derived(() => this.#options.onStop ?? noop);
	get onStop() {
		return this.#onStop();
	}
	set onStop($$value) {
		return this.#onStop($$value);
	}
	#eventListenerOptions = derived(() => this.#options.eventListenerOptions ?? {
		capture: false,
		passive: true
	});
	get eventListenerOptions() {
		return this.#eventListenerOptions();
	}
	set eventListenerOptions($$value) {
		return this.#eventListenerOptions($$value);
	}
	#behavior = derived(() => extract(this.#options.behavior, "auto"));
	get behavior() {
		return this.#behavior();
	}
	set behavior($$value) {
		return this.#behavior($$value);
	}
	#onError = derived(() => this.#options.onError ?? ((e) => {
		console.error(e);
	}));
	get onError() {
		return this.#onError();
	}
	set onError($$value) {
		return this.#onError($$value);
	}
	internalX = 0;
	internalY = 0;
	#x = derived(() => this.internalX);
	get x() {
		return this.#x();
	}
	set x(v) {
		this.scrollTo(v, void 0);
	}
	#y = derived(() => this.internalY);
	get y() {
		return this.#y();
	}
	set y(v) {
		this.scrollTo(void 0, v);
	}
	isScrolling = false;
	arrived = {
		left: true,
		right: false,
		top: true,
		bottom: false
	};
	directions = {
		left: false,
		right: false,
		top: false,
		bottom: false
	};
	progress = {
		x: 0,
		y: 0
	};
	constructor(options) {
		this.#options = options;
		this.#onScrollHandler, this.eventListenerOptions;
		this.eventListenerOptions;
		new AnimationFrames(() => this.setArrivedState());
	}
	/**
	* Updates direction and edge arrival states based on the current scroll position.
	* Takes into account writing mode, flex direction, and RTL layouts.
	*/
	setArrivedState = () => {
		if (!window || !this.element) return;
		const el = this.element?.document?.documentElement || this.element?.documentElement || this.element;
		const { display, flexDirection, direction } = getComputedStyle(el);
		const directionMultiplier = direction === "rtl" ? -1 : 1;
		const scrollLeft = el.scrollLeft;
		if (scrollLeft !== this.internalX) {
			this.directions.left = scrollLeft < this.internalX;
			this.directions.right = scrollLeft > this.internalX;
		}
		const left = scrollLeft * directionMultiplier <= (this.offset.left || 0);
		const right = scrollLeft * directionMultiplier + el.clientWidth >= el.scrollWidth - (this.offset.right || 0) - ARRIVED_STATE_THRESHOLD_PIXELS;
		if (display === "flex" && flexDirection === "row-reverse") {
			this.arrived.left = right;
			this.arrived.right = left;
		} else {
			this.arrived.left = left;
			this.arrived.right = right;
		}
		this.internalX = scrollLeft;
		let scrollTop = el.scrollTop;
		if (this.element === window.document && !scrollTop) scrollTop = window.document.body.scrollTop;
		if (scrollTop !== this.internalY) {
			this.directions.top = scrollTop < this.internalY;
			this.directions.bottom = scrollTop > this.internalY;
		}
		const top = scrollTop <= (this.offset.top || 0);
		const bottom = scrollTop + el.clientHeight >= el.scrollHeight - (this.offset.bottom || 0) - ARRIVED_STATE_THRESHOLD_PIXELS;
		/**
		* reverse columns and rows behave exactly the other way around,
		* bottom is treated as top and top is treated as the negative version of bottom
		*/
		if (display === "flex" && flexDirection === "column-reverse") {
			this.arrived.top = bottom;
			this.arrived.bottom = top;
		} else {
			this.arrived.top = top;
			this.arrived.bottom = bottom;
		}
		const height = el.scrollHeight - (this.offset.bottom || 0);
		this.progress.y = scrollTop / (height - el.clientHeight) * 100;
		const width = el.scrollWidth - (this.offset.left || 0);
		this.progress.x = Math.abs(scrollLeft / (width - el.clientWidth) * 100);
		this.internalY = scrollTop;
	};
	#onScrollHandler = (e) => {
		if (!window) return;
		this.setArrivedState();
		this.isScrolling = true;
		this.onScrollEndDebounced(e);
		this.onScroll(e);
	};
	/**
	* Programmatically scroll to a specific position.
	*/
	scrollTo(x, y) {
		if (!window) return;
		(this.element instanceof Document ? window.document.body : this.element)?.scrollTo({
			top: y ?? this.y,
			left: x ?? this.x,
			behavior: this.behavior
		});
		const scrollContainer = this.element?.document?.documentElement || this.element?.documentElement || this.element;
		if (x != null) this.internalX = scrollContainer.scrollLeft;
		if (y != null) this.internalY = scrollContainer.scrollTop;
	}
	/**
	* Scrolls to the top of the element.
	*/
	scrollToTop() {
		this.scrollTo(void 0, 0);
	}
	/**
	* Scrolls to the bottom of the element.
	*/
	scrollToBottom() {
		if (!window) return;
		const scrollContainer = this.element?.document?.documentElement || this.element?.documentElement || this.element;
		if (!scrollContainer) return;
		this.scrollTo(void 0, scrollContainer.scrollHeight);
	}
	onScrollEnd = (e) => {
		if (!this.isScrolling) return;
		this.isScrolling = false;
		this.directions.left = false;
		this.directions.right = false;
		this.directions.top = false;
		this.directions.bottom = false;
		this.onStop(e);
	};
	onScrollEndDebounced = useDebounce(this.onScrollEnd, () => this.idle);
};
//#endregion
//#region node_modules/runed/dist/utilities/textarea-autosize/textarea-autosize.svelte.js
var stylesToCopy = [
	"box-sizing",
	"width",
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
	"border-top-width",
	"border-right-width",
	"border-bottom-width",
	"border-left-width",
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"letter-spacing",
	"text-indent",
	"text-transform",
	"line-height",
	"word-spacing",
	"word-wrap",
	"word-break",
	"white-space"
];
var TextareaAutosize = class {
	#options;
	#resizeTimeout = null;
	#hiddenTextarea = null;
	#element = derived(() => extract(this.#options.element));
	get element() {
		return this.#element();
	}
	set element($$value) {
		return this.#element($$value);
	}
	#input = derived(() => extract(this.#options.input));
	get input() {
		return this.#input();
	}
	set input($$value) {
		return this.#input($$value);
	}
	#styleProp = derived(() => extract(this.#options.styleProp, "height"));
	get styleProp() {
		return this.#styleProp();
	}
	set styleProp($$value) {
		return this.#styleProp($$value);
	}
	#maxHeight = derived(() => extract(this.#options.maxHeight, void 0));
	get maxHeight() {
		return this.#maxHeight();
	}
	set maxHeight($$value) {
		return this.#maxHeight($$value);
	}
	textareaHeight = 0;
	textareaOldWidth = 0;
	constructor(options) {
		this.#options = options;
		this.#createHiddenTextarea();
		watch([() => this.input, () => this.element], () => {
			(/* @__PURE__ */ tick()).then(() => this.triggerResize());
		});
		watch(() => this.textareaHeight, () => options?.onResize?.());
		useResizeObserver(() => this.element, ([entry]) => {
			if (!entry) return;
			const { contentRect } = entry;
			if (this.textareaOldWidth === contentRect.width) return;
			this.textareaOldWidth = contentRect.width;
			this.triggerResize();
		});
	}
	#createHiddenTextarea() {
		if (typeof window === "undefined") return;
		this.#hiddenTextarea = document.createElement("textarea");
		const style = this.#hiddenTextarea.style;
		style.visibility = "hidden";
		style.position = "absolute";
		style.overflow = "hidden";
		style.height = "0";
		style.top = "0";
		style.left = "-9999px";
		document.body.appendChild(this.#hiddenTextarea);
	}
	#copyStyles() {
		if (!this.element || !this.#hiddenTextarea) return;
		const computed = window.getComputedStyle(this.element);
		for (const style of stylesToCopy) this.#hiddenTextarea.style.setProperty(style, computed.getPropertyValue(style));
		this.#hiddenTextarea.style.width = `${this.element.clientWidth}px`;
	}
	/**
	* Recomputes the required height based on current content and applies it
	* to the textarea. If `maxHeight` is exceeded, vertical scrolling is enabled.
	*/
	triggerResize = () => {
		if (!this.element || !this.#hiddenTextarea) return;
		this.#copyStyles();
		this.#hiddenTextarea.value = this.input || "";
		let newHeight = this.#hiddenTextarea.scrollHeight;
		if (this.maxHeight && newHeight > this.maxHeight) {
			newHeight = this.maxHeight;
			this.element.style.overflowY = "auto";
		} else this.element.style.overflowY = "hidden";
		if (this.textareaHeight !== newHeight) {
			this.textareaHeight = newHeight;
			this.element.style[this.styleProp] = `${newHeight}px`;
		}
	};
};
//#endregion
//#region convex/_generated/api.js
/**
* Generated `api` utility.
*
* THIS CODE IS AUTOMATICALLY GENERATED.
*
* To regenerate, run `npx convex dev`.
* @module
*/
/**
* A utility for referencing Convex functions in your app's API.
*
* Usage:
* ```js
* const myFunctionReference = api.myModule.myFunction;
* ```
*/
var api = anyApi;
componentsGeneric();
typeof window !== "undefined" && new ConvexClient(PUBLIC_CONVEX_CLIENT_URL);
//#endregion
//#region src/lib/auth/session.svelte.ts
var namespace = `homebody:https://honorable-woodpecker-450.eu-west-1.convex.cloud`;
var tokenKey = `${namespace}:jwt`;
var refreshTokenKey = `${namespace}:refresh`;
var stringSerializer = {
	serialize: (v) => v === null ? "__null__" : JSON.stringify(v),
	deserialize: (v) => {
		if (v === "__null__") return null;
		try {
			return JSON.parse(v);
		} catch {
			return v;
		}
	}
};
var tokenStore = new PersistedState(tokenKey, null, { serializer: stringSerializer });
var refreshTokenStore = new PersistedState(refreshTokenKey, null, { serializer: stringSerializer });
var roleStore = new PersistedState(`${namespace}:role`, null, { serializer: stringSerializer });
var refreshPromise = null;
var state = {
	isLoading: true,
	isAuthenticated: false,
	error: ""
};
var expiredSessionMessage = "החיבור פג. אפשר להיכנס מחדש עם קוד חד־פעמי.";
var authNetworkTimeoutMs = 7e3;
async function withTimeout(promise, message) {
	let timeoutId;
	const timeout = new Promise((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error(message)), authNetworkTimeoutMs);
	});
	try {
		return await Promise.race([promise, timeout]);
	} finally {
		if (timeoutId !== void 0) clearTimeout(timeoutId);
	}
}
function syncAuthState() {
	state.isAuthenticated = tokenStore.current !== null;
}
function storeTokens(tokens) {
	tokenStore.current = tokens?.token ?? null;
	refreshTokenStore.current = tokens?.refreshToken ?? null;
	if (tokens === null) roleStore.current = null;
	syncAuthState();
	state.isLoading = false;
	state.error = "";
}
function setCachedRole(role) {
	roleStore.current = role;
}
function getCachedRole() {
	return roleStore.current;
}
function clearStaleSession(message = expiredSessionMessage) {
	tokenStore.current = null;
	refreshTokenStore.current = null;
	syncAuthState();
	state.isLoading = false;
	state.error = message;
}
/**
* Creates a one-off HTTP client authenticated with the given token.
* In an MPA we NEVER use the shared WebSocket client for auth queries —
* each HTTP call carries its own token explicitly, avoiding 401 races
* that trigger refresh-token storms.
*/
function makeHttpClient(token) {
	return new ConvexHttpClient(PUBLIC_CONVEX_CLIENT_URL, {
		auth: token,
		logger: false
	});
}
async function refreshToken() {
	if (refreshPromise !== null) return refreshPromise;
	refreshPromise = doRefreshToken();
	try {
		return await refreshPromise;
	} finally {
		refreshPromise = null;
	}
}
async function doRefreshToken() {
	if (refreshTokenStore.current === null) {
		clearStaleSession();
		return null;
	}
	try {
		storeTokens((await withTimeout(new ConvexHttpClient("https://honorable-woodpecker-450.eu-west-1.convex.cloud", { logger: false }).action(api.auth.signIn, { refreshToken: refreshTokenStore.current }), "Refresh token timed out")).tokens ?? null);
		return tokenStore.current;
	} catch {
		clearStaleSession();
		return null;
	}
}
function isLikelyAuthError(reason) {
	const message = reason instanceof Error ? reason.message : String(reason);
	return /auth|token|jwt|unauth|not authenticated|authentication/i.test(message);
}
function initAuth() {
	if (typeof window === "undefined") return state;
	syncAuthState();
	state.isLoading = false;
	return state;
}
async function authQuery(query, args) {
	let token = tokenStore.current;
	if (token === null) {
		token = await refreshToken();
		if (token === null) return null;
	}
	const client = makeHttpClient(token);
	try {
		return await client.query(query, args);
	} catch (reason) {
		if (!isLikelyAuthError(reason)) throw reason;
		token = await refreshToken();
		if (token === null) return null;
		const retryClient = makeHttpClient(token);
		try {
			return await retryClient.query(query, args);
		} catch (retryReason) {
			if (!isLikelyAuthError(retryReason)) throw retryReason;
			clearStaleSession();
			return null;
		}
	}
}
async function signOut() {
	const tokenToSignOut = tokenStore.current;
	storeTokens(null);
	try {
		if (tokenToSignOut !== null) await withTimeout(makeHttpClient(tokenToSignOut).action(api.auth.signOut, {}), "Sign-out timed out");
	} catch {}
	window.location.assign("/");
}
//#endregion
export { useQuery as _, signOut as a, TextareaAutosize as c, useEventListener as d, useDebounce as f, useConvexClient as g, setupConvex as h, setCachedRole as i, ScrollState as l, createSubscriber as m, getCachedRole as n, storeTokens as o, SvelteMap as p, initAuth as r, api as s, authQuery as t, resource as u, PUBLIC_CONVEX_CLIENT_URL as v, PUBLIC_MUX_ENV_KEY as y };
