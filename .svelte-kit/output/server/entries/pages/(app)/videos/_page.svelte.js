import { H as attr, U as escape_html, a as derived, l as stringify, n as attr_class, o as ensure_array_like, r as attr_style } from "../../../../chunks/dev.js";
import { n as getCachedRole, o as api, r as initAuth, s as resource, t as authQuery } from "../../../../chunks/session.svelte.js";
import { t as Notice } from "../../../../chunks/Notice.js";
import { i as equipmentLabel, r as durationLabel } from "../../../../chunks/labels.js";
import { t as AppLayout } from "../../../../chunks/AppLayout.js";
import { t as PageShell } from "../../../../chunks/PageShell.js";
import { n as FormSection, t as EquipmentPicker } from "../../../../chunks/EquipmentPicker.js";
//#region src/components/app/InstructorVideoManager.svelte
function InstructorVideoManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		let tab = "library";
		let title = "";
		let description = "";
		let requiredEquipment = ["mat"];
		let uploadProgress = 0;
		let uploadStatus = "idle";
		let uploadError = "";
		let actionId = null;
		let editingVideo = null;
		let editTitle = "";
		let editDescription = "";
		const listResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return null;
			return await authQuery(api.videos.listAll, {});
		});
		const library = derived(() => listResource.current);
		function startOfWeek() {
			const now = /* @__PURE__ */ new Date();
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1);
			const monday = new Date(now.setDate(diff));
			monday.setHours(0, 0, 0, 0);
			return monday.getTime();
		}
		function endOfWeek() {
			return startOfWeek() + 10080 * 60 * 1e3 - 1;
		}
		function toDateTimeLocal(ts) {
			const d = new Date(ts);
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
		}
		let availableFrom = toDateTimeLocal(startOfWeek());
		let availableUntil = toDateTimeLocal(endOfWeek());
		function statusBadgeClass(status) {
			if (status === "published") return "badge--published";
			if (status === "draft") return "badge--draft";
			return "badge--archived";
		}
		function statusBadgeLabel(status) {
			if (status === "published") return "פעיל";
			if (status === "draft") return "טיוטה";
			return "בארכיון";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			AppLayout($$renderer, {
				children: ($$renderer) => {
					PageShell($$renderer, {
						kicker: "HomeBody Studio",
						title: "ניהול וידאו",
						description: "העלאת שיעורי וידאו, ניהול תוכן, וקביעת לוח זמנים שבועי.",
						children: ($$renderer) => {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> <div class="tabs svelte-xxgrk3" role="tablist"><button${attr_class("tab svelte-xxgrk3", void 0, { "active": tab === "library" })} role="tab"${attr("aria-selected", tab === "library")}>ספריה</button> <button${attr_class("tab svelte-xxgrk3", void 0, { "active": tab === "upload" })} role="tab"${attr("aria-selected", tab === "upload")}>העלאה חדשה</button></div> `);
							if (tab === "upload") {
								$$renderer.push("<!--[0-->");
								FormSection($$renderer, {
									title: "העלאת וידאו חדש",
									children: ($$renderer) => {
										if (uploadStatus === "ready") {
											$$renderer.push("<!--[0-->");
											Notice($$renderer, {
												tone: "success",
												children: ($$renderer) => {
													$$renderer.push(`<!---->הווידאו הועלה בהצלחה! מעבדים אותו עכשיו — יופיע בספריה תוך כמה דקות.`);
												},
												$$slots: { default: true }
											});
										} else if (uploadStatus === "processing") {
											$$renderer.push("<!--[1-->");
											$$renderer.push(`<div class="upload-progress svelte-xxgrk3"><p>הקובץ הועלה. מעבדים אותו בשרת...</p> <div class="progress-bar svelte-xxgrk3"><div class="progress-fill svelte-xxgrk3" style="width: 100%"></div></div></div>`);
										} else if (uploadStatus === "error") {
											$$renderer.push("<!--[2-->");
											Notice($$renderer, {
												tone: "danger",
												children: ($$renderer) => {
													$$renderer.push(`<!---->${escape_html(uploadError)}`);
												},
												$$slots: { default: true }
											});
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--> <form class="svelte-xxgrk3"><label class="file-drop svelte-xxgrk3"><input type="file" accept="video/*"${attr("disabled", uploadStatus === "uploading", true)} class="svelte-xxgrk3"/> `);
										$$renderer.push("<!--[-1-->");
										$$renderer.push(`<span class="drop-text svelte-xxgrk3">גררי קובץ וידאו לכאן<br/><small class="svelte-xxgrk3">או לחצי לבחירה</small></span>`);
										$$renderer.push(`<!--]--></label> `);
										if (uploadStatus === "uploading") {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<div class="upload-progress svelte-xxgrk3"><span class="progress-label svelte-xxgrk3">${escape_html(uploadProgress)}%</span> <div class="progress-bar svelte-xxgrk3"><div class="progress-fill svelte-xxgrk3"${attr_style(`width: ${stringify(uploadProgress)}%`)}></div></div></div>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--> <label class="field"><span class="field__label">כותרת</span> <input${attr("value", title)} required="" maxlength="120"${attr("disabled", uploadStatus === "uploading", true)}/></label> <label class="field"><span class="field__label">תיאור</span> <textarea rows="3" maxlength="500"${attr("disabled", uploadStatus === "uploading", true)}>`);
										const $$body = escape_html(description);
										if ($$body) $$renderer.push(`${$$body}`);
										$$renderer.push(`</textarea></label> <div class="form-grid svelte-xxgrk3"><label class="field"><span class="field__label">זמין מ-</span> <input type="datetime-local"${attr("value", availableFrom)}${attr("disabled", uploadStatus === "uploading", true)}/></label> <label class="field"><span class="field__label">זמין עד-</span> <input type="datetime-local"${attr("value", availableUntil)}${attr("disabled", uploadStatus === "uploading", true)}/></label></div> `);
										EquipmentPicker($$renderer, {
											disabled: uploadStatus === "uploading",
											get selected() {
												return requiredEquipment;
											},
											set selected($$value) {
												requiredEquipment = $$value;
												$$settled = false;
											}
										});
										$$renderer.push(`<!----> <button class="btn btn--ink primary-action svelte-xxgrk3" type="submit"${attr("disabled", true, true)}>${escape_html(uploadStatus === "uploading" ? "מעלה..." : "להעלות וידאו")}</button></form>`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push("<!--[-1-->");
								if (listResource.loading) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<div class="skeleton-card"><div class="skeleton skeleton--lg"></div> <div class="skeleton"></div></div>`);
								} else if (library()) {
									$$renderer.push("<!--[1-->");
									$$renderer.push(`<div class="library svelte-xxgrk3">`);
									if (library().published.length > 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<section class="library-section"><h2 class="section-title svelte-xxgrk3">פעילים <span class="count svelte-xxgrk3">(${escape_html(library().published.length)})</span></h2> <div class="video-grid svelte-xxgrk3"><!--[-->`);
										const each_array = ensure_array_like(library().published);
										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let video = each_array[$$index_1];
											$$renderer.push(`<article class="video-card svelte-xxgrk3"><div class="thumb svelte-xxgrk3">`);
											if (video.thumbnailUrl) {
												$$renderer.push("<!--[0-->");
												$$renderer.push(`<img${attr("src", video.thumbnailUrl)} alt="" loading="lazy" class="svelte-xxgrk3"/>`);
											} else {
												$$renderer.push("<!--[-1-->");
												$$renderer.push(`<span class="thumb-placeholder svelte-xxgrk3">${escape_html(durationLabel(video.durationSeconds))}</span>`);
											}
											$$renderer.push(`<!--]--> <span${attr_class(`thumb-badge ${stringify(statusBadgeClass(video.status))}`, "svelte-xxgrk3")}>${escape_html(statusBadgeLabel(video.status))}</span></div> `);
											if (editingVideo === video._id) {
												$$renderer.push("<!--[0-->");
												$$renderer.push(`<div class="card-edit svelte-xxgrk3"><input class="edit-input svelte-xxgrk3"${attr("value", editTitle)}/> <textarea class="edit-textarea svelte-xxgrk3" rows="2">`);
												const $$body_1 = escape_html(editDescription);
												if ($$body_1) $$renderer.push(`${$$body_1}`);
												$$renderer.push(`</textarea> <div class="edit-actions svelte-xxgrk3"><button class="btn btn--ink"${attr("disabled", actionId === video._id, true)}>שמור</button> <button class="btn btn--ghost">ביטול</button></div></div>`);
											} else {
												$$renderer.push("<!--[-1-->");
												$$renderer.push(`<div class="card-body svelte-xxgrk3"><h3 class="svelte-xxgrk3">${escape_html(video.title)}</h3> <p class="desc svelte-xxgrk3">${escape_html(video.description)}</p> <div class="tags svelte-xxgrk3"><span class="tag svelte-xxgrk3">${escape_html(durationLabel(video.durationSeconds))}</span> <!--[-->`);
												const each_array_1 = ensure_array_like(video.requiredEquipment);
												for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
													let eq = each_array_1[$$index];
													$$renderer.push(`<span class="tag svelte-xxgrk3">${escape_html(equipmentLabel(eq))}</span>`);
												}
												$$renderer.push(`<!--]--></div> <div class="card-actions svelte-xxgrk3"><button class="action svelte-xxgrk3">ערוך</button> <button class="action svelte-xxgrk3"${attr("disabled", actionId === video._id, true)}>פרסם</button> <button class="action action--danger svelte-xxgrk3"${attr("disabled", actionId === video._id, true)}>מחק</button></div></div>`);
											}
											$$renderer.push(`<!--]--></article>`);
										}
										$$renderer.push(`<!--]--></div></section>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--> `);
									if (library().drafts.length > 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<section class="library-section"><h2 class="section-title svelte-xxgrk3">טיוטות <span class="count svelte-xxgrk3">(${escape_html(library().drafts.length)})</span></h2> <div class="draft-list svelte-xxgrk3"><!--[-->`);
										const each_array_2 = ensure_array_like(library().drafts);
										for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
											let video = each_array_2[$$index_2];
											$$renderer.push(`<article class="draft-row svelte-xxgrk3"><div class="draft-info svelte-xxgrk3"><h3 class="svelte-xxgrk3">${escape_html(video.title)}</h3> <p class="desc svelte-xxgrk3">${escape_html(video.description || "אין תיאור")}</p> <span${attr_class(`badge ${stringify(statusBadgeClass(video.status))}`, "svelte-xxgrk3")}>${escape_html(statusBadgeLabel(video.status))}</span></div> <div class="draft-actions svelte-xxgrk3"><button class="btn btn--ink"${attr("disabled", actionId === video._id, true)}>פרסם</button> <button class="btn btn--ghost danger"${attr("disabled", actionId === video._id, true)}>מחק</button></div></article>`);
										}
										$$renderer.push(`<!--]--></div></section>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--> `);
									if (library().published.length === 0 && library().drafts.length === 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<p class="empty svelte-xxgrk3">אין עדיין וידאו בספריה. העלי את השיעור הראשון בלשונית "העלאה חדשה".</p>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--></div>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<p class="empty svelte-xxgrk3">טוען ספריה...</p>`);
								}
								$$renderer.push(`<!--]-->`);
							}
							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
//#region src/components/app/VideosShell.svelte
function VideosShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const role = derived(() => getCachedRole() ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		new Intl.DateTimeFormat("he-IL", {
			weekday: "short",
			day: "numeric",
			month: "short",
			timeZone: "Asia/Jerusalem"
		});
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
			return `${fullFormatter.format(start)} – ${fullFormatter.format(new Date(accessEndsAt))}`;
		}
		function statusLabel(item) {
			if (item.selected) return "נבחר לשבוע";
			if (item.missingEquipment.length > 0) return "חסר ציוד";
			if ((data()?.remainingCredits ?? 0) <= 0) return "נעול";
			return "זמין לבחירה";
		}
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-6uvm5a"><div class="skeleton skeleton--large svelte-6uvm5a"></div> <div class="skeleton svelte-6uvm5a"></div></div>`);
				},
				$$slots: { default: true }
			});
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-6uvm5a"><p class="eyebrow">חשבון נעול</p> <h2>צריך להתחבר כדי לצפות בווידאו</h2> <a class="button-link svelte-6uvm5a" href="/">כניסה</a></div>`);
				},
				$$slots: { default: true }
			});
		} else if (isStaff()) {
			$$renderer.push("<!--[2-->");
			InstructorVideoManager($$renderer, {});
		} else if (dataResource.error) {
			$$renderer.push("<!--[3-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-6uvm5a">`);
					Notice($$renderer, {
						tone: "danger",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(dataResource.error?.message ?? "שגיאה")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!----> <button type="button" class="btn btn--ghost svelte-6uvm5a">לנסות שוב</button></div>`);
				},
				$$slots: { default: true }
			});
		} else if (data()) {
			$$renderer.push("<!--[4-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					{
						function headerExtra($$renderer) {
							$$renderer.push(`<div class="credit-meter svelte-6uvm5a"><span class="svelte-6uvm5a">${escape_html(data().remainingCredits)}</span> <small class="svelte-6uvm5a">קרדיטים פנויים</small></div>`);
						}
						PageShell($$renderer, {
							title: "בחירת וידאו שבועית",
							kicker: "HomeBody Video",
							description: "בוחרים שיעורי וידאו לשבוע הזה עם קרדיטי הווידאו שלך. מה שבחרת פתוח לצפייה עד סוף השבוע.",
							headerExtra,
							children: ($$renderer) => {
								if (data().accessEndsAt) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<div class="week-banner svelte-6uvm5a"><span class="week-label svelte-6uvm5a">${escape_html(weekLabel(data().accessEndsAt))}</span> <span class="week-count svelte-6uvm5a">נבחרו ${escape_html(data().selectedCount)} מתוך ${escape_html(data().videos.length)}</span></div>`);
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> `);
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> `);
								if (data().videos.length === 0) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<div class="state-card svelte-6uvm5a"><p>אין עדיין וידאו פעיל לשבוע הזה. בדוק מאוחר יותר.</p></div>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<div class="video-grid svelte-6uvm5a"><!--[-->`);
									const each_array = ensure_array_like(data().videos);
									for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
										let item = each_array[$$index_1];
										$$renderer.push(`<article${attr_class("video-card svelte-6uvm5a", void 0, {
											"locked": item.locked,
											"selected": item.selected
										})}><div class="thumb svelte-6uvm5a">`);
										if (item.video.thumbnailUrl) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<img${attr("src", item.video.thumbnailUrl)} alt="" loading="lazy" class="svelte-6uvm5a"/>`);
										} else {
											$$renderer.push("<!--[-1-->");
											$$renderer.push(`<span class="thumb-placeholder svelte-6uvm5a"><span class="thumb-duration svelte-6uvm5a">${escape_html(durationLabel(item.video.durationSeconds))}</span> HomeBody</span>`);
										}
										$$renderer.push(`<!--]--></div> <div class="video-card__body svelte-6uvm5a"><div class="video-card__top svelte-6uvm5a"><p class="status svelte-6uvm5a">${escape_html(statusLabel(item))}</p> <span class="duration svelte-6uvm5a">${escape_html(durationLabel(item.video.durationSeconds))}</span></div> <h3 class="svelte-6uvm5a">${escape_html(item.video.title)}</h3> <p class="desc svelte-6uvm5a">${escape_html(item.video.description)}</p> <div class="tags svelte-6uvm5a"><!--[-->`);
										const each_array_1 = ensure_array_like(item.video.requiredEquipment);
										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
											let equipment = each_array_1[$$index];
											$$renderer.push(`<span class="svelte-6uvm5a">${escape_html(equipmentLabel(equipment))}</span>`);
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
										$$renderer.push(`<!--]--> <div class="actions svelte-6uvm5a">`);
										if (item.selected) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<a${attr("href", `/watch?videoId=${item.video._id}`)} class="svelte-6uvm5a">לצפות</a>`);
										} else {
											$$renderer.push("<!--[-1-->");
											$$renderer.push(`<button type="button"${attr("disabled", !item.canSelect || actionId === item.video._id, true)} class="svelte-6uvm5a">${escape_html(item.locked ? "נעול" : "לבחור לשבוע")}</button>`);
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
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/routes/(app)/videos/+page.svelte
function _page($$renderer) {
	VideosShell($$renderer, {});
}
//#endregion
export { _page as default };
