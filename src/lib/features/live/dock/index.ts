export { default as LiveDockProvider } from "./LiveDockProvider.svelte";
export { default as LivePip } from "./LivePip.svelte";
export { default as LivePipVideo } from "./LivePipVideo.svelte";
export { LiveDockController, setLiveDockContext, getLiveDockContext, tryGetLiveDockContext } from "./live-dock.svelte";
export type { LivePresentation, LiveDockContext } from "./live-dock.svelte";
export { isAppShellPath, isLiveRoomPath } from "./live-dock-paths";
export { pipBoundsPref, DEFAULT_PIP_BOUNDS, clampPipBounds } from "./live-dock-pip-bounds";
export type { PipBounds } from "./live-dock-pip-bounds";
