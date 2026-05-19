import { U as attr, W as escape_html, a as derived, l as stringify, n as attr_class, o as ensure_array_like, r as attr_style } from "./dev.js";
import { r as useQuery } from "./client.svelte.js";
import { r as initAuth, s as api } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { i as equipmentLabel, r as durationLabel } from "./labels.js";
import { t as PageShell } from "./PageShell.js";
import { n as FormSection, t as EquipmentPicker } from "./EquipmentPicker.js";
//#region src/lib/features/studio/components/InstructorVideoManager.svelte
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
		const listQuery = useQuery(api.instructorVideos.listAll, () => auth.isAuthenticated ? {} : "skip");
		const library = derived(() => listQuery.data);
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
			PageShell($$renderer, {
				kicker: "HomeBody Studio",
				title: "ניהול וידאו",
				description: "העלאת שיעורי וידאו, ניהול תוכן, וקביעת לוח זמנים שבועי.",
				children: ($$renderer) => {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <div class="tabs svelte-19auows" role="tablist"><button${attr_class("tab svelte-19auows", void 0, { "active": tab === "library" })} role="tab"${attr("aria-selected", tab === "library")}>ספריה</button> <button${attr_class("tab svelte-19auows", void 0, { "active": tab === "upload" })} role="tab"${attr("aria-selected", tab === "upload")}>העלאה חדשה</button></div> `);
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
									$$renderer.push(`<div class="upload-progress svelte-19auows"><p>הקובץ הועלה. מעבדים אותו בשרת...</p> <div class="progress-bar svelte-19auows"><div class="progress-fill svelte-19auows" style="width: 100%"></div></div></div>`);
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
								$$renderer.push(`<!--]--> <form class="svelte-19auows"><label class="file-drop svelte-19auows"><input type="file" accept="video/*"${attr("disabled", uploadStatus === "uploading", true)} class="svelte-19auows"/> `);
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`<span class="drop-text svelte-19auows">גררי קובץ וידאו לכאן<br/><small class="svelte-19auows">או לחצי לבחירה</small></span>`);
								$$renderer.push(`<!--]--></label> `);
								if (uploadStatus === "uploading") {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<div class="upload-progress svelte-19auows"><span class="progress-label svelte-19auows">${escape_html(uploadProgress)}%</span> <div class="progress-bar svelte-19auows"><div class="progress-fill svelte-19auows"${attr_style(`width: ${stringify(uploadProgress)}%`)}></div></div></div>`);
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--> <label class="field"><span class="field__label">כותרת</span> <input${attr("value", title)} required="" maxlength="120"${attr("disabled", uploadStatus === "uploading", true)}/></label> <label class="field"><span class="field__label">תיאור</span> <textarea rows="3" maxlength="500"${attr("disabled", uploadStatus === "uploading", true)}>`);
								const $$body = escape_html(description);
								if ($$body) $$renderer.push(`${$$body}`);
								$$renderer.push(`</textarea></label> <div class="form-grid svelte-19auows"><label class="field"><span class="field__label">זמין מ-</span> <input type="datetime-local"${attr("value", availableFrom)}${attr("disabled", uploadStatus === "uploading", true)}/></label> <label class="field"><span class="field__label">זמין עד-</span> <input type="datetime-local"${attr("value", availableUntil)}${attr("disabled", uploadStatus === "uploading", true)}/></label></div> `);
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
								$$renderer.push(`<!----> <button class="btn btn--ink primary-action svelte-19auows" type="submit"${attr("disabled", true, true)}>${escape_html(uploadStatus === "uploading" ? "מעלה..." : "להעלות וידאו")}</button></form>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push("<!--[-1-->");
						if (listQuery.isLoading) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="skeleton-card"><div class="skeleton skeleton--lg"></div> <div class="skeleton"></div></div>`);
						} else if (library()) {
							$$renderer.push("<!--[1-->");
							$$renderer.push(`<div class="library svelte-19auows">`);
							if (library().published.length > 0) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<section class="library-section"><h2 class="section-title svelte-19auows">פעילים <span class="count svelte-19auows">(${escape_html(library().published.length)})</span></h2> <div class="video-grid svelte-19auows"><!--[-->`);
								const each_array = ensure_array_like(library().published);
								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let video = each_array[$$index_1];
									$$renderer.push(`<article class="video-card svelte-19auows"><div class="thumb svelte-19auows">`);
									if (video.thumbnailUrl) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<img${attr("src", video.thumbnailUrl)} alt="" loading="lazy" class="svelte-19auows"/>`);
									} else {
										$$renderer.push("<!--[-1-->");
										$$renderer.push(`<span class="thumb-placeholder svelte-19auows">${escape_html(durationLabel(video.durationSeconds))}</span>`);
									}
									$$renderer.push(`<!--]--> <span${attr_class(`thumb-badge ${stringify(statusBadgeClass(video.status))}`, "svelte-19auows")}>${escape_html(statusBadgeLabel(video.status))}</span></div> `);
									if (editingVideo === video._id) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<div class="card-edit svelte-19auows"><input class="edit-input svelte-19auows"${attr("value", editTitle)}/> <textarea class="edit-textarea svelte-19auows" rows="2">`);
										const $$body_1 = escape_html(editDescription);
										if ($$body_1) $$renderer.push(`${$$body_1}`);
										$$renderer.push(`</textarea> <div class="edit-actions svelte-19auows"><button class="btn btn--ink"${attr("disabled", actionId === video._id, true)}>שמור</button> <button class="btn btn--ghost">ביטול</button></div></div>`);
									} else {
										$$renderer.push("<!--[-1-->");
										$$renderer.push(`<div class="card-body svelte-19auows"><h3 class="svelte-19auows">${escape_html(video.title)}</h3> <p class="desc svelte-19auows">${escape_html(video.description)}</p> <div class="tags svelte-19auows"><span class="tag svelte-19auows">${escape_html(durationLabel(video.durationSeconds))}</span> <!--[-->`);
										const each_array_1 = ensure_array_like(video.requiredEquipment);
										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
											let eq = each_array_1[$$index];
											$$renderer.push(`<span class="tag svelte-19auows">${escape_html(equipmentLabel(eq))}</span>`);
										}
										$$renderer.push(`<!--]--></div> <div class="card-actions svelte-19auows"><button class="action svelte-19auows">ערוך</button> <button class="action svelte-19auows"${attr("disabled", actionId === video._id, true)}>פרסם</button> <button class="action action--danger svelte-19auows"${attr("disabled", actionId === video._id, true)}>מחק</button></div></div>`);
									}
									$$renderer.push(`<!--]--></article>`);
								}
								$$renderer.push(`<!--]--></div></section>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> `);
							if (library().drafts.length > 0) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<section class="library-section"><h2 class="section-title svelte-19auows">טיוטות <span class="count svelte-19auows">(${escape_html(library().drafts.length)})</span></h2> <div class="draft-list svelte-19auows"><!--[-->`);
								const each_array_2 = ensure_array_like(library().drafts);
								for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
									let video = each_array_2[$$index_2];
									$$renderer.push(`<article class="draft-row svelte-19auows"><div class="draft-info svelte-19auows"><h3 class="svelte-19auows">${escape_html(video.title)}</h3> <p class="desc svelte-19auows">${escape_html(video.description || "אין תיאור")}</p> <span${attr_class(`badge ${stringify(statusBadgeClass(video.status))}`, "svelte-19auows")}>${escape_html(statusBadgeLabel(video.status))}</span></div> <div class="draft-actions svelte-19auows"><button class="btn btn--ink"${attr("disabled", actionId === video._id, true)}>פרסם</button> <button class="btn btn--ghost danger"${attr("disabled", actionId === video._id, true)}>מחק</button></div></article>`);
								}
								$$renderer.push(`<!--]--></div></section>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> `);
							if (library().published.length === 0 && library().drafts.length === 0) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<p class="empty svelte-19auows">אין עדיין וידאו בספריה. העלי את השיעור הראשון בלשונית "העלאה חדשה".</p>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<p class="empty svelte-19auows">טוען ספריה...</p>`);
						}
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]-->`);
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
export { InstructorVideoManager as t };
