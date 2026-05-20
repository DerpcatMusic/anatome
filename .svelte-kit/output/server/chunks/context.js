import "./index-server.js";
//#region src/lib/i18n/context.ts
var routes = {
	uDashboard: "/u/dashboard",
	uCalendar: "/u/calendar",
	uOneOnOne: "/u/one-on-one",
	uVideos: "/u/videos",
	uProfile: "/u/profile",
	iDashboard: "/i/dashboard",
	iLive: "/i/live",
	iVideos: "/i/videos",
	iOneOnOne: "/i/one-on-one",
	iProfile: "/i/profile",
	watch: "/watch",
	liveRoom: "/live-room",
	onboarding: "/onboarding"
};
function routePath(key, locale = "he") {
	return routes[key];
}
function liveRoomHref(classId, locale = "he") {
	return `${routePath("liveRoom", locale)}?classId=${classId}`;
}
//#endregion
export { routePath as n, liveRoomHref as t };
