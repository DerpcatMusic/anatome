import { Q as attr, c as ensure_array_like, et as escape_html, n as attr_class, o as derived } from "../../../../../chunks/dev.js";
import { _ as useQuery, g as useConvexClient, r as initAuth, s as api, t as authQuery, u as resource } from "../../../../../chunks/session.svelte.js";
import { t as InstructorVideoManager } from "../../../../../chunks/InstructorVideoManager.js";
import { t as Button } from "../../../../../chunks/button.js";
import { t as Notice } from "../../../../../chunks/Notice.js";
import { t as PageShell } from "../../../../../chunks/PageShell.js";
import { i as equipmentLabel, r as durationLabel } from "../../../../../chunks/labels.js";
//#region src/lib/features/videos/components/VideosShell.svelte
function VideosShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const profileQuery = useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
		const role = derived(() => profileQuery.data?.role ?? "customer");
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
			$$renderer.push(`<div class="skeleton-shell"><div class="skeleton skeleton--hero"></div> <div class="skeleton-grid"><div class="skeleton"></div> <div class="skeleton"></div> <div class="skeleton"></div></div></div>`);
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="state-card"><p class="eyebrow">חשבון נעול</p> <h2>צריך להתחבר כדי לצפות בווידאו</h2> <a class="button-link" href="/">כניסה</a></div>`);
		} else if (isStaff()) {
			$$renderer.push("<!--[2-->");
			InstructorVideoManager($$renderer, {});
		} else if (libraryResource.error) {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="state-card">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(libraryResource.error?.message ?? "שגיאה בטעינת הספרייה")}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			if (Button) {
				$$renderer.push("<!--[-->");
				Button($$renderer, {
					class: "hb-button hb-button--ghost",
					type: "button",
					onclick: () => {
						libraryResource.refetch();
					},
					children: ($$renderer) => {
						$$renderer.push(`<!---->לנסות שוב`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
			$$renderer.push(`</div>`);
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
					$$renderer.push(`<!--]--> <section class="hero"><div class="hero-copy"><p class="eyebrow">גישה חדשה</p> <h2>הספרייה מאורגנת לפי קטגוריות ולא לפי שבוע</h2> <p>השיעורים מוצגים עכשיו כרשת תוכן יציבה: בעלות קבועה ל-Macroflow, וגישה זמנית ל-Microflow לפי
          מנוי פעיל.</p></div> <div class="hero-metrics"><div><span>${escape_html(ownedCount())}</span> <small>שיעורי Macroflow בבעלותך</small></div> <div><span>${escape_html(data().categoryGroups.length)}</span> <small>קטגוריות פעילות</small></div></div></section> <div class="section-stack"><!--[-->`);
					const each_array = ensure_array_like(data().categoryGroups);
					for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
						let group = each_array[$$index_2];
						$$renderer.push(`<section class="category-panel"><header class="category-head"><div><p class="eyebrow">${escape_html(categoryTitle(group))}</p> <h3>${escape_html(group.category.description ?? "קטגוריה אוצרה ידנית")}</h3></div> <span class="category-count">${escape_html(group.items.length)}</span></header> `);
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
							$$renderer.push(`<div class="video-grid"><!--[-->`);
							const each_array_1 = ensure_array_like(group.items);
							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array_1[$$index_1];
								$$renderer.push(`<article${attr_class("video-card", void 0, { "owned": item.owned })}><div class="thumb">`);
								if (item.thumbnailUrl) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<img${attr("src", item.thumbnailUrl)} alt="" loading="lazy"/>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<span class="thumb-placeholder">${escape_html(durationLabel(item.durationSeconds))}</span>`);
								}
								$$renderer.push(`<!--]--></div> <div class="video-card__meta"><p class="status">${escape_html(videoStateLabel(item))}</p> <span class="duration">${escape_html(durationLabel(item.durationSeconds))}</span></div> <h4>${escape_html(item.title)}</h4> <p class="desc">${escape_html(item.description)}</p> <div class="tags"><!--[-->`);
								const each_array_2 = ensure_array_like(item.requiredEquipment);
								for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
									let equipment = each_array_2[$$index];
									$$renderer.push(`<span>${escape_html(equipmentLabel(equipment))}</span>`);
								}
								$$renderer.push(`<!--]--></div> <div class="actions">`);
								if (item.owned) {
									$$renderer.push("<!--[0-->");
									if (Button) {
										$$renderer.push("<!--[-->");
										Button($$renderer, {
											class: "hb-button hb-button--ink",
											href: `/watch?videoId=${item._id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->לצפות`);
											},
											$$slots: { default: true }
										});
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
								} else {
									$$renderer.push("<!--[-1-->");
									if (Button) {
										$$renderer.push("<!--[-->");
										Button($$renderer, {
											class: "hb-button hb-button--sky",
											type: "button",
											onclick: () => purchaseMacroflow(item._id),
											disabled: actionId === item._id,
											children: ($$renderer) => {
												$$renderer.push(`<!---->לרכוש Macroflow`);
											},
											$$slots: { default: true }
										});
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
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
//#region src/routes/(app)/u/videos/+page.svelte
function _page($$renderer) {
	VideosShell($$renderer, {});
}
//#endregion
export { _page as default };
