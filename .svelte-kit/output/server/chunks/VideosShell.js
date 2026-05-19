import { U as attr, W as escape_html, a as derived, n as attr_class, o as ensure_array_like } from "./dev.js";
import { n as routePath } from "./context.js";
import { c as resource, n as getCachedRole, r as initAuth, s as api, t as authQuery } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { i as equipmentLabel, r as durationLabel } from "./labels.js";
import { t as PageShell } from "./PageShell.js";
import { t as InstructorVideoManager } from "./InstructorVideoManager.js";
//#region src/lib/features/videos/components/VideosShell.svelte
function VideosShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const role = derived(() => getCachedRole() ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const fullFormatter = new Intl.DateTimeFormat("he-IL", {
			day: "numeric",
			month: "long",
			year: "numeric",
			timeZone: "Asia/Jerusalem"
		});
		let actionId = null;
		const dataResource = resource(() => auth.isAuthenticated && !isStaff(), async (shouldFetch) => {
			if (!shouldFetch) return null;
			return await authQuery(api.videos.listWeekly, {});
		});
		const data = derived(() => dataResource.current);
		function weekLabel(accessEndsAt) {
			if (!accessEndsAt) return "";
			const start = new Date(accessEndsAt);
			start.setDate(start.getDate() - 7);
			return `${fullFormatter.format(start)} - ${fullFormatter.format(new Date(accessEndsAt))}`;
		}
		function statusLabel(item) {
			if (item.selected) return "נבחר לשבוע";
			if (item.missingEquipment.length > 0) return "חסר ציוד";
			if ((data()?.remainingCredits ?? 0) <= 0) return "נעול";
			return "זמין לבחירה";
		}
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="state-card svelte-odx7iz"><div class="skeleton skeleton--large svelte-odx7iz"></div> <div class="skeleton svelte-odx7iz"></div></div>`);
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="state-card svelte-odx7iz"><p class="eyebrow svelte-odx7iz">חשבון נעול</p> <h2 class="svelte-odx7iz">צריך להתחבר כדי לצפות בווידאו</h2> <a class="button-link svelte-odx7iz" href="/">כניסה</a></div>`);
		} else if (isStaff()) {
			$$renderer.push("<!--[2-->");
			InstructorVideoManager($$renderer, {});
		} else if (dataResource.error) {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="state-card svelte-odx7iz">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(dataResource.error?.message ?? "שגיאה")}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> <button type="button" class="btn-ghost svelte-odx7iz">לנסות שוב</button></div>`);
		} else if (data()) {
			$$renderer.push("<!--[4-->");
			{
				function headerExtra($$renderer) {
					$$renderer.push(`<div class="credit-meter svelte-odx7iz"><span class="svelte-odx7iz">${escape_html(data().remainingCredits)}</span> <small class="svelte-odx7iz">קרדיטים פנויים</small></div>`);
				}
				PageShell($$renderer, {
					title: "בחירת וידאו שבועית",
					kicker: "HomeBody Video",
					description: "בוחרים שיעורי וידאו לשבוע הזה עם קרדיטי הווידאו שלך. מה שבחרת פתוח לצפייה עד סוף השבוע.",
					headerExtra,
					children: ($$renderer) => {
						if (data().accessEndsAt) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="week-banner svelte-odx7iz"><span class="week-label svelte-odx7iz">${escape_html(weekLabel(data().accessEndsAt))}</span> <span class="week-count svelte-odx7iz">נבחרו ${escape_html(data().selectedCount)} מתוך ${escape_html(data().videos.length)}</span></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (data().videos.length === 0) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="state-card svelte-odx7iz"><p class="svelte-odx7iz">אין עדיין וידאו פעיל לשבוע הזה. בדקי מאוחר יותר.</p></div>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<div class="video-grid svelte-odx7iz"><!--[-->`);
							const each_array = ensure_array_like(data().videos);
							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array[$$index_1];
								$$renderer.push(`<article${attr_class("video-card svelte-odx7iz", void 0, {
									"locked": item.locked,
									"selected": item.selected
								})}><div class="thumb svelte-odx7iz">`);
								if (item.video.thumbnailUrl) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<img${attr("src", item.video.thumbnailUrl)} alt="" loading="lazy" class="svelte-odx7iz"/>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<span class="thumb-placeholder svelte-odx7iz"><span class="thumb-duration svelte-odx7iz">${escape_html(durationLabel(item.video.durationSeconds))}</span> HomeBody</span>`);
								}
								$$renderer.push(`<!--]--></div> <div class="video-card__body svelte-odx7iz"><div class="video-card__top svelte-odx7iz"><p class="status svelte-odx7iz">${escape_html(statusLabel(item))}</p> <span class="duration svelte-odx7iz">${escape_html(durationLabel(item.video.durationSeconds))}</span></div> <h3 class="svelte-odx7iz">${escape_html(item.video.title)}</h3> <p class="desc svelte-odx7iz">${escape_html(item.video.description)}</p> <div class="tags svelte-odx7iz"><!--[-->`);
								const each_array_1 = ensure_array_like(item.video.requiredEquipment);
								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let equipment = each_array_1[$$index];
									$$renderer.push(`<span class="svelte-odx7iz">${escape_html(equipmentLabel(equipment))}</span>`);
								}
								$$renderer.push(`<!--]--></div> `);
								if (item.missingEquipment.length > 0) {
									$$renderer.push("<!--[0-->");
									Notice($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->חסר בפרופיל: ${escape_html(item.missingEquipment.map(equipmentLabel).join(", "))}`);
										},
										$$slots: { default: true }
									});
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> <div class="actions svelte-odx7iz">`);
								if (item.selected) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<a${attr("href", `${routePath("watch")}?videoId=${item.video._id}`)} class="svelte-odx7iz">לצפות</a>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<button type="button"${attr("disabled", !item.canSelect || actionId === item.video._id, true)} class="svelte-odx7iz">${escape_html(item.locked ? "נעול" : "לבחור לשבוע")}</button>`);
								}
								$$renderer.push(`<!--]--></div></div></article>`);
							}
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]-->`);
					},
					$$slots: {
						headerExtra: true,
						default: true
					}
				});
			}
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { VideosShell as t };
