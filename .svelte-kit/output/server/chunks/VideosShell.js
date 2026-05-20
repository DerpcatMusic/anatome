import { c as ensure_array_like, et as attr, n as attr_class, nt as escape_html, o as derived } from "./dev.js";
import { n as routePath } from "./context.js";
import { c as resource, f as useConvexClient, n as getCachedRole, r as initAuth, s as api, t as authQuery } from "./session.svelte.js";
import { t as InstructorVideoManager } from "./InstructorVideoManager.js";
import { t as Button_1 } from "./Button.js";
import { t as Notice } from "./Notice.js";
import { i as equipmentLabel, r as durationLabel } from "./labels.js";
import { t as PageShell } from "./PageShell.js";
//#region src/lib/features/videos/components/VideosShell.svelte
function VideosShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const role = derived(() => getCachedRole() ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const client = useConvexClient();
		let actionId = null;
		let actionError = "";
		const libraryResource = resource(() => auth.isAuthenticated && !isStaff(), async (shouldFetch) => {
			if (!shouldFetch) return null;
			return await authQuery(api.video.catalog.listLibrary, {});
		});
		const data = derived(() => libraryResource.current);
		const ownedCount = derived(() => data() ? data().videos.filter((video) => video.owned).length : 0);
		async function purchaseMacroflow(videoId) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.entitlements.purchaseMacroflow, { videoId });
				await libraryResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן את הזכאות.";
			} finally {
				actionId = null;
			}
		}
		function categoryTitle(group) {
			return group.category.name;
		}
		function videoStateLabel(item) {
			return item.owned ? "Macroflow" : "Locked";
		}
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="skeleton-shell svelte-odx7iz"><div class="skeleton skeleton--hero svelte-odx7iz"></div> <div class="skeleton-grid svelte-odx7iz"><div class="skeleton"></div> <div class="skeleton"></div> <div class="skeleton"></div></div></div>`);
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="state-card svelte-odx7iz"><p class="eyebrow svelte-odx7iz">חשבון נעול</p> <h2>צריך להתחבר כדי לצפות בווידאו</h2> <a class="button-link svelte-odx7iz" href="/">כניסה</a></div>`);
		} else if (isStaff()) {
			$$renderer.push("<!--[2-->");
			InstructorVideoManager($$renderer, {});
		} else if (libraryResource.error) {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="state-card svelte-odx7iz">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(libraryResource.error?.message ?? "שגיאה בטעינת הספרייה")}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button_1($$renderer, {
				type: "button",
				tone: "ghost",
				onclick: () => {
					libraryResource.refetch();
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->לנסות שוב`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div>`);
		} else if (data()) {
			$$renderer.push("<!--[4-->");
			PageShell($$renderer, {
				kicker: "HomeBody Video",
				title: "ספריית VOD",
				description: "Macroflow נרכש פעם אחת ונשאר שלך. Microflow נפתח אוטומטית כשיש מנוי פעיל.",
				children: ($$renderer) => {
					if (actionError) {
						$$renderer.push("<!--[0-->");
						Notice($$renderer, {
							tone: "danger",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(actionError)}`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <section class="hero svelte-odx7iz"><div class="hero-copy svelte-odx7iz"><p class="eyebrow svelte-odx7iz">גישה חדשה</p> <h2 class="svelte-odx7iz">הספרייה מאורגנת לפי קטגוריות ולא לפי שבוע</h2> <p class="svelte-odx7iz">השיעורים מוצגים עכשיו כרשת תוכן יציבה: בעלות קבועה ל-Macroflow, וגישה זמנית ל-Microflow לפי
          מנוי פעיל.</p></div> <div class="hero-metrics svelte-odx7iz"><div class="svelte-odx7iz"><span class="svelte-odx7iz">${escape_html(ownedCount())}</span> <small class="svelte-odx7iz">שיעורי Macroflow בבעלותך</small></div> <div class="svelte-odx7iz"><span class="svelte-odx7iz">${escape_html(data().categoryGroups.length)}</span> <small class="svelte-odx7iz">קטגוריות פעילות</small></div></div></section> <div class="section-stack svelte-odx7iz"><!--[-->`);
					const each_array = ensure_array_like(data().categoryGroups);
					for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
						let group = each_array[$$index_2];
						$$renderer.push(`<section class="category-panel svelte-odx7iz"><header class="category-head svelte-odx7iz"><div><p class="eyebrow svelte-odx7iz">${escape_html(categoryTitle(group))}</p> <h3 class="svelte-odx7iz">${escape_html(group.category.description ?? "קטגוריה אוצרה ידנית")}</h3></div> <span class="category-count svelte-odx7iz">${escape_html(group.items.length)}</span></header> `);
						if (group.items.length === 0) {
							$$renderer.push("<!--[0-->");
							Notice($$renderer, {
								tone: "neutral",
								children: ($$renderer) => {
									$$renderer.push(`<!---->אין עדיין שיעורים משויכים לקטגוריה הזו.`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<div class="video-grid svelte-odx7iz"><!--[-->`);
							const each_array_1 = ensure_array_like(group.items);
							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array_1[$$index_1];
								$$renderer.push(`<article${attr_class("video-card svelte-odx7iz", void 0, { "owned": item.owned })}><div class="thumb svelte-odx7iz">`);
								if (item.thumbnailUrl) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<img${attr("src", item.thumbnailUrl)} alt="" loading="lazy" class="svelte-odx7iz"/>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<span class="thumb-placeholder svelte-odx7iz">${escape_html(durationLabel(item.durationSeconds))}</span>`);
								}
								$$renderer.push(`<!--]--></div> <div class="video-card__meta svelte-odx7iz"><p class="status svelte-odx7iz">${escape_html(videoStateLabel(item))}</p> <span class="duration svelte-odx7iz">${escape_html(durationLabel(item.durationSeconds))}</span></div> <h4 class="svelte-odx7iz">${escape_html(item.title)}</h4> <p class="desc svelte-odx7iz">${escape_html(item.description)}</p> <div class="tags svelte-odx7iz"><!--[-->`);
								const each_array_2 = ensure_array_like(item.requiredEquipment);
								for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
									let equipment = each_array_2[$$index];
									$$renderer.push(`<span class="svelte-odx7iz">${escape_html(equipmentLabel(equipment))}</span>`);
								}
								$$renderer.push(`<!--]--></div> <div class="actions svelte-odx7iz">`);
								if (item.owned) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<a${attr("href", `${routePath("watch")}?videoId=${item._id}`)} class="svelte-odx7iz">לצפות</a>`);
								} else {
									$$renderer.push("<!--[-1-->");
									Button_1($$renderer, {
										type: "button",
										tone: "sky",
										onclick: () => purchaseMacroflow(item._id),
										disabled: actionId === item._id,
										children: ($$renderer) => {
											$$renderer.push(`<!---->לרכוש Macroflow`);
										},
										$$slots: { default: true }
									});
								}
								$$renderer.push(`<!--]--></div></article>`);
							}
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]--></section>`);
					}
					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { VideosShell as t };
