import { a as bind_props, c as ensure_array_like, i as attributes, nt as escape_html, o as derived, u as props_id } from "./dev.js";
import { n as routePath, t as liveRoomHref } from "./context.js";
import { f as useConvexClient, n as getCachedRole, p as useQuery, r as initAuth, s as api } from "./session.svelte.js";
import { F as boolToStr, J as Context, K as watch, L as boolToTrueOrUndef, P as boolToEmptyStrOrUndef, Q as mergeProps, R as createBitsAttrs, Y as attachRef, c as createId, it as boxWith, l as noop, u as RovingFocusGroup, z as getAriaChecked } from "./arrays.js";
import { n as resolveLocaleProp, t as useId } from "./use-id.js";
import { t as Button_1 } from "./Button.js";
import { a as Calendar_grid_row, c as Calendar_cell, d as Calendar_day, f as CalendarRootState, g as getDefaultDate, i as Calendar_header, l as Calendar_grid_body, n as Calendar_next_button, o as Calendar_head_cell, r as Calendar_heading, s as Calendar_grid_head, t as Calendar_prev_button, u as Calendar_grid } from "./calendar-prev-button.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { i as equipmentLabel, n as creditLabel, t as classTypeLabel } from "./labels.js";
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
//#region node_modules/bits-ui/dist/bits/toggle-group/toggle-group.svelte.js
var toggleGroupAttrs = createBitsAttrs({
	component: "toggle-group",
	parts: ["root", "item"]
});
var ToggleGroupRootContext = new Context("ToggleGroup.Root");
var ToggleGroupBaseState = class {
	opts;
	rovingFocusGroup;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
		this.rovingFocusGroup = new RovingFocusGroup({
			candidateAttr: toggleGroupAttrs.item,
			rootNode: opts.ref,
			loop: opts.loop,
			orientation: opts.orientation
		});
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		[toggleGroupAttrs.root]: "",
		role: "group",
		"data-orientation": this.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ToggleGroupSingleState = class extends ToggleGroupBaseState {
	opts;
	isMulti = false;
	#anyPressed = derived(() => this.opts.value.current !== "");
	get anyPressed() {
		return this.#anyPressed();
	}
	set anyPressed($$value) {
		return this.#anyPressed($$value);
	}
	constructor(opts) {
		super(opts);
		this.opts = opts;
	}
	includesItem(item) {
		return this.opts.value.current === item;
	}
	toggleItem(item, id) {
		if (this.includesItem(item)) this.opts.value.current = "";
		else {
			this.opts.value.current = item;
			this.rovingFocusGroup.setCurrentTabStopId(id);
		}
	}
};
var ToggleGroupMultipleState = class extends ToggleGroupBaseState {
	opts;
	isMulti = true;
	#anyPressed = derived(() => this.opts.value.current.length > 0);
	get anyPressed() {
		return this.#anyPressed();
	}
	set anyPressed($$value) {
		return this.#anyPressed($$value);
	}
	constructor(opts) {
		super(opts);
		this.opts = opts;
	}
	includesItem(item) {
		return this.opts.value.current.includes(item);
	}
	toggleItem(item, id) {
		if (this.includesItem(item)) this.opts.value.current = this.opts.value.current.filter((v) => v !== item);
		else {
			this.opts.value.current = [...this.opts.value.current, item];
			this.rovingFocusGroup.setCurrentTabStopId(id);
		}
	}
};
var ToggleGroupRootState = class {
	static create(opts) {
		const { type, ...rest } = opts;
		const rootState = type === "single" ? new ToggleGroupSingleState(rest) : new ToggleGroupMultipleState(rest);
		return ToggleGroupRootContext.set(rootState);
	}
};
var ToggleGroupItemState = class ToggleGroupItemState {
	static create(opts) {
		return new ToggleGroupItemState(opts, ToggleGroupRootContext.get());
	}
	opts;
	root;
	attachment;
	#isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#isPressed = derived(() => this.root.includesItem(this.opts.value.current));
	get isPressed() {
		return this.#isPressed();
	}
	set isPressed($$value) {
		return this.#isPressed($$value);
	}
	#ariaChecked = derived(() => {
		return this.root.isMulti ? void 0 : getAriaChecked(this.isPressed, false);
	});
	#ariaPressed = derived(() => {
		return this.root.isMulti ? boolToStr(this.isPressed) : void 0;
	});
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
	}
	#toggleItem() {
		if (this.#isDisabled()) return;
		this.root.toggleItem(this.opts.value.current, this.opts.id.current);
	}
	onclick(_) {
		if (this.#isDisabled()) return;
		this.root.toggleItem(this.opts.value.current, this.opts.id.current);
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			this.#toggleItem();
			return;
		}
		if (!this.root.opts.rovingFocus.current) return;
		this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
	}
	#tabIndex = 0;
	#snippetProps = derived(() => ({ pressed: this.isPressed }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: this.root.isMulti ? void 0 : "radio",
		tabindex: this.#tabIndex,
		"data-orientation": this.root.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		"data-state": getToggleItemDataState(this.isPressed),
		"data-value": this.opts.value.current,
		"aria-pressed": this.#ariaPressed(),
		"aria-checked": this.#ariaChecked(),
		disabled: boolToTrueOrUndef(this.#isDisabled()),
		[toggleGroupAttrs.item]: "",
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getToggleItemDataState(condition) {
	return condition ? "on" : "off";
}
//#endregion
//#region node_modules/bits-ui/dist/bits/toggle-group/components/toggle-group.svelte
function Toggle_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, value = void 0, onValueChange = noop, type, disabled = false, loop = true, orientation = "horizontal", rovingFocus = true, child, children, $$slots, $$events, ...restProps } = $$props;
		function handleDefaultValue() {
			if (value !== void 0) return;
			value = type === "single" ? "" : [];
		}
		handleDefaultValue();
		watch.pre(() => value, () => {
			handleDefaultValue();
		});
		const rootState = ToggleGroupRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			orientation: boxWith(() => orientation),
			rovingFocus: boxWith(() => rovingFocus),
			type,
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			ref,
			value
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/toggle-group/components/toggle-group-item.svelte
function Toggle_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, value, disabled = false, id = createId(uid), type = "button", $$slots, $$events, ...restProps } = $$props;
		const itemState = ToggleGroupItemState.create({
			id: boxWith(() => id),
			value: boxWith(() => value),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, itemState.props, { type }));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...itemState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, itemState.snippetProps);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region src/lib/components/ui/MonthCalendar.svelte
function MonthCalendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, onchange } = $$props;
		function updateValue(next) {
			value = next;
			onchange?.(next);
		}
		function initPlaceholder() {
			const today = /* @__PURE__ */ new Date();
			return new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
		}
		{
			function child($$renderer, { props, months }) {
				$$renderer.push(`<div${attributes({ ...props })}>`);
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
																		if (Calendar_day) {
																			$$renderer.push("<!--[-->");
																			Calendar_day($$renderer, { class: "hb-calendar__day" });
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
//#region src/lib/components/ui/ToggleGroup.svelte
function ToggleGroup_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, items, ariaLabel, onValueChange } = $$props;
		function updateValue(next) {
			value = next;
			onValueChange?.(next);
		}
		if (Toggle_group) {
			$$renderer.push("<!--[-->");
			Toggle_group($$renderer, {
				class: "hb-toggle-group",
				type: "single",
				value: String(value),
				onValueChange: updateValue,
				"aria-label": ariaLabel,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);
					const each_array = ensure_array_like(items);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];
						if (Toggle_group_item) {
							$$renderer.push("<!--[-->");
							Toggle_group_item($$renderer, {
								class: "hb-toggle-item",
								value: String(item.value),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${escape_html(item.label)}`);
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
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/features/calendar/components/DayStrip.svelte
function DayStrip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { days, selectedDay, onSelect } = $$props;
		const { t } = useI18n();
		function updateDay(value) {
			onSelect(Number(value));
		}
		ToggleGroup_1($$renderer, {
			value: String(selectedDay),
			items: days.map((d) => ({
				value: String(d.date),
				label: d.label
			})),
			ariaLabel: t.calendar.daySelect(),
			onValueChange: updateDay
		});
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
		function statusLabel(item) {
			if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") return t.calendar.status.reserved();
			if (item.viewerRole === "instructor" || item.viewerRole === "admin") {
				if (item.viewerCanJoin) return t.calendar.status.manageLive();
				return t.calendar.status.studioClass();
			}
			if (item.liveClass.status === "live") return t.calendar.status.nowLive();
			if (item.seatsRemaining <= 0) return t.calendar.status.full();
			if (item.viewerMissingEquipment.length > 0) return t.calendar.status.missingEquipmentShort();
			if (item.viewerAvailableCredits < item.liveClass.creditCost) return t.calendar.status.notEnoughCredits();
			return t.calendar.status.open();
		}
		$$renderer.push(`<article class="class-card svelte-1d2l3tx"><div class="class-card__time svelte-1d2l3tx"><span class="svelte-1d2l3tx">${escape_html(timeFormatter.format(new Date(item.liveClass.startsAt)))}</span> <span class="svelte-1d2l3tx">${escape_html(timeFormatter.format(new Date(item.liveClass.endsAt)))}</span></div> <div class="class-card__content svelte-1d2l3tx"><div class="class-card__header svelte-1d2l3tx"><div><p class="class-card__type svelte-1d2l3tx">${escape_html(classTypeLabel(item.liveClass.type))}</p> <h3 class="svelte-1d2l3tx">${escape_html(item.liveClass.title)}</h3></div> <span class="class-card__status svelte-1d2l3tx">${escape_html(statusLabel(item))}</span></div> `);
		if (item.liveClass.description) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="class-card__description svelte-1d2l3tx">${escape_html(item.liveClass.description)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="class-card__meta svelte-1d2l3tx"><span class="svelte-1d2l3tx">${escape_html(creditLabel(item.liveClass.creditKind))}</span> <span class="svelte-1d2l3tx">${escape_html(t.calendar.class.seats({
			remaining: item.seatsRemaining,
			capacity: item.liveClass.capacity
		}))}</span> <!--[-->`);
		const each_array = ensure_array_like(item.liveClass.requiredEquipment);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let equipment = each_array[$$index];
			$$renderer.push(`<span class="svelte-1d2l3tx">${escape_html(equipmentLabel(equipment))}</span>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (item.viewerMissingEquipment.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="info-text svelte-1d2l3tx">${escape_html(t.calendar.class.missingEquipment({ items: item.viewerMissingEquipment.map(equipmentLabel).join(", ") }))}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="class-card__actions svelte-1d2l3tx">`);
		if (item.viewerCanJoin) {
			$$renderer.push("<!--[0-->");
			if (item.viewerIsWalkIn) {
				$$renderer.push("<!--[0-->");
				Button_1($$renderer, {
					tone: "paper",
					class: "class-card__btn",
					href: liveRoomHref(item.liveClass._id),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.calendar.class.joinWalkIn())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> <p class="walk-in-warning svelte-1d2l3tx">${escape_html(t.calendar.class.walkInWarning())}</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				Button_1($$renderer, {
					tone: "paper",
					class: "class-card__btn",
					href: liveRoomHref(item.liveClass._id),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.calendar.class.join())}`);
					},
					$$slots: { default: true }
				});
			}
			$$renderer.push(`<!--]-->`);
		} else if (item.viewerRole === "instructor" || item.viewerRole === "admin") {
			$$renderer.push("<!--[1-->");
			Button_1($$renderer, {
				tone: "paper",
				class: "class-card__btn",
				href: routePath("studioLive"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.calendar.class.manage())}`);
				},
				$$slots: { default: true }
			});
		} else if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
			$$renderer.push("<!--[2-->");
			Button_1($$renderer, {
				type: "button",
				tone: "paper",
				class: "class-card__btn",
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
				tone: "ink",
				class: "class-card__btn",
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
		const formatter = new Intl.DateTimeFormat("he-IL", {
			weekday: "short",
			day: "numeric",
			month: "short",
			timeZone: "Asia/Jerusalem"
		});
		let selectedDay = rangeStart;
		let actionId = null;
		let actionError = "";
		const auth = initAuth();
		const client = useConvexClient();
		const profileQuery = useQuery(api.appProfiles.viewer, () => auth.isAuthenticated ? {} : "skip");
		const role = derived(() => profileQuery.data?.role ?? getCachedRole());
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const query = useQuery(api.customerLive.listCalendarRange, () => auth.isAuthenticated ? {
			from: rangeStart,
			to: rangeStart + 14 * dayMs
		} : "skip");
		const classes = derived(() => query.data ?? []);
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
				await client.mutation(api.customerLive.reserve, { liveClassId });
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
				await client.mutation(api.customerLive.cancelReservation, { liveClassId });
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
			$$renderer.push(`<div class="calendar-page svelte-1xxgmnf"><div class="page-header svelte-1xxgmnf"><div class="svelte-1xxgmnf"><p class="kicker svelte-1xxgmnf">${escape_html(t.calendar.kicker())}</p> <h1 class="svelte-1xxgmnf">${escape_html(t.calendar.title())}</h1></div> <div class="page-header__actions svelte-1xxgmnf">`);
			if (isStaff()) {
				$$renderer.push("<!--[0-->");
				Button_1($$renderer, {
					href: routePath("studioLive"),
					tone: "ink",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.calendar.studio())}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			Button_1($$renderer, {
				type: "button",
				tone: "paper",
				onclick: () => {
					selectedDay = rangeStart;
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.calendar.today())}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div> <p class="description svelte-1xxgmnf">${escape_html(t.calendar.description())}</p> `);
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
				onchange: onCalendarSelect
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
export { CalendarShell as t };
