import { Q as attr, c as ensure_array_like, et as escape_html, n as attr_class, o as derived, p as stringify } from "../../../chunks/dev.js";
import { t as liveRoomHref } from "../../../chunks/context.js";
import { _ as useQuery, r as initAuth, s as api } from "../../../chunks/session.svelte.js";
import { t as theme } from "../../../chunks/theme.svelte.js";
import { t as page } from "../../../chunks/state.js";
import { n as setAppContext, t as getAppContext } from "../../../chunks/appContext.js";
//#region src/lib/features/app/components/AppSidebar.svelte
function AppSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const ctx = getAppContext();
		const prefix = derived(() => {
			const path = page.url.pathname;
			if (path.startsWith("/i/")) return "/i";
			if (path.startsWith("/u/")) return "/u";
			return ctx.role === "instructor" || ctx.role === "admin" ? "/i" : "/u";
		});
		const isInstructorPrefix = derived(() => prefix() === "/i");
		const navMap = {
			"/u": [
				{
					href: "/u/dashboard",
					label: "סקירה"
				},
				{
					href: "/u/calendar",
					label: "לוח לייבים"
				},
				{
					href: "/u/one-on-one",
					label: "1:1 אישי"
				},
				{
					href: "/u/videos",
					label: "וידאו"
				},
				{
					href: "/u/profile",
					label: "פרופיל פילאטיס"
				}
			],
			"/i": [
				{
					href: "/i/dashboard",
					label: "סקירה"
				},
				{
					href: "/i/live",
					label: "סטודיו לייב"
				},
				{
					href: "/i/videos",
					label: "ניהול וידאו"
				},
				{
					href: "/i/one-on-one",
					label: "ניהול 1:1"
				},
				{
					href: "/i/profile",
					label: "פרופיל מדריכה"
				}
			]
		};
		const nextLiveQuery = useQuery(api.live.next.get, () => auth.isAuthenticated ? {} : "skip");
		const nextLive = derived(() => nextLiveQuery.data ?? null);
		const showLiveTab = derived(() => nextLive() !== null && nextLive().status !== "ended" && nextLive().status !== "cancelled");
		const baseNav = derived(() => navMap[prefix()] ?? navMap["/u"]);
		const navItems = derived(() => showLiveTab() ? [{
			href: liveRoomHref(nextLive().classId),
			label: "LIVE",
			isLive: true
		}, ...baseNav()] : baseNav());
		const currentPath = derived(() => page.url.pathname);
		function isCurrent(href) {
			if (href.startsWith("/live-room")) return currentPath() === "/live-room";
			return currentPath() === href;
		}
		$$renderer.push(`<aside class="sidebar" aria-label="ניווט אזור אישי"><div class="sidebar__brand"><span class="sidebar__tagline">${escape_html(isInstructorPrefix() ? "סטודיו" : "אזור אישי")}</span> `);
		if (isInstructorPrefix() && ctx.role) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span${attr_class(`role-badge role-badge--${stringify(ctx.role)}`)}>${escape_html(ctx.role === "admin" ? "Admin" : "Instructor")}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="sidebar__account">`);
		if (auth.isAuthenticated) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="sidebar__user">מחוברת</span> <div class="sidebar__actions"><button type="button" class="theme-toggle"${attr("title", theme.value === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה")}${attr("aria-label", theme.value === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה")}><span class="material-symbols-rounded">${escape_html(theme.value === "dark" ? "light_mode" : "dark_mode")}</span></button> <button type="button" class="sidebar__signout">יציאה</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a href="/" class="sidebar__signout">כניסה</a>`);
		}
		$$renderer.push(`<!--]--></div> <nav class="sidebar__nav" aria-label="ניווט פנימי"><!--[-->`);
		const each_array = ensure_array_like(navItems());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<a${attr("href", item.href)}${attr_class("sidebar__link", void 0, { "sidebar__link--live": "isLive" in item && item.isLive })}${attr("aria-current", isCurrent(item.href) ? "page" : void 0)}>`);
			if ("isLive" in item && item.isLive) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="live-pulse"></span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> ${escape_html(item.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></aside>`);
	});
}
//#endregion
//#region src/lib/features/app/components/AppLayout.svelte
function AppLayout($$renderer, $$props) {
	let { children } = $$props;
	$$renderer.push(`<div class="app-layout svelte-1vr0tfx">`);
	AppSidebar($$renderer, {});
	$$renderer.push(`<!----> <main class="app-main svelte-1vr0tfx">`);
	children($$renderer);
	$$renderer.push(`<!----></main></div>`);
}
//#endregion
//#region src/routes/(app)/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const auth = initAuth();
		useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
		setAppContext({
			role: null,
			isLoading: true
		});
		AppLayout($$renderer, {
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
export { _layout as default };
