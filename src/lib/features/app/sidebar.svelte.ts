const STORAGE_KEY = "app-sidebar-collapsed";

/** Expanded app shell sidebar column (matches previous AppLayout default). */
export const SIDEBAR_WIDTH_EXPANDED = "clamp(220px, 16vw, 260px)";

/** Icon rail width when collapsed (room for ~26px icons + touch padding). */
export const SIDEBAR_WIDTH_COLLAPSED = "5rem";

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function persistCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(collapsed));
}

const RAIL_MEDIA = "(min-width: 861px)";

class SidebarStore {
  collapsed = $state(false);
  /** Desktop rail only — mobile keeps full horizontal nav. */
  railActive = $state(
    typeof window !== "undefined"
      ? window.matchMedia(RAIL_MEDIA).matches
      : true,
  );

  readonly isCollapsed = $derived(this.collapsed && this.railActive);

  readonly width = $derived(
    this.isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
  );

  constructor() {
    if (typeof window !== "undefined") {
      this.collapsed = readCollapsed();
    }
  }

  initRailQuery(): () => void {
    if (typeof window === "undefined") return () => {};
    const mq = window.matchMedia(RAIL_MEDIA);
    const sync = () => {
      this.railActive = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }

  toggle() {
    this.collapsed = !this.collapsed;
    persistCollapsed(this.collapsed);
  }

  setCollapsed(collapsed: boolean) {
    if (this.collapsed === collapsed) return;
    this.collapsed = collapsed;
    persistCollapsed(collapsed);
  }
}

export const sidebar = new SidebarStore();
