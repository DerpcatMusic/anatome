import "./index-server.js";
import { P as snapshot, a as derived, at as setContext, rt as getContext } from "./dev.js";
import { ConvexClient } from "convex/browser";
import { getFunctionName } from "convex/server";
import { convexToJson } from "convex/values";
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
export { useConvexClient as n, useQuery as r, setupConvex as t };
