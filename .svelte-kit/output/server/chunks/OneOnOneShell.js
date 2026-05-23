import { $ as clsx, Q as attr, c as ensure_array_like, et as escape_html, n as attr_class, o as derived, p as stringify } from "./dev.js";
import { _ as useQuery, c as TextareaAutosize, g as useConvexClient, r as initAuth, s as api, t as authQuery, u as resource } from "./session.svelte.js";
import { p as Portal } from "./scroll-lock.js";
import { t as Button } from "./button.js";
import { a as Select_content, i as Select_item, n as Select, r as Select_viewport, t as Select_trigger } from "./select-trigger.js";
import { t as Notice } from "./Notice.js";
import { t as PageShell } from "./PageShell.js";
//#region src/lib/features/studio/components/OneOnOneShell.svelte
function OneOnOneShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const profileQuery = useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
		const role = derived(() => profileQuery.data?.role ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const range = derived(() => {
			const from = Date.now();
			return {
				from,
				to: from + 336 * 60 * 60 * 1e3
			};
		});
		const slotsResource = resource(() => auth.isAuthenticated && !isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.customer.listAvailableSlots, range());
		});
		const mineResource = resource(() => auth.isAuthenticated && !isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.customer.listMine, {});
		});
		const requestsResource = resource(() => auth.isAuthenticated && isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.instructor.listRequests, {});
		});
		const availabilityResource = resource(() => auth.isAuthenticated && isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.instructor.listAvailability, {});
		});
		const dayFormatter = new Intl.DateTimeFormat("he-IL", {
			weekday: "long",
			day: "numeric",
			month: "long",
			timeZone: "Asia/Jerusalem"
		});
		const timeFormatter = new Intl.DateTimeFormat("he-IL", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jerusalem"
		});
		const slotDateFormatter = new Intl.DateTimeFormat("he-IL", {
			weekday: "short",
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jerusalem"
		});
		const statusLabels = {
			pending: "ממתינה לאישור",
			approved: "אושרה",
			rejected: "נדחתה",
			cancelled: "בוטלה",
			expired: "פג תוקף"
		};
		const weekdayNames = [
			"ראשון",
			"שני",
			"שלישי",
			"רביעי",
			"חמישי",
			"שישי",
			"שבת"
		];
		const weekdayOptions = weekdayNames.map((label, value) => ({
			value,
			label
		}));
		let actionId = null;
		let actionError = "";
		let note = "";
		new TextareaAutosize({
			element: () => void 0,
			input: () => note
		});
		let editingRuleId = void 0;
		let weekday = 0;
		let startTime = "09:00";
		let endTime = "13:00";
		let slotMinutes = 50;
		let bufferMinutes = 10;
		const client = useConvexClient();
		function timeFromMinutes(value) {
			return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
		}
		function ruleLabel(rule) {
			return `${weekdayNames[rule.weekday] ?? ""}, ${timeFromMinutes(rule.startMinute)}–${timeFromMinutes(rule.endMinute)}`;
		}
		function resetForm() {
			editingRuleId = void 0;
			weekday = 0;
			startTime = "09:00";
			endTime = "13:00";
			slotMinutes = 50;
			bufferMinutes = 10;
		}
		async function approveRequest(requestId) {
			actionId = requestId;
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.instructor.approveRequest, { requestId });
				await requestsResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לאשר.";
			} finally {
				actionId = null;
			}
		}
		async function rejectRequest(requestId) {
			actionId = requestId;
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.instructor.rejectRequest, { requestId });
				await requestsResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לדחות.";
			} finally {
				actionId = null;
			}
		}
		async function requestSlot(slot) {
			actionId = String(slot.startsAt);
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.customer.requestSlot, {
					...slot,
					note
				});
				note = "";
				await Promise.all([slotsResource.refetch(), mineResource.refetch()]);
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.";
			} finally {
				actionId = null;
			}
		}
		async function cancelRequest(requestId) {
			actionId = requestId;
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.customer.cancelRequest, { requestId });
				await mineResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל.";
			} finally {
				actionId = null;
			}
		}
		PageShell($$renderer, {
			kicker: isStaff() ? "HomeBody Studio" : "HomeBody 1:1",
			title: isStaff() ? "ניהול 1:1 אישי" : "בקשת שיעור 1:1",
			description: isStaff() ? "קביעת זמינות ואישור בקשות לשיעורים אישיים." : "בחרי חלון פנוי, שלחי בקשה, והמדריכה תאשר ותפתח חדר לייב אישי.",
			loading: isStaff() ? requestsResource.loading : slotsResource.loading,
			error: actionError || null,
			children: ($$renderer) => {
				if (!auth.isAuthenticated) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="state-card"><p>צריך להתחבר כדי להשתמש ב-1:1.</p> <a class="button-link" href="/">כניסה</a></div>`);
				} else if (isStaff()) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<div class="one-grid"><section class="panel"><h2>זמינות שבועית</h2> <form class="availability-form"><div class="hb-field hb-field--compact"><span class="hb-field__label">יום</span> `);
					if (Select) {
						$$renderer.push("<!--[-->");
						Select($$renderer, {
							type: "single",
							value: String(weekday),
							onValueChange: (v) => weekday = Number(v),
							items: weekdayOptions.map((o) => ({
								value: String(o.value),
								label: o.label
							})),
							children: ($$renderer) => {
								if (Select_trigger) {
									$$renderer.push("<!--[-->");
									Select_trigger($$renderer, {
										class: "hb-select__trigger",
										"aria-label": "יום",
										children: ($$renderer) => {
											$$renderer.push(`<span class="hb-select__value">${escape_html(weekdayOptions.find((o) => o.value === weekday)?.label ?? "")}</span> <span class="hb-select__chevron" aria-hidden="true"></span>`);
										},
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
								$$renderer.push(` `);
								if (Portal) {
									$$renderer.push("<!--[-->");
									Portal($$renderer, {
										children: ($$renderer) => {
											if (Select_content) {
												$$renderer.push("<!--[-->");
												Select_content($$renderer, {
													class: "hb-select__content",
													sideOffset: 6,
													children: ($$renderer) => {
														if (Select_viewport) {
															$$renderer.push("<!--[-->");
															Select_viewport($$renderer, {
																class: "hb-select__viewport",
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);
																	const each_array = ensure_array_like(weekdayOptions);
																	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																		let option = each_array[$$index];
																		{
																			function children($$renderer, { selected }) {
																				$$renderer.push(`<span>${escape_html(option.label)}</span> `);
																				if (selected) {
																					$$renderer.push("<!--[0-->");
																					$$renderer.push(`<span class="hb-select__check" aria-hidden="true"></span>`);
																				} else $$renderer.push("<!--[-1-->");
																				$$renderer.push(`<!--]-->`);
																			}
																			if (Select_item) {
																				$$renderer.push("<!--[-->");
																				Select_item($$renderer, {
																					class: "hb-select__item",
																					value: String(option.value),
																					label: option.label,
																					children,
																					$$slots: { default: true }
																				});
																				$$renderer.push("<!--]-->");
																			} else {
																				$$renderer.push("<!--[!-->");
																				$$renderer.push("<!--]-->");
																			}
																		}
																	}
																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});
															$$renderer.push("<!--]-->");
														} else {
															$$renderer.push("<!--[!-->");
															$$renderer.push("<!--]-->");
														}
													},
													$$slots: { default: true }
												});
												$$renderer.push("<!--]-->");
											} else {
												$$renderer.push("<!--[!-->");
												$$renderer.push("<!--]-->");
											}
										},
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
					$$renderer.push(`</div> <label class="time-field"><span>משעה</span> <input type="time"${attr("value", startTime)} required=""/></label> <label class="time-field"><span>עד שעה</span> <input type="time"${attr("value", endTime)} required=""/></label> <label class="time-field"><span>משך (דקות)</span> <input type="number" min="20" max="120"${attr("value", slotMinutes)} required=""/></label> <label class="time-field"><span>מרווח (דקות)</span> <input type="number" min="0" max="60"${attr("value", bufferMinutes)} required=""/></label> <div class="form-actions">`);
					if (Button) {
						$$renderer.push("<!--[-->");
						Button($$renderer, {
							class: "hb-button hb-button--ink",
							type: "submit",
							disabled: actionId === "availability",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(actionId === "availability" ? "שומרות..." : editingRuleId ? "עדכון כלל" : "הוספת כלל")}`);
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
					$$renderer.push(` `);
					if (editingRuleId) {
						$$renderer.push("<!--[0-->");
						if (Button) {
							$$renderer.push("<!--[-->");
							Button($$renderer, {
								class: "hb-button hb-button--paper",
								type: "button",
								onclick: resetForm,
								children: ($$renderer) => {
									$$renderer.push(`<!---->ביטול עריכה`);
								},
								$$slots: { default: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div></form> <div class="rules-list">`);
					if ((availabilityResource.current ?? []).length === 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="empty-state"><span class="material-symbols-rounded empty-icon">event_busy</span> <p>אין עדיין כללי זמינות.</p> <p class="empty-hint">הגדירי ימים ושעות שבהם את פנויה לשיעורים אישיים.</p></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--[-->`);
						const each_array_1 = ensure_array_like(availabilityResource.current ?? []);
						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let rule = each_array_1[$$index_1];
							$$renderer.push(`<div${attr_class("rule-row", void 0, { "rule-row--inactive": !rule.isActive })}><div class="rule-info"><span class="rule-title">${escape_html(ruleLabel(rule))}</span> <span class="rule-meta">${escape_html(rule.slotMinutes)} דק׳ · ${escape_html(rule.bufferMinutes)} דק׳ מרווח · ${escape_html(rule.isActive ? "פעיל" : "מושבת")}</span></div> <div class="rule-actions"><button type="button" class="rule-btn" title="עריכה"><span class="material-symbols-rounded">edit</span></button> <button type="button" class="rule-btn"${attr("title", rule.isActive ? "השבתה" : "הפעלה")}><span class="material-symbols-rounded">${escape_html(rule.isActive ? "visibility_off" : "visibility")}</span></button></div></div>`);
						}
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]--></div></section> <section class="panel"><h2>בקשות ממתינות</h2> `);
					if ((requestsResource.current ?? []).length === 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="empty-state"><span class="material-symbols-rounded empty-icon">inbox</span> <p>אין בקשות ממתינות כרגע.</p> <p class="empty-hint">כאשר לקוחה תבקש שיעור 1:1, הבקשה תופיע כאן.</p></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="request-list"><!--[-->`);
						const each_array_2 = ensure_array_like(requestsResource.current ?? []);
						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let request = each_array_2[$$index_2];
							$$renderer.push(`<article class="request-card"><div class="request-header"><strong>${escape_html(dayFormatter.format(new Date(request.requestedStartsAt)))}</strong> <span class="request-time">${escape_html(timeFormatter.format(new Date(request.requestedStartsAt)))} – ${escape_html(timeFormatter.format(new Date(request.requestedEndsAt)))}</span></div> `);
							if (request.note) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<p class="request-note">${escape_html(request.note)}</p>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> <div class="request-actions">`);
							if (Button) {
								$$renderer.push("<!--[-->");
								Button($$renderer, {
									class: "hb-button hb-button--ink hb-button--sm",
									type: "button",
									onclick: () => approveRequest(request._id),
									disabled: actionId === request._id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->אישור`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
							$$renderer.push(` `);
							if (Button) {
								$$renderer.push("<!--[-->");
								Button($$renderer, {
									class: "hb-button hb-button--paper hb-button--sm",
									type: "button",
									onclick: () => rejectRequest(request._id),
									disabled: actionId === request._id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->דחייה`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
							$$renderer.push(`</div></article>`);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					$$renderer.push(`<!--]--></section></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					if (slotsResource.error) {
						$$renderer.push("<!--[0-->");
						Notice($$renderer, {
							tone: "danger",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(slotsResource.error.message)}`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <label class="note-field"><span>הערה למדריכה</span> <textarea maxlength="500" placeholder="מטרות, מגבלות, או משהו שכדאי לדעת">`);
					const $$body = escape_html(note);
					if ($$body) $$renderer.push(`${$$body}`);
					$$renderer.push(`</textarea></label> <div class="one-grid"><section class="panel"><h2>חלונות פנויים</h2> `);
					if ((slotsResource.current ?? []).length === 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="empty-state"><span class="material-symbols-rounded empty-icon">event_busy</span> <p>אין חלונות פנויים בשבועיים הקרובים.</p></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="request-list"><!--[-->`);
						const each_array_3 = ensure_array_like(slotsResource.current ?? []);
						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let slot = each_array_3[$$index_3];
							$$renderer.push(`<article class="request-card"><h3>${escape_html(slotDateFormatter.format(new Date(slot.startsAt)))}</h3> <p${attr_class(clsx(slot.availableCredits > 0 ? "has-credits" : "no-credits"))}>${escape_html(slot.availableCredits > 0 ? "יש קרדיט 1:1 זמין" : "אין קרדיט 1:1 זמין")}</p> `);
							if (Button) {
								$$renderer.push("<!--[-->");
								Button($$renderer, {
									class: "hb-button hb-button--ink hb-button--sm",
									type: "button",
									onclick: () => requestSlot(slot),
									disabled: slot.availableCredits <= 0 || actionId === String(slot.startsAt),
									children: ($$renderer) => {
										$$renderer.push(`<!---->לשלוח בקשה`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
							$$renderer.push(`</article>`);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					$$renderer.push(`<!--]--></section> <section class="panel"><h2>הבקשות שלי</h2> `);
					if ((mineResource.current ?? []).length === 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="empty-state"><span class="material-symbols-rounded empty-icon">inbox</span> <p>אין עדיין בקשות.</p></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="request-list"><!--[-->`);
						const each_array_4 = ensure_array_like(mineResource.current ?? []);
						for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
							let request = each_array_4[$$index_4];
							$$renderer.push(`<article class="request-card"><h3>${escape_html(slotDateFormatter.format(new Date(request.requestedStartsAt)))}</h3> <span${attr_class(`status-badge status-badge--${stringify(request.status)}`)}>${escape_html(statusLabels[request.status] ?? request.status)}</span> `);
							if (request.status === "pending") {
								$$renderer.push("<!--[0-->");
								if (Button) {
									$$renderer.push("<!--[-->");
									Button($$renderer, {
										class: "hb-button hb-button--paper hb-button--sm",
										type: "button",
										onclick: () => cancelRequest(request._id),
										disabled: actionId === request._id,
										children: ($$renderer) => {
											$$renderer.push(`<!---->ביטול בקשה`);
										},
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></article>`);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					$$renderer.push(`<!--]--></section></div>`);
				}
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
export { OneOnOneShell as t };
