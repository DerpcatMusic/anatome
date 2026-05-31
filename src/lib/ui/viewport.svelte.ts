const MOBILE_NAV_MQ = "(max-width: 860px)";
const LIVE_DOCK_COMPACT_MQ = "(max-width: 48rem)";

class ViewportStore {
	mobileNav = $state(
		typeof window !== "undefined" ? window.matchMedia(MOBILE_NAV_MQ).matches : false,
	);
	liveDockCompact = $state(
		typeof window !== "undefined"
			? window.matchMedia(LIVE_DOCK_COMPACT_MQ).matches
			: false,
	);

	init(): () => void {
		if (typeof window === "undefined") return () => {};
		const navMq = window.matchMedia(MOBILE_NAV_MQ);
		const liveMq = window.matchMedia(LIVE_DOCK_COMPACT_MQ);
		const syncNav = () => {
			this.mobileNav = navMq.matches;
		};
		const syncLive = () => {
			this.liveDockCompact = liveMq.matches;
		};
		syncNav();
		syncLive();
		navMq.addEventListener("change", syncNav);
		liveMq.addEventListener("change", syncLive);
		return () => {
			navMq.removeEventListener("change", syncNav);
			liveMq.removeEventListener("change", syncLive);
		};
	}
}

export const viewport = new ViewportStore();
