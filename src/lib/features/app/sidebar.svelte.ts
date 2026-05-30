import { PersistedState } from "runed";

const sidebarStore = new PersistedState<boolean>("sidebar-collapsed", false, {
	storage: "local",
	syncTabs: true,
});

/** Expanded app shell sidebar column (matches previous AppLayout default). */
export const SIDEBAR_WIDTH_EXPANDED = "clamp(220px, 16vw, 260px)";

/** Icon rail width when collapsed (room for ~26px icons + touch padding). */
export const SIDEBAR_WIDTH_COLLAPSED = "5rem";

const RAIL_MEDIA = "(min-width: 861px)";

class SidebarStore {
	get collapsed(): boolean {
		return sidebarStore.current;
	}

	private set collapsed(v: boolean) {
		sidebarStore.current = v;
	}

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
		sidebarStore.current = !sidebarStore.current;
	}

	setCollapsed(collapsed: boolean) {
		sidebarStore.current = collapsed;
	}
}

export const sidebar = new SidebarStore();
