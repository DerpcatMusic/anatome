import { getContext, setContext } from "svelte";

export type ViewerProfileSnapshot = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type AppContext = {
  role: "customer" | "instructor" | "admin" | null;
  isLoading: boolean;
  /** Synced from layout's profiles.viewer.get — avoids duplicate sidebar subscription. */
  viewer: ViewerProfileSnapshot | null;
};

const APP_CONTEXT_KEY = Symbol("app");

export function setAppContext(ctx: AppContext) {
  setContext(APP_CONTEXT_KEY, ctx);
}

export function getAppContext(): AppContext {
  return getContext(APP_CONTEXT_KEY) ?? { role: null, isLoading: true, viewer: null };
}
