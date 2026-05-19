import "./index-server.js";
import "./dev.js";
import { r as on } from "./events.js";
import "./context.js";
import { ConvexHttpClient } from "convex/browser";
import { anyApi, componentsGeneric } from "convex/server";
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
globalThis.Map;
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
//#endregion
//#region src/lib/auth/session.svelte.ts
var namespace = `homebody:ssr`;
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
	return new ConvexHttpClient(void 0, {
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
		storeTokens((await withTimeout(new ConvexHttpClient(void 0, { logger: false }).action(api.auth.signIn, { refreshToken: refreshTokenStore.current }), "Refresh token timed out")).tokens ?? null);
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
export { signOut as a, resource as c, setCachedRole as i, getCachedRole as n, storeTokens as o, initAuth as r, api as s, authQuery as t };
