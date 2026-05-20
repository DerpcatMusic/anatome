import { getContext, setContext } from "svelte";

export type AppContext = {
  role: "customer" | "instructor" | "admin" | null;
  isLoading: boolean;
};

const APP_CONTEXT_KEY = Symbol("app");

export function setAppContext(ctx: AppContext) {
  setContext(APP_CONTEXT_KEY, ctx);
}

export function getAppContext(): AppContext {
  return getContext(APP_CONTEXT_KEY) ?? { role: null, isLoading: true };
}
