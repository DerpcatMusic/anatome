import "./index-server.js";
import { a as bind_props, ht as run, i as attributes, nt as escape_html, o as derived, u as props_id } from "./dev.js";
import { C as ARROW_RIGHT, D as ENTER, F as boolToStr, I as boolToStrTrueOrUndef, J as Context, K as watch, P as boolToEmptyStrOrUndef, Q as mergeProps, R as createBitsAttrs, S as ARROW_LEFT, Y as attachRef, a as isValidIndex, c as createId, d as isBrowser, h as isHTMLElement, it as boxWith, n as chunk, w as ARROW_UP, x as ARROW_DOWN } from "./arrays.js";
import { n as srOnlyStylesString } from "./sr-only-styles.js";
import { c as afterTick, i as DOMContext, o as getDocument, t as useId } from "./use-id.js";
import { CalendarDate, CalendarDateTime, DateFormatter, ZonedDateTime, endOfMonth, getDayOfWeek, getLocalTimeZone, isSameDay, isSameMonth, isToday, parseDate, parseDateTime, parseZonedDateTime, startOfMonth, toCalendar } from "@internationalized/date";
//#region node_modules/bits-ui/dist/internal/date-time/announcer.js
/**
* Creates or gets an announcer element which is used to announce messages to screen readers.
* Within the date components, we use this to announce when the values of the individual segments
* change, as without it we get inconsistent behavior across screen readers.
*/
function initAnnouncer(doc) {
	if (!isBrowser || !doc) return null;
	let el = doc.querySelector("[data-bits-announcer]");
	/**
	* Creates a log element for assertive or polite announcements.
	*/
	const createLog = (kind) => {
		const log = doc.createElement("div");
		log.role = "log";
		log.ariaLive = kind;
		log.setAttribute("aria-relevant", "additions");
		return log;
	};
	if (!isHTMLElement(el)) {
		const div = doc.createElement("div");
		div.style.cssText = srOnlyStylesString;
		div.setAttribute("data-bits-announcer", "");
		div.appendChild(createLog("assertive"));
		div.appendChild(createLog("polite"));
		el = div;
		doc.body.insertBefore(el, doc.body.firstChild);
	}
	/**
	* Retrieves the log element for assertive or polite announcements.
	*/
	const getLog = (kind) => {
		if (!isHTMLElement(el)) return null;
		const log = el.querySelector(`[aria-live="${kind}"]`);
		if (!isHTMLElement(log)) return null;
		return log;
	};
	return { getLog };
}
/**
* Creates an announcer object that can be used to make `aria-live` announcements to screen readers.
*/
function getAnnouncer(doc) {
	const announcer = initAnnouncer(doc);
	/**
	* Announces a message to screen readers using the specified kind of announcement.
	*/
	function announce(value, kind = "assertive", timeout = 7500) {
		if (!announcer || !isBrowser || !doc) return;
		const log = announcer.getLog(kind);
		const content = doc.createElement("div");
		if (typeof value === "number") value = value.toString();
		else if (value === null) value = "Empty";
		else value = value.trim();
		content.innerText = value;
		if (kind === "assertive") log?.replaceChildren(content);
		else log?.appendChild(content);
		return setTimeout(() => {
			content.remove();
		}, timeout);
	}
	return { announce };
}
//#endregion
//#region node_modules/bits-ui/dist/internal/date-time/utils.js
var defaultDateDefaults = {
	defaultValue: void 0,
	granularity: "day"
};
/**
* A helper function used throughout the various date builders
* to generate a default `DateValue` using the `defaultValue`,
* `defaultPlaceholder`, `minValue`, `maxValue`, and `granularity` props.
*
* It's important to match the `DateValue` type being used
* elsewhere in the builder, so they behave according to the
* behavior the user expects based on the props they've provided.
*
*/
function getDefaultDate(opts) {
	const { defaultValue, granularity, minValue, maxValue } = {
		...defaultDateDefaults,
		...opts
	};
	if (Array.isArray(defaultValue) && defaultValue.length) return defaultValue[defaultValue.length - 1];
	if (defaultValue && !Array.isArray(defaultValue)) return defaultValue;
	else {
		let date = /* @__PURE__ */ new Date();
		if (minValue && date < minValue.toDate(getLocalTimeZone())) date = minValue.toDate(getLocalTimeZone());
		else if (maxValue && date > maxValue.toDate(getLocalTimeZone())) date = maxValue.toDate(getLocalTimeZone());
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		if ([
			"hour",
			"minute",
			"second"
		].includes(granularity ?? "day")) return new CalendarDateTime(year, month, day, 0, 0, 0);
		return new CalendarDate(year, month, day);
	}
}
/**
* Given a date string and a reference `DateValue` object, parse the
* string to the same type as the reference object.
*
* Useful for parsing strings from data attributes, which are always
* strings, to the same type being used by the date component.
*/
function parseStringToDateValue(dateStr, referenceVal) {
	let dateValue;
	if (referenceVal instanceof ZonedDateTime) dateValue = parseZonedDateTime(dateStr);
	else if (referenceVal instanceof CalendarDateTime) dateValue = parseDateTime(dateStr);
	else dateValue = parseDate(dateStr);
	return dateValue.calendar !== referenceVal.calendar ? toCalendar(dateValue, referenceVal.calendar) : dateValue;
}
/**
* Given a `DateValue` object, convert it to a native `Date` object.
* If a timezone is provided, the date will be converted to that timezone.
* If no timezone is provided, the date will be converted to the local timezone.
*/
function toDate(dateValue, tz = getLocalTimeZone()) {
	if (dateValue instanceof ZonedDateTime) return dateValue.toDate();
	else return dateValue.toDate(tz);
}
function getDateValueType(date) {
	if (date instanceof CalendarDate) return "date";
	if (date instanceof CalendarDateTime) return "datetime";
	if (date instanceof ZonedDateTime) return "zoneddatetime";
	throw new Error("Unknown date type");
}
function parseAnyDateValue(value, type) {
	switch (type) {
		case "date": return parseDate(value);
		case "datetime": return parseDateTime(value);
		case "zoneddatetime": return parseZonedDateTime(value);
		default: throw new Error(`Unknown date type: ${type}`);
	}
}
function isCalendarDateTime(dateValue) {
	return dateValue instanceof CalendarDateTime;
}
function isZonedDateTime(dateValue) {
	return dateValue instanceof ZonedDateTime;
}
function hasTime(dateValue) {
	return isCalendarDateTime(dateValue) || isZonedDateTime(dateValue);
}
/**
* Given a date, return the number of days in the month.
*/
function getDaysInMonth(date) {
	if (date instanceof Date) {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		/**
		* By using zero as the day, we get the
		* last day of the previous month, which
		* is the month we originally passed in.
		*/
		return new Date(year, month, 0).getDate();
	} else return date.set({ day: 100 }).day;
}
/**
* Determine if a date is before the reference date.
* @param dateToCompare - is this date before the `referenceDate`
* @param referenceDate - is the `dateToCompare` before this date
*
* @see {@link isBeforeOrSame} for inclusive
*/
function isBefore(dateToCompare, referenceDate) {
	return dateToCompare.compare(referenceDate) < 0;
}
/**
* Determine if a date is after the reference date.
* @param dateToCompare - is this date after the `referenceDate`
* @param referenceDate - is the `dateToCompare` after this date
*
* @see {@link isAfterOrSame} for inclusive
*/
function isAfter(dateToCompare, referenceDate) {
	return dateToCompare.compare(referenceDate) > 0;
}
function getLastFirstDayOfWeek(date, firstDayOfWeek, locale) {
	const day = getDayOfWeek(date, locale);
	if (firstDayOfWeek > day) return date.subtract({ days: day + 7 - firstDayOfWeek });
	if (firstDayOfWeek === day) return date;
	return date.subtract({ days: day - firstDayOfWeek });
}
function getNextLastDayOfWeek(date, firstDayOfWeek, locale) {
	const day = getDayOfWeek(date, locale);
	const lastDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
	if (day === lastDayOfWeek) return date;
	if (day > lastDayOfWeek) return date.add({ days: 7 - day + lastDayOfWeek });
	return date.add({ days: lastDayOfWeek - day });
}
//#endregion
//#region node_modules/bits-ui/dist/internal/date-time/formatter.js
var defaultPartOptions = {
	year: "numeric",
	month: "numeric",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric"
};
/**
* Creates a wrapper around the `DateFormatter`, which is
* an improved version of the {@link Intl.DateTimeFormat} API,
* that is used internally by the various date builders to
* easily format dates in a consistent way.
*
* @see [DateFormatter](https://react-spectrum.adobe.com/internationalized/date/DateFormatter.html)
*/
function createFormatter(opts) {
	let locale = opts.initialLocale;
	function setLocale(newLocale) {
		locale = newLocale;
	}
	function getLocale() {
		return locale;
	}
	function custom(date, options) {
		return new DateFormatter(locale, options).format(date);
	}
	function selectedDate(date, includeTime = true) {
		if (hasTime(date) && includeTime) return custom(toDate(date), {
			dateStyle: "long",
			timeStyle: "long"
		});
		else return custom(toDate(date), { dateStyle: "long" });
	}
	function fullMonthAndYear(date) {
		if (typeof opts.monthFormat.current !== "function" && typeof opts.yearFormat.current !== "function") return new DateFormatter(locale, {
			month: opts.monthFormat.current,
			year: opts.yearFormat.current
		}).format(date);
		return `${typeof opts.monthFormat.current === "function" ? opts.monthFormat.current(date.getMonth() + 1) : new DateFormatter(locale, { month: opts.monthFormat.current }).format(date)} ${typeof opts.yearFormat.current === "function" ? opts.yearFormat.current(date.getFullYear()) : new DateFormatter(locale, { year: opts.yearFormat.current }).format(date)}`;
	}
	function fullMonth(date) {
		return new DateFormatter(locale, { month: "long" }).format(date);
	}
	function fullYear(date) {
		return new DateFormatter(locale, { year: "numeric" }).format(date);
	}
	function toParts(date, options) {
		if (isZonedDateTime(date)) return new DateFormatter(locale, {
			...options,
			timeZone: date.timeZone
		}).formatToParts(toDate(date));
		else return new DateFormatter(locale, options).formatToParts(toDate(date));
	}
	function dayOfWeek(date, length = "narrow") {
		return new DateFormatter(locale, { weekday: length }).format(date);
	}
	function dayPeriod(date, hourCycle = void 0) {
		if (new DateFormatter(locale, {
			hour: "numeric",
			minute: "numeric",
			hourCycle: hourCycle === 24 ? "h23" : void 0
		}).formatToParts(date).find((p) => p.type === "dayPeriod")?.value === "PM") return "PM";
		return "AM";
	}
	function part(dateObj, type, options = {}) {
		const part = toParts(dateObj, {
			...defaultPartOptions,
			...options
		}).find((p) => p.type === type);
		return part ? part.value : "";
	}
	return {
		setLocale,
		getLocale,
		fullMonth,
		fullYear,
		fullMonthAndYear,
		toParts,
		custom,
		part,
		dayPeriod,
		selectedDate,
		dayOfWeek
	};
}
//#endregion
//#region node_modules/bits-ui/dist/internal/date-time/calendar-helpers.svelte.js
function isCalendarDayNode(node) {
	if (!isHTMLElement(node)) return false;
	if (!node.hasAttribute("data-bits-day")) return false;
	return true;
}
/**
* Retrieves an array of date values representing the days between
* the provided start and end dates.
*/
function getDaysBetween(start, end) {
	const days = [];
	let dCurrent = start.add({ days: 1 });
	const dEnd = end;
	while (dCurrent.compare(dEnd) < 0) {
		days.push(dCurrent);
		dCurrent = dCurrent.add({ days: 1 });
	}
	return days;
}
/**
* Creates a calendar month object.
*
* @remarks
* Given a date, this function returns an object containing
* the necessary values to render a calendar month, including
* the month's date (the first day of that month), which can be
* used to render the name of the month, an array of all dates
* in that month, and an array of weeks. Each week is an array
* of dates, useful for rendering an accessible calendar grid
* using a loop and table elements.
*
*/
function createMonth(props) {
	const { dateObj, weekStartsOn, fixedWeeks, locale } = props;
	const daysInMonth = getDaysInMonth(dateObj);
	const datesArray = Array.from({ length: daysInMonth }, (_, i) => dateObj.set({ day: i + 1 }));
	const firstDayOfMonth = startOfMonth(dateObj);
	const lastDayOfMonth = endOfMonth(dateObj);
	const lastSunday = weekStartsOn !== void 0 ? getLastFirstDayOfWeek(firstDayOfMonth, weekStartsOn, "en-US") : getLastFirstDayOfWeek(firstDayOfMonth, 0, locale);
	const nextSaturday = weekStartsOn !== void 0 ? getNextLastDayOfWeek(lastDayOfMonth, weekStartsOn, "en-US") : getNextLastDayOfWeek(lastDayOfMonth, 0, locale);
	const lastMonthDays = getDaysBetween(lastSunday.subtract({ days: 1 }), firstDayOfMonth);
	const nextMonthDays = getDaysBetween(lastDayOfMonth, nextSaturday.add({ days: 1 }));
	const totalDays = lastMonthDays.length + datesArray.length + nextMonthDays.length;
	if (fixedWeeks && totalDays < 42) {
		const extraDays = 42 - totalDays;
		let startFrom = nextMonthDays[nextMonthDays.length - 1];
		if (!startFrom) startFrom = dateObj.add({ months: 1 }).set({ day: 1 });
		let length = extraDays;
		if (nextMonthDays.length === 0) {
			length = extraDays - 1;
			nextMonthDays.push(startFrom);
		}
		const extraDaysArray = Array.from({ length }, (_, i) => {
			const incr = i + 1;
			return startFrom.add({ days: incr });
		});
		nextMonthDays.push(...extraDaysArray);
	}
	const allDays = lastMonthDays.concat(datesArray, nextMonthDays);
	return {
		value: dateObj,
		dates: allDays,
		weeks: chunk(allDays, 7)
	};
}
function createMonths(props) {
	const { numberOfMonths, dateObj, ...monthProps } = props;
	const months = [];
	if (!numberOfMonths || numberOfMonths === 1) {
		months.push(createMonth({
			...monthProps,
			dateObj
		}));
		return months;
	}
	months.push(createMonth({
		...monthProps,
		dateObj
	}));
	for (let i = 1; i < numberOfMonths; i++) {
		const nextMonth = dateObj.add({ months: i });
		months.push(createMonth({
			...monthProps,
			dateObj: nextMonth
		}));
	}
	return months;
}
function getSelectableCells(calendarNode) {
	if (!calendarNode) return [];
	return Array.from(calendarNode.querySelectorAll(`[data-bits-day]:not([data-disabled]):not([data-outside-visible-months])`)).filter((el) => isHTMLElement(el));
}
/**
* A helper function to extract the date from the `data-value`
* attribute of a date cell and set it as the placeholder value.
*
* Shared between the calendar and range calendar builders.
*
* @param node - The node to extract the date from.
* @param placeholder - The placeholder value store which will be set to the extracted date.
*/
function setPlaceholderToNodeValue(node, placeholder) {
	const cellValue = node.getAttribute("data-value");
	if (!cellValue) return;
	placeholder.current = parseStringToDateValue(cellValue, placeholder.current);
}
/**
* Shared logic for shifting focus between cells in the
* calendar and range calendar.
*/
function shiftCalendarFocus({ node, add, placeholder, calendarNode, isPrevButtonDisabled, isNextButtonDisabled, months, numberOfMonths }) {
	const candidateCells = getSelectableCells(calendarNode);
	if (!candidateCells.length) return;
	const nextIndex = candidateCells.indexOf(node) + add;
	/**
	* If the next cell is within the bounds of the displayed cells,
	* easy day, we just focus it.
	*/
	if (isValidIndex(nextIndex, candidateCells)) {
		const nextCell = candidateCells[nextIndex];
		setPlaceholderToNodeValue(nextCell, placeholder);
		return nextCell.focus();
	}
	/**
	* When the next cell falls outside the displayed cells range,
	* we update the focus to the previous or next month based on the
	* direction, and then focus on the relevant cell.
	*/
	if (nextIndex < 0) {
		/**
		* To handle negative indices, we rewind by one month,
		* retrieve candidate cells for that month, and shift focus
		* by the difference between the nextIndex starting from the end
		* of the array.
		*/
		if (isPrevButtonDisabled) return;
		const firstMonth = months[0]?.value;
		if (!firstMonth) return;
		placeholder.current = firstMonth.subtract({ months: numberOfMonths });
		afterTick(() => {
			const newCandidateCells = getSelectableCells(calendarNode);
			if (!newCandidateCells.length) return;
			/**
			* Starting at the end of the array, shift focus by the diff
			* between the nextIndex and the length of the array, since the
			* nextIndex is negative.
			*/
			const newIndex = newCandidateCells.length - Math.abs(nextIndex);
			if (isValidIndex(newIndex, newCandidateCells)) {
				const newCell = newCandidateCells[newIndex];
				setPlaceholderToNodeValue(newCell, placeholder);
				return newCell.focus();
			}
		});
	}
	if (nextIndex >= candidateCells.length) {
		/**
		* Since we're in the positive index range, we need to go forward
		* a month, refetch the candidate cells within that month, and then
		* starting at the beginning of the array, shift focus by the nextIndex
		* amount.
		*/
		if (isNextButtonDisabled) return;
		const firstMonth = months[0]?.value;
		if (!firstMonth) return;
		placeholder.current = firstMonth.add({ months: numberOfMonths });
		afterTick(() => {
			const newCandidateCells = getSelectableCells(calendarNode);
			if (!newCandidateCells.length) return;
			/**
			* We need to determine how far into the next month we need to go
			* to get the next index. So if we only went over the previous month
			* by one, we need to go into the next month by 1 to get the right index.
			*/
			const newIndex = nextIndex - candidateCells.length;
			if (isValidIndex(newIndex, newCandidateCells)) return newCandidateCells[newIndex].focus();
		});
	}
}
var ARROW_KEYS = [
	ARROW_DOWN,
	ARROW_UP,
	ARROW_LEFT,
	ARROW_RIGHT
];
var SELECT_KEYS = [ENTER, " "];
/**
* Shared keyboard event handler for the calendar and range calendar.
*/
function handleCalendarKeydown({ event, handleCellClick, shiftFocus, placeholderValue }) {
	const currentCell = event.target;
	if (!isCalendarDayNode(currentCell)) return;
	if (!ARROW_KEYS.includes(event.key) && !SELECT_KEYS.includes(event.key)) return;
	event.preventDefault();
	const kbdFocusMap = {
		[ARROW_DOWN]: 7,
		[ARROW_UP]: -7,
		[ARROW_LEFT]: -1,
		[ARROW_RIGHT]: 1
	};
	if (ARROW_KEYS.includes(event.key)) {
		const add = kbdFocusMap[event.key];
		if (add !== void 0) shiftFocus(currentCell, add);
	}
	if (SELECT_KEYS.includes(event.key)) {
		const cellValue = currentCell.getAttribute("data-value");
		if (!cellValue) return;
		handleCellClick(event, parseStringToDateValue(cellValue, placeholderValue));
	}
}
function handleCalendarNextPage({ months, setMonths, numberOfMonths, pagedNavigation, weekStartsOn, locale, fixedWeeks, setPlaceholder }) {
	const firstMonth = months[0]?.value;
	if (!firstMonth) return;
	if (pagedNavigation) setPlaceholder(firstMonth.add({ months: numberOfMonths }));
	else {
		const targetDate = firstMonth.add({ months: 1 });
		const newMonths = createMonths({
			dateObj: targetDate,
			weekStartsOn,
			locale,
			fixedWeeks,
			numberOfMonths
		});
		setPlaceholder(targetDate);
		setMonths(newMonths);
	}
}
function handleCalendarPrevPage({ months, setMonths, numberOfMonths, pagedNavigation, weekStartsOn, locale, fixedWeeks, setPlaceholder }) {
	const firstMonth = months[0]?.value;
	if (!firstMonth) return;
	if (pagedNavigation) setPlaceholder(firstMonth.subtract({ months: numberOfMonths }));
	else {
		const targetDate = firstMonth.subtract({ months: 1 });
		const newMonths = createMonths({
			dateObj: targetDate,
			weekStartsOn,
			locale,
			fixedWeeks,
			numberOfMonths
		});
		setPlaceholder(targetDate);
		setMonths(newMonths);
	}
}
function getWeekdays({ months, formatter, weekdayFormat }) {
	if (!months.length) return [];
	const firstWeek = months[0].weeks[0];
	if (!firstWeek) return [];
	return firstWeek.map((date) => formatter.dayOfWeek(toDate(date), weekdayFormat));
}
function useMonthViewPlaceholderSync({ placeholder, getVisibleMonths, weekStartsOn, locale, fixedWeeks, numberOfMonths, setMonths }) {
	/**
	* If the placeholder's month is already in this visible months,
	* we don't need to do anything.
	*/
}
function getIsNextButtonDisabled({ maxValue, months, disabled }) {
	if (!maxValue || !months.length) return false;
	if (disabled) return true;
	const lastMonthInView = months[months.length - 1]?.value;
	if (!lastMonthInView) return false;
	return isAfter(lastMonthInView.add({ months: 1 }).set({ day: 1 }), maxValue);
}
function getIsPrevButtonDisabled({ minValue, months, disabled }) {
	if (!minValue || !months.length) return false;
	if (disabled) return true;
	const firstMonthInView = months[0]?.value;
	if (!firstMonthInView) return false;
	return isBefore(firstMonthInView.subtract({ months: 1 }).set({ day: 35 }), minValue);
}
function getCalendarHeadingValue({ months, locale, formatter }) {
	if (!months.length) return "";
	if (locale !== formatter.getLocale()) formatter.setLocale(locale);
	if (months.length === 1) {
		const month = toDate(months[0].value);
		return `${formatter.fullMonthAndYear(month)}`;
	}
	const startMonth = toDate(months[0].value);
	const endMonth = toDate(months[months.length - 1].value);
	const startMonthName = formatter.fullMonth(startMonth);
	const endMonthName = formatter.fullMonth(endMonth);
	const startMonthYear = formatter.fullYear(startMonth);
	const endMonthYear = formatter.fullYear(endMonth);
	return startMonthYear === endMonthYear ? `${startMonthName} - ${endMonthName} ${endMonthYear}` : `${startMonthName} ${startMonthYear} - ${endMonthName} ${endMonthYear}`;
}
function getCalendarElementProps({ fullCalendarLabel, id, isInvalid, disabled, readonly }) {
	return {
		id,
		role: "application",
		"aria-label": fullCalendarLabel,
		"data-invalid": boolToEmptyStrOrUndef(isInvalid),
		"data-disabled": boolToEmptyStrOrUndef(disabled),
		"data-readonly": boolToEmptyStrOrUndef(readonly)
	};
}
function pickerOpenFocus(e) {
	const nodeToFocus = getDocument(e.target).querySelector("[data-bits-day][data-focused]");
	if (nodeToFocus) {
		e.preventDefault();
		nodeToFocus?.focus();
	}
}
function getFirstNonDisabledDateInView(calendarRef) {
	if (!isBrowser) return;
	const daysInView = Array.from(calendarRef.querySelectorAll("[data-bits-day]:not([aria-disabled=true])"));
	if (daysInView.length === 0) return;
	const element = daysInView[0];
	const value = element?.getAttribute("data-value");
	const type = element?.getAttribute("data-type");
	if (!value || !type) return;
	return parseAnyDateValue(value, type);
}
/**
* Ensures the placeholder is not set to a disabled date,
* which would prevent the user from entering the Calendar
* via the keyboard.
*/
function useEnsureNonDisabledPlaceholder({ ref, placeholder, defaultPlaceholder, minValue, maxValue, isDateDisabled }) {
	function isDisabled(date) {
		if (isDateDisabled.current(date)) return true;
		if (minValue.current && isBefore(date, minValue.current)) return true;
		if (maxValue.current && isBefore(maxValue.current, date)) return true;
		return false;
	}
	watch(() => ref.current, () => {
		if (!ref.current) return;
		/**
		* If the placeholder is still the default placeholder and it's a disabled date, find
		* the first available date in the calendar view and set it as the placeholder.
		*
		* This prevents the placeholder from being a disabled date and no date being tabbable
		* preventing the user from entering the Calendar. If all dates in the view are
		* disabled, currently that is considered an error on the developer's part and should
		* be handled by them.
		*
		* Perhaps in the future we can introduce a dev-only log message to prevent this from
		* being a silent error.
		*/
		if (placeholder.current && isSameDay(placeholder.current, defaultPlaceholder) && isDisabled(defaultPlaceholder)) placeholder.current = getFirstNonDisabledDateInView(ref.current) ?? defaultPlaceholder;
	});
}
function getDateWithPreviousTime(date, prev) {
	if (!date || !prev) return date;
	if (hasTime(date) && hasTime(prev)) return date.set({
		hour: prev.hour,
		minute: prev.minute,
		millisecond: prev.millisecond,
		second: prev.second
	});
	return date;
}
var calendarAttrs = createBitsAttrs({
	component: "calendar",
	parts: [
		"root",
		"grid",
		"cell",
		"next-button",
		"prev-button",
		"day",
		"grid-body",
		"grid-head",
		"grid-row",
		"head-cell",
		"header",
		"heading",
		"month-select",
		"year-select"
	]
});
function getDefaultYears(opts) {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const latestYear = Math.max(opts.placeholderYear, currentYear);
	let minYear;
	let maxYear;
	if (opts.minValue) minYear = opts.minValue.year;
	else {
		const initialMinYear = latestYear - 100;
		minYear = opts.placeholderYear < initialMinYear ? opts.placeholderYear - 10 : initialMinYear;
	}
	if (opts.maxValue) maxYear = opts.maxValue.year;
	else maxYear = latestYear + 10;
	if (minYear > maxYear) minYear = maxYear;
	const totalYears = maxYear - minYear + 1;
	return Array.from({ length: totalYears }, (_, i) => minYear + i);
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/calendar.svelte.js
var CalendarRootContext = new Context("Calendar.Root | RangeCalender.Root");
var CalendarRootState = class CalendarRootState {
	static create(opts) {
		return CalendarRootContext.set(new CalendarRootState(opts));
	}
	opts;
	#visibleMonths = derived(() => this.months.map((month) => month.value));
	get visibleMonths() {
		return this.#visibleMonths();
	}
	set visibleMonths($$value) {
		return this.#visibleMonths($$value);
	}
	formatter;
	accessibleHeadingId = useId();
	domContext;
	attachment;
	months = [];
	announcer;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
		this.domContext = new DOMContext(opts.ref);
		this.announcer = getAnnouncer(null);
		this.formatter = createFormatter({
			initialLocale: this.opts.locale.current,
			monthFormat: this.opts.monthFormat,
			yearFormat: this.opts.yearFormat
		});
		this.setMonths = this.setMonths.bind(this);
		this.nextPage = this.nextPage.bind(this);
		this.prevPage = this.prevPage.bind(this);
		this.prevYear = this.prevYear.bind(this);
		this.nextYear = this.nextYear.bind(this);
		this.setYear = this.setYear.bind(this);
		this.setMonth = this.setMonth.bind(this);
		this.isOutsideVisibleMonths = this.isOutsideVisibleMonths.bind(this);
		this.isDateDisabled = this.isDateDisabled.bind(this);
		this.isDateSelected = this.isDateSelected.bind(this);
		this.shiftFocus = this.shiftFocus.bind(this);
		this.handleCellClick = this.handleCellClick.bind(this);
		this.handleMultipleUpdate = this.handleMultipleUpdate.bind(this);
		this.handleSingleUpdate = this.handleSingleUpdate.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
		this.getBitsAttr = this.getBitsAttr.bind(this);
		this.months = createMonths({
			dateObj: this.opts.placeholder.current,
			weekStartsOn: this.opts.weekStartsOn.current,
			locale: this.opts.locale.current,
			fixedWeeks: this.opts.fixedWeeks.current,
			numberOfMonths: this.opts.numberOfMonths.current
		});
		this.#setupInitialFocusEffect();
		this.#setupAccessibleHeadingEffect();
		this.#setupFormatterEffect();
		/**
		* Updates the displayed months based on changes in the placeholder value.
		*/
		useMonthViewPlaceholderSync({
			placeholder: this.opts.placeholder,
			getVisibleMonths: () => this.visibleMonths,
			weekStartsOn: this.opts.weekStartsOn,
			locale: this.opts.locale,
			fixedWeeks: this.opts.fixedWeeks,
			numberOfMonths: this.opts.numberOfMonths,
			setMonths: (months) => this.months = months
		});
		/**
		* Updates the displayed months based on changes in the options values,
		* which determines the month to show in the calendar.
		*/
		this.opts.fixedWeeks, this.opts.locale, this.opts.numberOfMonths, this.opts.placeholder, this.setMonths, this.opts.weekStartsOn;
		/**
		* Update the accessible heading's text content when the `fullCalendarLabel`
		* changes.
		*/
		watch(() => this.fullCalendarLabel, (label) => {
			const node = this.domContext.getElementById(this.accessibleHeadingId);
			if (!node) return;
			node.textContent = label;
		});
		/**
		* Synchronize the placeholder value with the current value.
		*/
		watch(() => this.opts.value.current, () => {
			const value = this.opts.value.current;
			if (Array.isArray(value) && value.length) {
				const lastValue = value[value.length - 1];
				if (lastValue && this.opts.placeholder.current !== lastValue) this.opts.placeholder.current = lastValue;
			} else if (!Array.isArray(value) && value && this.opts.placeholder.current !== value) this.opts.placeholder.current = value;
		});
		useEnsureNonDisabledPlaceholder({
			placeholder: opts.placeholder,
			defaultPlaceholder: opts.defaultPlaceholder,
			isDateDisabled: opts.isDateDisabled,
			maxValue: opts.maxValue,
			minValue: opts.minValue,
			ref: opts.ref
		});
	}
	setMonths(months) {
		this.months = months;
	}
	#weekdays = derived(
		/**
		* This derived state holds an array of localized day names for the current
		* locale and calendar view. It dynamically syncs with the 'weekStartsOn' option,
		* updating its content when the option changes. Using this state to render the
		* calendar's days of the week is strongly recommended, as it guarantees that
		* the days are correctly formatted for the current locale and calendar view.
		*/
		() => {
			return getWeekdays({
				months: this.months,
				formatter: this.formatter,
				weekdayFormat: this.opts.weekdayFormat.current
			});
		}
	);
	get weekdays() {
		return this.#weekdays();
	}
	set weekdays($$value) {
		return this.#weekdays($$value);
	}
	#initialPlaceholderYear = derived(() => run(() => this.opts.placeholder.current.year));
	get initialPlaceholderYear() {
		return this.#initialPlaceholderYear();
	}
	set initialPlaceholderYear($$value) {
		return this.#initialPlaceholderYear($$value);
	}
	#defaultYears = derived(() => {
		return getDefaultYears({
			minValue: this.opts.minValue.current,
			maxValue: this.opts.maxValue.current,
			placeholderYear: this.initialPlaceholderYear
		});
	});
	get defaultYears() {
		return this.#defaultYears();
	}
	set defaultYears($$value) {
		return this.#defaultYears($$value);
	}
	#setupInitialFocusEffect() {}
	#setupAccessibleHeadingEffect() {}
	#setupFormatterEffect() {}
	/**
	* Navigates to the next page of the calendar.
	*/
	nextPage() {
		handleCalendarNextPage({
			fixedWeeks: this.opts.fixedWeeks.current,
			locale: this.opts.locale.current,
			numberOfMonths: this.opts.numberOfMonths.current,
			pagedNavigation: this.opts.pagedNavigation.current,
			setMonths: this.setMonths,
			setPlaceholder: (date) => this.opts.placeholder.current = date,
			weekStartsOn: this.opts.weekStartsOn.current,
			months: this.months
		});
	}
	/**
	* Navigates to the previous page of the calendar.
	*/
	prevPage() {
		handleCalendarPrevPage({
			fixedWeeks: this.opts.fixedWeeks.current,
			locale: this.opts.locale.current,
			numberOfMonths: this.opts.numberOfMonths.current,
			pagedNavigation: this.opts.pagedNavigation.current,
			setMonths: this.setMonths,
			setPlaceholder: (date) => this.opts.placeholder.current = date,
			weekStartsOn: this.opts.weekStartsOn.current,
			months: this.months
		});
	}
	nextYear() {
		this.opts.placeholder.current = this.opts.placeholder.current.add({ years: 1 });
	}
	prevYear() {
		this.opts.placeholder.current = this.opts.placeholder.current.subtract({ years: 1 });
	}
	setYear(year) {
		this.opts.placeholder.current = this.opts.placeholder.current.set({ year });
	}
	setMonth(month) {
		this.opts.placeholder.current = this.opts.placeholder.current.set({ month });
	}
	#isNextButtonDisabled = derived(() => {
		return getIsNextButtonDisabled({
			maxValue: this.opts.maxValue.current,
			months: this.months,
			disabled: this.opts.disabled.current
		});
	});
	get isNextButtonDisabled() {
		return this.#isNextButtonDisabled();
	}
	set isNextButtonDisabled($$value) {
		return this.#isNextButtonDisabled($$value);
	}
	#isPrevButtonDisabled = derived(() => {
		return getIsPrevButtonDisabled({
			minValue: this.opts.minValue.current,
			months: this.months,
			disabled: this.opts.disabled.current
		});
	});
	get isPrevButtonDisabled() {
		return this.#isPrevButtonDisabled();
	}
	set isPrevButtonDisabled($$value) {
		return this.#isPrevButtonDisabled($$value);
	}
	#isInvalid = derived(() => {
		const value = this.opts.value.current;
		const isDateDisabled = this.opts.isDateDisabled.current;
		const isDateUnavailable = this.opts.isDateUnavailable.current;
		if (Array.isArray(value)) {
			if (!value.length) return false;
			for (const date of value) {
				if (isDateDisabled(date)) return true;
				if (isDateUnavailable(date)) return true;
			}
		} else {
			if (!value) return false;
			if (isDateDisabled(value)) return true;
			if (isDateUnavailable(value)) return true;
		}
		return false;
	});
	get isInvalid() {
		return this.#isInvalid();
	}
	set isInvalid($$value) {
		return this.#isInvalid($$value);
	}
	#headingValue = derived(() => {
		this.opts.monthFormat.current;
		this.opts.yearFormat.current;
		return getCalendarHeadingValue({
			months: this.months,
			formatter: this.formatter,
			locale: this.opts.locale.current
		});
	});
	get headingValue() {
		return this.#headingValue();
	}
	set headingValue($$value) {
		return this.#headingValue($$value);
	}
	#fullCalendarLabel = derived(() => {
		return `${this.opts.calendarLabel.current} ${this.headingValue}`;
	});
	get fullCalendarLabel() {
		return this.#fullCalendarLabel();
	}
	set fullCalendarLabel($$value) {
		return this.#fullCalendarLabel($$value);
	}
	isOutsideVisibleMonths(date) {
		return !this.visibleMonths.some((month) => isSameMonth(date, month));
	}
	isDateDisabled(date) {
		if (this.opts.isDateDisabled.current(date) || this.opts.disabled.current) return true;
		const minValue = this.opts.minValue.current;
		const maxValue = this.opts.maxValue.current;
		if (minValue && isBefore(date, minValue)) return true;
		if (maxValue && isBefore(maxValue, date)) return true;
		return false;
	}
	isDateSelected(date) {
		const value = this.opts.value.current;
		if (Array.isArray(value)) return value.some((d) => isSameDay(d, date));
		else if (!value) return false;
		return isSameDay(value, date);
	}
	shiftFocus(node, add) {
		return shiftCalendarFocus({
			node,
			add,
			placeholder: this.opts.placeholder,
			calendarNode: this.opts.ref.current,
			isPrevButtonDisabled: this.isPrevButtonDisabled,
			isNextButtonDisabled: this.isNextButtonDisabled,
			months: this.months,
			numberOfMonths: this.opts.numberOfMonths.current
		});
	}
	#isMultipleSelectionValid(selectedDates) {
		if (this.opts.type.current !== "multiple") return true;
		if (!this.opts.maxDays.current) return true;
		const selectedCount = selectedDates.length;
		if (this.opts.maxDays.current && selectedCount > this.opts.maxDays.current) return false;
		return true;
	}
	handleCellClick(_, date) {
		if (this.opts.readonly.current || this.opts.isDateDisabled.current?.(date) || this.opts.isDateUnavailable.current?.(date)) return;
		const prev = this.opts.value.current;
		if (this.opts.type.current === "multiple") {
			if (Array.isArray(prev) || prev === void 0) this.opts.value.current = this.handleMultipleUpdate(prev, date);
		} else if (!Array.isArray(prev)) {
			const next = this.handleSingleUpdate(prev, date);
			if (!next) this.announcer.announce("Selected date is now empty.", "polite", 5e3);
			else this.announcer.announce(`Selected Date: ${this.formatter.selectedDate(next, false)}`, "polite");
			this.opts.value.current = getDateWithPreviousTime(next, prev);
			if (next !== void 0) this.opts.onDateSelect?.current?.();
		}
	}
	handleMultipleUpdate(prev, date) {
		if (!prev) {
			const newSelection = [date];
			return this.#isMultipleSelectionValid(newSelection) ? newSelection : [date];
		}
		if (!Array.isArray(prev)) return;
		const index = prev.findIndex((d) => isSameDay(d, date));
		const preventDeselect = this.opts.preventDeselect.current;
		if (index === -1) {
			const newSelection = [...prev, date];
			if (this.#isMultipleSelectionValid(newSelection)) return newSelection;
			else return [date];
		} else if (preventDeselect) return prev;
		else {
			const next = prev.filter((d) => !isSameDay(d, date));
			if (!next.length) {
				this.opts.placeholder.current = date;
				return;
			}
			return next;
		}
	}
	handleSingleUpdate(prev, date) {
		if (Array.isArray(prev)) {}
		if (!prev) return date;
		if (!this.opts.preventDeselect.current && isSameDay(prev, date)) {
			this.opts.placeholder.current = date;
			return;
		}
		return date;
	}
	onkeydown(event) {
		handleCalendarKeydown({
			event,
			handleCellClick: this.handleCellClick,
			shiftFocus: this.shiftFocus,
			placeholderValue: this.opts.placeholder.current
		});
	}
	#snippetProps = derived(() => ({
		months: this.months,
		weekdays: this.weekdays
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	getBitsAttr = (part) => {
		return calendarAttrs.getAttr(part);
	};
	#props = derived(() => ({
		...getCalendarElementProps({
			fullCalendarLabel: this.fullCalendarLabel,
			id: this.opts.id.current,
			isInvalid: this.isInvalid,
			disabled: this.opts.disabled.current,
			readonly: this.opts.readonly.current
		}),
		[this.getBitsAttr("root")]: "",
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
var CalendarHeadingState = class CalendarHeadingState {
	static create(opts) {
		return new CalendarHeadingState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"aria-hidden": boolToStrTrueOrUndef(true),
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		[this.root.getBitsAttr("heading")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarCellContext = new Context("Calendar.Cell | RangeCalendar.Cell");
var CalendarCellState = class CalendarCellState {
	static create(opts) {
		return CalendarCellContext.set(new CalendarCellState(opts, CalendarRootContext.get()));
	}
	opts;
	root;
	#cellDate = derived(() => toDate(this.opts.date.current));
	get cellDate() {
		return this.#cellDate();
	}
	set cellDate($$value) {
		return this.#cellDate($$value);
	}
	#isUnavailable = derived(() => this.root.opts.isDateUnavailable.current(this.opts.date.current));
	get isUnavailable() {
		return this.#isUnavailable();
	}
	set isUnavailable($$value) {
		return this.#isUnavailable($$value);
	}
	#isDateToday = derived(() => isToday(this.opts.date.current, getLocalTimeZone()));
	get isDateToday() {
		return this.#isDateToday();
	}
	set isDateToday($$value) {
		return this.#isDateToday($$value);
	}
	#isOutsideMonth = derived(() => !isSameMonth(this.opts.date.current, this.opts.month.current));
	get isOutsideMonth() {
		return this.#isOutsideMonth();
	}
	set isOutsideMonth($$value) {
		return this.#isOutsideMonth($$value);
	}
	#isOutsideVisibleMonths = derived(() => this.root.isOutsideVisibleMonths(this.opts.date.current));
	get isOutsideVisibleMonths() {
		return this.#isOutsideVisibleMonths();
	}
	set isOutsideVisibleMonths($$value) {
		return this.#isOutsideVisibleMonths($$value);
	}
	#isDisabled = derived(() => this.root.isDateDisabled(this.opts.date.current) || this.isOutsideMonth && this.root.opts.disableDaysOutsideMonth.current);
	get isDisabled() {
		return this.#isDisabled();
	}
	set isDisabled($$value) {
		return this.#isDisabled($$value);
	}
	#isFocusedDate = derived(() => isSameDay(this.opts.date.current, this.root.opts.placeholder.current));
	get isFocusedDate() {
		return this.#isFocusedDate();
	}
	set isFocusedDate($$value) {
		return this.#isFocusedDate($$value);
	}
	#isSelectedDate = derived(() => this.root.isDateSelected(this.opts.date.current));
	get isSelectedDate() {
		return this.#isSelectedDate();
	}
	set isSelectedDate($$value) {
		return this.#isSelectedDate($$value);
	}
	#labelText = derived(() => this.root.formatter.custom(this.cellDate, {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric"
	}));
	get labelText() {
		return this.#labelText();
	}
	set labelText($$value) {
		return this.#labelText($$value);
	}
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#snippetProps = derived(() => ({
		disabled: this.isDisabled,
		unavailable: this.isUnavailable,
		selected: this.isSelectedDate,
		day: `${this.opts.date.current.day}`
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#ariaDisabled = derived(() => {
		return this.isDisabled || this.isOutsideMonth && this.root.opts.disableDaysOutsideMonth.current || this.isUnavailable;
	});
	get ariaDisabled() {
		return this.#ariaDisabled();
	}
	set ariaDisabled($$value) {
		return this.#ariaDisabled($$value);
	}
	#sharedDataAttrs = derived(() => ({
		"data-unavailable": boolToEmptyStrOrUndef(this.isUnavailable),
		"data-today": this.isDateToday ? "" : void 0,
		"data-outside-month": this.isOutsideMonth ? "" : void 0,
		"data-outside-visible-months": this.isOutsideVisibleMonths ? "" : void 0,
		"data-focused": this.isFocusedDate ? "" : void 0,
		"data-selected": boolToEmptyStrOrUndef(this.isSelectedDate),
		"data-value": this.opts.date.current.toString(),
		"data-type": getDateValueType(this.opts.date.current),
		"data-disabled": boolToEmptyStrOrUndef(this.isDisabled || this.isOutsideMonth && this.root.opts.disableDaysOutsideMonth.current)
	}));
	get sharedDataAttrs() {
		return this.#sharedDataAttrs();
	}
	set sharedDataAttrs($$value) {
		return this.#sharedDataAttrs($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "gridcell",
		"aria-selected": boolToStr(this.isSelectedDate),
		"aria-disabled": boolToStr(this.ariaDisabled),
		...this.sharedDataAttrs,
		[this.root.getBitsAttr("cell")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarDayState = class CalendarDayState {
	static create(opts) {
		return new CalendarDayState(opts, CalendarCellContext.get());
	}
	opts;
	cell;
	attachment;
	constructor(opts, cell) {
		this.opts = opts;
		this.cell = cell;
		this.onclick = this.onclick.bind(this);
		this.attachment = attachRef(this.opts.ref);
	}
	#tabindex = derived(() => this.cell.isOutsideMonth && this.cell.root.opts.disableDaysOutsideMonth.current || this.cell.isDisabled ? void 0 : this.cell.isFocusedDate ? 0 : -1);
	onclick(e) {
		if (this.cell.isDisabled) return;
		this.cell.root.handleCellClick(e, this.cell.opts.date.current);
	}
	#snippetProps = derived(() => ({
		disabled: this.cell.isDisabled,
		unavailable: this.cell.isUnavailable,
		selected: this.cell.isSelectedDate,
		day: `${this.cell.opts.date.current.day}`
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "button",
		"aria-label": this.cell.labelText,
		"aria-disabled": boolToStr(this.cell.ariaDisabled),
		...this.cell.sharedDataAttrs,
		tabindex: this.#tabindex(),
		[this.cell.root.getBitsAttr("day")]: "",
		"data-bits-day": "",
		onclick: this.onclick,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarNextButtonState = class CalendarNextButtonState {
	static create(opts) {
		return new CalendarNextButtonState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	#isDisabled = derived(() => this.root.isNextButtonDisabled);
	get isDisabled() {
		return this.#isDisabled();
	}
	set isDisabled($$value) {
		return this.#isDisabled($$value);
	}
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.onclick = this.onclick.bind(this);
		this.attachment = attachRef(this.opts.ref);
	}
	onclick(_) {
		if (this.isDisabled) return;
		this.root.nextPage();
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "button",
		type: "button",
		"aria-label": "Next",
		"aria-disabled": boolToStr(this.isDisabled),
		"data-disabled": boolToEmptyStrOrUndef(this.isDisabled),
		disabled: this.isDisabled,
		[this.root.getBitsAttr("next-button")]: "",
		onclick: this.onclick,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarPrevButtonState = class CalendarPrevButtonState {
	static create(opts) {
		return new CalendarPrevButtonState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	#isDisabled = derived(() => this.root.isPrevButtonDisabled);
	get isDisabled() {
		return this.#isDisabled();
	}
	set isDisabled($$value) {
		return this.#isDisabled($$value);
	}
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.onclick = this.onclick.bind(this);
		this.attachment = attachRef(this.opts.ref);
	}
	onclick(_) {
		if (this.isDisabled) return;
		this.root.prevPage();
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "button",
		type: "button",
		"aria-label": "Previous",
		"aria-disabled": boolToStr(this.isDisabled),
		"data-disabled": boolToEmptyStrOrUndef(this.isDisabled),
		disabled: this.isDisabled,
		[this.root.getBitsAttr("prev-button")]: "",
		onclick: this.onclick,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarGridState = class CalendarGridState {
	static create(opts) {
		return new CalendarGridState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		tabindex: -1,
		role: "grid",
		"aria-readonly": boolToStr(this.root.opts.readonly.current),
		"aria-disabled": boolToStr(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		[this.root.getBitsAttr("grid")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarGridBodyState = class CalendarGridBodyState {
	static create(opts) {
		return new CalendarGridBodyState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		[this.root.getBitsAttr("grid-body")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarGridHeadState = class CalendarGridHeadState {
	static create(opts) {
		return new CalendarGridHeadState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		[this.root.getBitsAttr("grid-head")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarGridRowState = class CalendarGridRowState {
	static create(opts) {
		return new CalendarGridRowState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		[this.root.getBitsAttr("grid-row")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarHeadCellState = class CalendarHeadCellState {
	static create(opts) {
		return new CalendarHeadCellState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		[this.root.getBitsAttr("head-cell")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var CalendarHeaderState = class CalendarHeaderState {
	static create(opts) {
		return new CalendarHeaderState(opts, CalendarRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		"data-readonly": boolToEmptyStrOrUndef(this.root.opts.readonly.current),
		[this.root.getBitsAttr("header")]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-day.svelte
function Calendar_day($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const dayState = CalendarDayState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, dayState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...dayState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			if (children) {
				$$renderer.push("<!--[0-->");
				children?.($$renderer, dayState.snippetProps);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`${escape_html(dayState.cell.opts.date.current.day)}`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-grid.svelte
function Calendar_grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const gridState = CalendarGridState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, gridState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<table${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></table>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-grid-body.svelte
function Calendar_grid_body($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const gridBodyState = CalendarGridBodyState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, gridBodyState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<tbody${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></tbody>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-cell.svelte
function Calendar_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), date, month, $$slots, $$events, ...restProps } = $$props;
		const cellState = CalendarCellState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			date: boxWith(() => date),
			month: boxWith(() => month)
		});
		const mergedProps = derived(() => mergeProps(restProps, cellState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...cellState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<td${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, cellState.snippetProps);
			$$renderer.push(`<!----></td>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-grid-head.svelte
function Calendar_grid_head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const gridHeadState = CalendarGridHeadState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, gridHeadState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<thead${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></thead>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-head-cell.svelte
function Calendar_head_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const headCellState = CalendarHeadCellState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, headCellState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<th${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></th>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-grid-row.svelte
function Calendar_grid_row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const gridRowState = CalendarGridRowState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, gridRowState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<tr${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></tr>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-header.svelte
function Calendar_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const headerState = CalendarHeaderState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, headerState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<header${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></header>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-heading.svelte
function Calendar_heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const headingState = CalendarHeadingState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, headingState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				headingValue: headingState.root.headingValue
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			if (children) {
				$$renderer.push("<!--[0-->");
				children?.($$renderer, { headingValue: headingState.root.headingValue });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`${escape_html(headingState.root.headingValue)}`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-next-button.svelte
function Calendar_next_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, tabindex = 0, $$slots, $$events, ...restProps } = $$props;
		const nextButtonState = CalendarNextButtonState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, nextButtonState.props, { tabindex }));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/calendar/components/calendar-prev-button.svelte
function Calendar_prev_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, tabindex = 0, $$slots, $$events, ...restProps } = $$props;
		const prevButtonState = CalendarPrevButtonState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, prevButtonState.props, { tabindex }));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
export { hasTime as _, Calendar_grid_row as a, toDate as b, Calendar_cell as c, Calendar_day as d, CalendarRootState as f, getDefaultDate as g, getDaysInMonth as h, Calendar_header as i, Calendar_grid_body as l, createFormatter as m, Calendar_next_button as n, Calendar_head_cell as o, pickerOpenFocus as p, Calendar_heading as r, Calendar_grid_head as s, Calendar_prev_button as t, Calendar_grid as u, isBefore as v, getAnnouncer as x, isZonedDateTime as y };
