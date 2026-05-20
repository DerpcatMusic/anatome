import "./index-server.js";
import { xt as setContext, yt as getContext } from "./dev.js";
//#region src/lib/features/app/context/appContext.ts
var APP_CONTEXT_KEY = Symbol("app");
function setAppContext(ctx) {
	setContext(APP_CONTEXT_KEY, ctx);
}
function getAppContext() {
	return getContext(APP_CONTEXT_KEY) ?? {
		role: null,
		isLoading: true
	};
}
//#endregion
export { setAppContext as n, getAppContext as t };
