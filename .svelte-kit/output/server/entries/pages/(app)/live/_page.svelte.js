import "../../../../chunks/index-server.js";
import { H as attr, U as escape_html, a as derived, l as stringify, n as attr_class, o as ensure_array_like } from "../../../../chunks/dev.js";
import { i as setCachedRole, o as api, t as authQuery } from "../../../../chunks/session.svelte.js";
import { t as Notice } from "../../../../chunks/Notice.js";
import { t as AppLayout } from "../../../../chunks/AppLayout.js";
import { t as AuthGuard } from "../../../../chunks/AuthGuard.js";
import { t as PageShell } from "../../../../chunks/PageShell.js";
import { n as FormSection, t as EquipmentPicker } from "../../../../chunks/EquipmentPicker.js";
//#region src/components/live/WeeklyAgenda.svelte
function WeeklyAgenda($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { classes, onStart, onEnd, actionId } = $$props;
		const hebrewDays = [
			"א",
			"ב",
			"ג",
			"ד",
			"ה",
			"ו",
			"ש"
		];
		const dayFormatter = new Intl.DateTimeFormat("he-IL", {
			weekday: "short",
			day: "numeric",
			month: "short",
			timeZone: "Asia/Jerusalem"
		});
		const timeFormatter = new Intl.DateTimeFormat("he-IL", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jerusalem"
		});
		function getDayStart(ts) {
			const d = new Date(ts);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		}
		function getWeekStart(ts) {
			const d = new Date(ts);
			const day = d.getDay();
			const diff = d.getDate() - day + (day === 0 ? -6 : 1);
			const monday = new Date(d.setDate(diff));
			monday.setHours(0, 0, 0, 0);
			return monday.getTime();
		}
		const now = Date.now();
		const weekStart = derived(() => getWeekStart(now));
		const weekDays = derived(() => Array.from({ length: 7 }, (_, i) => {
			const start = weekStart() + i * 24 * 60 * 60 * 1e3;
			return {
				start,
				label: dayFormatter.format(new Date(start)),
				dayIndex: (new Date(start).getDay() + 6) % 7,
				isToday: getDayStart(start) === getDayStart(now)
			};
		}));
		const classesByDay = derived(() => () => {
			const map = /* @__PURE__ */ new Map();
			for (const day of weekDays()) {
				const dayEnd = day.start + 1440 * 60 * 1e3;
				map.set(day.start, classes.filter((c) => c.startsAt >= day.start && c.startsAt < dayEnd).sort((a, b) => a.startsAt - b.startsAt));
			}
			return map;
		});
		function statusClass(status) {
			if (status === "live") return "status--live";
			if (status === "scheduled") return "status--scheduled";
			if (status === "ended") return "status--ended";
			return "status--other";
		}
		function statusDot(status) {
			if (status === "live") return "●";
			if (status === "scheduled") return "○";
			return "·";
		}
		$$renderer.push(`<div class="agenda svelte-19p47cs"><div class="agenda-header svelte-19p47cs"><p class="eyebrow svelte-19p47cs">Weekly Schedule</p> <h2 class="svelte-19p47cs">לוח שבועי</h2></div> <div class="agenda-grid svelte-19p47cs"><!--[-->`);
		const each_array = ensure_array_like(weekDays());
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let day = each_array[$$index_1];
			const dayClasses = classesByDay()().get(day.start) ?? [];
			$$renderer.push(`<div${attr_class("day-col svelte-19p47cs", void 0, { "today": day.isToday })}><div class="day-header svelte-19p47cs"><span class="day-name svelte-19p47cs">${escape_html(hebrewDays[day.dayIndex])}</span> <span class="day-date svelte-19p47cs">${escape_html(day.label)}</span></div> <div class="day-classes svelte-19p47cs">`);
			if (dayClasses.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="day-empty svelte-19p47cs">—</div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_1 = ensure_array_like(dayClasses);
				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let liveClass = each_array_1[$$index];
					$$renderer.push(`<article${attr_class(`class-card ${stringify(statusClass(liveClass.status))}`, "svelte-19p47cs")}><div class="class-time svelte-19p47cs"><span class="dot svelte-19p47cs">${escape_html(statusDot(liveClass.status))}</span> <span>${escape_html(timeFormatter.format(new Date(liveClass.startsAt)))}</span></div> <h4 class="class-title svelte-19p47cs">${escape_html(liveClass.title)}</h4> <p class="class-meta svelte-19p47cs">${escape_html(liveClass.capacity)} מקומות ·
                  ${escape_html(liveClass.type === "one_on_one" ? "1:1" : "קבוצתי")}</p> <div class="class-actions svelte-19p47cs">`);
					if (liveClass.status === "scheduled") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button class="btn btn--ink svelte-19p47cs"${attr("disabled", actionId === liveClass._id, true)}>${escape_html(actionId === liveClass._id ? "..." : "התחל")}</button>`);
					} else if (liveClass.status === "live") {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<a class="btn btn--sky svelte-19p47cs"${attr("href", `/live-room?classId=${liveClass._id}`)}>חדר</a> <button class="btn btn--danger svelte-19p47cs"${attr("disabled", actionId === liveClass._id, true)}>סיים</button>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span class="status-label svelte-19p47cs">${escape_html(liveClass.status)}</span>`);
					}
					$$renderer.push(`<!--]--></div></article>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}
//#endregion
//#region src/components/app/LiveStudioShell.svelte
function LiveStudioShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let profile = null;
		let classes = [];
		let loading = true;
		let error = "";
		let actionId = null;
		let title = "פילאטיס לייב - נשימה, כוח ותנועה";
		let description = "שיעור דו־כיווני קטן עם תיקונים אישיים. הכיני מרחב שקט, מצלמה פתוחה וציוד מתאים.";
		let liveType = "group_live";
		let startsAtLocal = defaultStartsAtLocal();
		let durationMinutes = 50;
		let joinOpensMinutesBefore = 10;
		let capacity = 12;
		let requiredEquipment = ["mat"];
		function defaultStartsAtLocal() {
			const date = new Date(Date.now() + 3600 * 1e3);
			date.setMinutes(0, 0, 0);
			return toDateTimeLocal(date);
		}
		function toDateTimeLocal(date) {
			const pad = (value) => String(value).padStart(2, "0");
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}
		async function load() {
			loading = true;
			error = "";
			try {
				profile = await authQuery(api.appProfiles.viewer, {});
				if (profile === null || profile.role !== "admin" && profile.role !== "instructor") {
					error = "רק מדריכה או אדמין יכולות לפתוח לייב";
					loading = false;
					return;
				}
				setCachedRole(profile.role);
				classes = await authQuery(api.instructorLive.listMine, {}) ?? [];
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לטעון את אזור הלייב.";
			} finally {
				loading = false;
			}
		}
		async function startLive(liveClassId) {
			actionId = liveClassId;
			error = "";
			try {
				await null.mutation(api.instructorLive.startLive, { liveClassId });
				await load();
				window.location.assign(`/live-room?classId=${liveClassId}`);
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו להתחיל את הלייב.";
			} finally {
				actionId = null;
			}
		}
		async function endLive(liveClassId) {
			actionId = liveClassId;
			error = "";
			try {
				await null.mutation(api.instructorLive.endLive, { liveClassId });
				await load();
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לסיים את הלייב.";
			} finally {
				actionId = null;
			}
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			AppLayout($$renderer, {
				role: profile?.role ?? null,
				children: ($$renderer) => {
					AuthGuard($$renderer, {
						role: "instructor",
						children: ($$renderer) => {
							if (loading) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<div class="auth-guard__loading svelte-1xoq3ji"><div class="skeleton skeleton--title svelte-1xoq3ji"></div> <div class="skeleton skeleton--text svelte-1xoq3ji"></div></div>`);
							} else if (error) {
								$$renderer.push("<!--[1-->");
								$$renderer.push(`<div class="auth-guard__state svelte-1xoq3ji"><p class="eyebrow svelte-1xoq3ji">שגיאה</p> <h2 class="svelte-1xoq3ji">${escape_html(error)}</h2> <button class="svelte-1xoq3ji">נסה שוב</button></div>`);
							} else {
								$$renderer.push("<!--[-1-->");
								PageShell($$renderer, {
									kicker: "HomeBody Studio",
									title: "יצירת לייב פילאטיס",
									description: "מקום אחד לתזמן שיעור, לבחור ציוד חובה, לפתוח חדר LiveKit ולתת למשתתפות להצטרף רק אם הן מתאימות.",
									badge: profile?.role === "admin" ? "Admin" : "Instructor",
									children: ($$renderer) => {
										if (error) {
											$$renderer.push("<!--[0-->");
											Notice($$renderer, {
												tone: "danger",
												children: ($$renderer) => {
													$$renderer.push(`<!---->${escape_html(error)}`);
												},
												$$slots: { default: true }
											});
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--> <div class="studio-grid svelte-1xoq3ji">`);
										FormSection($$renderer, {
											title: "תזמון שיעור חדש",
											children: ($$renderer) => {
												$$renderer.push(`<form class="svelte-1xoq3ji"><div class="live-type-switch svelte-1xoq3ji" role="radiogroup" aria-label="סוג לייב"><label${attr_class("svelte-1xoq3ji", void 0, { "selected": liveType === "group_live" })}><input type="radio"${attr("checked", liveType === "group_live", true)} value="group_live" class="svelte-1xoq3ji"/> <span class="svelte-1xoq3ji">לייב קבוצתי</span> <small class="svelte-1xoq3ji">עד 12 משתתפות, RSVP, קרדיט לייב אחד</small></label> <label${attr_class("svelte-1xoq3ji", void 0, { "selected": liveType === "one_on_one" })}><input type="radio"${attr("checked", liveType === "one_on_one", true)} value="one_on_one" class="svelte-1xoq3ji"/> <span class="svelte-1xoq3ji">1:1 אישי</span> <small class="svelte-1xoq3ji">משתתפת אחת, קרדיט 1:1 אחד</small></label></div> <label class="field svelte-1xoq3ji"><span class="field__label svelte-1xoq3ji">כותרת</span> <input${attr("value", title)} required="" maxlength="120" class="svelte-1xoq3ji"/></label> <label class="field svelte-1xoq3ji"><span class="field__label svelte-1xoq3ji">תיאור קצר</span> <textarea rows="3" maxlength="500" class="svelte-1xoq3ji">`);
												const $$body = escape_html(description);
												if ($$body) $$renderer.push(`${$$body}`);
												$$renderer.push(`</textarea></label> <div class="form-grid svelte-1xoq3ji"><label class="field svelte-1xoq3ji"><span class="field__label svelte-1xoq3ji">מתי מתחילים</span> <input type="datetime-local"${attr("value", startsAtLocal)} required="" class="svelte-1xoq3ji"/></label> <label class="field svelte-1xoq3ji"><span class="field__label svelte-1xoq3ji">משך בדקות</span> <input type="number" min="15" max="180"${attr("value", durationMinutes)} class="svelte-1xoq3ji"/></label> <label class="field svelte-1xoq3ji"><span class="field__label svelte-1xoq3ji">פתיחת כניסה לפני</span> <input type="number" min="0" max="60"${attr("value", joinOpensMinutesBefore)} class="svelte-1xoq3ji"/></label> <label class="field svelte-1xoq3ji"><span class="field__label svelte-1xoq3ji">מקומות</span> <input type="number" min="1" max="12"${attr("value", capacity)}${attr("disabled", liveType === "one_on_one", true)} class="svelte-1xoq3ji"/></label></div> `);
												EquipmentPicker($$renderer, {
													label: "ציוד חובה לשיעור",
													get selected() {
														return requiredEquipment;
													},
													set selected($$value) {
														requiredEquipment = $$value;
														$$settled = false;
													}
												});
												$$renderer.push(`<!----> <button class="btn btn--ink primary-action svelte-1xoq3ji" type="submit"${attr("disabled", actionId === "create" || requiredEquipment.length === 0, true)}>${escape_html(actionId === "create" ? "יוצרות..." : "לתזמן לייב")}</button></form>`);
											},
											$$slots: { default: true }
										});
										$$renderer.push(`<!----> `);
										WeeklyAgenda($$renderer, {
											classes,
											onStart: startLive,
											onEnd: endLive,
											actionId
										});
										$$renderer.push(`<!----></div>`);
									},
									$$slots: { default: true }
								});
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
//#region src/routes/(app)/live/+page.svelte
function _page($$renderer) {
	LiveStudioShell($$renderer, {});
}
//#endregion
export { _page as default };
