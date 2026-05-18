import { H as attr, U as escape_html, a as derived, n as attr_class, o as ensure_array_like } from "../../../../chunks/dev.js";
import { o as api } from "../../../../chunks/session.svelte.js";
import { t as Notice } from "../../../../chunks/Notice.js";
import { t as useAuthQuery } from "../../../../chunks/useAuthQuery.svelte.js";
import { i as equipmentLabel, n as creditLabel, t as classTypeLabel } from "../../../../chunks/labels.js";
import { t as AppLayout } from "../../../../chunks/AppLayout.js";
import { t as AuthGuard } from "../../../../chunks/AuthGuard.js";
import { t as PageShell } from "../../../../chunks/PageShell.js";
//#region src/components/app/CalendarShell.svelte
function CalendarShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dayMs = 1440 * 60 * 1e3;
		const rangeStart = startOfToday();
		const formatter = new Intl.DateTimeFormat("he-IL", {
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
		let selectedDay = rangeStart;
		let actionId = null;
		let actionError = "";
		const classesResource = useAuthQuery(api.liveClasses.listCalendarRange, {
			from: rangeStart,
			to: rangeStart + 14 * dayMs
		}, { initialValue: [] });
		const classes = derived(() => classesResource.current ?? []);
		const days = derived(() => Array.from({ length: 14 }, (_, index) => {
			const date = rangeStart + index * dayMs;
			return {
				date,
				label: formatter.format(new Date(date))
			};
		}));
		const visibleClasses = derived(() => classes().filter((item) => {
			const startsAt = item.liveClass.startsAt;
			return startsAt >= selectedDay && startsAt < selectedDay + dayMs;
		}));
		function startOfToday() {
			const now = /* @__PURE__ */ new Date();
			return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		}
		function statusLabel(item) {
			if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") return "שמורה לך";
			if (item.liveClass.status === "live") return "עכשיו בלייב";
			if (item.seatsRemaining <= 0) return "מלא";
			if (item.viewerMissingEquipment.length > 0) return "חסר ציוד";
			if (item.viewerAvailableCredits < item.liveClass.creditCost) return "אין מספיק קרדיטים";
			return "פתוח להרשמה";
		}
		AppLayout($$renderer, {
			children: ($$renderer) => {
				AuthGuard($$renderer, {
					children: ($$renderer) => {
						if (classesResource.loading) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="state-card svelte-7o1cus"><div class="skeleton skeleton--wide svelte-7o1cus"></div> <div class="skeleton svelte-7o1cus"></div> <div class="skeleton svelte-7o1cus"></div></div>`);
						} else {
							$$renderer.push("<!--[-1-->");
							{
								function headerExtra($$renderer) {
									$$renderer.push(`<button type="button" class="btn btn--ghost">היום</button>`);
								}
								PageShell($$renderer, {
									title: "לוח לייבים",
									kicker: "HomeBody Live",
									description: "הרשמה לשיעור אפשרית רק כשיש קרדיטים פנויים בתוכנית. מקום נשמר ברגע שההרשמה מצליחה.",
									headerExtra,
									children: ($$renderer) => {
										if (classesResource.error || actionError) {
											$$renderer.push("<!--[0-->");
											Notice($$renderer, {
												tone: "danger",
												children: ($$renderer) => {
													$$renderer.push(`<!---->${escape_html(classesResource.error?.message ?? actionError)}`);
												},
												$$slots: { default: true }
											});
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--> <div class="day-strip svelte-7o1cus" aria-label="בחירת יום"><!--[-->`);
										const each_array = ensure_array_like(days());
										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let day = each_array[$$index];
											$$renderer.push(`<button type="button"${attr_class("day-strip__day svelte-7o1cus", void 0, { "day-strip__day--active": day.date === selectedDay })}>${escape_html(day.label)}</button>`);
										}
										$$renderer.push(`<!--]--></div> <div class="agenda svelte-7o1cus" aria-live="polite">`);
										if (visibleClasses().length === 0) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<div class="empty-agenda svelte-7o1cus"><p class="empty-agenda__kicker svelte-7o1cus">אין שיעורים ביום הזה</p> <p>נסי יום אחר בלוח. כשיעלו לייבים חדשים הם יופיעו כאן.</p></div>`);
										} else {
											$$renderer.push("<!--[-1-->");
											$$renderer.push(`<!--[-->`);
											const each_array_1 = ensure_array_like(visibleClasses());
											for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
												let item = each_array_1[$$index_2];
												$$renderer.push(`<article class="class-card svelte-7o1cus"><div class="class-card__time svelte-7o1cus"><span class="svelte-7o1cus">${escape_html(timeFormatter.format(new Date(item.liveClass.startsAt)))}</span> <span class="svelte-7o1cus">${escape_html(timeFormatter.format(new Date(item.liveClass.endsAt)))}</span></div> <div class="class-card__content svelte-7o1cus"><div class="class-card__header svelte-7o1cus"><div><p class="class-card__type svelte-7o1cus">${escape_html(classTypeLabel(item.liveClass.type))}</p> <h3 class="svelte-7o1cus">${escape_html(item.liveClass.title)}</h3></div> <span class="class-card__status svelte-7o1cus">${escape_html(statusLabel(item))}</span></div> `);
												if (item.liveClass.description) {
													$$renderer.push("<!--[0-->");
													$$renderer.push(`<p class="class-card__description svelte-7o1cus">${escape_html(item.liveClass.description)}</p>`);
												} else $$renderer.push("<!--[-1-->");
												$$renderer.push(`<!--]--> <div class="class-card__meta svelte-7o1cus"><span class="svelte-7o1cus">${escape_html(creditLabel(item.liveClass.creditKind))}</span> <span class="svelte-7o1cus">${escape_html(item.seatsRemaining)} מקומות פנויים מתוך ${escape_html(item.liveClass.capacity)}</span> <!--[-->`);
												const each_array_2 = ensure_array_like(item.liveClass.requiredEquipment);
												for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
													let equipment = each_array_2[$$index_1];
													$$renderer.push(`<span class="svelte-7o1cus">${escape_html(equipmentLabel(equipment))}</span>`);
												}
												$$renderer.push(`<!--]--></div> `);
												if (item.viewerMissingEquipment.length > 0) {
													$$renderer.push("<!--[0-->");
													Notice($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->חסר בפרופיל שלך: ${escape_html(item.viewerMissingEquipment.map(equipmentLabel).join(", "))}.
                    אפשר לעדכן ציוד בפרופיל פילאטיס.`);
														},
														$$slots: { default: true }
													});
												} else $$renderer.push("<!--[-1-->");
												$$renderer.push(`<!--]--> <div class="class-card__actions svelte-7o1cus">`);
												if (item.viewerCanJoin) {
													$$renderer.push("<!--[0-->");
													$$renderer.push(`<a class="class-card__join svelte-7o1cus"${attr("href", `/live-room?classId=${item.liveClass._id}`)}>להיכנס ללייב</a>`);
												} else if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
													$$renderer.push("<!--[1-->");
													$$renderer.push(`<button type="button"${attr("disabled", actionId === item.liveClass._id, true)} class="svelte-7o1cus">לבטל הרשמה</button>`);
												} else {
													$$renderer.push("<!--[-1-->");
													$$renderer.push(`<button type="button" class="class-card__reserve svelte-7o1cus"${attr("disabled", !item.viewerCanReserve || actionId === item.liveClass._id, true)}>לשמור מקום</button>`);
												}
												$$renderer.push(`<!--]--></div></div></article>`);
											}
											$$renderer.push(`<!--]-->`);
										}
										$$renderer.push(`<!--]--></div>`);
									},
									$$slots: {
										headerExtra: true,
										default: true
									}
								});
							}
						}
						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
//#region src/routes/(app)/calendar/+page.svelte
function _page($$renderer) {
	CalendarShell($$renderer, {});
}
//#endregion
export { _page as default };
