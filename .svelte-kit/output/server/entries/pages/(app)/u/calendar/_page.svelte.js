import { a as bind_props, c as ensure_array_like, et as attr, i as attributes, m as stringify, n as attr_class, nt as escape_html, o as derived } from "../../../../../chunks/dev.js";
import { t as liveRoomHref } from "../../../../../chunks/context.js";
import { f as useConvexClient, p as useQuery, r as initAuth, s as api } from "../../../../../chunks/session.svelte.js";
import { G as watch, Z as mergeProps, at as boxWith, l as noop } from "../../../../../chunks/arrays.js";
import { n as resolveLocaleProp, t as useId } from "../../../../../chunks/use-id.js";
import { t as Button_1 } from "../../../../../chunks/Button.js";
import { a as Calendar_grid_row, c as Calendar_cell, d as Calendar_day, f as CalendarRootState, g as getDefaultDate, i as Calendar_header, l as Calendar_grid_body, n as Calendar_next_button, o as Calendar_head_cell, r as Calendar_heading, s as Calendar_grid_head, t as Calendar_prev_button, u as Calendar_grid } from "../../../../../chunks/calendar-prev-button.js";
import { t as Notice } from "../../../../../chunks/Notice.js";
import { t as useI18n } from "../../../../../chunks/runes.svelte.js";
import { n as creditLabel, t as classTypeLabel } from "../../../../../chunks/labels.js";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar.svelte
function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { child, children, id = useId(), ref = null, value = void 0, onValueChange = noop, placeholder = void 0, onPlaceholderChange = noop, weekdayFormat = "narrow", weekStartsOn, pagedNavigation = false, isDateDisabled = () => false, isDateUnavailable = () => false, fixedWeeks = false, numberOfMonths = 1, locale, calendarLabel = "Event", disabled = false, readonly = false, minValue = void 0, maxValue = void 0, preventDeselect = false, type, disableDaysOutsideMonth = true, initialFocus = false, maxDays, monthFormat = "long", yearFormat = "numeric", $$slots, $$events, ...restProps } = $$props;
		const defaultPlaceholder = getDefaultDate({
			defaultValue: value,
			minValue,
			maxValue
		});
		function handleDefaultPlaceholder() {
			if (placeholder !== void 0) return;
			placeholder = defaultPlaceholder;
		}
		handleDefaultPlaceholder();
		watch.pre(() => placeholder, () => {
			handleDefaultPlaceholder();
		});
		function handleDefaultValue() {
			if (value !== void 0) return;
			value = type === "single" ? void 0 : [];
		}
		handleDefaultValue();
		watch.pre(() => value, () => {
			handleDefaultValue();
		});
		const rootState = CalendarRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			weekdayFormat: boxWith(() => weekdayFormat),
			weekStartsOn: boxWith(() => weekStartsOn),
			pagedNavigation: boxWith(() => pagedNavigation),
			isDateDisabled: boxWith(() => isDateDisabled),
			isDateUnavailable: boxWith(() => isDateUnavailable),
			fixedWeeks: boxWith(() => fixedWeeks),
			numberOfMonths: boxWith(() => numberOfMonths),
			locale: resolveLocaleProp(() => locale),
			calendarLabel: boxWith(() => calendarLabel),
			readonly: boxWith(() => readonly),
			disabled: boxWith(() => disabled),
			minValue: boxWith(() => minValue),
			maxValue: boxWith(() => maxValue),
			disableDaysOutsideMonth: boxWith(() => disableDaysOutsideMonth),
			initialFocus: boxWith(() => initialFocus),
			maxDays: boxWith(() => maxDays),
			placeholder: boxWith(() => placeholder, (v) => {
				placeholder = v;
				onPlaceholderChange(v);
			}),
			preventDeselect: boxWith(() => preventDeselect),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			type: boxWith(() => type),
			monthFormat: boxWith(() => monthFormat),
			yearFormat: boxWith(() => yearFormat),
			defaultPlaceholder
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...rootState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			ref,
			value,
			placeholder
		});
	});
}
//#endregion
//#region src/lib/components/ui/MonthCalendar.svelte
function MonthCalendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, onchange, events = [] } = $$props;
		function updateValue(next) {
			value = next;
			onchange?.(next);
		}
		function initPlaceholder() {
			const today = /* @__PURE__ */ new Date();
			return new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
		}
		const eventMap = derived(() => {
			const map = /* @__PURE__ */ new Map();
			for (const ev of events) map.set(ev.date.toString(), ev.tone);
			return map;
		});
		function dateKey(d) {
			return d.toString();
		}
		{
			function child($$renderer, { props, months }) {
				$$renderer.push(`<div${attributes({ ...props }, "svelte-1t7uxwj")}>`);
				if (Calendar_header) {
					$$renderer.push("<!--[-->");
					Calendar_header($$renderer, {
						class: "hb-calendar__header",
						children: ($$renderer) => {
							if (Calendar_prev_button) {
								$$renderer.push("<!--[-->");
								Calendar_prev_button($$renderer, {
									class: "hb-calendar__nav",
									children: ($$renderer) => {
										$$renderer.push(`<span class="material-symbols-rounded">chevron_right</span>`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
							$$renderer.push(` `);
							if (Calendar_heading) {
								$$renderer.push("<!--[-->");
								Calendar_heading($$renderer, { class: "hb-calendar__heading" });
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
							}
							$$renderer.push(` `);
							if (Calendar_next_button) {
								$$renderer.push("<!--[-->");
								Calendar_next_button($$renderer, {
									class: "hb-calendar__nav",
									children: ($$renderer) => {
										$$renderer.push(`<span class="material-symbols-rounded">chevron_left</span>`);
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
				$$renderer.push(` `);
				if (Calendar_grid) {
					$$renderer.push("<!--[-->");
					Calendar_grid($$renderer, {
						class: "hb-calendar__grid",
						children: ($$renderer) => {
							if (Calendar_grid_head) {
								$$renderer.push("<!--[-->");
								Calendar_grid_head($$renderer, {
									children: ($$renderer) => {
										if (Calendar_grid_row) {
											$$renderer.push("<!--[-->");
											Calendar_grid_row($$renderer, {
												class: "hb-calendar__row",
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);
													const each_array = ensure_array_like([
														"א",
														"ב",
														"ג",
														"ד",
														"ה",
														"ו",
														"ש"
													]);
													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let day = each_array[$$index];
														if (Calendar_head_cell) {
															$$renderer.push("<!--[-->");
															Calendar_head_cell($$renderer, {
																class: "hb-calendar__head-cell",
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${escape_html(day)}`);
																},
																$$slots: { default: true }
															});
															$$renderer.push("<!--]-->");
														} else {
															$$renderer.push("<!--[!-->");
															$$renderer.push("<!--]-->");
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
							$$renderer.push(` `);
							if (Calendar_grid_body) {
								$$renderer.push("<!--[-->");
								Calendar_grid_body($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);
										const each_array_1 = ensure_array_like(months[0].weeks);
										for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
											let week = each_array_1[$$index_2];
											if (Calendar_grid_row) {
												$$renderer.push("<!--[-->");
												Calendar_grid_row($$renderer, {
													class: "hb-calendar__row",
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);
														const each_array_2 = ensure_array_like(week);
														for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
															let date = each_array_2[$$index_1];
															if (Calendar_cell) {
																$$renderer.push("<!--[-->");
																Calendar_cell($$renderer, {
																	date,
																	month: months[0].value,
																	children: ($$renderer) => {
																		{
																			function children($$renderer, { day }) {
																				const tone = eventMap().get(dateKey(date));
																				$$renderer.push(`<span class="day-number svelte-1t7uxwj">${escape_html(day)}</span> `);
																				if (tone) {
																					$$renderer.push("<!--[0-->");
																					$$renderer.push(`<span${attr_class(`event-dot event-dot--${stringify(tone)}`, "svelte-1t7uxwj")}></span>`);
																				} else $$renderer.push("<!--[-1-->");
																				$$renderer.push(`<!--]-->`);
																			}
																			if (Calendar_day) {
																				$$renderer.push("<!--[-->");
																				Calendar_day($$renderer, {
																					class: "hb-calendar__day hb-calendar__day--with-dots",
																					children,
																					$$slots: { default: true }
																				});
																				$$renderer.push("<!--]-->");
																			} else {
																				$$renderer.push("<!--[!-->");
																				$$renderer.push("<!--]-->");
																			}
																		}
																	},
																	$$slots: { default: true }
																});
																$$renderer.push("<!--]-->");
															} else {
																$$renderer.push("<!--[!-->");
																$$renderer.push("<!--]-->");
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
				$$renderer.push(`</div>`);
			}
			if (Calendar) {
				$$renderer.push("<!--[-->");
				Calendar($$renderer, {
					class: "hb-calendar",
					type: "single",
					value,
					onValueChange: updateValue,
					placeholder: initPlaceholder(),
					child,
					$$slots: { child: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		}
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/features/calendar/components/DayStrip.svelte
function DayStrip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { days, selectedDay, onSelect } = $$props;
		const dayNameFormatter = new Intl.DateTimeFormat("he-IL", {
			weekday: "short",
			timeZone: "Asia/Jerusalem"
		});
		const dayNumFormatter = new Intl.DateTimeFormat("he-IL", {
			day: "numeric",
			timeZone: "Asia/Jerusalem"
		});
		function dayName(ts) {
			return dayNameFormatter.format(new Date(ts));
		}
		function dayNum(ts) {
			return dayNumFormatter.format(new Date(ts));
		}
		$$renderer.push(`<div class="day-strip svelte-1s3lnwf" role="tablist" aria-label="בחירת יום"><!--[-->`);
		const each_array = ensure_array_like(days);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { date } = each_array[$$index];
			$$renderer.push(`<button type="button" role="tab"${attr_class("day-pill svelte-1s3lnwf", void 0, { "day-pill--active": date === selectedDay })}${attr("aria-selected", date === selectedDay)}><span class="day-pill__name svelte-1s3lnwf">${escape_html(dayName(date))}</span> <span class="day-pill__num svelte-1s3lnwf">${escape_html(dayNum(date))}</span></button>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
//#region src/lib/features/calendar/components/ClassCard.svelte
function ClassCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, actionId, onReserve, onCancel } = $$props;
		const { t } = useI18n();
		const timeFormatter = new Intl.DateTimeFormat("he-IL", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jerusalem"
		});
		function statusInfo(item) {
			if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") return {
				label: t.calendar.status.reserved(),
				tone: "success"
			};
			if (item.liveClass.status === "live") return {
				label: t.calendar.status.nowLive(),
				tone: "terra"
			};
			if (item.seatsRemaining <= 0) return {
				label: t.calendar.status.full(),
				tone: "muted"
			};
			if (item.viewerMissingEquipment.length > 0) return {
				label: t.calendar.status.missingEquipmentShort(),
				tone: "muted"
			};
			if (item.viewerAvailableCredits < item.liveClass.creditCost) return {
				label: t.calendar.status.notEnoughCredits(),
				tone: "muted"
			};
			return {
				label: t.calendar.status.open(),
				tone: "sky"
			};
		}
		function rsvpText(item) {
			const now = Date.now();
			const closesAt = item.liveClass.joinClosesAt;
			if (closesAt <= now) return "ההרשמה נסגרה";
			const diffMs = closesAt - now;
			const diffHours = Math.floor(diffMs / (1e3 * 60 * 60));
			const diffMinutes = Math.floor(diffMs / (1e3 * 60));
			if (diffMinutes < 60) return `נסגרת בעוד ${diffMinutes} דקות`;
			if (diffHours < 24) return `נסגרת בעוד ${diffHours} שעות`;
			return null;
		}
		const info = derived(() => statusInfo(item));
		const rsvp = derived(() => rsvpText(item));
		$$renderer.push(`<article class="class-card svelte-1d2l3tx"><div class="class-card__time svelte-1d2l3tx"><span class="class-card__start svelte-1d2l3tx">${escape_html(timeFormatter.format(new Date(item.liveClass.startsAt)))}</span> <span class="class-card__end svelte-1d2l3tx">${escape_html(timeFormatter.format(new Date(item.liveClass.endsAt)))}</span></div> <div class="class-card__body svelte-1d2l3tx"><div class="class-card__main svelte-1d2l3tx"><div class="class-card__title-row svelte-1d2l3tx"><h3 class="svelte-1d2l3tx">${escape_html(item.liveClass.title)}</h3> <span${attr_class(`status-badge status-badge--${stringify(info().tone)}`, "svelte-1d2l3tx")}>${escape_html(info().label)}</span></div> <div class="class-card__meta svelte-1d2l3tx"><span class="meta-tag meta-tag--type svelte-1d2l3tx">${escape_html(classTypeLabel(item.liveClass.type))}</span> <span class="meta-tag svelte-1d2l3tx">${escape_html(creditLabel(item.liveClass.creditKind))}</span> `);
		if (item.liveClass.capacity > 1) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="meta-tag svelte-1d2l3tx">${escape_html(item.seatsRemaining)} / ${escape_html(item.liveClass.capacity)}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (rsvp()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span${attr_class("meta-tag meta-tag--rsvp svelte-1d2l3tx", void 0, { "meta-tag--urgent": info().tone === "sky" && item.liveClass.joinClosesAt - Date.now() < 1e3 * 60 * 60 })}>${escape_html(rsvp())}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> <div class="class-card__action svelte-1d2l3tx">`);
		if (item.viewerCanJoin) {
			$$renderer.push("<!--[0-->");
			if (item.viewerIsWalkIn) {
				$$renderer.push("<!--[0-->");
				Button_1($$renderer, {
					tone: "terra",
					size: "sm",
					href: liveRoomHref(item.liveClass._id),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.calendar.class.joinWalkIn())}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push("<!--[-1-->");
				Button_1($$renderer, {
					tone: "terra",
					size: "sm",
					href: liveRoomHref(item.liveClass._id),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.calendar.class.join())}`);
					},
					$$slots: { default: true }
				});
			}
			$$renderer.push(`<!--]-->`);
		} else if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
			$$renderer.push("<!--[1-->");
			Button_1($$renderer, {
				type: "button",
				tone: "paper",
				size: "sm",
				onclick: () => onCancel(item.liveClass._id),
				disabled: actionId === item.liveClass._id,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.calendar.class.cancel())}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push("<!--[-1-->");
			Button_1($$renderer, {
				type: "button",
				tone: info().tone === "sky" ? "ink" : "paper",
				size: "sm",
				onclick: () => onReserve(item.liveClass._id),
				disabled: !item.viewerCanReserve || actionId === item.liveClass._id,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.calendar.class.reserve())}`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></div></article>`);
	});
}
//#endregion
//#region src/lib/features/calendar/components/CalendarShell.svelte
function CalendarShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dayMs = 1440 * 60 * 1e3;
		const rangeStart = startOfToday();
		let selectedDay = rangeStart;
		let actionId = null;
		let actionError = "";
		const auth = initAuth();
		const client = useConvexClient();
		const query = useQuery(api.live.calendar.listRange, () => auth.isAuthenticated ? {
			from: rangeStart,
			to: rangeStart + 14 * dayMs
		} : "skip");
		const classes = derived(() => query.data ?? []);
		const days = derived(() => Array.from({ length: 14 }, (_, index) => {
			return {
				date: rangeStart + index * dayMs,
				label: ""
			};
		}));
		const visibleClasses = derived(() => classes().filter((item) => {
			const startsAt = item.liveClass.startsAt;
			return startsAt >= selectedDay && startsAt < selectedDay + dayMs;
		}));
		const calendarEvents = derived(() => {
			const dayTones = /* @__PURE__ */ new Map();
			for (const item of classes()) {
				const dayStart = Math.floor(item.liveClass.startsAt / dayMs) * dayMs;
				const existing = dayTones.get(dayStart);
				let tone = "sky";
				if (item.liveClass.status === "live") tone = "terra";
				else if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") tone = "success";
				else if (item.seatsRemaining <= 0) tone = "muted";
				const priority = {
					terra: 4,
					success: 3,
					sky: 2,
					muted: 1
				};
				if (!existing || priority[tone] > priority[existing]) dayTones.set(dayStart, tone);
			}
			const events = [];
			for (const [dayStart, tone] of dayTones) {
				const d = new Date(dayStart);
				events.push({
					date: new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
					tone
				});
			}
			return events;
		});
		function startOfToday() {
			const now = /* @__PURE__ */ new Date();
			return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		}
		function timestampToDateValue(ts) {
			const d = new Date(ts);
			return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
		}
		function dateValueToTimestamp(dv) {
			return dv.toDate(getLocalTimeZone()).getTime();
		}
		let calendarValue = derived(() => timestampToDateValue(selectedDay));
		function onCalendarSelect(dv) {
			if (!dv) return;
			selectedDay = dateValueToTimestamp(dv);
		}
		const { t } = useI18n();
		async function reserve(liveClassId) {
			actionId = liveClassId;
			actionError = "";
			try {
				await client.mutation(api.live.reservation.reserve, { liveClassId });
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : t.calendar.error.reserve();
			} finally {
				actionId = null;
			}
		}
		async function cancel(liveClassId) {
			actionId = liveClassId;
			actionError = "";
			try {
				await client.mutation(api.live.reservation.cancel, { liveClassId });
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : t.calendar.error.cancel();
			} finally {
				actionId = null;
			}
		}
		if (query.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="state-card svelte-1xxgmnf"><div class="skeleton skeleton--wide svelte-1xxgmnf"></div> <div class="skeleton svelte-1xxgmnf"></div> <div class="skeleton svelte-1xxgmnf"></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="calendar-page svelte-1xxgmnf"><header class="page-header svelte-1xxgmnf"><div class="svelte-1xxgmnf"><p class="kicker svelte-1xxgmnf">${escape_html(t.calendar.kicker())}</p> <h1 class="svelte-1xxgmnf">${escape_html(t.calendar.title())}</h1></div> `);
			Button_1($$renderer, {
				type: "button",
				tone: "paper",
				size: "sm",
				onclick: () => {
					selectedDay = rangeStart;
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.calendar.today())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></header> `);
			if (query.error || actionError) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					tone: "danger",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(query.error?.message ?? actionError)}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="calendar-layout svelte-1xxgmnf"><div class="calendar-month svelte-1xxgmnf">`);
			MonthCalendar($$renderer, {
				value: calendarValue(),
				onchange: onCalendarSelect,
				events: calendarEvents()
			});
			$$renderer.push(`<!----></div> `);
			DayStrip($$renderer, {
				days: days(),
				selectedDay,
				onSelect: (date) => {
					selectedDay = date;
				}
			});
			$$renderer.push(`<!----> <div class="agenda svelte-1xxgmnf" aria-live="polite">`);
			if (visibleClasses().length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="empty-agenda svelte-1xxgmnf"><p class="empty-agenda__kicker svelte-1xxgmnf">${escape_html(t.calendar.empty.kicker())}</p> <p class="svelte-1xxgmnf">${escape_html(t.calendar.empty.text())}</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(visibleClasses());
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];
					ClassCard($$renderer, {
						item,
						actionId,
						onReserve: reserve,
						onCancel: cancel
					});
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/routes/(app)/u/calendar/+page.svelte
function _page($$renderer) {
	CalendarShell($$renderer, {});
}
//#endregion
export { _page as default };
