import { H as attr, U as escape_html, a as derived, l as stringify, n as attr_class, o as ensure_array_like } from "./dev.js";
import { n as getCachedRole, r as initAuth } from "./session.svelte.js";
//#region src/components/app/AppSidebar.svelte
function AppSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { role: roleProp } = $$props;
		const auth = initAuth();
		const role = derived(() => roleProp ?? getCachedRole() ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const customerNav = [
			{
				href: "/dashboard",
				label: "סקירה"
			},
			{
				href: "/calendar",
				label: "לוח לייבים"
			},
			{
				href: "/videos",
				label: "וידאו"
			},
			{
				href: "/profile",
				label: "פרופיל פילאטיס"
			}
		];
		const staffNav = [
			{
				href: "/dashboard",
				label: "סקירה"
			},
			{
				href: "/live",
				label: "סטודיו"
			},
			{
				href: "/calendar",
				label: "לוח לייבים"
			},
			{
				href: "/videos",
				label: "וידאו"
			}
		];
		const navItems = derived(() => isStaff() ? staffNav : customerNav);
		let currentPath = typeof window !== "undefined" ? window.location.pathname : "";
		if (typeof window !== "undefined") window.addEventListener("popstate", () => {
			currentPath = window.location.pathname;
		});
		function isCurrent(href) {
			return currentPath === href;
		}
		$$renderer.push(`<aside class="sidebar svelte-178g8yr" aria-label="ניווט אזור אישי"><div class="sidebar__brand svelte-178g8yr"><span class="sidebar__tagline svelte-178g8yr">${escape_html(isStaff() ? "סטודיו" : "אזור אישי")}</span> `);
		if (isStaff()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span${attr_class(`role-badge role-badge--${stringify(role())}`, "svelte-178g8yr")}>${escape_html(role() === "admin" ? "Admin" : "Instructor")}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <nav class="sidebar__nav svelte-178g8yr" aria-label="ניווט פנימי"><!--[-->`);
		const each_array = ensure_array_like(navItems());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<a${attr("href", item.href)} class="sidebar__link svelte-178g8yr"${attr("aria-current", isCurrent(item.href) ? "page" : void 0)}>${escape_html(item.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav> <div class="sidebar__footer svelte-178g8yr">`);
		if (auth.isAuthenticated) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="sidebar__user svelte-178g8yr">מחוברת</span> <button type="button" class="sidebar__signout svelte-178g8yr">יציאה</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a href="/" class="sidebar__signout svelte-178g8yr">כניסה</a>`);
		}
		$$renderer.push(`<!--]--></div></aside>`);
	});
}
//#endregion
//#region src/components/app/AppLayout.svelte
function AppLayout($$renderer, $$props) {
	let { children, role } = $$props;
	$$renderer.push(`<div class="app-layout svelte-1u6hedt">`);
	AppSidebar($$renderer, { role });
	$$renderer.push(`<!----> <main class="app-main svelte-1u6hedt">`);
	children($$renderer);
	$$renderer.push(`<!----></main></div>`);
}
//#endregion
export { AppLayout as t };
