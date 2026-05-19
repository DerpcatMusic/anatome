import "./index-server.js";
//#region src/lib/i18n/context.ts
var routes = {
	dashboard: "/dashboard",
	customerCalendar: "/calendar",
	customerOneOnOne: "/one-on-one",
	customerVideos: "/videos",
	watch: "/watch",
	profile: "/profile",
	onboarding: "/onboarding",
	liveRoom: "/live-room",
	studioLive: "/live",
	studioVideos: "/studio/videos"
};
function routePath(key, locale = "he") {
	return routes[key];
}
function liveRoomHref(classId, locale = "he") {
	return `${routePath("liveRoom", locale)}?classId=${classId}`;
}
//#endregion
export { routePath as n, liveRoomHref as t };
