import { U as attr, W as escape_html, a as derived, n as attr_class, o as ensure_array_like } from "./dev.js";
import { n as routePath, t as liveRoomHref } from "./context.js";
import { n as useConvexClient, r as useQuery } from "./client.svelte.js";
import { n as getCachedRole, r as initAuth, s as api } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { i as equipmentLabel, n as creditLabel, t as classTypeLabel } from "./labels.js";
//#region src/lib/features/calendar/components/DayStrip.svelte
function DayStrip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { days, selectedDay, onSelect } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="day-strip svelte-1s3lnwf"${attr("aria-label", t.calendar.daySelect())}><!--[-->`);
		const each_array = ensure_array_like(days);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let day = each_array[$$index];
			$$renderer.push(`<button type="button"${attr_class("day-strip__day svelte-1s3lnwf", void 0, { "day-strip__day--active": day.date === selectedDay })}>${escape_html(day.label)}</button>`);
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
			$$renderer.push(`<a class="class-card__join svelte-1d2l3tx"${attr("href", liveRoomHref(item.liveClass._id))}>${escape_html(t.calendar.class.join())}</a>`);
		} else if (item.viewerRole === "instructor" || item.viewerRole === "admin") {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<a class="class-card__join svelte-1d2l3tx"${attr("href", routePath("studioLive"))}>${escape_html(t.calendar.class.manage())}</a>`);
		} else if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<button type="button"${attr("disabled", actionId === item.liveClass._id, true)} class="svelte-1d2l3tx">${escape_html(t.calendar.class.cancel())}</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button type="button" class="class-card__reserve svelte-1d2l3tx"${attr("disabled", !item.viewerCanReserve || actionId === item.liveClass._id, true)}>${escape_html(t.calendar.class.reserve())}</button>`);
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
				$$renderer.push(`<a${attr("href", routePath("studioLive"))} class="btn btn--primary svelte-1xxgmnf">${escape_html(t.calendar.studio())}</a>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button type="button" class="btn btn--ghost svelte-1xxgmnf">${escape_html(t.calendar.today())}</button></div></div> <p class="description svelte-1xxgmnf">${escape_html(t.calendar.description())}</p> `);
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
			$$renderer.push(`<!--]--> `);
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
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { CalendarShell as t };
