import { getContext, setContext } from "svelte";
import type { Id } from "$convex/_generated/dataModel";
import { sidebar } from "$features/app/sidebar.svelte";
import type { LiveSession } from "../live-session.svelte";
import { isAppShellPath, isLiveRoomPath } from "./live-dock-paths";
import { readPipBounds, writePipBounds, type PipBounds, DEFAULT_PIP_BOUNDS } from "./live-dock-pip-bounds";

export type LivePresentation = "idle" | "preconnect" | "immersive" | "pip";

export type LiveDockContext = {
  session: LiveSession;
  readonly presentation: LivePresentation;
  readonly activeClassId: Id<"liveClasses"> | null;
  readonly pipBounds: PipBounds;
  readonly joinLoading: boolean;
  setActiveClassId: (id: Id<"liveClasses"> | null) => void;
  syncRoute: (pathname: string, inRoom: boolean, isInstructor: boolean) => void;
  handleNavigation: (fromPath: string, toPath: string, inRoom: boolean, isInstructor: boolean) => void;
  focusImmersive: () => void;
  enterPip: () => void;
  updatePipBounds: (bounds: PipBounds) => void;
  finishSession: () => void;
  endLive: () => Promise<void>;
};

const LIVE_DOCK_KEY = Symbol("live-dock");

export class LiveDockController {
  presentation = $state<LivePresentation>("idle");
  activeClassId = $state<Id<"liveClasses"> | null>(null);
  pipBounds = $state<PipBounds>(DEFAULT_PIP_BOUNDS);

  private sidebarCollapsedBeforeLive: boolean | null = null;

  constructor(readonly session: LiveSession) {
    if (typeof window !== "undefined") {
      this.pipBounds = readPipBounds();
    }
  }

  setActiveClassId(id: Id<"liveClasses"> | null) {
    this.activeClassId = id;
  }

  updatePipBounds(bounds: PipBounds) {
    this.pipBounds = bounds;
    writePipBounds(bounds);
  }

  ensureLiveSidebarCollapsed() {
    if (this.sidebarCollapsedBeforeLive === null) {
      this.sidebarCollapsedBeforeLive = sidebar.collapsed;
      sidebar.setCollapsed(true);
    }
  }

  restoreSidebarIfNeeded() {
    if (this.sidebarCollapsedBeforeLive === null) return;
    sidebar.setCollapsed(this.sidebarCollapsedBeforeLive);
    this.sidebarCollapsedBeforeLive = null;
  }

  /** LiveKit session is up (in-room or PiP) — not the same as `inRoom` UI flag. */
  private broadcastActive(): boolean {
    return this.session.sessionConnect && this.session.liveKitRoom !== null;
  }

  syncRoute(pathname: string, inRoom: boolean, isInstructor: boolean) {
    const broadcastActive = this.broadcastActive() || inRoom;

    if (isLiveRoomPath(pathname)) {
      this.ensureLiveSidebarCollapsed();
      if (this.presentation === "pip") {
        this.presentation = inRoom ? "immersive" : "preconnect";
      } else if (this.presentation === "idle") {
        this.presentation = inRoom ? "immersive" : "preconnect";
      } else if (!inRoom) {
        this.presentation = "preconnect";
      } else {
        this.presentation = "immersive";
      }
      if (isInstructor && inRoom) {
        this.session.keepAliveAcrossNavigation = true;
      }
      return;
    }

    if (isInstructor && isAppShellPath(pathname) && broadcastActive) {
      this.enterPip();
      return;
    }

    if (this.presentation === "pip") {
      return;
    }

    if (!broadcastActive) {
      this.presentation = "idle";
      this.activeClassId = null;
      this.session.keepAliveAcrossNavigation = false;
    }
  }

  handleNavigation(
    fromPath: string,
    toPath: string,
    inRoom: boolean,
    isInstructor: boolean,
  ) {
    const broadcastActive = this.broadcastActive() || inRoom;

    if (
      isInstructor &&
      isLiveRoomPath(fromPath) &&
      isAppShellPath(toPath) &&
      !isLiveRoomPath(toPath) &&
      broadcastActive
    ) {
      this.enterPip();
      return;
    }

    if (isLiveRoomPath(toPath) && this.presentation === "pip") {
      this.presentation = inRoom ? "immersive" : "preconnect";
      this.ensureLiveSidebarCollapsed();
    }
  }

  /** Instructor left the live route — keep publishing in a floating PiP. */
  enterPip() {
    if (!this.session.isInstructorRoom) return;
    if (!this.broadcastActive() && !this.session.inRoom) return;
    this.presentation = "pip";
    this.session.keepAliveAcrossNavigation = true;
  }

  focusImmersive() {
    this.presentation = this.session.inRoom ? "immersive" : "preconnect";
    this.ensureLiveSidebarCollapsed();
  }

  finishSession() {
    this.presentation = "idle";
    this.activeClassId = null;
    this.session.pinnedClassId = null;
    this.session.keepAliveAcrossNavigation = false;
    this.restoreSidebarIfNeeded();
    this.session.destroy();
  }
}

export function setLiveDockContext(value: LiveDockContext) {
  setContext(LIVE_DOCK_KEY, value);
}

export function getLiveDockContext(): LiveDockContext {
  const ctx = getContext<LiveDockContext>(LIVE_DOCK_KEY);
  if (!ctx) {
    throw new Error("LiveDockProvider is missing — wrap the app shell layout.");
  }
  return ctx;
}

export function tryGetLiveDockContext(): LiveDockContext | null {
  return getContext<LiveDockContext | undefined>(LIVE_DOCK_KEY) ?? null;
}
