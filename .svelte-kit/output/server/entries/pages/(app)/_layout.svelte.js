import { c as ensure_array_like, et as attr, m as stringify, n as attr_class, nt as escape_html, o as derived } from "../../../chunks/dev.js";
import { n as routePath, t as liveRoomHref } from "../../../chunks/context.js";
import { n as getCachedRole, p as useQuery, r as initAuth, s as api } from "../../../chunks/session.svelte.js";
import { t as page } from "../../../chunks/state.js";
//#region src/lib/features/app/components/AppSidebar.svelte
function AppSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { role: roleProp } = $$props;
		const auth = initAuth();
		const role = derived(() => roleProp ?? getCachedRole() ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const customerNav = [
			{
				href: routePath("dashboard"),
				label: "סקירה"
			},
			{
				href: routePath("customerCalendar"),
				label: "לוח לייבים"
			},
			{
				href: routePath("customerOneOnOne"),
				label: "1:1 אישי"
			},
			{
				href: routePath("customerVideos"),
				label: "וידאו"
			},
			{
				href: routePath("profile"),
				label: "פרופיל פילאטיס"
			}
		];
		const staffNav = [
			{
				href: routePath("dashboard"),
				label: "סקירה"
			},
			{
				href: routePath("studioLive"),
				label: "סטודיו לייב"
			},
			{
				href: routePath("studioVideos"),
				label: "ניהול וידאו"
			},
			{
				href: routePath("profile"),
				label: "פרופיל מדריכה"
			}
		];
		const nextLiveQuery = useQuery(api.liveClasses.myNextLiveClass, () => auth.isAuthenticated ? {} : "skip");
		const nextLive = derived(() => nextLiveQuery.data ?? null);
		const showLiveTab = derived(() => nextLive() !== null && nextLive().status !== "ended" && nextLive().status !== "cancelled");
		const baseNav = derived(() => isStaff() ? staffNav : customerNav);
		const navItems = derived(() => showLiveTab() ? [{
			href: liveRoomHref(nextLive().classId),
			label: "LIVE",
			isLive: true
		}, ...baseNav()] : baseNav());
		const currentPath = derived(() => page.url.pathname);
		function isCurrent(href) {
			if (href.startsWith(routePath("liveRoom"))) return currentPath() === routePath("liveRoom");
			return currentPath() === href;
		}
		$$renderer.push(`<aside class="sidebar svelte-1uyw6j7" aria-label="ניווט אזור אישי"><div class="sidebar__brand svelte-1uyw6j7"><span class="sidebar__tagline svelte-1uyw6j7">${escape_html(isStaff() ? "סטודיו" : "אזור אישי")}</span> `);
		if (isStaff()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span${attr_class(`role-badge role-badge--${stringify(role())}`, "svelte-1uyw6j7")}>${escape_html(role() === "admin" ? "Admin" : "Instructor")}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="sidebar__account svelte-1uyw6j7">`);
		if (auth.isAuthenticated) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="sidebar__user svelte-1uyw6j7">מחוברת</span> <button type="button" class="sidebar__signout svelte-1uyw6j7">יציאה</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a href="/" class="sidebar__signout svelte-1uyw6j7">כניסה</a>`);
		}
		$$renderer.push(`<!--]--></div> <nav class="sidebar__nav svelte-1uyw6j7" aria-label="ניווט פנימי"><!--[-->`);
		const each_array = ensure_array_like(navItems());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<a${attr("href", item.href)}${attr_class("sidebar__link svelte-1uyw6j7", void 0, { "sidebar__link--live": "isLive" in item && item.isLive })}${attr("aria-current", isCurrent(item.href) ? "page" : void 0)}>`);
			if ("isLive" in item && item.isLive) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="live-pulse svelte-1uyw6j7"></span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> ${escape_html(item.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></aside>`);
	});
}
//#endregion
//#region src/lib/features/app/components/AppLayout.svelte
function AppLayout($$renderer, $$props) {
	let { children, role } = $$props;
	$$renderer.push(`<div class="app-layout svelte-1vr0tfx">`);
	AppSidebar($$renderer, { role });
	$$renderer.push(`<!----> <main class="app-main svelte-1vr0tfx">`);
	children($$renderer);
	$$renderer.push(`<!----></main></div>`);
}
//#endregion
//#region src/routes/(app)/+layout.svelte
function _layout($$renderer, $$props) {
	let { children } = $$props;
	AppLayout($$renderer, {
		children: ($$renderer) => {
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
//#endregion
export { _layout as default };
