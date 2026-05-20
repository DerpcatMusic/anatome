import { i as tick } from "./index-server.js";
import { a as bind_props, c as ensure_array_like, et as attr, f as spread_props, gt as to_array, ht as run, i as attributes, m as stringify, n as attr_class, nt as escape_html, o as derived, r as attr_style, tt as clsx, u as props_id, xt as setContext, yt as getContext } from "./dev.js";
import "./events.js";
import { t as liveRoomHref } from "./context.js";
import { f as useConvexClient, i as setCachedRole, l as SvelteMap, s as api, t as authQuery } from "./session.svelte.js";
import { C as ARROW_RIGHT, F as boolToStr, I as boolToStrTrueOrUndef, J as Context, K as watch, P as boolToEmptyStrOrUndef, Q as mergeProps, R as createBitsAttrs, S as ARROW_LEFT, Y as attachRef, a as isValidIndex, at as simpleBox, c as createId, d as isBrowser, h as isHTMLElement, it as boxWith, k as HOME, l as noop$2, p as isElementOrSVGElement, v as isNull, w as ARROW_UP, x as ARROW_DOWN } from "./arrays.js";
import { p as Portal } from "./scroll-lock.js";
import { i as Floating_layer } from "./popper-layer-force-mount.js";
import { i as DOMContext, n as resolveLocaleProp, t as useId } from "./use-id.js";
import { n as Dialog, r as Dialog_overlay, t as Dialog_content } from "./dialog-content.js";
import { t as Button_1 } from "./Button.js";
import { _ as hasTime, a as Calendar_grid_row, b as toDate, c as Calendar_cell, d as Calendar_day, f as CalendarRootState, g as getDefaultDate, h as getDaysInMonth, i as Calendar_header, l as Calendar_grid_body, m as createFormatter, n as Calendar_next_button, o as Calendar_head_cell, p as pickerOpenFocus, r as Calendar_heading, s as Calendar_grid_head, t as Calendar_prev_button, u as Calendar_grid, v as isBefore, x as getAnnouncer, y as isZonedDateTime } from "./calendar-prev-button.js";
import { t as RadioGroup_1 } from "./RadioGroup.js";
import { n as Popover_content, r as PopoverRootState, t as Popover_trigger } from "./popover-trigger.js";
import { t as SvelteResizeObserver } from "./svelte-resize-observer.svelte.js";
import { r as durationLabel } from "./labels.js";
import { t as PageShell } from "./PageShell.js";
import { t as EquipmentPicker } from "./EquipmentPicker.js";
import { CalendarDate, parseTime, toCalendarDateTime } from "@internationalized/date";
//#region node_modules/bits-ui/dist/internal/date-time/field/parts.js
var DATE_SEGMENT_PARTS = [
	"day",
	"month",
	"year"
];
var EDITABLE_TIME_SEGMENT_PARTS = [
	"hour",
	"minute",
	"second",
	"dayPeriod"
];
var NON_EDITABLE_SEGMENT_PARTS = ["literal", "timeZoneName"];
var EDITABLE_SEGMENT_PARTS = [...DATE_SEGMENT_PARTS, ...EDITABLE_TIME_SEGMENT_PARTS];
var ALL_SEGMENT_PARTS = [...EDITABLE_SEGMENT_PARTS, ...NON_EDITABLE_SEGMENT_PARTS];
var ALL_TIME_SEGMENT_PARTS = [...EDITABLE_TIME_SEGMENT_PARTS, ...NON_EDITABLE_SEGMENT_PARTS];
ALL_SEGMENT_PARTS.filter((part) => part !== "literal");
ALL_TIME_SEGMENT_PARTS.filter((part) => part !== "literal");
//#endregion
//#region node_modules/bits-ui/dist/internal/date-time/placeholders.js
var supportedLocales = [
	"ach",
	"af",
	"am",
	"an",
	"ar",
	"ast",
	"az",
	"be",
	"bg",
	"bn",
	"br",
	"bs",
	"ca",
	"cak",
	"ckb",
	"cs",
	"cy",
	"da",
	"de",
	"dsb",
	"el",
	"en",
	"eo",
	"es",
	"et",
	"eu",
	"fa",
	"ff",
	"fi",
	"fr",
	"fy",
	"ga",
	"gd",
	"gl",
	"he",
	"hr",
	"hsb",
	"hu",
	"ia",
	"id",
	"it",
	"ja",
	"ka",
	"kk",
	"kn",
	"ko",
	"lb",
	"lo",
	"lt",
	"lv",
	"meh",
	"ml",
	"ms",
	"nl",
	"nn",
	"no",
	"oc",
	"pl",
	"pt",
	"rm",
	"ro",
	"ru",
	"sc",
	"scn",
	"sk",
	"sl",
	"sr",
	"sv",
	"szl",
	"tg",
	"th",
	"tr",
	"uk",
	"zh-CN",
	"zh-TW"
];
var placeholderFields = [
	"year",
	"month",
	"day"
];
var placeholders = {
	ach: {
		year: "mwaka",
		month: "dwe",
		day: "nino"
	},
	af: {
		year: "jjjj",
		month: "mm",
		day: "dd"
	},
	am: {
		year: "ዓዓዓዓ",
		month: "ሚሜ",
		day: "ቀቀ"
	},
	an: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	ar: {
		year: "سنة",
		month: "شهر",
		day: "يوم"
	},
	ast: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	az: {
		year: "iiii",
		month: "aa",
		day: "gg"
	},
	be: {
		year: "гггг",
		month: "мм",
		day: "дд"
	},
	bg: {
		year: "гггг",
		month: "мм",
		day: "дд"
	},
	bn: {
		year: "yyyy",
		month: "মিমি",
		day: "dd"
	},
	br: {
		year: "bbbb",
		month: "mm",
		day: "dd"
	},
	bs: {
		year: "gggg",
		month: "mm",
		day: "dd"
	},
	ca: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	cak: {
		year: "jjjj",
		month: "ii",
		day: "q'q'"
	},
	ckb: {
		year: "ساڵ",
		month: "مانگ",
		day: "ڕۆژ"
	},
	cs: {
		year: "rrrr",
		month: "mm",
		day: "dd"
	},
	cy: {
		year: "bbbb",
		month: "mm",
		day: "dd"
	},
	da: {
		year: "åååå",
		month: "mm",
		day: "dd"
	},
	de: {
		year: "jjjj",
		month: "mm",
		day: "tt"
	},
	dsb: {
		year: "llll",
		month: "mm",
		day: "źź"
	},
	el: {
		year: "εεεε",
		month: "μμ",
		day: "ηη"
	},
	en: {
		year: "yyyy",
		month: "mm",
		day: "dd"
	},
	eo: {
		year: "jjjj",
		month: "mm",
		day: "tt"
	},
	es: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	et: {
		year: "aaaa",
		month: "kk",
		day: "pp"
	},
	eu: {
		year: "uuuu",
		month: "hh",
		day: "ee"
	},
	fa: {
		year: "سال",
		month: "ماه",
		day: "روز"
	},
	ff: {
		year: "hhhh",
		month: "ll",
		day: "ññ"
	},
	fi: {
		year: "vvvv",
		month: "kk",
		day: "pp"
	},
	fr: {
		year: "aaaa",
		month: "mm",
		day: "jj"
	},
	fy: {
		year: "jjjj",
		month: "mm",
		day: "dd"
	},
	ga: {
		year: "bbbb",
		month: "mm",
		day: "ll"
	},
	gd: {
		year: "bbbb",
		month: "mm",
		day: "ll"
	},
	gl: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	he: {
		year: "שנה",
		month: "חודש",
		day: "יום"
	},
	hr: {
		year: "gggg",
		month: "mm",
		day: "dd"
	},
	hsb: {
		year: "llll",
		month: "mm",
		day: "dd"
	},
	hu: {
		year: "éééé",
		month: "hh",
		day: "nn"
	},
	ia: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	id: {
		year: "tttt",
		month: "bb",
		day: "hh"
	},
	it: {
		year: "aaaa",
		month: "mm",
		day: "gg"
	},
	ja: {
		year: " 年 ",
		month: "月",
		day: "日"
	},
	ka: {
		year: "წწწწ",
		month: "თთ",
		day: "რრ"
	},
	kk: {
		year: "жжжж",
		month: "аа",
		day: "кк"
	},
	kn: {
		year: "ವವವವ",
		month: "ಮಿಮೀ",
		day: "ದಿದಿ"
	},
	ko: {
		year: "연도",
		month: "월",
		day: "일"
	},
	lb: {
		year: "jjjj",
		month: "mm",
		day: "dd"
	},
	lo: {
		year: "ປປປປ",
		month: "ດດ",
		day: "ວວ"
	},
	lt: {
		year: "mmmm",
		month: "mm",
		day: "dd"
	},
	lv: {
		year: "gggg",
		month: "mm",
		day: "dd"
	},
	meh: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	ml: {
		year: "വർഷം",
		month: "മാസം",
		day: "തീയതി"
	},
	ms: {
		year: "tttt",
		month: "mm",
		day: "hh"
	},
	nl: {
		year: "jjjj",
		month: "mm",
		day: "dd"
	},
	nn: {
		year: "åååå",
		month: "mm",
		day: "dd"
	},
	no: {
		year: "åååå",
		month: "mm",
		day: "dd"
	},
	oc: {
		year: "aaaa",
		month: "mm",
		day: "jj"
	},
	pl: {
		year: "rrrr",
		month: "mm",
		day: "dd"
	},
	pt: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	rm: {
		year: "oooo",
		month: "mm",
		day: "dd"
	},
	ro: {
		year: "aaaa",
		month: "ll",
		day: "zz"
	},
	ru: {
		year: "гггг",
		month: "мм",
		day: "дд"
	},
	sc: {
		year: "aaaa",
		month: "mm",
		day: "dd"
	},
	scn: {
		year: "aaaa",
		month: "mm",
		day: "jj"
	},
	sk: {
		year: "rrrr",
		month: "mm",
		day: "dd"
	},
	sl: {
		year: "llll",
		month: "mm",
		day: "dd"
	},
	sr: {
		year: "гггг",
		month: "мм",
		day: "дд"
	},
	sv: {
		year: "åååå",
		month: "mm",
		day: "dd"
	},
	szl: {
		year: "rrrr",
		month: "mm",
		day: "dd"
	},
	tg: {
		year: "сссс",
		month: "мм",
		day: "рр"
	},
	th: {
		year: "ปปปป",
		month: "ดด",
		day: "วว"
	},
	tr: {
		year: "yyyy",
		month: "aa",
		day: "gg"
	},
	uk: {
		year: "рррр",
		month: "мм",
		day: "дд"
	},
	"zh-CN": {
		year: "年",
		month: "月",
		day: "日"
	},
	"zh-TW": {
		year: "年",
		month: "月",
		day: "日"
	}
};
function getPlaceholderObj(locale) {
	if (!isSupportedLocale(locale)) {
		const localeLanguage = getLocaleLanguage(locale);
		if (!isSupportedLocale(localeLanguage)) return placeholders.en;
		else return placeholders[localeLanguage];
	} else return placeholders[locale];
}
function getPlaceholder(field, value, locale) {
	if (isPlaceholderField(field)) return getPlaceholderObj(locale)[field];
	if (isDefaultField(field)) return value;
	if (isTimeField(field)) return "––";
	return "";
}
function isSupportedLocale(locale) {
	return supportedLocales.includes(locale);
}
function isPlaceholderField(field) {
	return placeholderFields.includes(field);
}
function isTimeField(field) {
	return field === "hour" || field === "minute" || field === "second";
}
function isDefaultField(field) {
	return field === "era" || field === "dayPeriod";
}
function getLocaleLanguage(locale) {
	if (Intl.Locale) return new Intl.Locale(locale).language;
	return locale.split("-")[0];
}
//#endregion
//#region node_modules/bits-ui/dist/internal/date-time/field/helpers.js
function initializeSegmentValues(granularity) {
	const calendarDateTimeGranularities = [
		"hour",
		"minute",
		"second"
	];
	const initialParts = EDITABLE_SEGMENT_PARTS.map((part) => {
		if (part === "dayPeriod") return [part, "AM"];
		return [part, null];
	}).filter(([key]) => {
		if (key === "literal" || key === null) return false;
		if (granularity === "day") return !calendarDateTimeGranularities.includes(key);
		else return true;
	});
	return Object.fromEntries(initialParts);
}
function createContentObj(props) {
	const { segmentValues, formatter, locale, dateRef } = props;
	const content = Object.keys(segmentValues).reduce((obj, part) => {
		if (!isSegmentPart(part)) return obj;
		if ("hour" in segmentValues && part === "dayPeriod") {
			const value = segmentValues[part];
			if (!isNull(value)) obj[part] = value;
			else obj[part] = getPlaceholder(part, "AM", locale);
		} else obj[part] = getPartContent(part);
		return obj;
	}, {});
	function getPartContent(part) {
		if ("hour" in segmentValues) {
			const value = segmentValues[part];
			const leadingZero = typeof value === "string" && value?.startsWith("0");
			const intValue = value !== null ? Number.parseInt(value) : null;
			if (value === "0" && part !== "year") return "0";
			else if (!isNull(value) && !isNull(intValue)) {
				const formatted = formatter.part(dateRef.set({ [part]: value }), part, { hourCycle: props.hourCycle === 24 ? "h23" : void 0 });
				/**
				* If we're operating in a 12 hour clock and the part is an hour, we handle
				* the conversion to 12 hour format with 2 digit hours and leading zeros here.
				*/
				const is12HourMode = props.hourCycle === 12 || props.hourCycle === void 0 && getDefaultHourCycle(locale) === 12;
				if (part === "hour" && is12HourMode) {
					/**
					* If the value is over 12, we convert to 12 hour format and add leading
					* zeroes if the value is less than 10.
					*/
					if (intValue > 12) {
						const hour = intValue - 12;
						if (hour === 0) return "12";
						else if (hour < 10) return `0${hour}`;
						else return `${hour}`;
					}
					/**
					* If the value is 0, we convert to 12, since 0 is not a valid 12 hour time.
					*/
					if (intValue === 0) return "12";
					/**
					* If the value is less than 10, we add a leading zero to the value.
					*/
					if (intValue < 10) return `0${intValue}`;
					/**
					* Otherwise, we don't need to do anything to the value.
					*/
					return `${intValue}`;
				}
				if (part === "year") return `${value}`;
				if (leadingZero && formatted.length === 1) return `0${formatted}`;
				return formatted;
			} else return getPlaceholder(part, "", locale);
		} else {
			if (isDateSegmentPart(part)) {
				const value = segmentValues[part];
				const leadingZero = typeof value === "string" && value?.startsWith("0");
				if (value === "0") return "0";
				else if (!isNull(value)) {
					const formatted = formatter.part(dateRef.set({ [part]: value }), part);
					if (part === "year") return `${value}`;
					if (leadingZero && formatted.length === 1) return `0${formatted}`;
					return formatted;
				} else return getPlaceholder(part, "", locale);
			}
			return "";
		}
	}
	return content;
}
function createContentArr(props) {
	const { granularity, dateRef, formatter, contentObj, hideTimeZone, hourCycle } = props;
	return formatter.toParts(dateRef, getOptsByGranularity(granularity, hourCycle)).map((part) => {
		if ([
			"literal",
			"dayPeriod",
			"timeZoneName",
			null
		].includes(part.type) || !isSegmentPart(part.type)) return {
			part: part.type,
			value: part.value
		};
		return {
			part: part.type,
			value: contentObj[part.type]
		};
	}).filter((segment) => {
		if (isNull(segment.part) || isNull(segment.value)) return false;
		if (segment.part === "timeZoneName" && (!isZonedDateTime(dateRef) || hideTimeZone)) return false;
		return true;
	});
}
function createContent(props) {
	const contentObj = createContentObj(props);
	return {
		obj: contentObj,
		arr: createContentArr({
			contentObj,
			...props
		})
	};
}
function getOptsByGranularity(granularity, hourCycle) {
	const opts = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZoneName: "short",
		hourCycle: hourCycle === 24 ? "h23" : void 0,
		hour12: hourCycle === 24 ? false : void 0
	};
	if (granularity === "day") {
		delete opts.second;
		delete opts.hour;
		delete opts.minute;
		delete opts.timeZoneName;
	}
	if (granularity === "hour") delete opts.minute;
	if (granularity === "minute") delete opts.second;
	return opts;
}
function initSegmentStates() {
	return EDITABLE_SEGMENT_PARTS.reduce((acc, key) => {
		acc[key] = {
			lastKeyZero: false,
			hasLeftFocus: true,
			updating: null
		};
		return acc;
	}, {});
}
function isDateSegmentPart(part) {
	return DATE_SEGMENT_PARTS.includes(part);
}
function isSegmentPart(part) {
	return EDITABLE_SEGMENT_PARTS.includes(part);
}
function isAnySegmentPart(part) {
	return ALL_SEGMENT_PARTS.includes(part);
}
/**
* Get the segments being used/ are rendered in the DOM.
* We're using this to determine when to set the value of
* the date picker, which is when all the segments have
* been filled.
*/
function getUsedSegments(fieldNode) {
	if (!isBrowser || !fieldNode) return [];
	return getSegments(fieldNode).map((el) => el.dataset.segment).filter((part) => {
		return EDITABLE_SEGMENT_PARTS.includes(part);
	});
}
function getValueFromSegments(props) {
	const { segmentObj, fieldNode, dateRef } = props;
	const usedSegments = getUsedSegments(fieldNode);
	let date = dateRef;
	for (const part of usedSegments) if ("hour" in segmentObj) {
		const value = segmentObj[part];
		if (isNull(value)) continue;
		date = date.set({ [part]: segmentObj[part] });
	} else if (isDateSegmentPart(part)) {
		const value = segmentObj[part];
		if (isNull(value)) continue;
		date = date.set({ [part]: segmentObj[part] });
	}
	return date;
}
/**
* Check if all the segments being used have been filled.
* We use this to determine when we should set the value
* store of the date field(s).
*
* @param segmentValues - The current `SegmentValueObj`
* @param fieldNode  - The id of the date field
*/
function areAllSegmentsFilled(segmentValues, fieldNode) {
	const usedSegments = getUsedSegments(fieldNode);
	for (const part of usedSegments) if ("hour" in segmentValues) {
		if (segmentValues[part] === null) return false;
	} else if (isDateSegmentPart(part)) {
		if (segmentValues[part] === null) return false;
	}
	return true;
}
/**
* Determines if the provided object is a valid `DateAndTimeSegmentObj`
* by checking if it has the correct keys and values for each key.
*/
function isDateAndTimeSegmentObj(obj) {
	if (typeof obj !== "object" || obj === null) return false;
	return Object.entries(obj).every(([key, value]) => {
		return (EDITABLE_TIME_SEGMENT_PARTS.includes(key) || DATE_SEGMENT_PARTS.includes(key)) && (key === "dayPeriod" ? value === "AM" || value === "PM" || value === null : typeof value === "string" || typeof value === "number" || value === null);
	});
}
/**
* Infer the granularity to use based on the
* value and granularity props.
*/
function inferGranularity(value, granularity) {
	if (granularity) return granularity;
	if (hasTime(value)) return "minute";
	return "day";
}
/**
* Determines if the element with the provided id is the first focusable
* segment in the date field with the provided fieldId.
*
* @param id - The id of the element to check if it's the first segment
* @param fieldNode - The id of the date field associated with the segment
*/
function isFirstSegment(id, fieldNode) {
	if (!isBrowser) return false;
	const segments = getSegments(fieldNode);
	return segments.length ? segments[0].id === id : false;
}
function getDefaultHourCycle(locale) {
	return new Intl.DateTimeFormat(locale, { hour: "numeric" }).formatToParts(/* @__PURE__ */ new Date("2023-01-01T13:00:00")).find((part) => part.type === "hour")?.value === "1" ? 12 : 24;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/date-time/field/segments.js
/**
* Handles segment navigation based on the provided keyboard event and field ID.
*
* @param e - The keyboard event
* @param fieldNode - The ID of the field we're navigating within
*/
function handleSegmentNavigation(e, fieldNode) {
	const currentTarget = e.currentTarget;
	if (!isHTMLElement(currentTarget)) return;
	const { prev, next } = getPrevNextSegments(currentTarget, fieldNode);
	if (e.key === "ArrowLeft") {
		if (!prev) return;
		prev.focus();
	} else if (e.key === "ArrowRight") {
		if (!next) return;
		next.focus();
	}
}
/**
* Retrieves the next segment in the list of segments relative to the provided node.
*
* @param node - The node we're starting from
* @param segments - The list of candidate segments to navigate through
*/
function getNextSegment(node, segments) {
	const index = segments.indexOf(node);
	if (index === segments.length - 1 || index === -1) return null;
	return segments[index + 1];
}
/**
* Retrieves the previous segment in the list of segments relative to the provided node.
*
* @param node - The node we're starting from
* @param segments - The list of candidate segments to navigate through
*/
function getPrevSegment(node, segments) {
	const index = segments.indexOf(node);
	if (index === 0 || index === -1) return null;
	return segments[index - 1];
}
/**
* Retrieves an object containing the next and previous segments relative to the current node.
*
* @param startingNode - The node we're starting from
* @param fieldNode - The ID of the field we're navigating within
*/
function getPrevNextSegments(startingNode, fieldNode) {
	const segments = getSegments(fieldNode);
	if (!segments.length) return {
		next: null,
		prev: null
	};
	return {
		next: getNextSegment(startingNode, segments),
		prev: getPrevSegment(startingNode, segments)
	};
}
function isSegmentNavigationKey(key) {
	if (key === "ArrowRight" || key === "ArrowLeft") return true;
	return false;
}
/**
* Retrieves all the interactive segments within the field identified by the provided ID.
*/
function getSegments(fieldNode) {
	if (!fieldNode) return [];
	return Array.from(fieldNode.querySelectorAll("[data-segment]")).filter((el) => {
		if (!isHTMLElement(el)) return false;
		const segment = el.dataset.segment;
		if (segment === "trigger") return true;
		if (!isAnySegmentPart(segment) || segment === "literal") return false;
		return true;
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/date-field/date-field.svelte.js
var dateFieldAttrs = createBitsAttrs({
	component: "date-field",
	parts: [
		"input",
		"label",
		"segment"
	]
});
var DateFieldRootContext = new Context("DateField.Root");
var DateFieldRootState = class DateFieldRootState {
	static create(opts, rangeRoot) {
		return DateFieldRootContext.set(new DateFieldRootState(opts, rangeRoot));
	}
	value;
	placeholder;
	validate;
	minValue;
	maxValue;
	disabled;
	readonly;
	granularity;
	readonlySegments;
	hourCycle;
	locale;
	hideTimeZone;
	required;
	onInvalid;
	errorMessageId;
	isInvalidProp;
	descriptionId = useId();
	formatter;
	initialSegments;
	segmentValues;
	announcer;
	#readonlySegmentsSet = derived(() => new Set(this.readonlySegments.current));
	get readonlySegmentsSet() {
		return this.#readonlySegmentsSet();
	}
	set readonlySegmentsSet($$value) {
		return this.#readonlySegmentsSet($$value);
	}
	segmentStates = initSegmentStates();
	#fieldNode = null;
	#labelNode = null;
	descriptionNode = null;
	validationNode = null;
	states = initSegmentStates();
	dayPeriodNode = null;
	rangeRoot = void 0;
	name = "";
	domContext = new DOMContext(() => null);
	constructor(props, rangeRoot) {
		this.rangeRoot = rangeRoot;
		/**
		* Since the `DateFieldRootState` can be used in two contexts, as a standalone
		* field or as a field within a `DateRangeField` component, we handle assigning
		* the props based on that context.
		*/
		this.value = props.value;
		this.placeholder = rangeRoot ? rangeRoot.opts.placeholder : props.placeholder;
		this.validate = rangeRoot ? simpleBox(void 0) : props.validate;
		this.minValue = rangeRoot ? rangeRoot.opts.minValue : props.minValue;
		this.maxValue = rangeRoot ? rangeRoot.opts.maxValue : props.maxValue;
		this.disabled = rangeRoot ? rangeRoot.opts.disabled : props.disabled;
		this.readonly = rangeRoot ? rangeRoot.opts.readonly : props.readonly;
		this.granularity = rangeRoot ? rangeRoot.opts.granularity : props.granularity;
		this.readonlySegments = rangeRoot ? rangeRoot.opts.readonlySegments : props.readonlySegments;
		this.hourCycle = rangeRoot ? rangeRoot.opts.hourCycle : props.hourCycle;
		this.locale = rangeRoot ? rangeRoot.opts.locale : props.locale;
		this.hideTimeZone = rangeRoot ? rangeRoot.opts.hideTimeZone : props.hideTimeZone;
		this.required = rangeRoot ? rangeRoot.opts.required : props.required;
		this.onInvalid = rangeRoot ? rangeRoot.opts.onInvalid : props.onInvalid;
		this.errorMessageId = rangeRoot ? rangeRoot.opts.errorMessageId : props.errorMessageId;
		this.isInvalidProp = props.isInvalidProp;
		this.formatter = createFormatter({
			initialLocale: this.locale.current,
			monthFormat: boxWith(() => "long"),
			yearFormat: boxWith(() => "numeric")
		});
		this.initialSegments = initializeSegmentValues(this.inferredGranularity);
		this.segmentValues = this.initialSegments;
		this.announcer = getAnnouncer(null);
		this.getFieldNode = this.getFieldNode.bind(this);
		this.updateSegment = this.updateSegment.bind(this);
		this.handleSegmentClick = this.handleSegmentClick.bind(this);
		this.getBaseSegmentAttrs = this.getBaseSegmentAttrs.bind(this);
		if (this.value.current) this.syncSegmentValues(this.value.current);
		watch(() => this.validationStatus, () => {
			if (this.validationStatus !== false) this.onInvalid.current?.(this.validationStatus.reason, this.validationStatus.message);
		});
	}
	setName(name) {
		this.name = name;
	}
	/**
	* Sets the field node for the `DateFieldRootState` instance. We use this method so we can
	* keep `#fieldNode` private to prevent accidental usage of the incorrect field node.
	*/
	setFieldNode(node) {
		this.#fieldNode = node;
	}
	/**
	* Gets the correct field node for the date field regardless of whether it's being
	* used in a standalone context or within a `DateRangeField` component.
	*/
	getFieldNode() {
		/** If we're not within a DateRangeField, we return this field. */
		if (!this.rangeRoot) return this.#fieldNode;
		else
 /**
		* Otherwise, we return the rangeRoot's field node which
		* contains both start and end fields.
		*/
		return this.rangeRoot.fieldNode;
	}
	/**
	* Sets the label node for the `DateFieldRootState` instance. We use this method so we can
	* keep `#labelNode` private to prevent accidental usage of the incorrect label node.
	*/
	setLabelNode(node) {
		this.#labelNode = node;
	}
	/**
	* Gets the correct label node for the date field regardless of whether it's being used in
	* a standalone context or within a `DateRangeField` component.
	*/
	getLabelNode() {
		/** If we're not within a DateRangeField, we return this field. */
		if (!this.rangeRoot) return this.#labelNode;
		/** Otherwise we return the rangeRoot's label node. */
		return this.rangeRoot.labelNode;
	}
	#clearUpdating() {
		this.states.day.updating = null;
		this.states.month.updating = null;
		this.states.year.updating = null;
		this.states.hour.updating = null;
		this.states.minute.updating = null;
		this.states.dayPeriod.updating = null;
	}
	setValue(value) {
		this.value.current = value;
	}
	syncSegmentValues(value) {
		const dateValues = DATE_SEGMENT_PARTS.map((part) => {
			const partValue = value[part];
			if (part === "month") {
				if (this.states.month.updating) return [part, this.states.month.updating];
				if (partValue < 10) return [part, `0${partValue}`];
			}
			if (part === "day") {
				if (this.states.day.updating) return [part, this.states.day.updating];
				if (partValue < 10) return [part, `0${partValue}`];
			}
			if (part === "year") {
				if (this.states.year.updating) return [part, this.states.year.updating];
				const diff = 4 - `${partValue}`.length;
				if (diff > 0) return [part, `${"0".repeat(diff)}${partValue}`];
			}
			return [part, `${partValue}`];
		});
		if ("hour" in value) {
			const timeValues = EDITABLE_TIME_SEGMENT_PARTS.map((part) => {
				if (part === "dayPeriod") if (this.states.dayPeriod.updating) return [part, this.states.dayPeriod.updating];
				else return [part, this.formatter.dayPeriod(toDate(value))];
				else if (part === "hour") {
					if (this.states.hour.updating) return [part, this.states.hour.updating];
					if (value[part] !== void 0 && value[part] < 10) return [part, `0${value[part]}`];
					if (value[part] === 0) {
						/**
						* If we're rendering a `dayPeriod` segment, we're operating in a
						* 12-hour clock, so we never allow the displayed hour to be 0.
						*/
						if (this.dayPeriodNode) return [part, "12"];
					}
				} else if (part === "minute") {
					if (this.states.minute.updating) return [part, this.states.minute.updating];
					if (value[part] !== void 0 && value[part] < 10) return [part, `0${value[part]}`];
				} else if (part === "second") {
					if (this.states.second.updating) return [part, this.states.second.updating];
					if (value[part] !== void 0 && value[part] < 10) return [part, `0${value[part]}`];
				}
				return [part, `${value[part]}`];
			});
			const mergedSegmentValues = [...dateValues, ...timeValues];
			this.segmentValues = Object.fromEntries(mergedSegmentValues);
			this.#clearUpdating();
			return;
		}
		this.segmentValues = Object.fromEntries(dateValues);
	}
	#validationStatus = derived(() => {
		const value = this.value.current;
		if (!value) return false;
		const msg = this.validate.current?.(value);
		if (msg) return {
			reason: "custom",
			message: msg
		};
		const minValue = this.minValue.current;
		if (minValue && isBefore(value, minValue)) return { reason: "min" };
		const maxValue = this.maxValue.current;
		if (maxValue && isBefore(maxValue, value)) return { reason: "max" };
		return false;
	});
	get validationStatus() {
		return this.#validationStatus();
	}
	set validationStatus($$value) {
		return this.#validationStatus($$value);
	}
	#isInvalid = derived(() => {
		if (this.validationStatus === false) return false;
		if (this.isInvalidProp.current) return true;
		return true;
	});
	get isInvalid() {
		return this.#isInvalid();
	}
	set isInvalid($$value) {
		return this.#isInvalid($$value);
	}
	#inferredGranularity = derived(() => {
		const granularity = this.granularity.current;
		if (granularity) return granularity;
		return inferGranularity(this.placeholder.current, this.granularity.current);
	});
	get inferredGranularity() {
		return this.#inferredGranularity();
	}
	set inferredGranularity($$value) {
		return this.#inferredGranularity($$value);
	}
	#dateRef = derived(() => this.value.current !== void 0 ? this.value.current : this.placeholder.current);
	get dateRef() {
		return this.#dateRef();
	}
	set dateRef($$value) {
		return this.#dateRef($$value);
	}
	#allSegmentContent = derived(() => {
		return createContent({
			segmentValues: this.segmentValues,
			formatter: this.formatter,
			locale: this.locale.current,
			granularity: this.inferredGranularity,
			dateRef: this.dateRef,
			hideTimeZone: this.hideTimeZone.current,
			hourCycle: this.hourCycle.current
		});
	});
	get allSegmentContent() {
		return this.#allSegmentContent();
	}
	set allSegmentContent($$value) {
		return this.#allSegmentContent($$value);
	}
	#segmentContents = derived(() => this.allSegmentContent.arr);
	get segmentContents() {
		return this.#segmentContents();
	}
	set segmentContents($$value) {
		return this.#segmentContents($$value);
	}
	sharedSegmentAttrs = {
		role: "spinbutton",
		contenteditable: "true",
		tabindex: 0,
		spellcheck: false,
		inputmode: "numeric",
		autocorrect: "off",
		enterkeyhint: "next",
		style: { caretColor: "transparent" },
		onbeforeinput: (e) => {
			if (!e.data || e.data.length <= 1) e.preventDefault();
		}
	};
	#getLabelledBy(segmentId) {
		return `${segmentId} ${this.getLabelNode()?.id ?? ""}`;
	}
	updateSegment(part, cb) {
		const disabled = this.disabled.current;
		const readonly = this.readonly.current;
		const readonlySegmentsSet = this.readonlySegmentsSet;
		if (disabled || readonly || readonlySegmentsSet.has(part)) return;
		const prev = this.segmentValues;
		let newSegmentValues = prev;
		const dateRef = this.placeholder.current;
		if (isDateAndTimeSegmentObj(prev)) {
			const pVal = prev[part];
			const castCb = cb;
			if (part === "month") {
				const next = castCb(pVal);
				this.states.month.updating = next;
				if (next !== null && prev.day !== null) {
					const daysInMonth = getDaysInMonth(toDate(dateRef.set({ month: Number.parseInt(next) })));
					if (Number.parseInt(prev.day) > daysInMonth) prev.day = `${daysInMonth}`;
				}
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "dayPeriod") {
				const next = castCb(pVal);
				this.states.dayPeriod.updating = next;
				const date = this.value.current;
				if (date && "hour" in date) {
					const trueHour = date.hour;
					if (next === "AM") {
						if (trueHour >= 12) prev.hour = `${trueHour - 12}`;
					} else if (next === "PM") {
						if (trueHour < 12) prev.hour = `${trueHour + 12}`;
					}
				}
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "hour") {
				const next = castCb(pVal);
				this.states.hour.updating = next;
				if (next !== null && prev.dayPeriod !== null) {
					const dayPeriod = this.formatter.dayPeriod(toDate(dateRef.set({ hour: Number.parseInt(next) })), this.hourCycle.current);
					if (dayPeriod === "AM" || dayPeriod === "PM") prev.dayPeriod = dayPeriod;
				}
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "minute") {
				const next = castCb(pVal);
				this.states.minute.updating = next;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "second") {
				const next = castCb(pVal);
				this.states.second.updating = next;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "year") {
				const next = castCb(pVal);
				this.states.year.updating = next;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "day") {
				const next = castCb(pVal);
				this.states.day.updating = next;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else {
				const next = castCb(pVal);
				newSegmentValues = {
					...prev,
					[part]: next
				};
			}
		} else if (isDateSegmentPart(part)) {
			const pVal = prev[part];
			const castCb = cb;
			const next = castCb(pVal);
			if (part === "month" && next !== null && prev.day !== null) {
				this.states.month.updating = next;
				const daysInMonth = getDaysInMonth(toDate(dateRef.set({ month: Number.parseInt(next) })));
				if (Number.parseInt(prev.day) > daysInMonth) prev.day = `${daysInMonth}`;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "year") {
				const next = castCb(pVal);
				this.states.year.updating = next;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else if (part === "day") {
				const next = castCb(pVal);
				this.states.day.updating = next;
				newSegmentValues = {
					...prev,
					[part]: next
				};
			} else newSegmentValues = {
				...prev,
				[part]: next
			};
		}
		this.segmentValues = newSegmentValues;
		if (areAllSegmentsFilled(newSegmentValues, this.#fieldNode)) this.setValue(getValueFromSegments({
			segmentObj: newSegmentValues,
			fieldNode: this.#fieldNode,
			dateRef: this.placeholder.current
		}));
		else {
			this.setValue(void 0);
			this.segmentValues = newSegmentValues;
		}
	}
	handleSegmentClick(e) {
		if (this.disabled.current) e.preventDefault();
	}
	getBaseSegmentAttrs(part, segmentId) {
		const inReadonlySegments = this.readonlySegmentsSet.has(part);
		const defaultAttrs = {
			"aria-invalid": boolToStrTrueOrUndef(this.isInvalid),
			"aria-disabled": boolToStr(this.disabled.current),
			"aria-readonly": boolToStr(this.readonly.current || inReadonlySegments),
			"data-invalid": boolToEmptyStrOrUndef(this.isInvalid),
			"data-disabled": boolToEmptyStrOrUndef(this.disabled.current),
			"data-readonly": boolToEmptyStrOrUndef(this.readonly.current || inReadonlySegments),
			"data-segment": `${part}`,
			[dateFieldAttrs.segment]: ""
		};
		if (part === "literal") return defaultAttrs;
		const descriptionId = this.descriptionNode?.id;
		const hasDescription = isFirstSegment(segmentId, this.#fieldNode) && descriptionId;
		const errorMsgId = this.errorMessageId?.current;
		const describedBy = hasDescription ? `${descriptionId} ${this.isInvalid && errorMsgId ? errorMsgId : ""}` : void 0;
		const contenteditable = !(this.readonly.current || inReadonlySegments || this.disabled.current);
		return {
			...defaultAttrs,
			"aria-labelledby": this.#getLabelledBy(segmentId),
			contenteditable: contenteditable ? "true" : void 0,
			"aria-describedby": describedBy,
			tabindex: this.disabled.current ? void 0 : 0
		};
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/date-picker/date-picker.svelte.js
var DatePickerRootContext = new Context("DatePicker.Root");
var DatePickerRootState = class DatePickerRootState {
	static create(opts) {
		return DatePickerRootContext.set(new DatePickerRootState(opts));
	}
	opts;
	constructor(opts) {
		this.opts = opts;
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/date-picker/components/date-picker.svelte
function Date_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, onOpenChange = noop$2, onOpenChangeComplete = noop$2, value = void 0, onValueChange = noop$2, placeholder = void 0, onPlaceholderChange = noop$2, isDateUnavailable = () => false, validate = noop$2, onInvalid = noop$2, minValue, maxValue, disabled = false, readonly = false, granularity, readonlySegments = [], hourCycle, locale, hideTimeZone = false, required = false, calendarLabel = "Event", disableDaysOutsideMonth = true, preventDeselect = false, pagedNavigation = false, weekStartsOn, weekdayFormat = "narrow", isDateDisabled = () => false, fixedWeeks = false, numberOfMonths = 1, closeOnDateSelect = true, initialFocus = false, errorMessageId, children, monthFormat = "long", yearFormat = "numeric" } = $$props;
		const defaultPlaceholder = getDefaultDate({
			granularity,
			defaultValue: value,
			minValue,
			maxValue
		});
		function handleDefaultPlaceholder() {
			if (placeholder !== void 0) return;
			placeholder = defaultPlaceholder;
		}
		handleDefaultPlaceholder();
		/**
		* Covers an edge case where when a spread props object is reassigned,
		* the props are reset to their default values, which would make placeholder
		* undefined which causes errors to be thrown.
		*/
		watch.pre(() => placeholder, () => {
			handleDefaultPlaceholder();
		});
		function onDateSelect() {
			if (closeOnDateSelect) open = false;
		}
		const pickerRootState = DatePickerRootState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			placeholder: boxWith(() => placeholder, (v) => {
				placeholder = v;
				onPlaceholderChange(v);
			}),
			isDateUnavailable: boxWith(() => isDateUnavailable),
			minValue: boxWith(() => minValue),
			maxValue: boxWith(() => maxValue),
			disabled: boxWith(() => disabled),
			readonly: boxWith(() => readonly),
			granularity: boxWith(() => granularity),
			readonlySegments: boxWith(() => readonlySegments),
			hourCycle: boxWith(() => hourCycle),
			locale: resolveLocaleProp(() => locale),
			hideTimeZone: boxWith(() => hideTimeZone),
			required: boxWith(() => required),
			calendarLabel: boxWith(() => calendarLabel),
			disableDaysOutsideMonth: boxWith(() => disableDaysOutsideMonth),
			preventDeselect: boxWith(() => preventDeselect),
			pagedNavigation: boxWith(() => pagedNavigation),
			weekStartsOn: boxWith(() => weekStartsOn),
			weekdayFormat: boxWith(() => weekdayFormat),
			isDateDisabled: boxWith(() => isDateDisabled),
			fixedWeeks: boxWith(() => fixedWeeks),
			numberOfMonths: boxWith(() => numberOfMonths),
			initialFocus: boxWith(() => initialFocus),
			onDateSelect: boxWith(() => onDateSelect),
			defaultPlaceholder,
			monthFormat: boxWith(() => monthFormat),
			yearFormat: boxWith(() => yearFormat)
		});
		PopoverRootState.create({
			open: pickerRootState.opts.open,
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});
		DateFieldRootState.create({
			value: pickerRootState.opts.value,
			disabled: pickerRootState.opts.disabled,
			readonly: pickerRootState.opts.readonly,
			readonlySegments: pickerRootState.opts.readonlySegments,
			validate: boxWith(() => validate),
			onInvalid: boxWith(() => onInvalid),
			minValue: pickerRootState.opts.minValue,
			maxValue: pickerRootState.opts.maxValue,
			granularity: pickerRootState.opts.granularity,
			hideTimeZone: pickerRootState.opts.hideTimeZone,
			hourCycle: pickerRootState.opts.hourCycle,
			locale: pickerRootState.opts.locale,
			required: pickerRootState.opts.required,
			placeholder: pickerRootState.opts.placeholder,
			errorMessageId: boxWith(() => errorMessageId),
			isInvalidProp: boxWith(() => void 0)
		});
		if (Floating_layer) {
			$$renderer.push("<!--[-->");
			Floating_layer($$renderer, {
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		bind_props($$props, {
			open,
			value,
			placeholder
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/date-picker/components/date-picker-calendar.svelte
function Date_picker_calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, $$slots, $$events, ...restProps } = $$props;
		const datePickerRootState = DatePickerRootContext.get();
		const calendarState = CalendarRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			calendarLabel: datePickerRootState.opts.calendarLabel,
			fixedWeeks: datePickerRootState.opts.fixedWeeks,
			isDateDisabled: datePickerRootState.opts.isDateDisabled,
			isDateUnavailable: datePickerRootState.opts.isDateUnavailable,
			locale: datePickerRootState.opts.locale,
			numberOfMonths: datePickerRootState.opts.numberOfMonths,
			pagedNavigation: datePickerRootState.opts.pagedNavigation,
			preventDeselect: datePickerRootState.opts.preventDeselect,
			readonly: datePickerRootState.opts.readonly,
			type: boxWith(() => "single"),
			weekStartsOn: datePickerRootState.opts.weekStartsOn,
			weekdayFormat: datePickerRootState.opts.weekdayFormat,
			disabled: datePickerRootState.opts.disabled,
			disableDaysOutsideMonth: datePickerRootState.opts.disableDaysOutsideMonth,
			maxValue: datePickerRootState.opts.maxValue,
			minValue: datePickerRootState.opts.minValue,
			placeholder: datePickerRootState.opts.placeholder,
			value: datePickerRootState.opts.value,
			onDateSelect: datePickerRootState.opts.onDateSelect,
			initialFocus: datePickerRootState.opts.initialFocus,
			defaultPlaceholder: datePickerRootState.opts.defaultPlaceholder,
			maxDays: boxWith(() => void 0),
			monthFormat: datePickerRootState.opts.monthFormat,
			yearFormat: datePickerRootState.opts.yearFormat
		});
		const mergedProps = derived(() => mergeProps(restProps, calendarState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				props: mergedProps(),
				...calendarState.snippetProps
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, calendarState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/date-picker/components/date-picker-content.svelte
function Date_picker_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, onOpenAutoFocus, $$slots, $$events, ...restProps } = $$props;
		const mergedProps = derived(() => mergeProps({ onOpenAutoFocus }, { onOpenAutoFocus: pickerOpenFocus }));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			Popover_content($$renderer, spread_props([
				mergedProps(),
				restProps,
				{
					get ref() {
						return ref;
					},
					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				}
			]));
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/date-picker/components/date-picker-trigger.svelte
function Date_picker_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, onkeydown, $$slots, $$events, ...restProps } = $$props;
		function onKeydown(e) {
			if (isSegmentNavigationKey(e.key)) {
				const dateFieldInputNode = e.currentTarget.closest(dateFieldAttrs.selector("input"));
				if (!dateFieldInputNode) return;
				handleSegmentNavigation(e, dateFieldInputNode);
			}
		}
		const mergedProps = derived(() => mergeProps({ onkeydown }, { onkeydown: onKeydown }));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			Popover_trigger($$renderer, spread_props([
				restProps,
				{ "data-segment": "trigger" },
				mergedProps(),
				{
					get ref() {
						return ref;
					},
					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				}
			]));
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/slider/helpers.js
function getRangeStyles(direction, min, max) {
	const styles = { position: "absolute" };
	if (direction === "lr") {
		styles.left = `${min}%`;
		styles.right = `${max}%`;
	} else if (direction === "rl") {
		styles.right = `${min}%`;
		styles.left = `${max}%`;
	} else if (direction === "bt") {
		styles.bottom = `${min}%`;
		styles.top = `${max}%`;
	} else {
		styles.top = `${min}%`;
		styles.bottom = `${max}%`;
	}
	return styles;
}
function getThumbStyles(direction, thumbPos) {
	const styles = { position: "absolute" };
	if (direction === "lr") {
		styles.left = `${thumbPos}%`;
		styles.translate = "-50% 0";
	} else if (direction === "rl") {
		styles.right = `${thumbPos}%`;
		styles.translate = "50% 0";
	} else if (direction === "bt") {
		styles.bottom = `${thumbPos}%`;
		styles.translate = "0 50%";
	} else {
		styles.top = `${thumbPos}%`;
		styles.translate = "0 -50%";
	}
	return styles;
}
function getTickStyles(direction, tickPosition, offsetPercentage) {
	const style = { position: "absolute" };
	if (direction === "lr") {
		style.left = `${tickPosition}%`;
		style.translate = `${offsetPercentage}% 0`;
	} else if (direction === "rl") {
		style.right = `${tickPosition}%`;
		style.translate = `${-offsetPercentage}% 0`;
	} else if (direction === "bt") {
		style.bottom = `${tickPosition}%`;
		style.translate = `0 ${-offsetPercentage}%`;
	} else {
		style.top = `${tickPosition}%`;
		style.translate = `0 ${offsetPercentage}%`;
	}
	return style;
}
/**
* Gets the number of decimal places in a number
*/
function getDecimalPlaces(num) {
	if (Math.floor(num) === num) return 0;
	const str = num.toString();
	if (str.indexOf(".") !== -1 && str.indexOf("e-") === -1) return str.split(".")[1].length;
	else if (str.indexOf("e-") !== -1) {
		const parts = str.split("e-");
		return parseInt(parts[1], 10);
	}
	return 0;
}
/**
* Rounds a number to the specified number of decimal places
*/
function roundToPrecision(num, precision) {
	const factor = Math.pow(10, precision);
	return Math.round(num * factor) / factor;
}
/**
* Normalizes step to always be a sorted array of valid values within min/max range
*/
function normalizeSteps(step, min, max) {
	if (typeof step === "number") {
		const difference = max - min;
		let count = Math.ceil(difference / step);
		const precision = getDecimalPlaces(step);
		const factor = Math.pow(10, precision);
		if (Math.round(difference * factor) % Math.round(step * factor) === 0) count++;
		const steps = [];
		for (let i = 0; i < count; i++) {
			const roundedValue = roundToPrecision(min + i * step, precision);
			steps.push(roundedValue);
		}
		return steps;
	}
	return [...new Set(step)].filter((value) => value >= min && value <= max).sort((a, b) => a - b);
}
/**
* Snaps a value to the nearest step in a custom steps array
*/
function snapValueToCustomSteps(value, steps) {
	if (steps.length === 0) return value;
	let closest = steps[0];
	let minDistance = Math.abs(value - closest);
	for (const step of steps) {
		const distance = Math.abs(value - step);
		if (distance < minDistance) {
			minDistance = distance;
			closest = step;
		}
	}
	return closest;
}
/**
* Gets the next/previous step value for keyboard navigation
*/
function getAdjacentStepValue(currentValue, steps, direction) {
	const currentIndex = steps.indexOf(currentValue);
	if (currentIndex === -1) return snapValueToCustomSteps(currentValue, steps);
	if (direction === "next") return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : currentValue;
	else return currentIndex > 0 ? steps[currentIndex - 1] : currentValue;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/math.js
function linearScale(domain, range, clamp = true) {
	const [d0, d1] = domain;
	const [r0, r1] = range;
	const slope = (r1 - r0) / (d1 - d0);
	return (x) => {
		const result = r0 + slope * (x - d0);
		if (!clamp) return result;
		if (result > Math.max(r0, r1)) return Math.max(r0, r1);
		if (result < Math.min(r0, r1)) return Math.min(r0, r1);
		return result;
	};
}
//#endregion
//#region node_modules/bits-ui/dist/bits/slider/slider.svelte.js
var sliderAttrs = createBitsAttrs({
	component: "slider",
	parts: [
		"root",
		"thumb",
		"range",
		"tick",
		"tick-label",
		"thumb-label"
	]
});
var SliderRootContext = new Context("Slider.Root");
var SliderBaseRootState = class {
	opts;
	attachment;
	isActive = false;
	#layoutVersion = 0;
	#direction = derived(() => {
		if (this.opts.orientation.current === "horizontal") return this.opts.dir.current === "rtl" ? "rl" : "lr";
		else return this.opts.dir.current === "rtl" ? "tb" : "bt";
	});
	get direction() {
		return this.#direction();
	}
	set direction($$value) {
		return this.#direction($$value);
	}
	#normalizedSteps = derived(() => {
		return normalizeSteps(this.opts.step.current, this.opts.min.current, this.opts.max.current);
	});
	get normalizedSteps() {
		return this.#normalizedSteps();
	}
	set normalizedSteps($$value) {
		return this.#normalizedSteps($$value);
	}
	domContext;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(opts.ref);
		this.domContext = new DOMContext(this.opts.ref);
		new SvelteResizeObserver(() => this.opts.ref.current, this.#handleLayoutChange);
	}
	#handleLayoutChange = () => {
		this.#layoutVersion += 1;
	};
	isThumbActive(_index) {
		return this.isActive;
	}
	#touchAction = derived(() => {
		if (this.opts.disabled.current) return void 0;
		return this.opts.orientation.current === "horizontal" ? "pan-y" : "pan-x";
	});
	getAllThumbs = () => {
		const node = this.opts.ref.current;
		if (!node) return [];
		return Array.from(node.querySelectorAll(sliderAttrs.selector("thumb")));
	};
	getThumbScale = () => {
		this.#layoutVersion;
		const trackPadding = this.opts.trackPadding?.current;
		if (trackPadding !== void 0 && trackPadding > 0) return [trackPadding, 100 - trackPadding];
		if (this.opts.thumbPositioning.current === "exact") return [0, 100];
		const isVertical = this.opts.orientation.current === "vertical";
		const activeThumb = this.getAllThumbs()[0];
		const thumbSize = isVertical ? activeThumb?.offsetHeight : activeThumb?.offsetWidth;
		if (thumbSize === void 0 || Number.isNaN(thumbSize) || thumbSize === 0) return [0, 100];
		const trackSize = isVertical ? this.opts.ref.current?.offsetHeight : this.opts.ref.current?.offsetWidth;
		if (trackSize === void 0 || Number.isNaN(trackSize) || trackSize === 0) return [0, 100];
		const percentPadding = thumbSize / 2 / trackSize * 100;
		return [percentPadding, 100 - percentPadding];
	};
	getPositionFromValue = (thumbValue) => {
		const thumbScale = this.getThumbScale();
		return linearScale([this.opts.min.current, this.opts.max.current], thumbScale)(thumbValue);
	};
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-orientation": this.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		style: { touchAction: this.#touchAction() },
		[sliderAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SliderSingleRootState = class extends SliderBaseRootState {
	opts;
	isMulti = false;
	constructor(opts) {
		super(opts);
		this.opts = opts;
		watch([
			() => this.opts.step.current,
			() => this.opts.min.current,
			() => this.opts.max.current,
			() => this.opts.value.current
		], ([step, min, max, value]) => {
			const steps = normalizeSteps(step, min, max);
			const isValidValue = (v) => {
				return steps.includes(v);
			};
			const gcv = (v) => {
				return snapValueToCustomSteps(v, steps);
			};
			if (!isValidValue(value)) this.opts.value.current = gcv(value);
		});
	}
	isTickValueSelected = (tickValue) => {
		return this.opts.value.current === tickValue;
	};
	applyPosition({ clientXY, start, end }) {
		const min = this.opts.min.current;
		const max = this.opts.max.current;
		const val = (clientXY - start) / (end - start) * (max - min) + min;
		if (val < min) this.updateValue(min);
		else if (val > max) this.updateValue(max);
		else {
			const steps = this.normalizedSteps;
			const newValue = snapValueToCustomSteps(val, steps);
			this.updateValue(newValue);
		}
	}
	updateValue = (newValue) => {
		this.opts.value.current = snapValueToCustomSteps(newValue, this.normalizedSteps);
	};
	handlePointerMove = (e) => {
		if (!this.isActive || this.opts.disabled.current) return;
		e.preventDefault();
		e.stopPropagation();
		const sliderNode = this.opts.ref.current;
		const activeThumb = this.getAllThumbs()[0];
		if (!sliderNode || !activeThumb) return;
		activeThumb.focus();
		const { left, right, top, bottom } = sliderNode.getBoundingClientRect();
		if (this.direction === "lr") this.applyPosition({
			clientXY: e.clientX,
			start: left,
			end: right
		});
		else if (this.direction === "rl") this.applyPosition({
			clientXY: e.clientX,
			start: right,
			end: left
		});
		else if (this.direction === "bt") this.applyPosition({
			clientXY: e.clientY,
			start: bottom,
			end: top
		});
		else if (this.direction === "tb") this.applyPosition({
			clientXY: e.clientY,
			start: top,
			end: bottom
		});
	};
	handlePointerDown = (e) => {
		if (e.button !== 0 || this.opts.disabled.current) return;
		const sliderNode = this.opts.ref.current;
		const closestThumb = this.getAllThumbs()[0];
		if (!closestThumb || !sliderNode) return;
		const target = e.composedPath()[0] ?? e.target;
		if (!isElementOrSVGElement(target) || !sliderNode.contains(target)) return;
		e.preventDefault();
		closestThumb.focus();
		this.isActive = true;
		this.handlePointerMove(e);
	};
	handlePointerUp = () => {
		if (this.opts.disabled.current) return;
		if (this.isActive) this.opts.onValueCommit.current(run(() => this.opts.value.current));
		this.isActive = false;
	};
	#thumbsPropsArr = derived(() => {
		const currValue = this.opts.value.current;
		return Array.from({ length: 1 }, () => {
			const thumbValue = currValue;
			const thumbPosition = this.getPositionFromValue(thumbValue);
			const style = getThumbStyles(this.direction, thumbPosition);
			return {
				role: "slider",
				"aria-valuemin": this.opts.min.current,
				"aria-valuemax": this.opts.max.current,
				"aria-valuenow": thumbValue,
				"aria-disabled": boolToStr(this.opts.disabled.current),
				"aria-orientation": this.opts.orientation.current,
				"data-value": thumbValue,
				"data-orientation": this.opts.orientation.current,
				style,
				[sliderAttrs.thumb]: ""
			};
		});
	});
	get thumbsPropsArr() {
		return this.#thumbsPropsArr();
	}
	set thumbsPropsArr($$value) {
		return this.#thumbsPropsArr($$value);
	}
	#thumbsRenderArr = derived(() => {
		return this.thumbsPropsArr.map((_, i) => i);
	});
	get thumbsRenderArr() {
		return this.#thumbsRenderArr();
	}
	set thumbsRenderArr($$value) {
		return this.#thumbsRenderArr($$value);
	}
	#ticksPropsArr = derived(() => {
		const steps = this.normalizedSteps;
		const currValue = this.opts.value.current;
		return steps.map((tickValue, i) => {
			const tickPosition = this.getPositionFromValue(tickValue);
			const isFirst = i === 0;
			const isLast = i === steps.length - 1;
			const offsetPercentage = isFirst ? 0 : isLast ? -100 : -50;
			const style = getTickStyles(this.direction, tickPosition, offsetPercentage);
			const bounded = tickValue <= currValue;
			return {
				"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
				"data-orientation": this.opts.orientation.current,
				"data-bounded": bounded ? "" : void 0,
				"data-value": tickValue,
				"data-selected": this.isTickValueSelected(tickValue) ? "" : void 0,
				style,
				[sliderAttrs.tick]: ""
			};
		});
	});
	get ticksPropsArr() {
		return this.#ticksPropsArr();
	}
	set ticksPropsArr($$value) {
		return this.#ticksPropsArr($$value);
	}
	#ticksRenderArr = derived(() => {
		return this.ticksPropsArr.map((_, i) => i);
	});
	get ticksRenderArr() {
		return this.#ticksRenderArr();
	}
	set ticksRenderArr($$value) {
		return this.#ticksRenderArr($$value);
	}
	#tickItemsArr = derived(() => {
		return this.ticksPropsArr.map((tick, i) => ({
			value: tick["data-value"],
			index: i
		}));
	});
	get tickItemsArr() {
		return this.#tickItemsArr();
	}
	set tickItemsArr($$value) {
		return this.#tickItemsArr($$value);
	}
	#thumbItemsArr = derived(() => {
		return [{
			value: this.opts.value.current,
			index: 0
		}];
	});
	get thumbItemsArr() {
		return this.#thumbItemsArr();
	}
	set thumbItemsArr($$value) {
		return this.#thumbItemsArr($$value);
	}
	#snippetProps = derived(() => ({
		ticks: this.ticksRenderArr,
		thumbs: this.thumbsRenderArr,
		tickItems: this.tickItemsArr,
		thumbItems: this.thumbItemsArr
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
};
var SliderMultiRootState = class extends SliderBaseRootState {
	opts;
	isMulti = true;
	activeThumb = null;
	currentThumbIdx = 0;
	constructor(opts) {
		super(opts);
		this.opts = opts;
		watch([
			() => this.opts.step.current,
			() => this.opts.min.current,
			() => this.opts.max.current,
			() => this.opts.value.current
		], ([step, min, max, value]) => {
			const steps = normalizeSteps(step, min, max);
			const isValidValue = (v) => {
				return steps.includes(v);
			};
			const gcv = (v) => {
				return snapValueToCustomSteps(v, steps);
			};
			if (value.some((v) => !isValidValue(v))) this.opts.value.current = value.map(gcv);
		});
	}
	isTickValueSelected = (tickValue) => {
		return this.opts.value.current.includes(tickValue);
	};
	isThumbActive(index) {
		return this.isActive && this.activeThumb?.idx === index;
	}
	applyPosition({ clientXY, activeThumbIdx, start, end }) {
		const min = this.opts.min.current;
		const max = this.opts.max.current;
		const val = (clientXY - start) / (end - start) * (max - min) + min;
		if (val < min) this.updateValue(min, activeThumbIdx);
		else if (val > max) this.updateValue(max, activeThumbIdx);
		else {
			const steps = this.normalizedSteps;
			const newValue = snapValueToCustomSteps(val, steps);
			this.updateValue(newValue, activeThumbIdx);
		}
	}
	#getClosestThumb = (e) => {
		const thumbs = this.getAllThumbs();
		if (!thumbs.length) return;
		for (const thumb of thumbs) thumb.blur();
		const distances = thumbs.map((thumb) => {
			if (this.opts.orientation.current === "horizontal") {
				const { left, right } = thumb.getBoundingClientRect();
				return Math.abs(e.clientX - (left + right) / 2);
			} else {
				const { top, bottom } = thumb.getBoundingClientRect();
				return Math.abs(e.clientY - (top + bottom) / 2);
			}
		});
		const node = thumbs[distances.indexOf(Math.min(...distances))];
		return {
			node,
			idx: thumbs.indexOf(node)
		};
	};
	handlePointerMove = (e) => {
		if (!this.isActive || this.opts.disabled.current) return;
		e.preventDefault();
		e.stopPropagation();
		const sliderNode = this.opts.ref.current;
		const activeThumb = this.activeThumb;
		if (!sliderNode || !activeThumb) return;
		activeThumb.node.focus();
		const { left, right, top, bottom } = sliderNode.getBoundingClientRect();
		const direction = this.direction;
		if (direction === "lr") this.applyPosition({
			clientXY: e.clientX,
			activeThumbIdx: activeThumb.idx,
			start: left,
			end: right
		});
		else if (direction === "rl") this.applyPosition({
			clientXY: e.clientX,
			activeThumbIdx: activeThumb.idx,
			start: right,
			end: left
		});
		else if (direction === "bt") this.applyPosition({
			clientXY: e.clientY,
			activeThumbIdx: activeThumb.idx,
			start: bottom,
			end: top
		});
		else if (direction === "tb") this.applyPosition({
			clientXY: e.clientY,
			activeThumbIdx: activeThumb.idx,
			start: top,
			end: bottom
		});
	};
	handlePointerDown = (e) => {
		if (e.button !== 0 || this.opts.disabled.current) return;
		const sliderNode = this.opts.ref.current;
		const closestThumb = this.#getClosestThumb(e);
		if (!closestThumb || !sliderNode) return;
		const target = e.composedPath()[0] ?? e.target;
		if (!isElementOrSVGElement(target) || !sliderNode.contains(target)) return;
		e.preventDefault();
		this.activeThumb = closestThumb;
		closestThumb.node.focus();
		this.isActive = true;
		this.handlePointerMove(e);
	};
	handlePointerUp = () => {
		if (this.opts.disabled.current) return;
		if (this.isActive) this.opts.onValueCommit.current(run(() => this.opts.value.current));
		this.isActive = false;
	};
	getAllThumbs = () => {
		const node = this.opts.ref.current;
		if (!node) return [];
		return Array.from(node.querySelectorAll(sliderAttrs.selector("thumb")));
	};
	updateValue = (thumbValue, idx) => {
		const currValue = this.opts.value.current;
		if (!currValue.length) {
			this.opts.value.current.push(thumbValue);
			return;
		}
		if (currValue[idx] === thumbValue) return;
		const newValue = [...currValue];
		if (!isValidIndex(idx, newValue)) return;
		const direction = newValue[idx] > thumbValue ? -1 : 1;
		const swap = () => {
			const diffIndex = idx + direction;
			newValue[idx] = newValue[diffIndex];
			newValue[diffIndex] = thumbValue;
			const thumbs = this.getAllThumbs();
			if (!thumbs.length) return;
			thumbs[diffIndex]?.focus();
			this.activeThumb = {
				node: thumbs[diffIndex],
				idx: diffIndex
			};
		};
		if (this.opts.autoSort.current && (direction === -1 && thumbValue < newValue[idx - 1] || direction === 1 && thumbValue > newValue[idx + 1])) {
			swap();
			this.opts.value.current = newValue;
			return;
		}
		const steps = this.normalizedSteps;
		newValue[idx] = snapValueToCustomSteps(thumbValue, steps);
		this.opts.value.current = newValue;
	};
	#thumbsPropsArr = derived(() => {
		const currValue = this.opts.value.current;
		return Array.from({ length: currValue.length || 1 }, (_, i) => {
			const currThumb = run(() => this.currentThumbIdx);
			if (currThumb < currValue.length) run(() => {
				this.currentThumbIdx = currThumb + 1;
			});
			const thumbValue = currValue[i];
			const thumbPosition = this.getPositionFromValue(thumbValue ?? 0);
			const style = getThumbStyles(this.direction, thumbPosition);
			return {
				role: "slider",
				"aria-valuemin": this.opts.min.current,
				"aria-valuemax": this.opts.max.current,
				"aria-valuenow": thumbValue,
				"aria-disabled": boolToStr(this.opts.disabled.current),
				"aria-orientation": this.opts.orientation.current,
				"data-value": thumbValue,
				"data-orientation": this.opts.orientation.current,
				style,
				[sliderAttrs.thumb]: ""
			};
		});
	});
	get thumbsPropsArr() {
		return this.#thumbsPropsArr();
	}
	set thumbsPropsArr($$value) {
		return this.#thumbsPropsArr($$value);
	}
	#thumbsRenderArr = derived(() => {
		return this.thumbsPropsArr.map((_, i) => i);
	});
	get thumbsRenderArr() {
		return this.#thumbsRenderArr();
	}
	set thumbsRenderArr($$value) {
		return this.#thumbsRenderArr($$value);
	}
	#ticksPropsArr = derived(() => {
		const steps = this.normalizedSteps;
		const currValue = this.opts.value.current;
		return steps.map((tickValue, i) => {
			const tickPosition = this.getPositionFromValue(tickValue);
			const isFirst = i === 0;
			const isLast = i === steps.length - 1;
			const offsetPercentage = isFirst ? 0 : isLast ? -100 : -50;
			const style = getTickStyles(this.direction, tickPosition, offsetPercentage);
			const bounded = currValue.length === 1 ? tickValue <= currValue[0] : currValue[0] <= tickValue && tickValue <= currValue[currValue.length - 1];
			return {
				"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
				"data-orientation": this.opts.orientation.current,
				"data-bounded": bounded ? "" : void 0,
				"data-value": tickValue,
				style,
				[sliderAttrs.tick]: ""
			};
		});
	});
	get ticksPropsArr() {
		return this.#ticksPropsArr();
	}
	set ticksPropsArr($$value) {
		return this.#ticksPropsArr($$value);
	}
	#ticksRenderArr = derived(() => {
		return this.ticksPropsArr.map((_, i) => i);
	});
	get ticksRenderArr() {
		return this.#ticksRenderArr();
	}
	set ticksRenderArr($$value) {
		return this.#ticksRenderArr($$value);
	}
	#tickItemsArr = derived(() => {
		return this.ticksPropsArr.map((tick, i) => ({
			value: tick["data-value"],
			index: i
		}));
	});
	get tickItemsArr() {
		return this.#tickItemsArr();
	}
	set tickItemsArr($$value) {
		return this.#tickItemsArr($$value);
	}
	#thumbItemsArr = derived(() => {
		return this.opts.value.current.map((value, index) => ({
			value,
			index
		}));
	});
	get thumbItemsArr() {
		return this.#thumbItemsArr();
	}
	set thumbItemsArr($$value) {
		return this.#thumbItemsArr($$value);
	}
	#snippetProps = derived(() => ({
		ticks: this.ticksRenderArr,
		thumbs: this.thumbsRenderArr,
		tickItems: this.tickItemsArr,
		thumbItems: this.thumbItemsArr
	}));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
};
var SliderRootState = class {
	static create(opts) {
		const { type, ...rest } = opts;
		const rootState = type === "single" ? new SliderSingleRootState(rest) : new SliderMultiRootState(rest);
		return SliderRootContext.set(rootState);
	}
};
var VALID_SLIDER_KEYS = [
	ARROW_LEFT,
	ARROW_RIGHT,
	ARROW_UP,
	ARROW_DOWN,
	HOME,
	"End"
];
var SliderRangeState = class SliderRangeState {
	static create(opts) {
		return new SliderRangeState(opts, SliderRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
	}
	#rangeStyles = derived(() => {
		if (Array.isArray(this.root.opts.value.current)) {
			const min = this.root.opts.value.current.length > 1 ? this.root.getPositionFromValue(Math.min(...this.root.opts.value.current) ?? 0) : 0;
			const max = 100 - this.root.getPositionFromValue(Math.max(...this.root.opts.value.current) ?? 0);
			return {
				position: "absolute",
				...getRangeStyles(this.root.direction, min, max)
			};
		} else {
			const trackPadding = this.root.opts.trackPadding?.current;
			const currentValue = this.root.opts.value.current;
			const maxValue = this.root.opts.max.current;
			const min = 0;
			const max = trackPadding !== void 0 && trackPadding > 0 && currentValue === maxValue ? 0 : 100 - this.root.getPositionFromValue(currentValue);
			return {
				position: "absolute",
				...getRangeStyles(this.root.direction, min, max)
			};
		}
	});
	get rangeStyles() {
		return this.#rangeStyles();
	}
	set rangeStyles($$value) {
		return this.#rangeStyles($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-orientation": this.root.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
		style: this.rangeStyles,
		[sliderAttrs.range]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SliderThumbState = class SliderThumbState {
	static create(opts) {
		return new SliderThumbState(opts, SliderRootContext.get());
	}
	opts;
	root;
	attachment;
	#isDisabled = derived(() => this.root.opts.disabled.current || this.opts.disabled.current);
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
		this.onkeydown = this.onkeydown.bind(this);
	}
	#updateValue(newValue) {
		if (this.root.isMulti) this.root.updateValue(newValue, this.opts.index.current);
		else this.root.updateValue(newValue);
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		const currNode = this.opts.ref.current;
		if (!currNode) return;
		const thumbs = this.root.getAllThumbs();
		if (!thumbs.length) return;
		const idx = thumbs.indexOf(currNode);
		if (this.root.isMulti) this.root.currentThumbIdx = idx;
		if (!VALID_SLIDER_KEYS.includes(e.key)) return;
		e.preventDefault();
		const min = this.root.opts.min.current;
		const max = this.root.opts.max.current;
		const value = this.root.opts.value.current;
		const thumbValue = Array.isArray(value) ? value[idx] : value;
		const orientation = this.root.opts.orientation.current;
		const direction = this.root.direction;
		const steps = this.root.normalizedSteps;
		switch (e.key) {
			case HOME:
				this.#updateValue(min);
				break;
			case "End":
				this.#updateValue(max);
				break;
			case ARROW_LEFT:
				if (orientation !== "horizontal") break;
				if (e.metaKey) {
					const newValue = direction === "rl" ? max : min;
					this.#updateValue(newValue);
				} else {
					const newValue = getAdjacentStepValue(thumbValue, steps, direction === "rl" ? "next" : "prev");
					this.#updateValue(newValue);
				}
				break;
			case ARROW_RIGHT:
				if (orientation !== "horizontal") break;
				if (e.metaKey) {
					const newValue = direction === "rl" ? min : max;
					this.#updateValue(newValue);
				} else {
					const newValue = getAdjacentStepValue(thumbValue, steps, direction === "rl" ? "prev" : "next");
					this.#updateValue(newValue);
				}
				break;
			case ARROW_UP:
				if (e.metaKey) {
					const newValue = direction === "tb" ? min : max;
					this.#updateValue(newValue);
				} else {
					const newValue = getAdjacentStepValue(thumbValue, steps, direction === "tb" ? "prev" : "next");
					this.#updateValue(newValue);
				}
				break;
			case ARROW_DOWN:
				if (e.metaKey) {
					const newValue = direction === "tb" ? max : min;
					this.#updateValue(newValue);
				} else {
					const newValue = getAdjacentStepValue(thumbValue, steps, direction === "tb" ? "next" : "prev");
					this.#updateValue(newValue);
				}
				break;
		}
		this.root.opts.onValueCommit.current(this.root.opts.value.current);
	}
	#props = derived(() => ({
		...this.root.thumbsPropsArr[this.opts.index.current],
		id: this.opts.id.current,
		onkeydown: this.onkeydown,
		"data-active": this.root.isThumbActive(this.opts.index.current) ? "" : void 0,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current || this.root.opts.disabled.current),
		tabindex: this.opts.disabled.current || this.root.opts.disabled.current ? -1 : 0,
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
//#region node_modules/bits-ui/dist/bits/slider/components/slider.svelte
function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, value = void 0, type, onValueChange = noop$2, onValueCommit = noop$2, disabled = false, min: minProp, max: maxProp, step = 1, dir = "ltr", autoSort = true, orientation = "horizontal", thumbPositioning = "contain", trackPadding, $$slots, $$events, ...restProps } = $$props;
		const min = derived(() => {
			if (minProp !== void 0) return minProp;
			if (Array.isArray(step)) return Math.min(...step);
			return 0;
		});
		const max = derived(() => {
			if (maxProp !== void 0) return maxProp;
			if (Array.isArray(step)) return Math.max(...step);
			return 100;
		});
		function handleDefaultValue() {
			if (value !== void 0) return;
			if (type === "single") return min();
			return [];
		}
		handleDefaultValue();
		watch.pre(() => value, () => {
			handleDefaultValue();
		});
		const rootState = SliderRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			onValueCommit: boxWith(() => onValueCommit),
			disabled: boxWith(() => disabled),
			min: boxWith(() => min()),
			max: boxWith(() => max()),
			step: boxWith(() => step),
			dir: boxWith(() => dir),
			autoSort: boxWith(() => autoSort),
			orientation: boxWith(() => orientation),
			thumbPositioning: boxWith(() => thumbPositioning),
			type,
			trackPadding: boxWith(() => trackPadding)
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
			$$renderer.push(`<span${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></span>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			ref,
			value
		});
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/slider/components/slider-range.svelte
function Slider_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const rangeState = SliderRangeState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rangeState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/slider/components/slider-thumb.svelte
function Slider_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, ref = null, id = createId(uid), index, disabled = false, $$slots, $$events, ...restProps } = $$props;
		const thumbState = SliderThumbState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			index: boxWith(() => index),
			disabled: boxWith(() => disabled)
		});
		const mergedProps = derived(() => mergeProps(restProps, thumbState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, {
				active: thumbState.root.isThumbActive(thumbState.opts.index.current),
				props: mergedProps()
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span${attributes({ ...mergedProps() })}>`);
			children?.($$renderer, { active: thumbState.root.isThumbActive(thumbState.opts.index.current) });
			$$renderer.push(`<!----></span>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/a11y.js
function keyEnter(fn, _this = void 0) {
	return function(e) {
		return e.key === "Enter" || e.key === " " && !e.preventDefault() ? fn.call(_this, e) : void 0;
	};
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/utils.js
function assign(...args) {
	return Object.assign(...args);
}
function keys(object) {
	return Object.keys(object);
}
function entries(object) {
	return Object.entries(object);
}
function hasOwn(object, property) {
	return Object.hasOwn(object, property);
}
function floor(value) {
	return Math.floor(value);
}
function ceil(value) {
	return Math.ceil(value);
}
function min(...args) {
	return Math.min(...args);
}
function max(...args) {
	return Math.max(...args);
}
function symbol() {
	return Symbol("ec");
}
function length(array) {
	return array.length;
}
function empty(array) {
	return !length(array);
}
function tzOffset(date = /* @__PURE__ */ new Date()) {
	return -date.getTimezoneOffset();
}
function isArray(value) {
	return Array.isArray(value);
}
function isFunction(value) {
	return typeof value === "function";
}
function isPlainObject(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}
function isDate(value) {
	return value instanceof Date;
}
var identity = (x) => x;
function isRtl() {
	return window.getComputedStyle(document.documentElement).direction === "rtl";
}
function undefinedOr(fn) {
	return (input) => input === void 0 ? void 0 : fn(input);
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/date.js
var DAY_IN_SECONDS = 86400;
function createDate(input = /* @__PURE__ */ new Date(), offset = void 0) {
	return isDate(input) ? _fromLocalDate(input, offset) : _fromISOString(input, offset);
}
function createDuration(input) {
	if (typeof input === "number") input = { seconds: input };
	else if (typeof input === "string") {
		let seconds = 0, exp = 2;
		for (let part of input.split(":", 3)) seconds += parseInt(part, 10) * Math.pow(60, exp--);
		input = { seconds };
	} else if (isDate(input)) input = {
		hours: input.getUTCHours(),
		minutes: input.getUTCMinutes(),
		seconds: input.getUTCSeconds()
	};
	let weeks = input.weeks || input.week || 0;
	return {
		years: input.years || input.year || 0,
		months: input.months || input.month || 0,
		days: weeks * 7 + (input.days || input.day || 0),
		seconds: (input.hours || input.hour || 0) * 60 * 60 + (input.minutes || input.minute || 0) * 60 + (input.seconds || input.second || 0),
		inWeeks: !!weeks
	};
}
function cloneDate(date) {
	let result = new Date(date.getTime());
	setOffset(result, getOffset(date));
	return result;
}
function addDuration(date, duration, x = 1) {
	date.setUTCFullYear(date.getUTCFullYear() + x * duration.years);
	let month = date.getUTCMonth() + x * duration.months;
	date.setUTCMonth(month);
	month %= 12;
	if (month < 0) month += 12;
	while (date.getUTCMonth() !== month) subtractDay(date);
	date.setUTCDate(date.getUTCDate() + x * duration.days);
	date.setUTCSeconds(date.getUTCSeconds() + x * duration.seconds);
	return date;
}
function subtractDuration(date, duration, x = 1) {
	return addDuration(date, duration, -x);
}
function addDay(date, x = 1) {
	date.setUTCDate(date.getUTCDate() + x);
	return date;
}
function subtractDay(date, x = 1) {
	return addDay(date, -x);
}
function setMidnight(date) {
	date.setUTCHours(0, 0, 0, 0);
	return date;
}
function toLocalDate(date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}
function toISOString(date, len = 19) {
	return date.toISOString().substring(0, len);
}
function datesEqual(date1, ...dates2) {
	return dates2.every((date2) => date1.getTime() === date2.getTime());
}
function prevClosestDay(date, day) {
	let diff = day - date.getUTCDay();
	date.setUTCDate(date.getUTCDate() + (diff <= 0 ? diff : diff - 7));
	return date;
}
/**
* Check whether given date is string which contains no time part
*/
function noTimePart(date) {
	return typeof date === "string" && date.length <= 10;
}
/**
* Copy time from one date to another
*/
function copyTime(toDate, fromDate) {
	toDate.setUTCHours(fromDate.getUTCHours(), fromDate.getUTCMinutes(), fromDate.getUTCSeconds(), 0);
	return toDate;
}
/**
* Get duration value in seconds
*/
function toSeconds(duration) {
	return duration.seconds;
}
/**
* Move the date forward (when pressing the next button)
*/
function nextDate(date, duration, hiddenDays) {
	addDuration(date, duration);
	_skipHiddenDays(date, hiddenDays, addDay);
	return date;
}
/**
* Move the date backward (when pressing the prev button)
*/
function prevDate(date, duration, hiddenDays) {
	subtractDuration(date, duration);
	_skipHiddenDays(date, hiddenDays, subtractDay);
	return date;
}
function parseOffset(str, match = {}) {
	let parts = str.match(/([+-])(\d{2}):(\d{2})$/);
	if (parts) {
		assign(match, parts);
		return +(parts[1] + "1") * (+parts[2] * 60 + +parts[3]);
	}
}
/**
* Apply timezone offset difference in minutes to a date
*/
function applyOffsetDiff(date, offsetDiff) {
	if (offsetDiff) date.setUTCMinutes(date.getUTCMinutes() + offsetDiff);
	return date;
}
var offsetSymbol = Symbol("ec");
function setOffset(date, offset) {
	date[offsetSymbol] = offset;
	return date;
}
function getOffset(date) {
	return date[offsetSymbol];
}
/**
* Private functions
*/
function _fromLocalDate(date, offset = void 0) {
	let result = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
	applyOffsetDiff(result, offset ? offset - tzOffset(result) : 0);
	setOffset(result, offset ?? tzOffset(result));
	return result;
}
function _fromISOString(str, offset = void 0) {
	let match = {};
	let inputOffset = parseOffset(str, match);
	if (inputOffset !== void 0) str = str.substring(0, match.index);
	let parts = str.match(/\d+/g);
	let result = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2], +parts[3] || 0, +parts[4] || 0, +parts[5] || 0));
	if (offset !== void 0 && inputOffset !== void 0) applyOffsetDiff(result, offset - inputOffset);
	setOffset(result, offset ?? inputOffset);
	return result;
}
function _skipHiddenDays(date, hiddenDays, dateFn) {
	if (hiddenDays.length && hiddenDays.length < 7) while (hiddenDays.includes(date.getUTCDay())) dateFn(date);
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/payload.js
var payloadProp = symbol();
function setPayload(obj, payload) {
	obj[payloadProp] = payload;
}
function hasPayload(obj) {
	return !!obj?.[payloadProp];
}
function getPayload(obj) {
	return obj[payloadProp];
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/dom.js
function createElement(tag, className, content, attrs = []) {
	let el = document.createElement(tag);
	el.className = className;
	if (typeof content == "string") el.innerText = content;
	else if (content.domNodes) el.replaceChildren(...content.domNodes);
	else if (content.html) el.innerHTML = content.html;
	for (let attr of attrs) el.setAttribute(...attr);
	return el;
}
function rect(el) {
	return el.getBoundingClientRect();
}
function ancestor(el, up) {
	while (up--) el = el.parentElement;
	return el;
}
function height(el) {
	return rect(el).height;
}
function getElementWithPayload(x, y, root = document, processed = []) {
	processed.push(root);
	for (let el of root.elementsFromPoint(x, y)) {
		if (hasPayload(el)) return el;
		/** @see https://github.com/vkurko/calendar/issues/142 */
		if (el.shadowRoot && !processed.includes(el.shadowRoot)) {
			let shadowEl = getElementWithPayload(x, y, el.shadowRoot, processed);
			if (shadowEl) return shadowEl;
		}
	}
	return null;
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/view.js
function createView(view, _viewTitle, _currentRange, _activeRange) {
	return {
		type: view,
		title: _viewTitle,
		currentStart: _currentRange.start,
		currentEnd: _currentRange.end,
		activeStart: _activeRange.start,
		activeEnd: _activeRange.end,
		calendar: void 0
	};
}
function toViewWithLocalDates(view) {
	view = assign({}, view);
	view.currentStart = toLocalDate(view.currentStart);
	view.currentEnd = toLocalDate(view.currentEnd);
	view.activeStart = toLocalDate(view.activeStart);
	view.activeEnd = toLocalDate(view.activeEnd);
	return view;
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/events.js
var eventId = 1;
function createEvents(input, offset = void 0) {
	return input.map((event) => {
		let result = {
			id: "id" in event ? String(event.id) : `{generated-${eventId++}}`,
			resourceIds: toArrayProp(event, "resourceId").map(String),
			allDay: event.allDay ?? (noTimePart(event.start) && noTimePart(event.end)),
			start: createDate(event.start, offset),
			end: createDate(event.end, offset),
			title: event.title ?? "",
			editable: event.editable,
			startEditable: event.startEditable,
			durationEditable: event.durationEditable,
			display: event.display ?? "auto",
			extendedProps: event.extendedProps ?? {},
			backgroundColor: event.backgroundColor ?? event.color,
			textColor: event.textColor,
			classNames: toArrayProp(event, "className"),
			styles: toArrayProp(event, "style")
		};
		if (result.allDay) {
			setMidnight(result.start);
			let end = cloneDate(result.end);
			setMidnight(result.end);
			if (!datesEqual(result.end, end) || datesEqual(result.end, result.start)) addDay(result.end);
		}
		return result;
	});
}
function toArrayProp(input, propName) {
	let result = input[propName + "s"] ?? input[propName] ?? [];
	return isArray(result) ? result : [result];
}
function createEventSources(input) {
	return input.map((source) => ({
		events: source.events,
		url: source.url && source.url.trimEnd("&") || "",
		method: source.method && source.method.toUpperCase() || "GET",
		extraParams: source.extraParams || {}
	}));
}
function createEventContent(chunk, displayEventEnd, eventContent, theme, _intlEventTime, _view) {
	let timeText = _intlEventTime.formatRange(chunk.start, displayEventEnd && chunk.event.display !== "pointer" && !chunk.zeroDuration ? copyTime(cloneDate(chunk.start), chunk.end) : chunk.start);
	let content;
	if (eventContent) content = isFunction(eventContent) ? eventContent({
		event: toEventWithLocalDates(chunk.event),
		timeText,
		view: toViewWithLocalDates(_view)
	}) : eventContent;
	if (content === void 0) {
		let domNodes;
		switch (chunk.event.display) {
			case "background":
				domNodes = [];
				break;
			case "pointer":
				domNodes = chunk.event.allDay ? [] : [createTimeElement(timeText, chunk, theme)];
				break;
			default: domNodes = [...chunk.event.allDay ? [] : [createTimeElement(timeText, chunk, theme)], createElement("h4", theme.eventTitle, chunk.event.title)];
		}
		content = { domNodes };
	}
	return [timeText, content];
}
function createTimeElement(timeText, chunk, theme) {
	return createElement("time", theme.eventTime, timeText, [["datetime", toISOString(chunk.start)]]);
}
function createEventClasses(eventClassNames, event, _view) {
	let result = event.classNames;
	if (eventClassNames) {
		if (isFunction(eventClassNames)) eventClassNames = eventClassNames({
			event: toEventWithLocalDates(event),
			view: toViewWithLocalDates(_view)
		});
		result = [...isArray(eventClassNames) ? eventClassNames : [eventClassNames], ...result];
	}
	return result;
}
function toEventWithLocalDates(event) {
	return _cloneEvent(event, toLocalDate);
}
function cloneEvent(event) {
	return _cloneEvent(event, cloneDate);
}
function _cloneEvent(event, dateFn) {
	event = assign({}, event);
	event.start = dateFn(event.start);
	event.end = dateFn(event.end);
	return event;
}
/**
* Check whether the event intersects with the given date range and resource
* @param event
* @param start
* @param end
* @param resource
* @return boolean
*/
function eventIntersects(event, start, end, resource = void 0) {
	return (!resource || event.resourceIds.includes(resource.id)) && event.start < end && event.end > start;
}
function helperEvent(display) {
	return previewEvent(display) || ghostEvent(display) || pointerEvent(display);
}
function bgEvent(display) {
	return display === "background";
}
function previewEvent(display) {
	return display === "preview";
}
function ghostEvent(display) {
	return display === "ghost";
}
function pointerEvent(display) {
	return display === "pointer";
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/chunks.js
/**
* @returns {{
*   id?: String,  // this can be used as key in Svelte keyed each block
*   start: Date,
*   end: Date,
*   event: Object,
*   zeroDuration: boolean,
*   gridColumn?: Number,
*   gridRow?: Number,
*   resource?: Object,
*   group?: Object,
*   groupColumn?: Number,
*   dates?: Array
*   day?: Array,
*   long?: Object,
*   prev?: Object,
*   top?: Number,
*   bottom?: Number,
*   left?: Number,
*   height?: Number,
*   width?: Number,
*   maxHeight?: Number
* }}
*/
function createEventChunk(event, start, end) {
	start = event.start > start ? event.start : start;
	end = event.end < end ? event.end : end;
	return {
		start,
		end,
		event,
		zeroDuration: datesEqual(start, end)
	};
}
/**
* Create event chunk for month view and all-day slot in week view
*/
function createAllDayChunks(event, days, withId = true) {
	let dates = [];
	let lastEnd;
	let gridColumn;
	let gridRow;
	let resource;
	for (let { gridColumn: column, gridRow: row, resource: dayResource, dayStart, dayEnd, disabled } of days) if (!disabled && eventIntersects(event, dayStart, dayEnd, dayResource)) {
		dates.push(dayStart);
		lastEnd = dayEnd;
		if (!gridColumn) {
			gridColumn = column;
			gridRow = row;
			resource = dayResource;
		}
	}
	if (dates.length) {
		let chunk = createEventChunk(event, dates[0], lastEnd);
		assign(chunk, {
			gridColumn,
			gridRow,
			resource,
			dates
		});
		if (withId) assignChunkId(chunk);
		return [chunk];
	}
	return [];
}
/**
* Prepare event chunks for month view and all-day slot in week view
*/
function prepareAllDayChunks(chunks) {
	let prevChunks = {};
	let longChunks = {};
	for (let chunk of chunks) {
		let { gridColumn, gridRow } = chunk;
		for (let i = 1; i < chunk.dates.length; ++i) {
			let key = `${gridRow}_${gridColumn + i}`;
			if (longChunks[key]) longChunks[key].chunks.push(chunk);
			else longChunks[key] = {
				sorted: false,
				chunks: [chunk]
			};
		}
		let key = `${gridRow}_${gridColumn}`;
		chunk.long = longChunks[key];
		chunk.prev = prevChunks[key];
		prevChunks[key] = chunk;
	}
}
function repositionEvent(chunk, height, top = 1) {
	if (chunk.prev) top = chunk.prev.bottom + 1;
	let bottom = top + height;
	if (chunk.long) {
		let longChunks = chunk.long;
		if (!longChunks.sorted) {
			longChunks.chunks.sort((a, b) => a.top - b.top);
			longChunks.sorted = true;
		}
		for (let longChunk of longChunks.chunks) if (top < longChunk.bottom && bottom > longChunk.top) {
			let offset = longChunk.bottom - top + 1;
			top += offset;
			bottom += offset;
		}
	}
	assign(chunk, {
		top,
		bottom
	});
	return top;
}
var ids = /* @__PURE__ */ new WeakMap();
var idCounter = 1;
function assignChunkId(chunk) {
	let { event, gridColumn, gridRow } = chunk;
	let id = ids.get(event);
	if (!id) {
		id = idCounter++;
		ids.set(event, id);
	}
	chunk.id = `${id}-${gridColumn}-${gridRow}`;
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/derived.js
function intl(mainState, option) {
	return () => {
		let { options: { locale } } = mainState;
		let format = mainState.options[option];
		let intl;
		run(() => {
			intl = isFunction(format) ? { format } : new Intl.DateTimeFormat(locale, format);
		});
		return { format: (date) => intl.format(toLocalDate(date)) };
	};
}
function intlRange(mainState, option) {
	return () => {
		let { options: { locale } } = mainState;
		let format = mainState.options[option];
		let formatRange;
		run(() => {
			if (isFunction(format)) formatRange = format;
			else {
				let intl = new Intl.DateTimeFormat(locale, format);
				formatRange = (start, end) => {
					if (start <= end) return intl.formatRange(start, end);
					else {
						/** @see https://github.com/vkurko/calendar/issues/227 */
						let parts = intl.formatRangeToParts(end, start);
						let result = "";
						let sources = ["startRange", "endRange"];
						let processed = [false, false];
						for (let part of parts) {
							let i = sources.indexOf(part.source);
							if (i >= 0) {
								if (!processed[i]) {
									result += _getParts(sources[1 - i], parts);
									processed[i] = true;
								}
							} else result += part.value;
						}
						return result;
					}
				};
			}
		});
		return { formatRange: (start, end) => formatRange(toLocalDate(start), toLocalDate(end)) };
	};
}
function _getParts(source, parts) {
	let result = "";
	for (let part of parts) if (part.source == source) result += part.value;
	return result;
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/options.js
function btnTextDay(text) {
	return btnText(text, "day");
}
function btnTextWeek(text) {
	return btnText(text, "week");
}
function btnText(text, period) {
	return {
		...text,
		next: "Next " + period,
		prev: "Previous " + period
	};
}
function themeView(view) {
	return (theme) => ({
		...theme,
		view
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/range.js
function createDateRange(input) {
	let start, end;
	if (input) {
		({start, end} = input);
		if (start) start = setMidnight(createDate(start));
		if (end) end = setMidnight(createDate(end));
	}
	return {
		start,
		end
	};
}
function outsideRange(date, range) {
	return range.start && date < range.start || range.end && date > range.end;
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/resources.js
function createResources(input) {
	let result = [];
	_createResources(input, 0, false, result);
	return result;
}
function _createResources(input, level, hidden, flat) {
	let result = [];
	for (let item of input) {
		let resource = createResource(item);
		result.push(resource);
		flat.push(resource);
		let payload = {
			level,
			children: [],
			hidden
		};
		setPayload(resource, payload);
		if (item.children) payload.children = _createResources(item.children, level + 1, hidden || !resource.expanded, flat);
	}
	return result;
}
function createResource(input) {
	return {
		id: String(input.id),
		title: input.title || "",
		eventBackgroundColor: eventBackgroundColor(input),
		eventTextColor: eventTextColor(input),
		expanded: input.expanded ?? true,
		extendedProps: input.extendedProps ?? {}
	};
}
function eventBackgroundColor(resource) {
	return resource?.eventBackgroundColor;
}
function eventTextColor(resource) {
	return resource?.eventTextColor;
}
function findFirstResource(event, resources) {
	return empty(event.resourceIds) ? void 0 : resources.find((resource) => event.resourceIds.includes(resource.id));
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/slots.js
function createSlots(date, slotDuration, slotLabelPeriodicity, slotTimeLimits, intlSlotLabel) {
	let slots = [];
	date = cloneDate(date);
	let end = cloneDate(date);
	addDuration(date, slotTimeLimits.min);
	addDuration(end, slotTimeLimits.max);
	while (date < end) {
		slots.push([toISOString(date), intlSlotLabel.format(date)]);
		addDuration(date, slotDuration, slotLabelPeriodicity);
	}
	let span = floor((date - end) / 1e3 / toSeconds(slotDuration));
	if (span && span !== slotLabelPeriodicity) slots.at(-1)[2] = slotLabelPeriodicity - span;
	return slots;
}
function createSlotTimeLimits(slotMinTime, slotMaxTime, flexibleSlotTimeLimits, viewDates, filteredEvents) {
	let min$1 = createDuration(slotMinTime);
	let max$1 = createDuration(slotMaxTime);
	if (flexibleSlotTimeLimits) {
		let minMin = createDuration(min(toSeconds(min$1), max(0, toSeconds(max$1) - DAY_IN_SECONDS)));
		let maxMax = createDuration(max(toSeconds(max$1), toSeconds(minMin) + DAY_IN_SECONDS));
		let filter = isFunction(flexibleSlotTimeLimits?.eventFilter) ? flexibleSlotTimeLimits.eventFilter : (event) => !bgEvent(event.display);
		loop: for (let date of viewDates) {
			let start = addDuration(cloneDate(date), min$1);
			let end = addDuration(cloneDate(date), max$1);
			let minStart = addDuration(cloneDate(date), minMin);
			let maxEnd = addDuration(cloneDate(date), maxMax);
			for (let event of filteredEvents) if (!event.allDay && filter(event) && event.start < maxEnd && event.end > minStart) {
				if (event.start < start) {
					let seconds = max((event.start - date) / 1e3, toSeconds(minMin));
					if (seconds < toSeconds(min$1)) min$1.seconds = seconds;
				}
				if (event.end > end) {
					let seconds = min((event.end - date) / 1e3, toSeconds(maxMax));
					if (seconds > toSeconds(max$1)) max$1.seconds = seconds;
				}
				if (toSeconds(min$1) === toSeconds(minMin) && toSeconds(max$1) === toSeconds(maxMax)) break loop;
			}
		}
	}
	return {
		min: min$1,
		max: max$1
	};
}
//#endregion
//#region node_modules/@event-calendar/core/src/storage/proxy.svelte.js
function arrayProxy(array) {
	let counter = 0;
	let version = counter;
	return proxy(array, () => version, () => true, () => version = ++counter);
}
/**
* Object proxy that triggers the effect on changes to first-level properties
*/
function objectProxy(object) {
	let counter = 0;
	let versions = {};
	return proxy(object, (prop) => versions[prop], (a, b) => a !== b, (prop) => versions[prop] = ++counter);
}
function proxy(target, setDependency, hasEffect, invokeEffect) {
	return new Proxy(target, {
		get(target, prop, receiver) {
			if (hasOwn(target, prop)) setDependency(prop);
			return Reflect.get(target, prop, receiver);
		},
		set(target, prop, value, receiver) {
			let has = hasEffect(target[prop], value);
			let result = Reflect.set(target, prop, value, receiver);
			if (has) invokeEffect(prop);
			return result;
		}
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/storage/options.js
function createOptions(plugins) {
	let options = {
		buttonText: { today: "today" },
		customButtons: {},
		customScrollbars: false,
		date: /* @__PURE__ */ new Date(),
		dateIncrement: void 0,
		datesSet: void 0,
		dayCellContent: void 0,
		dayHeaderFormat: {
			weekday: "short",
			month: "numeric",
			day: "numeric"
		},
		dayHeaderAriaLabelFormat: { dateStyle: "full" },
		displayEventEnd: true,
		duration: { weeks: 1 },
		events: [],
		eventAllUpdated: void 0,
		eventBackgroundColor: void 0,
		eventClassNames: void 0,
		eventClick: void 0,
		eventColor: void 0,
		eventContent: void 0,
		eventDidMount: void 0,
		eventFilter: void 0,
		eventMouseEnter: void 0,
		eventMouseLeave: void 0,
		eventOrder: void 0,
		eventSources: [],
		eventTextColor: void 0,
		eventTimeFormat: {
			hour: "numeric",
			minute: "2-digit"
		},
		filterEventsWithResources: false,
		firstDay: 0,
		headerToolbar: {
			start: "title",
			center: "",
			end: "today prev,next"
		},
		height: void 0,
		hiddenDays: [],
		highlightedDates: [],
		icons: {},
		lazyFetching: true,
		loading: void 0,
		locale: void 0,
		refetchResourcesOnNavigate: false,
		resources: [],
		selectable: false,
		theme: {
			active: "ec-active",
			bgEvent: "ec-bg-event",
			bgEvents: "ec-bg-events",
			body: "ec-body",
			button: "ec-button",
			buttonGroup: "ec-button-group",
			calendar: "ec",
			colHead: "ec-col-head",
			customScrollbars: "ec-custom-scrollbars",
			day: "ec-day",
			dayHead: "ec-day-head",
			disabled: "ec-disabled",
			event: "ec-event",
			eventBody: "ec-event-body",
			eventTime: "ec-event-time",
			eventTitle: "ec-event-title",
			events: "ec-events",
			grid: "ec-grid",
			header: "ec-header",
			hidden: "ec-hidden",
			highlight: "ec-highlight",
			icon: "ec-icon",
			main: "ec-main",
			noBeb: "ec-no-beb",
			noIeb: "ec-no-ieb",
			today: "ec-today",
			title: "ec-title",
			toolbar: "ec-toolbar",
			view: "",
			weekdays: [
				"ec-sun",
				"ec-mon",
				"ec-tue",
				"ec-wed",
				"ec-thu",
				"ec-fri",
				"ec-sat"
			],
			weekNumber: "ec-week-number"
		},
		timeZone: "local",
		titleFormat: {
			year: "numeric",
			month: "short",
			day: "numeric"
		},
		validRange: void 0,
		view: void 0,
		viewDidMount: void 0,
		views: {}
	};
	for (let plugin of plugins) plugin.createOptions?.(options);
	return options;
}
function createParsers(plugins) {
	let parsers = {
		date: (input) => setMidnight(createDate(input)),
		dateIncrement: undefinedOr(createDuration),
		duration: createDuration,
		events: createEvents,
		eventSources: createEventSources,
		hiddenDays: (input) => [...new Set(input)],
		highlightedDates: (input) => input.map((item) => setMidnight(createDate(item))),
		resources: (input) => isArray(input) ? createResources(input) : input,
		validRange: createDateRange
	};
	for (let plugin of plugins) plugin.createParsers?.(parsers);
	return parsers;
}
var specialOptions = [
	"buttonText",
	"customButtons",
	"icons",
	"theme"
];
function optionsState(plugins, userOptions) {
	let defOptions = createOptions(plugins);
	let parsers = createParsers(plugins);
	defOptions = parseOptions(defOptions, parsers);
	userOptions = parseOptions(userOptions, parsers);
	let defViews = extractOption(defOptions, "views") ?? {};
	let userViews = extractOption(userOptions, "views") ?? {};
	let options = objectProxy({});
	assign(options, defOptions);
	if (userOptions.view) options.view = userOptions.view;
	let setters = {};
	let viewOptions = {};
	let viewComponents = {};
	let views = new Set([...keys(defViews), ...keys(userViews)]);
	for (let view of views) {
		let userViewOptions = userViews[view] ?? {};
		let defOpts = mergeOpts(defOptions, defViews[view] ?? defViews[userViewOptions.type] ?? {});
		let opts = mergeOpts(defOpts, userOptions, userViewOptions);
		let component = extractOption(opts, "component");
		delete opts.view;
		for (let key of keys(opts)) if (hasOwn(options, key)) {
			setters[key] ??= [];
			setters[key].push(specialOptions.includes(key) ? (value) => opts[key] = isFunction(value) ? value(defOpts[key]) : value : (value) => opts[key] = value);
		} else delete opts[key];
		viewOptions[view] = opts;
		viewComponents[view] = component;
	}
	assign(options, viewOptions[options.view]);
	return [
		options,
		function setOption(key, value, parsed = true) {
			if (hasOwn(options, key)) {
				if (!parsed) {
					if (key in parsers) value = parsers[key](value);
					else if (isPlainObject(value)) value = { ...value };
					else if (isArray(value)) value = [...value];
				}
				setters[key]?.forEach((set) => set(value));
				options[key] = value;
			}
		},
		function setViewOptions(view) {
			assign(options, viewOptions[view]);
			return viewComponents[view];
		}
	];
}
function parseOptions(opts, parsers) {
	let result = { ...opts };
	for (let key of keys(parsers)) if (key in result) result[key] = parsers[key](result[key]);
	if (opts.views) {
		result.views = {};
		for (let view of keys(opts.views)) result.views[view] = parseOptions(opts.views[view], parsers);
	}
	return result;
}
function extractOption(options, name) {
	let extracted = options[name];
	delete options[name];
	return extracted;
}
function mergeOpts(...args) {
	let result = {};
	for (let opts of args) {
		let override = {};
		for (let key of specialOptions) if (isFunction(opts[key])) override[key] = opts[key](result[key]);
		result = {
			...result,
			...opts,
			...override
		};
	}
	return result;
}
//#endregion
//#region node_modules/@event-calendar/core/src/storage/derived.js
function currentRange(mainState) {
	return () => {
		let { options: { date, duration, firstDay } } = mainState;
		let start, end;
		run(() => {
			start = cloneDate(date);
			if (duration.years) {
				start.setUTCMonth(0);
				start.setUTCDate(1);
			} else if (duration.months) start.setUTCDate(1);
			else if (duration.inWeeks) prevClosestDay(start, firstDay);
			end = addDuration(cloneDate(start), duration);
		});
		return {
			start,
			end
		};
	};
}
function activeRange(mainState) {
	return () => {
		let { currentRange, extensions: { activeRange } } = mainState;
		let start, end;
		run(() => {
			start = cloneDate(currentRange.start);
			end = cloneDate(currentRange.end);
		});
		return activeRange ? activeRange(start, end) : {
			start,
			end
		};
	};
}
function filteredEvents(mainState) {
	return () => {
		let { events, options: { eventFilter, eventOrder, filterEventsWithResources, resources, view } } = mainState;
		let result = [...events];
		run(() => {
			if (isFunction(eventFilter)) {
				let events2 = events.map(toEventWithLocalDates);
				let view = toViewWithLocalDates(mainState.view);
				result = result.filter((event, index) => eventFilter({
					event: toEventWithLocalDates(event),
					index,
					events: events2,
					view
				}));
			}
			if (filterEventsWithResources) result = result.filter((event) => resources.some((resource) => event.resourceIds.includes(resource.id)));
			if (isFunction(eventOrder)) result.sort((a, b) => eventOrder(toEventWithLocalDates(a), toEventWithLocalDates(b)));
			else result.sort((a, b) => a.start - b.start || b.allDay - a.allDay);
		});
		return result;
	};
}
function offset(mainState) {
	return () => {
		let { options: { timeZone } } = mainState;
		let offset;
		run(() => {
			offset = timeZone === "local" ? tzOffset() : timeZone === "UTC" ? 0 : parseOffset(timeZone) ?? tzOffset();
		});
		return offset;
	};
}
function viewDates(mainState) {
	return () => {
		let { options, activeRange } = mainState;
		let { hiddenDays } = options;
		let dates = [];
		run(() => {
			let date = setMidnight(cloneDate(activeRange.start));
			let end = setMidnight(cloneDate(activeRange.end));
			while (date < end) {
				if (!hiddenDays.includes(date.getUTCDay())) dates.push(cloneDate(date));
				addDay(date);
			}
			if (!dates.length && hiddenDays.length && hiddenDays.length < 7) {
				while (hiddenDays.includes(date.getUTCDay())) addDay(date);
				(/* @__PURE__ */ tick()).then(() => {
					mainState.setOption("date", date);
				});
			}
		});
		return dates;
	};
}
function viewTitle(mainState) {
	return () => {
		let { currentRange, intlTitle } = mainState;
		let title;
		run(() => {
			title = intlTitle.formatRange(currentRange.start, subtractDay(cloneDate(currentRange.end)));
		});
		return title;
	};
}
function view(mainState) {
	return () => {
		let { activeRange, currentRange, viewTitle, options: { view } } = mainState;
		let viewObj;
		run(() => {
			viewObj = createView(view, viewTitle, currentRange, activeRange);
		});
		return viewObj;
	};
}
//#endregion
//#region node_modules/@event-calendar/core/src/storage/state.svelte.js
var State = class {
	#offset;
	get offset() {
		return this.#offset();
	}
	set offset($$value) {
		return this.#offset($$value);
	}
	#currentRange;
	get currentRange() {
		return this.#currentRange();
	}
	set currentRange($$value) {
		return this.#currentRange($$value);
	}
	#activeRange;
	get activeRange() {
		return this.#activeRange();
	}
	set activeRange($$value) {
		return this.#activeRange($$value);
	}
	#filteredEvents;
	get filteredEvents() {
		return this.#filteredEvents();
	}
	set filteredEvents($$value) {
		return this.#filteredEvents($$value);
	}
	#intlEventTime;
	get intlEventTime() {
		return this.#intlEventTime();
	}
	set intlEventTime($$value) {
		return this.#intlEventTime($$value);
	}
	#intlDayHeader;
	get intlDayHeader() {
		return this.#intlDayHeader();
	}
	set intlDayHeader($$value) {
		return this.#intlDayHeader($$value);
	}
	#intlDayHeaderAL;
	get intlDayHeaderAL() {
		return this.#intlDayHeaderAL();
	}
	set intlDayHeaderAL($$value) {
		return this.#intlDayHeaderAL($$value);
	}
	#intlTitle;
	get intlTitle() {
		return this.#intlTitle();
	}
	set intlTitle($$value) {
		return this.#intlTitle($$value);
	}
	#viewDates;
	get viewDates() {
		return this.#viewDates();
	}
	set viewDates($$value) {
		return this.#viewDates($$value);
	}
	#viewTitle;
	get viewTitle() {
		return this.#viewTitle();
	}
	set viewTitle($$value) {
		return this.#viewTitle($$value);
	}
	#view;
	get view() {
		return this.#view();
	}
	set view($$value) {
		return this.#view($$value);
	}
	options;
	setOption;
	setViewOptions;
	constructor(plugins, options) {
		[this.options, this.setOption, this.setViewOptions] = optionsState(plugins, options);
		this.auxComponents = [];
		this.#offset = derived(offset(this));
		this.#currentRange = derived(currentRange(this));
		this.#activeRange = derived(activeRange(this));
		this.fetchedRange = {
			events: {},
			resources: {}
		};
		this.events = arrayProxy(this.options.events);
		this.#filteredEvents = derived(filteredEvents(this));
		this.mainEl = void 0;
		this.now = createDate(void 0, this.offset);
		this.resources = arrayProxy(isArray(this.options.resources) ? this.options.resources : []);
		this.today = setMidnight(cloneDate(this.now));
		this.#intlEventTime = derived(intlRange(this, "eventTimeFormat"));
		this.#intlDayHeader = derived(intl(this, "dayHeaderFormat"));
		this.#intlDayHeaderAL = derived(intl(this, "dayHeaderAriaLabelFormat"));
		this.#intlTitle = derived(intlRange(this, "titleFormat"));
		this.#viewDates = derived(viewDates(this));
		this.#viewTitle = derived(viewTitle(this));
		this.#view = derived(view(this));
		this.viewComponent = void 0;
		this.extensions = {};
		this.features = [];
		this.interaction = {};
		this.iEvents = new SvelteMap();
		this.iClasses = identity;
		this.iClass = void 0;
		for (let plugin of plugins) plugin.initState?.(this);
		this.#initEffects();
	}
	#initEffects() {}
};
//#endregion
//#region node_modules/@event-calendar/core/src/Buttons.svelte
function Buttons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { buttons } = $$props;
		let mainState = getContext("state");
		derived(() => mainState.currentRange);
		derived(() => mainState.today);
		derived(() => mainState.viewTitle);
		derived(() => mainState.viewDates);
		let buttonText = derived(() => mainState.options.buttonText), customButtons = derived(() => mainState.options.customButtons);
		derived(() => mainState.options.date);
		derived(() => mainState.options.dateIncrement);
		derived(() => mainState.options.duration);
		derived(() => mainState.options.hiddenDays);
		let theme = derived(() => mainState.options.theme);
		derived(() => mainState.options.validRange);
		let view = derived(() => mainState.options.view);
		let prevDisabled = false;
		let nextDisabled = false;
		let todayDisabled = false;
		$$renderer.push(`<!--[-->`);
		const each_array = ensure_array_like(buttons);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let button = each_array[$$index];
			if (button === "title") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<h2${attr_class(theme().title)}></h2>`);
			} else if (button === "prev") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<button${attr_class(`${stringify(theme().button)} ec-${stringify(button)}`)}${attr("aria-label", buttonText().prev)}${attr("title", buttonText().prev)}${attr("disabled", prevDisabled, true)}><i${attr_class(`${stringify(theme().icon)} ec-${stringify(button)}`)}></i></button>`);
			} else if (button === "next") {
				$$renderer.push("<!--[2-->");
				$$renderer.push(`<button${attr_class(`${stringify(theme().button)} ec-${stringify(button)}`)}${attr("aria-label", buttonText().next)}${attr("title", buttonText().next)}${attr("disabled", nextDisabled, true)}><i${attr_class(`${stringify(theme().icon)} ec-${stringify(button)}`)}></i></button>`);
			} else if (button === "today") {
				$$renderer.push("<!--[3-->");
				$$renderer.push(`<button${attr_class(`${stringify(theme().button)} ec-${stringify(button)}`)}${attr("disabled", todayDisabled, true)}>${escape_html(buttonText()[button])}</button>`);
			} else if (customButtons()[button]) {
				$$renderer.push("<!--[4-->");
				$$renderer.push(`<button${attr_class(clsx([
					theme().button,
					`ec-${button}`,
					customButtons()[button].active && theme().active
				]))}></button>`);
			} else if (button !== "") {
				$$renderer.push("<!--[5-->");
				$$renderer.push(`<button${attr_class(clsx([
					theme().button,
					`ec-${button}`,
					view() === button && theme().active
				]))}>${escape_html(buttonText()[button])}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/Toolbar.svelte
function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let $$d = derived(() => getContext("state")), headerToolbar = derived(() => $$d().options.headerToolbar), theme = derived(() => $$d().options.theme);
		let sections = derived(() => {
			let sections = {};
			for (let key of [
				"start",
				"center",
				"end"
			]) sections[key] = headerToolbar()[key]?.split(" ").map((group) => group.split(",")) ?? [];
			return sections;
		});
		$$renderer.push(`<nav${attr_class(theme().toolbar)}><!--[-->`);
		const each_array = ensure_array_like(keys(sections()));
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let key = each_array[$$index_1];
			$$renderer.push(`<div${attr_class(`ec-${stringify(key)}`)}><!--[-->`);
			const each_array_1 = ensure_array_like(sections()[key]);
			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let buttons = each_array_1[$$index];
				if (buttons.length > 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div${attr_class(theme().buttonGroup)}>`);
					Buttons($$renderer, { buttons });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					Buttons($$renderer, { buttons });
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></nav>`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/Calendar.svelte
function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { plugins = [], options = {} } = $$props;
		let mainState = new State(plugins, options);
		setContext("state", mainState);
		let auxComponents = derived(() => mainState.auxComponents), features = derived(() => mainState.features), events = derived(() => mainState.events), interaction = derived(() => mainState.interaction), iClass = derived(() => mainState.iClass), offset = derived(() => mainState.offset), view = derived(() => mainState.view), View = derived(() => mainState.viewComponent), date = derived(() => mainState.options.date), dateIncrement = derived(() => mainState.options.dateIncrement), duration = derived(() => mainState.options.duration), height = derived(() => mainState.options.height), hiddenDays = derived(() => mainState.options.hiddenDays), customScrollbars = derived(() => mainState.options.customScrollbars), theme = derived(() => mainState.options.theme);
		({ ...options });
		function setOption(name, value) {
			mainState.setOption(name, value, false);
			return this;
		}
		function getOption(name) {
			let value = mainState.options[name];
			return isDate(value) ? toLocalDate(value) : value;
		}
		function refetchResources() {
			mainState.fetchedRange.resources = {};
			return this;
		}
		function refetchEvents() {
			mainState.fetchedRange.events = {};
			return this;
		}
		function getEvents() {
			return events().map(toEventWithLocalDates);
		}
		function getEventById(id) {
			id = String(id);
			for (let event of events()) if (event.id === id) return toEventWithLocalDates(event);
			return null;
		}
		function addEvent(event) {
			event = createEvents([event], offset())[0];
			events().push(event);
			return toEventWithLocalDates(event);
		}
		function updateEvent(event) {
			let id = String(event.id);
			let idx = events().findIndex((event) => event.id === id);
			if (idx >= 0) {
				event = createEvents([event], offset())[0];
				events()[idx] = event;
				return toEventWithLocalDates(event);
			}
			return null;
		}
		function removeEventById(id) {
			id = String(id);
			let idx = events().findIndex((event) => event.id === id);
			if (idx >= 0) events().splice(idx, 1);
			return this;
		}
		function getView() {
			return toViewWithLocalDates(view());
		}
		function unselect() {
			interaction().action?.unselect();
			return this;
		}
		function dateFromPoint(x, y) {
			let dayEl = getElementWithPayload(x, y);
			if (dayEl) {
				let info = getPayload(dayEl)(x, y);
				info.date = toLocalDate(info.date);
				return info;
			}
			return null;
		}
		function next() {
			mainState.setOption("date", nextDate(cloneDate(date()), dateIncrement() ?? duration(), hiddenDays()));
			return this;
		}
		function prev() {
			mainState.setOption("date", prevDate(cloneDate(date()), dateIncrement() ?? duration(), hiddenDays()));
			return this;
		}
		$$renderer.push(`<div${attr_class(clsx([
			theme().calendar,
			theme().view,
			iClass() && theme()[iClass()],
			customScrollbars() && theme().customScrollbars
		]))}${attr("role", features().includes("list") ? "list" : "table")}${attr_style("", { height })}>`);
		Toolbar($$renderer, {});
		$$renderer.push(`<!----> `);
		if (View()) {
			$$renderer.push("<!--[-->");
			View()($$renderer, {});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` <!--[-->`);
		const each_array = ensure_array_like(auxComponents());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let AuxComponent = each_array[$$index];
			if (AuxComponent) {
				$$renderer.push("<!--[-->");
				AuxComponent($$renderer, {});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, {
			setOption,
			getOption,
			refetchResources,
			refetchEvents,
			getEvents,
			getEventById,
			addEvent,
			updateEvent,
			removeEventById,
			getView,
			unselect,
			dateFromPoint,
			next,
			prev
		});
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/components/BaseDay.svelte
function BaseDay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { el = void 0, date, allDay = false, resource = void 0, dateFromPoint = () => date, classes = identity, disabled = false, highlight = false, role = "cell", noIeb = false, noBeb = false, content } = $$props;
		let $$d = derived(() => getContext("state")), today = derived(() => $$d().today), action = derived(() => $$d().interaction.action), dayCellContent = derived(() => $$d().options.dayCellContent), theme = derived(() => $$d().options.theme);
		let $$d_1 = derived(() => getContext("view-state")), snap = derived(() => $$d_1().snap);
		let isToday = derived(() => datesEqual(date, today()));
		let dayContent = derived(() => isFunction(dayCellContent()) ? dayCellContent()({
			allDay,
			date: toLocalDate(date),
			isToday: isToday(),
			resource
		}) : dayCellContent());
		let classNames = derived(() => classes([
			theme().day,
			theme().weekdays?.[date.getUTCDay()],
			isToday() && theme().today,
			highlight && theme().highlight,
			disabled && theme().disabled,
			noIeb && theme().noIeb,
			noBeb && theme().noBeb
		]));
		derived(() => !disabled && action() ? (jsEvent) => action().select(jsEvent, snap()) : void 0);
		$$renderer.push(`<div${attr_class(clsx(classNames()))}${attr("role", role)}>`);
		content?.($$renderer, dayContent());
		$$renderer.push(`<!----></div>`);
		bind_props($$props, { el });
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/components/BaseEvent.svelte
function BaseEvent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { el = void 0, chunk, classes = identity, styles = identity, onpointerdown, body } = $$props, $$d = derived(() => getContext("state")), intlEventTime = derived(() => $$d().intlEventTime), resources = derived(() => $$d().resources), view = derived(() => $$d().view), displayEventEnd = derived(() => $$d().options.displayEventEnd), eventBackgroundColor$1 = derived(() => $$d().options.eventBackgroundColor), eventColor = derived(() => $$d().options.eventColor), eventContent = derived(() => $$d().options.eventContent), eventClick = derived(() => $$d().options.eventClick);
		derived(() => $$d().options.eventDidMount);
		let eventClassNames = derived(() => $$d().options.eventClassNames), eventMouseEnter = derived(() => $$d().options.eventMouseEnter), eventMouseLeave = derived(() => $$d().options.eventMouseLeave), eventTextColor$1 = derived(() => $$d().options.eventTextColor), theme = derived(() => $$d().options.theme);
		let event = derived(() => chunk.event);
		let display = derived(() => chunk.event.display);
		let bgColor = derived(() => event().backgroundColor ?? eventBackgroundColor(chunk.resource ?? findFirstResource(event(), resources())) ?? eventBackgroundColor$1() ?? eventColor());
		let txtColor = derived(() => event().textColor ?? eventTextColor(chunk.resource ?? findFirstResource(event(), resources())) ?? eventTextColor$1());
		let style = derived(() => entries(styles({
			"background-color": bgColor(),
			"color": txtColor()
		})).map((entry) => `${entry[0]}:${entry[1]}`).concat(event().styles).join(";")), classNames = derived(() => classes([bgEvent(display()) ? theme().bgEvent : theme().event, ...createEventClasses(eventClassNames(), event(), view())])), $$d_1 = derived(() => createEventContent(chunk, displayEventEnd(), eventContent(), theme(), intlEventTime(), view())), $$derived_array = derived(() => to_array($$d_1(), 2));
		derived(() => $$derived_array()[0]);
		derived(() => $$derived_array()[1]);
		function createHandler(fn, display) {
			return isFunction(fn) && !helperEvent(display) ? (jsEvent) => fn({
				event: toEventWithLocalDates(event()),
				el,
				jsEvent,
				view: toViewWithLocalDates(view())
			}) : void 0;
		}
		let onclick = derived(() => !bgEvent(display()) && createHandler(eventClick(), display()) || void 0);
		derived(() => onclick() && keyEnter(onclick()));
		derived(() => createHandler(eventMouseEnter(), display()));
		derived(() => createHandler(eventMouseLeave(), display()));
		function defaultBody($$renderer) {
			$$renderer.push(`<div${attr_class(clsx(theme().eventBody))}></div>`);
		}
		$$renderer.push(`<article${attr_class(clsx(classNames()))}${attr_style(style())}${attr("role", onclick() ? "button" : void 0)}${attr("tabindex", onclick() ? 0 : void 0)}>`);
		if (body) {
			$$renderer.push("<!--[0-->");
			body($$renderer, defaultBody, bgColor(), txtColor());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			defaultBody($$renderer);
		}
		$$renderer.push(`<!--]--></article>`);
		bind_props($$props, { el });
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/components/ColHead.svelte
function ColHead($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { date, className, weekday = true, colSpan = 1, colIndex, ariaHidden = false, disabled = false, highlight = false, cssSpan = false, children } = $$props;
		let $$d = derived(() => getContext("state")), today = derived(() => $$d().today), theme = derived(() => $$d().options.theme);
		$$renderer.push(`<div${attr_class(clsx([
			className ?? theme().colHead,
			weekday && theme().weekdays?.[date.getUTCDay()],
			weekday && datesEqual(date, today()) && theme().today,
			highlight && theme().highlight,
			disabled && theme().disabled
		]))}${attr("role", ariaHidden ? null : "columnheader")}${attr("aria-colspan", ariaHidden || colSpan <= 1 ? null : colSpan)}${attr("aria-colindex", ariaHidden ? null : colIndex)}${attr("aria-hidden", ariaHidden ? "true" : null)}${attr_style("", { "--ec-col-group-span": cssSpan ? colSpan : void 0 })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/components/DayHeader.svelte
function DayHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { date, alPrefix = "" } = $$props, $$d = derived(() => getContext("state"));
		derived(() => $$d().intlDayHeader);
		let intlDayHeaderAL = derived(() => $$d().intlDayHeaderAL);
		$$renderer.push(`<time${attr("datetime", toISOString(date, 10))}${attr("aria-label", `${stringify(alPrefix)}${stringify(intlDayHeaderAL().format(date))}`)}></time>`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/lib/components/InteractableEvent.svelte
function InteractableEvent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { el = void 0, chunk, styles, axis, forceDate, forceMargin } = $$props;
		let $$d = derived(() => getContext("state")), iClasses = derived(() => $$d().iClasses), action = derived(() => $$d().interaction.action), Resizer = derived(() => $$d().interaction.resizer);
		let $$d_1 = derived(() => getContext("view-state")), snap = derived(() => $$d_1().snap);
		let event = derived(() => chunk.event);
		let display = derived(() => chunk.event.display);
		let classes = derived(() => (classNames) => iClasses()(classNames, event()));
		function createDragHandler(event) {
			return action()?.draggable(event) ? (jsEvent) => action().drag(event, jsEvent, forceDate, forceMargin, snap()) : action()?.noAction;
		}
		let onpointerdown = derived(() => !bgEvent(display()) && !helperEvent(display()) ? createDragHandler(event()) : void 0);
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			{
				function body($$renderer, defaultBody) {
					if (Resizer()) {
						$$renderer.push("<!--[0-->");
						if (Resizer()) {
							$$renderer.push("<!--[-->");
							Resizer()($$renderer, {
								chunk,
								axis,
								forceDate,
								forceMargin,
								children: ($$renderer) => {
									defaultBody($$renderer);
									$$renderer.push(`<!---->`);
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
						defaultBody($$renderer);
						$$renderer.push(`<!---->`);
					}
					$$renderer.push(`<!--]-->`);
				}
				BaseEvent($$renderer, {
					chunk,
					classes: classes(),
					styles,
					onpointerdown: onpointerdown(),
					get el() {
						return el;
					},
					set el($$value) {
						el = $$value;
						$$settled = false;
					},
					body,
					$$slots: { body: true }
				});
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { el });
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/lib/events.js
function eventDraggable(event, $eventStartEditable, $editable) {
	return event.startEditable ?? $eventStartEditable ?? event.editable ?? $editable;
}
function eventResizable(event, $eventDurationEditable, $editable) {
	return event.durationEditable ?? $eventDurationEditable ?? event.editable ?? $editable;
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/lib/utils.js
var busy = false;
function animate(fn) {
	if (!busy) {
		busy = true;
		window.requestAnimationFrame(() => {
			fn();
			busy = false;
		});
	}
}
function limit(value, minLimit, maxLimit) {
	return max(minLimit, min(maxLimit, value));
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/state.svelte.js
var AuxState = class {
	constructor(mainState) {
		this.#setupEffects(mainState);
	}
	#setupEffects(mainState) {}
};
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/Action.svelte
function Action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mainState = getContext("state"), events = derived(() => mainState.events), iEvents = derived(() => mainState.iEvents), features = derived(() => mainState.features), view = derived(() => mainState.view), mainEl = derived(() => mainState.mainEl);
		derived(() => mainState.options.dateClick);
		let dragConstraint = derived(() => mainState.options.dragConstraint), dragScroll = derived(() => mainState.options.dragScroll), editable = derived(() => mainState.options.editable), eventStartEditable = derived(() => mainState.options.eventStartEditable), eventDragMinDistance = derived(() => mainState.options.eventDragMinDistance), eventDragStart = derived(() => mainState.options.eventDragStart);
		derived(() => mainState.options.eventDragStop);
		derived(() => mainState.options.eventDrop);
		let eventLongPressDelay = derived(() => mainState.options.eventLongPressDelay), eventResizeStart = derived(() => mainState.options.eventResizeStart);
		derived(() => mainState.options.eventResizeStop);
		derived(() => mainState.options.eventResize);
		let longPressDelay = derived(() => mainState.options.longPressDelay), resizeConstraint = derived(() => mainState.options.resizeConstraint), selectable = derived(() => mainState.options.selectable);
		derived(() => mainState.options.select);
		let selectBackgroundColor = derived(() => mainState.options.selectBackgroundColor), selectConstraint = derived(() => mainState.options.selectConstraint), selectLongPressDelay = derived(() => mainState.options.selectLongPressDelay), selectMinDistance = derived(() => mainState.options.selectMinDistance), unselectFn = derived(() => mainState.options.unselect);
		derived(() => mainState.options.unselectAuto);
		derived(() => mainState.options.unselectCancel);
		let validRange = derived(() => mainState.options.validRange);
		const ACTION_DRAG = 1;
		const ACTION_RESIZE_END = 2;
		const ACTION_RESIZE_START = 3;
		const ACTION_SELECT = 4;
		const ACTION_CLICK = 5;
		const ACTION_NO_ACTION = 6;
		let action;
		let interacting;
		let event;
		let iEvent;
		let date;
		let newDate;
		let resource;
		let newResource;
		let fromX;
		let fromY;
		let toX;
		let toY;
		let gridEl;
		let allDaySlot;
		let delta;
		let allDay;
		let iClass;
		let minResize;
		let selectStep;
		let selected;
		let viewport;
		let margin;
		let snapDuration;
		let extraDuration;
		function draggable(event) {
			return eventDraggable(event, eventStartEditable(), editable());
		}
		function drag(eventToDrag, jsEvent, forceDate, forceMargin, snap) {
			if (!action) {
				action = validJsEvent(jsEvent) ? ACTION_DRAG : ACTION_NO_ACTION;
				if (complexAction()) {
					event = eventToDrag;
					common(jsEvent, snap);
					if (forceDate) date = forceDate;
					if (forceMargin) margin = forceMargin;
					iClass = "dragging";
					move(jsEvent);
				}
			}
		}
		function resize(eventToResize, jsEvent, start, axis, forceDate, forceMargin, zeroDuration, snap) {
			if (!action) {
				action = validJsEvent(jsEvent) ? start ? ACTION_RESIZE_START : ACTION_RESIZE_END : ACTION_NO_ACTION;
				if (complexAction()) {
					event = eventToResize;
					common(jsEvent, snap);
					if (forceDate) date = forceDate;
					if (forceMargin) margin = forceMargin;
					iClass = axis === "x" ? "resizingX" : "resizingY";
					if (resizingStart()) {
						minResize = cloneDate(event.end);
						if (allDay) {
							copyTime(minResize, event.start);
							if (minResize >= event.end) subtractDay(minResize);
						} else {
							subtractDuration(minResize, snapDuration);
							if (minResize < event.start) minResize = event.start;
							date = event.start;
						}
					} else {
						minResize = cloneDate(event.start);
						if (allDay) {
							copyTime(minResize, event.end);
							if (minResize <= event.start && !zeroDuration) addDay(minResize);
						} else {
							addDuration(minResize, snapDuration);
							if (minResize > event.end) minResize = event.end;
							date = event.end;
							if (!zeroDuration) date = subtractDuration(cloneDate(date), snapDuration);
						}
						if (zeroDuration && !allDay) extraDuration = snapDuration;
					}
					move(jsEvent);
				}
			}
		}
		function select(jsEvent, snap) {
			if (!action) {
				action = validJsEvent(jsEvent) ? selectable() && !features().includes("list") ? ACTION_SELECT : ACTION_CLICK : ACTION_NO_ACTION;
				if (complexAction()) {
					common(jsEvent, snap);
					iClass = "selecting";
					selectStep = allDay ? createDuration({ day: 1 }) : snapDuration;
					event = {
						allDay,
						start: date,
						end: addDuration(cloneDate(date), selectStep),
						resourceIds: resource ? [resource.id] : []
					};
					move(jsEvent);
				}
			}
		}
		function noAction() {
			if (!action) action = ACTION_NO_ACTION;
		}
		function common(jsEvent, snap) {
			window.getSelection().removeAllRanges();
			fromX = toX = jsEvent.clientX;
			fromY = toY = jsEvent.clientY;
			snapDuration = snap?.duration;
			let dayEl = getElementWithPayload(toX, toY);
			({allDay, date, resource} = getPayload(dayEl)(toX, toY));
			allDaySlot = mainEl() !== ancestor(dayEl, 3);
			gridEl = ancestor(dayEl, 1);
			calcViewport();
			if (jsEvent.pointerType !== "mouse") setTimeout(() => {
				if (action) {
					interacting = true;
					move(jsEvent);
				}
			}, (selecting() ? selectLongPressDelay() : eventLongPressDelay()) ?? longPressDelay());
		}
		function move(jsEvent) {
			if (interacting || jsEvent && jsEvent.pointerType === "mouse" && distance() >= (selecting() ? selectMinDistance() : eventDragMinDistance())) {
				interacting = true;
				unselect(jsEvent);
				mainState.iClass = iClass;
				if (!iEvent) if (selecting()) createIEventSelect();
				else createIEvent(jsEvent, resizing() ? eventResizeStart() : eventDragStart());
				let payload = findPayload(findDayEl());
				if (payload) {
					let newAllDay;
					({allDay: newAllDay, date: newDate, resource: newResource} = payload);
					if (newAllDay === allDay) {
						let candidate = copyIEventData({}, iEvent);
						let constraintFn = resizeConstraint();
						delta = createDuration((newDate - date) / 1e3);
						if (resizingStart()) {
							candidate.start = addDuration(cloneDate(event.start), delta);
							if (candidate.start > minResize) {
								candidate.start = minResize;
								delta = createDuration((minResize - event.start) / 1e3);
							}
						} else {
							candidate.end = addDuration(cloneDate(event.end), delta);
							if (extraDuration) addDuration(candidate.end, extraDuration);
							if (resizing()) {
								if (candidate.end < minResize) {
									candidate.end = minResize;
									delta = createDuration((minResize - event.end) / 1e3);
								}
							} else if (selecting()) {
								if (candidate.end < event.end) {
									candidate.start = subtractDuration(candidate.end, selectStep);
									candidate.end = event.end;
								} else candidate.start = event.start;
								constraintFn = selectConstraint();
							} else {
								candidate.start = addDuration(cloneDate(event.start), delta);
								if (resource) {
									candidate.resourceIds = event.resourceIds.filter((id) => id !== resource.id);
									candidate.resourceIds.push(newResource.id);
								}
								constraintFn = dragConstraint();
							}
						}
						do {
							if (constraintFn !== void 0) {
								candidate = copyIEventData(cloneEvent(event), candidate);
								if (constraintFn(selecting() ? createSelectCallbackInfo(candidate, jsEvent) : createCallbackInfo(candidate, event, jsEvent)) === false) {
									updateIEvent(event);
									break;
								}
							}
							updateIEvent(candidate);
						} while (0);
					}
				}
			}
			if (dragScroll()) {
				let thresholdY = 24;
				let thresholdX = 24;
				animate(() => {
					if (viewport) {
						if (!allDaySlot) {
							if (toY < viewport.top + thresholdY) mainEl().scrollTop += max(-8, (toY - viewport.top - thresholdY) / 3);
							if (toY > viewport.bottom - thresholdY) mainEl().scrollTop += min(8, (toY - viewport.bottom + thresholdY) / 3);
						}
						if (toX < viewport.left + thresholdX) mainEl().scrollLeft += max(-8, (toX - viewport.left - thresholdX) / 3);
						if (toX > viewport.right - thresholdX) mainEl().scrollLeft += min(8, (toX - viewport.right + thresholdX) / 3);
						if (toY < thresholdY) window.scrollBy(0, max(-8, (toY - thresholdY) / 3));
						if (toY > window.innerHeight - thresholdY) window.scrollBy(0, min(8, (toY - window.innerHeight + thresholdY) / 3));
					}
				});
			}
		}
		function handleScroll() {
			if (complexAction()) {
				calcViewport();
				move();
			}
		}
		function findDayEl() {
			return getElementWithPayload(limit(toX, viewport.left, viewport.right), limit(toY, viewport.top, viewport.bottom));
		}
		function findPayload(dayEl) {
			if (dayEl) {
				let payload = getPayload(dayEl)(toX, toY);
				if (payload.disabled) {
					if (!validRange().end || payload.date < validRange().end) return findPayload(dayEl.nextElementSibling);
					if (!validRange().start || payload.date > validRange().start) return findPayload(dayEl.previousElementSibling);
				} else {
					if ((selecting() || resizing()) && payload.resource && !iEvent.resourceIds.includes(payload.resource.id) && !features().includes("timeline")) if (toX > fromX) return findPayload(dayEl.previousElementSibling);
					else return findPayload(dayEl.nextElementSibling);
					return payload;
				}
			}
			return null;
		}
		function calcViewport() {
			let mainRect = rect(mainEl());
			let gridRect = rect(gridEl);
			let scaleX = mainRect.width / mainEl().offsetWidth;
			let scaleY = mainRect.height / mainEl().offsetHeight;
			let rtl = isRtl();
			viewport = {
				left: max(0, rtl ? mainRect.right - mainEl().clientWidth * scaleX : gridRect.left + mainEl().scrollLeft * scaleX),
				right: min(document.documentElement.clientWidth, rtl ? gridRect.right + mainEl().scrollLeft * scaleX : mainRect.left + mainEl().clientWidth * scaleX) - 2,
				top: max(0, gridRect.top + (!allDaySlot ? mainEl().scrollTop : 0) * scaleY),
				bottom: min(document.documentElement.clientHeight, !allDaySlot ? mainRect.top + mainEl().clientHeight * scaleY : gridRect.bottom) - 2
			};
		}
		function createIEvent(jsEvent, callback) {
			if (isFunction(callback)) callback({
				event: toEventWithLocalDates(event),
				jsEvent,
				view: toViewWithLocalDates(view())
			});
			event.display;
			event.display = "preview";
			iEvent = cloneEvent(event);
			if (margin !== void 0) iEvent._margin = margin;
			if (extraDuration) addDuration(iEvent.end, extraDuration);
			event.display = "ghost";
			events().length = events().length;
		}
		function createIEventSelect() {
			iEvent = {
				id: "{select}",
				allDay: event.allDay,
				start: event.start,
				title: "",
				display: "preview",
				extendedProps: {},
				backgroundColor: selectBackgroundColor(),
				resourceIds: event.resourceIds,
				classNames: [],
				styles: []
			};
		}
		function destroyIEvent() {
			iEvent = void 0;
			iEvents().delete("action");
		}
		function copyIEventData(target, source) {
			target.start = source.start;
			target.end = source.end;
			target.resourceIds = source.resourceIds;
			return { ...target };
		}
		function updateIEvent(source) {
			iEvent = copyIEventData(iEvent, source);
			iEvents().set("action", iEvent);
		}
		function createSelectCallbackInfo(event, jsEvent) {
			let { start, end } = toEventWithLocalDates(event);
			return {
				start,
				end,
				startStr: toISOString(event.start),
				endStr: toISOString(event.end),
				allDay,
				view: toViewWithLocalDates(view()),
				resource,
				jsEvent
			};
		}
		function createCallbackInfo(event, oldEvent, jsEvent) {
			let info;
			if (resizing()) info = resizingStart() ? {
				startDelta: delta,
				endDelta: createDuration(0)
			} : {
				startDelta: createDuration(0),
				endDelta: delta
			};
			else info = {
				delta,
				oldResource: resource !== newResource ? resource : void 0,
				newResource: resource !== newResource ? newResource : void 0
			};
			assign(info, {
				event: toEventWithLocalDates(event),
				oldEvent: toEventWithLocalDates(oldEvent),
				view: toViewWithLocalDates(view()),
				jsEvent
			});
			return info;
		}
		function distance() {
			return Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
		}
		function resizing() {
			return action === ACTION_RESIZE_END || resizingStart();
		}
		function resizingStart() {
			return action === ACTION_RESIZE_START;
		}
		function selecting() {
			return action === ACTION_SELECT;
		}
		function complexAction() {
			return action && action < ACTION_CLICK;
		}
		function validJsEvent(jsEvent) {
			return jsEvent.isPrimary && (jsEvent.pointerType !== "mouse" || jsEvent.buttons & 1);
		}
		function unselect(jsEvent) {
			if (selected) {
				selected = false;
				destroyIEvent();
				if (isFunction(unselectFn())) unselectFn()({
					jsEvent,
					view: toViewWithLocalDates(view())
				});
			}
		}
		function noClick() {}
		bind_props($$props, {
			draggable,
			drag,
			resize,
			select,
			noAction,
			handleScroll,
			unselect,
			noClick
		});
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/Pointer.svelte
function Pointer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let $$d = derived(() => getContext("state")), iEvents = derived(() => $$d().iEvents), slotDuration = derived(() => $$d().options.slotDuration);
		let x = 0;
		let y = 0;
		let iEvent;
		function move() {
			let dayEl = getElementWithPayload(x, y);
			if (dayEl && !iEvents().has("action")) {
				let { allDay, date, resource, disabled } = getPayload(dayEl)(x, y);
				if (!disabled) {
					if (!iEvent) createPointerEvent();
					iEvent.allDay = allDay;
					iEvent.start = date;
					iEvent.end = addDuration(cloneDate(date), slotDuration());
					iEvent.resourceIds = resource ? [resource.id] : [];
					iEvents().set("pointer", { ...iEvent });
					return;
				}
			}
			removePointerEvent();
		}
		function handleScroll() {
			move();
		}
		function createPointerEvent() {
			iEvent = {
				id: "{pointer}",
				title: "",
				display: "pointer",
				extendedProps: {},
				backgroundColor: "transparent",
				classNames: [],
				styles: []
			};
		}
		function removePointerEvent() {
			iEvent = void 0;
			iEvents().delete("pointer");
		}
		bind_props($$props, { handleScroll });
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/Resizer.svelte
function Resizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chunk, axis, forceDate = void 0, forceMargin = void 0, children } = $$props, $$d = derived(() => getContext("state"));
		derived(() => $$d().interaction.action);
		let editable = derived(() => $$d().options.editable), eventDurationEditable = derived(() => $$d().options.eventDurationEditable), eventResizableFromStart = derived(() => $$d().options.eventResizableFromStart), theme = derived(() => $$d().options.theme), $$d_1 = derived(() => getContext("view-state"));
		derived(() => $$d_1().snap);
		let event = derived(() => chunk.event);
		let display = derived(() => chunk.event.display);
		let resizable = derived(() => !bgEvent(display()) && !helperEvent(display()) && eventResizable(event(), eventDurationEditable(), editable()));
		if (resizable() && eventResizableFromStart()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class(`${stringify(theme().resizer)} ${stringify(theme().start)}`)}></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----> `);
		if (resizable()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class(theme().resizer)}></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/Auxiliary.svelte
function Auxiliary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mainState = getContext("state");
		new AuxState(mainState);
		let interaction = derived(() => mainState.interaction), pointer = derived(() => mainState.options.pointer);
		interaction().resizer = Resizer;
		Action($$renderer, {});
		$$renderer.push(`<!----> `);
		if (pointer()) {
			$$renderer.push("<!--[0-->");
			Pointer($$renderer, {});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/interaction/index.js
var interaction_default = {
	createOptions(options) {
		assign(options, {
			dateClick: void 0,
			dragConstraint: void 0,
			dragScroll: true,
			editable: false,
			eventDragMinDistance: 5,
			eventDragStart: void 0,
			eventDragStop: void 0,
			eventDrop: void 0,
			eventDurationEditable: true,
			eventLongPressDelay: void 0,
			eventResizableFromStart: false,
			eventResizeStart: void 0,
			eventResizeStop: void 0,
			eventResize: void 0,
			eventStartEditable: true,
			longPressDelay: 1e3,
			pointer: false,
			resizeConstraint: void 0,
			select: void 0,
			selectBackgroundColor: void 0,
			selectConstraint: void 0,
			selectLongPressDelay: void 0,
			selectMinDistance: 5,
			snapDuration: void 0,
			unselect: void 0,
			unselectAuto: true,
			unselectCancel: ""
		});
		assign(options.theme, {
			draggable: "ec-draggable",
			ghost: "ec-ghost",
			preview: "ec-preview",
			pointer: "ec-pointer",
			resizer: "ec-resizer",
			start: "ec-start",
			dragging: "ec-dragging",
			resizingY: "ec-resizing-y",
			resizingX: "ec-resizing-x",
			selecting: "ec-selecting"
		});
	},
	initState(mainState) {
		mainState.auxComponents.push(Auxiliary);
	}
};
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/lib.js
function createChunks$1(event, days, withId = true) {
	let chunks = [];
	for (let { gridColumn, gridRow, resource, start, end, disabled } of days) if (!disabled && eventIntersects(event, start, end, resource)) {
		let chunk = createEventChunk(event, start, end);
		assign(chunk, {
			gridColumn,
			gridRow,
			resource,
			top: (chunk.start - start) / 1e3,
			height: (chunk.end - chunk.start) / 1e3,
			maxHeight: (end - chunk.start) / 1e3
		});
		if (withId) assignChunkId(chunk);
		chunks.push(chunk);
	}
	return chunks;
}
function groupChunks(chunks) {
	let groups = {};
	for (let chunk of chunks) {
		let { gridColumn } = chunk;
		let group = groups[gridColumn];
		let column = 0;
		if (group && chunk.start < group.end) {
			for (; column < group.columns.length; ++column) if (group.columns[column].at(-1).end <= chunk.start) break;
			if (chunk.end > group.end) group.end = chunk.end;
		} else group = {
			columns: [],
			end: chunk.end
		};
		if (group.columns.length < column + 1) group.columns.push([]);
		group.columns[column].push(chunk);
		groups[gridColumn] = group;
		chunk.group = group;
		chunk.groupColumn = column;
	}
}
function createAllDayContent(allDayContent) {
	let text = "all-day";
	let content;
	if (allDayContent) {
		content = isFunction(allDayContent) ? allDayContent({ text }) : allDayContent;
		if (typeof content === "string") content = { html: content };
	} else content = { html: text };
	return content;
}
function setExtensions(mainState) {
	mainState.extensions.activeRange = (start, end) => {
		let { options: { slotMaxTime } } = mainState;
		if (slotMaxTime.days || slotMaxTime.seconds > 86400) {
			addDuration(subtractDay(end), slotMaxTime);
			let start2 = subtractDay(cloneDate(end));
			if (start2 < start) start = start2;
		}
		return {
			start,
			end
		};
	};
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/options.js
/**
* TimeGrid + ResourceTimeGrid + ResourceTimeline
*/
function createTRROptions(options) {
	if (!("scrollTime" in options)) {
		assign(options, {
			columnWidth: void 0,
			flexibleSlotTimeLimits: false,
			nowIndicator: false,
			scrollTime: "06:00:00",
			slotDuration: "00:30:00",
			slotHeight: 24,
			slotLabelInterval: void 0,
			slotLabelFormat: {
				hour: "numeric",
				minute: "2-digit"
			},
			slotMaxTime: "24:00:00",
			slotMinTime: "00:00:00",
			snapDuration: void 0
		});
		assign(options.theme, {
			nowIndicator: "ec-now-indicator",
			sidebar: "ec-sidebar",
			slot: "ec-slot"
		});
	}
}
/**
* TimeGrid + ResourceTimeGrid
*/
function createTROptions(options) {
	if (!("allDaySlot" in options)) {
		assign(options, {
			allDayContent: void 0,
			allDaySlot: true,
			slotEventOverlap: true
		});
		assign(options.theme, { allDay: "ec-all-day" });
	}
}
/**
* TimeGrid + ResourceTimeGrid + ResourceTimeline
*/
function createTRRParsers(parsers) {
	if (!("scrollTime" in parsers)) assign(parsers, {
		scrollTime: createDuration,
		slotDuration: createDuration,
		slotLabelInterval: undefinedOr(createDuration),
		slotMaxTime: createDuration,
		slotMinTime: createDuration,
		snapDuration: undefinedOr(createDuration)
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/derived.js
function grid$2(mainState, viewState) {
	return () => {
		let { viewDates, options: { highlightedDates, validRange } } = mainState;
		let { slotTimeLimits } = viewState;
		let days = [];
		run(() => {
			let gridColumn = 1;
			for (let date of viewDates) {
				days.push({
					gridColumn,
					gridRow: 1,
					resource: void 0,
					start: addDuration(cloneDate(date), slotTimeLimits.min),
					end: addDuration(cloneDate(date), slotTimeLimits.max),
					dayStart: date,
					dayEnd: addDay(cloneDate(date)),
					disabled: outsideRange(date, validRange),
					highlight: highlightedDates.some((d) => datesEqual(d, date))
				});
				++gridColumn;
			}
		});
		return [days];
	};
}
function eventChunks$1(mainState, viewState) {
	return () => {
		let { filteredEvents } = mainState;
		let { grid } = viewState;
		let chunks = [];
		let bgChunks = [];
		let allDayChunks = [];
		let allDayBgChunks = [];
		run(() => {
			for (let event of filteredEvents) for (let days of grid) if (bgEvent(event.display)) {
				bgChunks = bgChunks.concat(createChunks$1(event, days));
				if (event.allDay) allDayBgChunks = allDayBgChunks.concat(createAllDayChunks(event, days));
			} else if (event.allDay) allDayChunks = allDayChunks.concat(createAllDayChunks(event, days));
			else chunks = chunks.concat(createChunks$1(event, days));
			groupChunks(chunks);
			prepareAllDayChunks(allDayChunks);
		});
		return {
			chunks,
			bgChunks,
			allDayChunks,
			allDayBgChunks
		};
	};
}
function iEventChunks$1(mainState, viewState) {
	return () => {
		let { iEvents } = mainState;
		let { grid } = viewState;
		let iChunks = [];
		let allDayIChunks = [];
		for (let [, event] of iEvents) {
			if (!event) continue;
			run(() => {
				for (let days of grid) if (event.allDay) allDayIChunks = allDayIChunks.concat(createAllDayChunks(event, days, false));
				else iChunks = iChunks.concat(createChunks$1(event, days, false));
			});
		}
		return {
			iChunks,
			allDayIChunks
		};
	};
}
function slotTimeLimits(mainState) {
	return () => {
		let { filteredEvents, viewDates, options: { flexibleSlotTimeLimits, slotMinTime, slotMaxTime } } = mainState;
		let limits;
		run(() => {
			limits = createSlotTimeLimits(slotMinTime, slotMaxTime, flexibleSlotTimeLimits, viewDates, filteredEvents);
		});
		return limits;
	};
}
function slotLabelPeriodicity(mainState) {
	return () => {
		let { options: { slotDuration, slotLabelInterval } } = mainState;
		let periodicity;
		run(() => {
			periodicity = slotLabelInterval === void 0 ? toSeconds(slotDuration) < 3600 ? 2 : 1 : ceil(toSeconds(slotLabelInterval) / toSeconds(slotDuration)) || 1;
		});
		return periodicity;
	};
}
function slots(mainState, viewState) {
	return () => {
		let { offset, options: { slotDuration } } = mainState;
		let { intlSlotLabel, slotLabelPeriodicity, slotTimeLimits } = viewState;
		let slots;
		run(() => {
			slots = createSlots(setMidnight(createDate(void 0, offset)), slotDuration, slotLabelPeriodicity, slotTimeLimits, intlSlotLabel);
		});
		return slots;
	};
}
function snap(mainState) {
	return () => {
		let { options: { slotDuration, snapDuration } } = mainState;
		snapDuration ??= slotDuration;
		return {
			duration: snapDuration,
			ratio: toSeconds(snapDuration) / toSeconds(slotDuration)
		};
	};
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/state.svelte.js
function TRRState() {
	return class {
		#intlSlotLabel;
		get intlSlotLabel() {
			return this.#intlSlotLabel();
		}
		set intlSlotLabel($$value) {
			return this.#intlSlotLabel($$value);
		}
		#slotLabelPeriodicity;
		get slotLabelPeriodicity() {
			return this.#slotLabelPeriodicity();
		}
		set slotLabelPeriodicity($$value) {
			return this.#slotLabelPeriodicity($$value);
		}
		#snap;
		get snap() {
			return this.#snap();
		}
		set snap($$value) {
			return this.#snap($$value);
		}
		constructor(mainState) {
			this.#intlSlotLabel = derived(intl(mainState, "slotLabelFormat"));
			this.#slotLabelPeriodicity = derived(slotLabelPeriodicity(mainState));
			this.sidebarWidth = 0;
			this.#snap = derived(snap(mainState));
		}
	};
}
/**
* TimeGrid + ResourceTimeGrid
*/
function TRState(Base) {
	return class extends Base {
		#slotTimeLimits;
		get slotTimeLimits() {
			return this.#slotTimeLimits();
		}
		set slotTimeLimits($$value) {
			return this.#slotTimeLimits($$value);
		}
		#slots;
		get slots() {
			return this.#slots();
		}
		set slots($$value) {
			return this.#slots($$value);
		}
		#chunks;
		get chunks() {
			return this.#chunks();
		}
		set chunks($$value) {
			return this.#chunks($$value);
		}
		#bgChunks;
		get bgChunks() {
			return this.#bgChunks();
		}
		set bgChunks($$value) {
			return this.#bgChunks($$value);
		}
		#allDayChunks;
		get allDayChunks() {
			return this.#allDayChunks();
		}
		set allDayChunks($$value) {
			return this.#allDayChunks($$value);
		}
		#allDayBgChunks;
		get allDayBgChunks() {
			return this.#allDayBgChunks();
		}
		set allDayBgChunks($$value) {
			return this.#allDayBgChunks($$value);
		}
		#iChunks;
		get iChunks() {
			return this.#iChunks();
		}
		set iChunks($$value) {
			return this.#iChunks($$value);
		}
		#allDayIChunks;
		get allDayIChunks() {
			return this.#allDayIChunks();
		}
		set allDayIChunks($$value) {
			return this.#allDayIChunks($$value);
		}
		constructor(mainState) {
			super(mainState);
			this.#slotTimeLimits = derived(slotTimeLimits(mainState));
			this.#slots = derived(slots(mainState, this));
			let $$d = derived(eventChunks$1(mainState, this)), chunks = derived(() => $$d().chunks), bgChunks = derived(() => $$d().bgChunks), allDayChunks = derived(() => $$d().allDayChunks), allDayBgChunks = derived(() => $$d().allDayBgChunks);
			this.#chunks = derived(chunks);
			this.#bgChunks = derived(bgChunks);
			this.#allDayChunks = derived(allDayChunks);
			this.#allDayBgChunks = derived(allDayBgChunks);
			let $$d_1 = derived(iEventChunks$1(mainState, this)), iChunks = derived(() => $$d_1().iChunks), allDayIChunks = derived(() => $$d_1().allDayIChunks);
			this.#iChunks = derived(iChunks);
			this.#allDayIChunks = derived(allDayIChunks);
		}
	};
}
var ViewState$2 = class extends TRState(TRRState()) {
	#grid;
	get grid() {
		return this.#grid();
	}
	set grid($$value) {
		return this.#grid($$value);
	}
	constructor(mainState) {
		super(mainState);
		this.#grid = derived(grid$2(mainState, this));
	}
};
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/Day.svelte
function Day($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { day, allDay = false, noIeb, noBeb } = $$props;
		let $$d = derived(() => getContext("state")), slotHeight = derived(() => $$d().options.slotHeight);
		let $$d_1 = derived(() => getContext("view-state")), snap = derived(() => $$d_1().snap);
		let date = derived(() => day.dayStart), start = derived(() => day.start), resource = derived(() => day.resource), disabled = derived(() => day.disabled), highlight = derived(() => day.highlight);
		let el = void 0;
		function dateFromPoint(x, y) {
			if (allDay) return date();
			else {
				let dayRect = rect(el);
				let scaleY = dayRect.height / el.offsetHeight;
				return addDuration(cloneDate(start()), snap().duration, floor((y - dayRect.top) / (slotHeight() * snap().ratio * scaleY)));
			}
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			BaseDay($$renderer, {
				date: date(),
				allDay,
				resource: resource(),
				dateFromPoint,
				disabled: disabled(),
				highlight: highlight(),
				noIeb,
				noBeb,
				get el() {
					return el;
				},
				set el($$value) {
					el = $$value;
					$$settled = false;
				}
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
//#region node_modules/@event-calendar/core/src/plugins/time-grid/Event.svelte
function Event($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chunk } = $$props;
		let $$d = derived(() => getContext("state")), slotEventOverlap = derived(() => $$d().options.slotEventOverlap), slotDuration = derived(() => $$d().options.slotDuration), slotHeight = derived(() => $$d().options.slotHeight);
		InteractableEvent($$renderer, {
			chunk,
			styles: derived(() => (style) => {
				let step = toSeconds(slotDuration());
				let top = chunk.top / step * slotHeight();
				let height = chunk.height / step * slotHeight() || slotHeight();
				let maxHeight = chunk.maxHeight / step * slotHeight();
				style["grid-column"] = chunk.gridColumn;
				style["inset-block-start"] = `${top}px`;
				style["min-block-size"] = `${height}px`;
				style["block-size"] = `${height}px`;
				style["max-block-size"] = `${maxHeight}px`;
				let maxWidth = "100% - var(--ec-event-col-gap)";
				if (chunk.group) {
					let groupColumns = chunk.group.columns.length;
					style["z-index"] = `${chunk.groupColumn + 1}`;
					style["inset-inline-start"] = `calc((${maxWidth}) / ${groupColumns} * ${chunk.groupColumn})`;
					style["inline-size"] = `calc((${maxWidth}) / ${groupColumns} * ${slotEventOverlap() ? .5 * (1 + groupColumns - chunk.groupColumn) : 1})`;
				}
				return style;
			})(),
			axis: "y"
		});
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/AllDayEvent.svelte
function AllDayEvent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chunk } = $$props;
		let el = void 0;
		let margin = 0;
		let event = derived(() => chunk.event);
		let styles = derived(() => (style) => {
			style["grid-column"] = `${chunk.gridColumn} / span ${chunk.dates.length}`;
			if (margin || event()._margin) style["margin-block-start"] = `${event()._margin ?? margin}px`;
			return style;
		});
		function reposition() {
			margin = repositionEvent(chunk, height(el));
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			InteractableEvent($$renderer, {
				chunk,
				styles: styles(),
				axis: "x",
				forceMargin: margin,
				get el() {
					return el;
				},
				set el($$value) {
					el = $$value;
					$$settled = false;
				}
			});
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { reposition });
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/NowIndicator.svelte
function NowIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { days, span = 1 } = $$props;
		let $$d = derived(() => getContext("state")), mainEl = derived(() => $$d().mainEl), now = derived(() => $$d().now), today = derived(() => $$d().today), slotDuration = derived(() => $$d().options.slotDuration), slotHeight = derived(() => $$d().options.slotHeight), theme = derived(() => $$d().options.theme);
		let $$d_1 = derived(() => getContext("view-state")), sidebarWidth = derived(() => $$d_1().sidebarWidth);
		let $$d_2 = derived(() => {
			for (let day of days) if (datesEqual(day.dayStart, today())) return day;
			return {};
		}), gridColumn = derived(() => $$d_2().gridColumn), start = derived(() => $$d_2().start), end = derived(() => $$d_2().end);
		let top = derived(() => {
			if (now() < start() || now() > end()) return null;
			let step = toSeconds(slotDuration());
			return (now() - start()) / 1e3 / step * slotHeight();
		});
		derived(() => ({
			root: mainEl(),
			rootMargin: isRtl() ? `0px -${sidebarWidth() + 5.5}px 0px 0px` : `0px 0px 0px -${sidebarWidth() + 5.5}px`,
			threshold: 0
		}));
		if (gridColumn() && top() !== null) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class(theme().nowIndicator)}${attr_style("", {
				"grid-column": `${stringify(gridColumn() + 1)} / span ${stringify(span)}`,
				"inset-block-start": `${stringify(top())}px`
			})}></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/View.svelte
function View($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { header, nowIndicator, viewState } = $$props;
		let mainState = getContext("state");
		if (!viewState) viewState = new ViewState$2(mainState);
		setContext("view-state", viewState);
		derived(() => mainState.mainEl);
		derived(() => mainState.viewDates);
		let allDayContent = derived(() => mainState.options.allDayContent), allDaySlot = derived(() => mainState.options.allDaySlot), columnWidth = derived(() => mainState.options.columnWidth), showNowIndicator = derived(() => mainState.options.nowIndicator);
		derived(() => mainState.options.scrollTime);
		let slotHeight = derived(() => mainState.options.slotHeight);
		derived(() => mainState.options.slotDuration);
		let theme = derived(() => mainState.options.theme), allDayChunks = derived(() => viewState.allDayChunks), allDayBgChunks = derived(() => viewState.allDayBgChunks), allDayIChunks = derived(() => viewState.allDayIChunks), bgChunks = derived(() => viewState.bgChunks), chunks = derived(() => viewState.chunks), iChunks = derived(() => viewState.iChunks), grid = derived(() => viewState.grid), sidebarWidth = derived(() => viewState.sidebarWidth), slots = derived(() => viewState.slots), slotLabelPeriodicity = derived(() => viewState.slotLabelPeriodicity);
		derived(() => viewState.slotTimeLimits);
		let headerHeight = 0;
		derived(() => createAllDayContent(allDayContent()));
		if (!empty(grid()) && !empty(grid()[0])) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section${attr_class(theme().main)}${attr_style("", {
				"--ec-grid-cols": length(grid()) * length(grid()[0]),
				"--ec-col-group-span": length(grid()[0]),
				"--ec-col-width": columnWidth() ?? "minmax(0, 1fr)",
				"--ec-slot-label-periodicity": slotLabelPeriodicity(),
				"--ec-slot-height": `${stringify(slotHeight())}px`,
				"--ec-header-height": `${stringify(headerHeight)}px`,
				"--ec-sidebar-width": `${stringify(sidebarWidth())}px`
			})}><header${attr_class(theme().header)}><aside${attr_class(theme().sidebar)}></aside> <div${attr_class(theme().grid)} role="row">`);
			if (header) {
				$$renderer.push("<!--[0-->");
				header($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(grid()[0]);
				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let { dayStart: date, disabled, highlight } = each_array[i];
					ColHead($$renderer, {
						date,
						colIndex: 1 + i,
						disabled,
						highlight,
						children: ($$renderer) => {
							DayHeader($$renderer, { date });
						},
						$$slots: { default: true }
					});
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (allDaySlot()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class(theme().allDay)}><aside${attr_class(theme().sidebar)}></aside> <div${attr_class(theme().grid)} role="row"><!--[-->`);
				const each_array_1 = ensure_array_like(grid());
				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let days = each_array_1[i];
					$$renderer.push(`<!--[-->`);
					const each_array_2 = ensure_array_like(days);
					for (let j = 0, $$length = each_array_2.length; j < $$length; j++) {
						let day = each_array_2[j];
						Day($$renderer, {
							day,
							allDay: true,
							noIeb: i + 1 === length(grid()) && j + 1 === length(days)
						});
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div> <div${attr_class(theme().events)}><!--[-->`);
				const each_array_3 = ensure_array_like(allDayChunks());
				for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
					let chunk = each_array_3[i];
					AllDayEvent($$renderer, { chunk });
				}
				$$renderer.push(`<!--]--> <!--[-->`);
				const each_array_4 = ensure_array_like(allDayBgChunks());
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let chunk = each_array_4[$$index_4];
					AllDayEvent($$renderer, { chunk });
				}
				$$renderer.push(`<!--]--> <!--[-->`);
				const each_array_5 = ensure_array_like(allDayIChunks());
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let chunk = each_array_5[$$index_5];
					AllDayEvent($$renderer, { chunk });
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></header> <div${attr_class(theme().body)} role="rowgroup"><aside${attr_class(theme().sidebar)} aria-hidden="true"><!--[-->`);
			const each_array_6 = ensure_array_like(slots());
			for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
				let slot = each_array_6[i];
				$$renderer.push(`<div${attr_class(clsx([theme().slot, !i && theme().hidden]))}${attr_style("", { "--ec-slot-label-periodicity": slot[2] })}><time${attr("datetime", slot[0])}></time></div>`);
			}
			$$renderer.push(`<!--]--></aside> <div${attr_class(theme().grid)} role="row"><!--[-->`);
			const each_array_7 = ensure_array_like(grid());
			for (let i = 0, $$length = each_array_7.length; i < $$length; i++) {
				let days = each_array_7[i];
				$$renderer.push(`<!--[-->`);
				const each_array_8 = ensure_array_like(days);
				for (let j = 0, $$length = each_array_8.length; j < $$length; j++) {
					let day = each_array_8[j];
					Day($$renderer, {
						day,
						noIeb: i + 1 === length(grid()) && j + 1 === length(days),
						noBeb: true
					});
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> <div${attr_class(theme().events)}><!--[-->`);
			const each_array_9 = ensure_array_like(chunks());
			for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
				let chunk = each_array_9[$$index_9];
				Event($$renderer, { chunk });
			}
			$$renderer.push(`<!--]--> <!--[-->`);
			const each_array_10 = ensure_array_like(bgChunks());
			for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
				let chunk = each_array_10[$$index_10];
				Event($$renderer, { chunk });
			}
			$$renderer.push(`<!--]--> <!--[-->`);
			const each_array_11 = ensure_array_like(iChunks());
			for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
				let chunk = each_array_11[$$index_11];
				Event($$renderer, { chunk });
			}
			$$renderer.push(`<!--]--></div></div> `);
			if (showNowIndicator()) {
				$$renderer.push("<!--[0-->");
				if (nowIndicator) {
					$$renderer.push("<!--[0-->");
					nowIndicator($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push("<!--[-1-->");
					NowIndicator($$renderer, { days: grid()[0] });
				}
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region node_modules/@event-calendar/core/src/plugins/time-grid/index.js
var time_grid_default = {
	createOptions(options) {
		createTRROptions(options);
		createTROptions(options);
		assign(options.buttonText, {
			timeGridDay: "day",
			timeGridWeek: "week"
		});
		assign(options, { view: "timeGridWeek" });
		assign(options.views, {
			timeGridDay: {
				buttonText: btnTextDay,
				component: initViewComponent,
				dayHeaderFormat: { weekday: "long" },
				duration: { days: 1 },
				theme: themeView("ec-time-grid ec-day-view"),
				titleFormat: {
					year: "numeric",
					month: "long",
					day: "numeric"
				}
			},
			timeGridWeek: {
				buttonText: btnTextWeek,
				component: initViewComponent,
				duration: { weeks: 1 },
				theme: themeView("ec-time-grid ec-week-view")
			}
		});
	},
	createParsers(parsers) {
		createTRRParsers(parsers);
	}
};
function initViewComponent(mainState) {
	setExtensions(mainState);
	return View;
}
//#endregion
//#region src/lib/features/live/components/LiveClassModalShell.svelte
function LiveClassModalShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, onClose, title, icon = "edit_calendar", iconColor = "var(--sky-strong)", children, wide = false } = $$props;
		function handleOpenChange(next) {
			if (!next) {
				open = false;
				onClose?.();
			}
		}
		const contentClass = derived(() => `hb-dialog-content ${wide ? "hb-dialog-content--wide" : ""}`);
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (Dialog) {
				$$renderer.push("<!--[-->");
				Dialog($$renderer, {
					onOpenChange: handleOpenChange,
					get open() {
						return open;
					},
					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						if (Portal) {
							$$renderer.push("<!--[-->");
							Portal($$renderer, {
								children: ($$renderer) => {
									if (Dialog_overlay) {
										$$renderer.push("<!--[-->");
										Dialog_overlay($$renderer, {
											class: "hb-dialog-overlay",
											"data-state": open ? "open" : "closed"
										});
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
									$$renderer.push(` `);
									if (Dialog_content) {
										$$renderer.push("<!--[-->");
										Dialog_content($$renderer, {
											class: contentClass(),
											"aria-label": title,
											children: ($$renderer) => {
												$$renderer.push(`<div class="modal-header svelte-1x8z7yc"><span class="material-symbols-rounded header-icon svelte-1x8z7yc"${attr_style("", { color: iconColor })}>${escape_html(icon)}</span> <h2 class="modal-title svelte-1x8z7yc">${escape_html(title)}</h2> <button class="close-button svelte-1x8z7yc" aria-label="סגור"><span class="material-symbols-rounded">close</span></button></div> <div class="modal-body svelte-1x8z7yc">`);
												children($$renderer);
												$$renderer.push(`<!----></div>`);
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
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { open });
	});
}
//#endregion
//#region src/lib/components/ui/Slider.svelte
function Slider_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = 0, min = 0, max = 100, step = 1, label, disabled = false } = $$props;
		const displayValue = derived(() => value);
		function updateValue(v) {
			value = v;
		}
		$$renderer.push(`<div class="hb-slider"><span class="hb-slider__label">${escape_html(label)}</span> <span class="hb-slider__value">${escape_html(displayValue())}</span> `);
		if (Slider) {
			$$renderer.push("<!--[-->");
			Slider($$renderer, {
				class: "hb-slider__root",
				type: "single",
				min,
				max,
				step,
				disabled,
				value,
				onValueChange: updateValue,
				"aria-label": label,
				children: ($$renderer) => {
					$$renderer.push(`<span class="hb-slider__track">`);
					if (Slider_range) {
						$$renderer.push("<!--[-->");
						Slider_range($$renderer, { class: "hb-slider__range" });
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
					$$renderer.push(`</span> `);
					if (Slider_thumb) {
						$$renderer.push("<!--[-->");
						Slider_thumb($$renderer, {
							class: "hb-slider__thumb",
							index: 0
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
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/components/ui/DatePicker.svelte
function DatePicker_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, label, disabled = false, onchange } = $$props;
		function updateValue(next) {
			value = next;
			onchange?.(next);
		}
		function initPlaceholder() {
			const today = /* @__PURE__ */ new Date();
			return new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
		}
		$$renderer.push(`<div class="hb-date-picker"><span class="hb-date-picker__label">${escape_html(label)}</span> `);
		if (Date_picker) {
			$$renderer.push("<!--[-->");
			Date_picker($$renderer, {
				value,
				placeholder: initPlaceholder(),
				onValueChange: updateValue,
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							$$renderer.push(`<button${attributes({
								...props,
								type: "button",
								class: "hb-date-picker__trigger"
							})}><span class="hb-date-picker__value">${escape_html(value ? value.toString() : "בחרו תאריך")}</span> <span class="material-symbols-rounded" aria-hidden="true">calendar_today</span></button>`);
						}
						if (Date_picker_trigger) {
							$$renderer.push("<!--[-->");
							Date_picker_trigger($$renderer, {
								class: "hb-date-picker__trigger",
								disabled,
								child,
								$$slots: { child: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
					}
					$$renderer.push(` `);
					if (Portal) {
						$$renderer.push("<!--[-->");
						Portal($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { wrapperProps, props, open }) {
										if (open) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...props })}>`);
											{
												function child($$renderer, { props: calProps, months }) {
													$$renderer.push(`<div${attributes({ ...calProps })}>`);
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
												if (Date_picker_calendar) {
													$$renderer.push("<!--[-->");
													Date_picker_calendar($$renderer, {
														class: "hb-calendar",
														child,
														$$slots: { child: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
											}
											$$renderer.push(`</div></div>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]-->`);
									}
									if (Date_picker_content) {
										$$renderer.push("<!--[-->");
										Date_picker_content($$renderer, {
											class: "hb-date-picker__content",
											child,
											$$slots: { child: true }
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
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(`</div>`);
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/components/ui/NativeTimePicker.svelte
function NativeTimePicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = "09:00", label, disabled = false, onchange } = $$props;
		$$renderer.push(`<div class="hb-input-field"><span class="hb-input-field__label">${escape_html(label)}</span> <input type="time" class="hb-input svelte-1rtt28j"${attr("disabled", disabled, true)}${attr("value", value)} step="60"/></div>`);
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/features/live/components/EditLiveClassForm.svelte
function EditLiveClassForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { liveClass, onSubmit, onCancel, onDelete, onEndLive, submitting = false } = $$props;
		function formatLocalDate(ts) {
			const d = new Date(ts);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		}
		function formatLocalTime(ts) {
			const d = new Date(ts);
			return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
		}
		let editTitle = "";
		let editDescription = "";
		let editTime = "";
		let editDuration = 60;
		let editJoinOpens = 10;
		let editCapacity = 12;
		let editEquipment = [];
		let editDateValue = void 0;
		const endTimeDisplay = derived(() => {
			const [h, m] = editTime.split(":").map(Number);
			const end = new Date(new Date(2e3, 0, 1, h, m).getTime() + editDuration * 6e4);
			const pad = (n) => String(n).padStart(2, "0");
			return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (liveClass.status === "ended") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="ended-class-details svelte-1kb5poz"><div class="read-only-banner svelte-1kb5poz"><span class="material-symbols-rounded completed-tick svelte-1kb5poz">check_circle</span> <div class="banner-text svelte-1kb5poz"><h3 class="svelte-1kb5poz">השיעור הושלם בהצלחה</h3> <p class="svelte-1kb5poz">שיעורים שהסתיימו נעולים לעריכה מטעמי שלמות היסטוריית אימונים וקרדיטים.</p></div></div> <div class="details-section svelte-1kb5poz"><div class="detail-row svelte-1kb5poz"><span class="detail-label svelte-1kb5poz">שם השיעור:</span> <span class="detail-value svelte-1kb5poz">${escape_html(liveClass.title)}</span></div> <div class="detail-row svelte-1kb5poz"><span class="detail-label svelte-1kb5poz">מועד השידור:</span> <span class="detail-value svelte-1kb5poz">${escape_html(formatLocalDate(liveClass.startsAt))} בשעה ${escape_html(formatLocalTime(liveClass.startsAt))}</span></div> <div class="detail-row svelte-1kb5poz"><span class="detail-label svelte-1kb5poz">משך השיעור:</span> <span class="detail-value svelte-1kb5poz">${escape_html(durationLabel(Math.round((liveClass.endsAt - liveClass.startsAt) / 6e4)))}</span></div> <div class="detail-row svelte-1kb5poz"><span class="detail-label svelte-1kb5poz">סוג שידור:</span> <span class="detail-value svelte-1kb5poz">${escape_html(liveClass.type === "one_on_one" ? "אימון אישי 1:1" : "שיעור קבוצתי")}</span></div></div> <div class="modal-actions svelte-1kb5poz">`);
				Button_1($$renderer, {
					tone: "ink",
					type: "button",
					onclick: onCancel,
					disabled: submitting,
					children: ($$renderer) => {
						$$renderer.push(`<!---->סגור פרטים`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<form class="edit-form svelte-1kb5poz"><div class="form-grid svelte-1kb5poz"><div class="hb-input-field span-2 svelte-1kb5poz"><span class="hb-input-field__label">כותרת</span> <input class="hb-input"${attr("value", editTitle)} required=""${attr("disabled", submitting, true)} maxlength="120"/></div> <div class="hb-input-field span-2 svelte-1kb5poz"><span class="hb-input-field__label">תיאור</span> <textarea class="hb-textarea" rows="2"${attr("disabled", submitting, true)} maxlength="500">`);
				const $$body = escape_html(editDescription);
				if ($$body) $$renderer.push(`${$$body}`);
				$$renderer.push(`</textarea></div> <div class="form-row-split span-2 svelte-1kb5poz">`);
				DatePicker_1($$renderer, {
					label: "תאריך",
					disabled: submitting,
					get value() {
						return editDateValue;
					},
					set value($$value) {
						editDateValue = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----> `);
				NativeTimePicker($$renderer, {
					label: "שעת התחלה",
					disabled: submitting,
					get value() {
						return editTime;
					},
					set value($$value) {
						editTime = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----></div> <div class="form-row-split span-2 svelte-1kb5poz"><div class="hb-input-field"><span class="hb-input-field__label">משך (דקות)</span> `);
				Slider_1($$renderer, {
					label: "משך",
					min: 15,
					max: 180,
					step: 5,
					get value() {
						return editDuration;
					},
					set value($$value) {
						editDuration = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----> <span class="duration-badge svelte-1kb5poz">${escape_html(durationLabel(editDuration))}</span></div> <div class="hb-input-field"><span class="hb-input-field__label">עד</span> <div class="end-time-box svelte-1kb5poz">${escape_html(endTimeDisplay())}</div></div></div> <div class="form-row-split span-2 svelte-1kb5poz"><div class="hb-input-field"><span class="hb-input-field__label">פתיחת כניסה (דקות לפני)</span> `);
				Slider_1($$renderer, {
					label: "פתיחה",
					min: 0,
					max: 60,
					step: 5,
					get value() {
						return editJoinOpens;
					},
					set value($$value) {
						editJoinOpens = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----> <span class="duration-badge svelte-1kb5poz">${escape_html(editJoinOpens)} דק׳</span></div> <div class="hb-input-field"><span class="hb-input-field__label">קיבולת</span> `);
				if (liveClass.type === "one_on_one") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="one-on-one-badge svelte-1kb5poz">1 משתתפת (אישי)</div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					Slider_1($$renderer, {
						label: "קיבולת",
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return editCapacity;
						},
						set value($$value) {
							editCapacity = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <span class="duration-badge svelte-1kb5poz">${escape_html(editCapacity)} מקומות</span>`);
				}
				$$renderer.push(`<!--]--></div></div> <div class="form-field-group span-2 svelte-1kb5poz"><span class="field-group-label svelte-1kb5poz">ציוד נדרש</span> `);
				EquipmentPicker($$renderer, {
					get selected() {
						return editEquipment;
					},
					set selected($$value) {
						editEquipment = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----></div></div> <div class="modal-actions svelte-1kb5poz">`);
				if (liveClass.status === "live") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="live-action-buttons svelte-1kb5poz">`);
					Button_1($$renderer, {
						tone: "ink",
						type: "button",
						onclick: onEndLive,
						disabled: submitting,
						children: ($$renderer) => {
							$$renderer.push(`<!---->לסיים שידור`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!----> <span class="live-badge-glow svelte-1kb5poz">🔴 שידור חי פעיל</span></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					Button_1($$renderer, {
						tone: "ink",
						type: "submit",
						disabled: submitting,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(submitting ? "מעדכן..." : "שמירת שינויים")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!----> `);
					Button_1($$renderer, {
						tone: "danger",
						type: "button",
						onclick: onDelete,
						disabled: submitting,
						children: ($$renderer) => {
							$$renderer.push(`<!---->ביטול שיעור`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!---->`);
				}
				$$renderer.push(`<!--]--> `);
				Button_1($$renderer, {
					tone: "paper",
					type: "button",
					onclick: onCancel,
					disabled: submitting,
					children: ($$renderer) => {
						$$renderer.push(`<!---->ביטול`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div></form>`);
			}
			$$renderer.push(`<!--]-->`);
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
//#region src/lib/features/live/components/WeeklyAgenda.svelte
function WeeklyAgenda($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { classes, onStart, onEnd, actionId, onSelectSlot, onRefreshClasses } = $$props;
		const client = useConvexClient();
		let activeEditClass = null;
		let submitting = false;
		let editError = "";
		function formatLocalTime(ts) {
			const d = new Date(ts);
			return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
		}
		function toDateTimeLocal(date) {
			const pad = (value) => String(value).padStart(2, "0");
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}
		function escapeHtml(str) {
			return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
		}
		async function submitReschedule(data) {
			if (!activeEditClass) return;
			editError = "";
			submitting = true;
			try {
				await client.mutation(api.instructorLive.rescheduleLiveClass, {
					liveClassId: activeEditClass._id,
					startsAt: data.startsAt,
					durationMinutes: data.durationMinutes,
					joinOpensMinutesBefore: data.joinOpensMinutesBefore,
					capacity: data.capacity,
					requiredEquipment: data.requiredEquipment,
					title: data.title,
					description: data.description
				});
				activeEditClass = null;
				await onRefreshClasses();
			} catch (err) {
				editError = err instanceof Error ? err.message : "לא הצלחנו לעדכן את השיעור.";
			} finally {
				submitting = false;
			}
		}
		async function submitCancellation() {
			if (!activeEditClass) return;
			if (!confirm("האם את בטוחה שברצונך לבטל שיעור זה? כל הרשמות המנויות יבוטלו ויזוכו בקרדיט באופן אוטומטי.")) return;
			editError = "";
			submitting = true;
			try {
				await client.mutation(api.instructorLive.cancelLiveClass, { liveClassId: activeEditClass._id });
				activeEditClass = null;
				await onRefreshClasses();
			} catch (err) {
				editError = err instanceof Error ? err.message : "לא הצלחנו לבטל את השיעור.";
			} finally {
				submitting = false;
			}
		}
		async function handleDragDropReschedule(liveClassId, newStartsAt, newEndsAt) {
			const orig = classes.find((c) => c._id === liveClassId);
			if (!orig) return;
			const durationMinutes = Math.round((newEndsAt - newStartsAt) / (1e3 * 60));
			try {
				await client.mutation(api.instructorLive.rescheduleLiveClass, {
					liveClassId,
					startsAt: newStartsAt,
					durationMinutes,
					joinOpensMinutesBefore: orig.joinOpensMinutesBefore ?? 10,
					capacity: orig.capacity,
					requiredEquipment: orig.requiredEquipment,
					title: orig.title,
					description: orig.description
				});
				await onRefreshClasses();
			} catch (err) {
				editError = err instanceof Error ? err.message : "לא הצלחנו לעדכן את השיעור.";
				await onRefreshClasses();
			}
		}
		const plugins = [time_grid_default, interaction_default];
		const calendarOptions = derived(() => ({
			view: "timeGridWeek",
			locale: "he",
			direction: "rtl",
			firstDay: 0,
			slotMinTime: "00:00:00",
			slotMaxTime: "24:00:00",
			allDaySlot: false,
			headerToolbar: {
				start: "today prev,next",
				center: "title",
				end: ""
			},
			buttonText: { today: "היום" },
			height: "calc(100vh - 260px)",
			slotDuration: "00:30:00",
			slotLabelInterval: "01:00:00",
			slotEventOverlap: false,
			selectable: true,
			unselectAuto: true,
			editable: true,
			selectBackgroundColor: "rgba(59, 130, 246, 0.35)",
			events: classes.filter((c) => c.status !== "cancelled").map((c) => ({
				id: c._id,
				title: c.title,
				start: new Date(c.startsAt).toISOString(),
				end: new Date(c.endsAt).toISOString(),
				editable: c.status === "scheduled" || c.status === "live",
				startEditable: c.status === "scheduled" || c.status === "live",
				durationEditable: c.status === "scheduled" || c.status === "live",
				className: `ec-event-status--${c.status}`,
				extendedProps: { originalClass: c }
			})),
			select(info) {
				if (info.start.getTime() < Date.now() - 300 * 1e3) return;
				onSelectSlot(toDateTimeLocal(info.start), Math.round((info.end.getTime() - info.start.getTime()) / 6e4));
			},
			eventClick(info) {
				const liveClass = info.event.extendedProps?.originalClass;
				if (!liveClass) return;
				editError = "";
				activeEditClass = liveClass;
			},
			eventDrop(info) {
				const liveClass = info.event.extendedProps?.originalClass;
				if (!liveClass || liveClass.status === "ended") {
					info.revert();
					return;
				}
				handleDragDropReschedule(liveClass._id, info.event.start.getTime(), info.event.end.getTime());
			},
			eventResize(info) {
				const liveClass = info.event.extendedProps?.originalClass;
				if (!liveClass || liveClass.status === "ended") {
					info.revert();
					return;
				}
				handleDragDropReschedule(liveClass._id, info.event.start.getTime(), info.event.end.getTime());
			},
			eventContent(info) {
				const c = info.event.extendedProps?.originalClass;
				if (!c) return { html: "" };
				const formattedTime = `${formatLocalTime(c.startsAt)} – ${formatLocalTime(c.endsAt)}`;
				let statusDot = "";
				if (c.status === "live") statusDot = `<span class="pulse-indicator" aria-label="שידור חי"></span>`;
				return { html: `
          <div class="calendar-class-event-body status-${c.status}" title="${escapeHtml(c.title)} • ${formattedTime}">
            <div class="event-title">${escapeHtml(c.title)}</div>
            <div class="event-meta">
              ${statusDot}
              <span class="meta-badge">${c.type === "one_on_one" ? "1:1" : "קבוצתי"}</span>
            </div>
          </div>
        ` };
			}
		}));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			var bind_get = () => activeEditClass !== null;
			var bind_set = (v) => {
				if (!v) activeEditClass = null;
			};
			$$renderer.push(`<div class="weekly-agenda-container svelte-1u0ub2e"><div class="calendar-wrapper svelte-1u0ub2e">`);
			Calendar($$renderer, {
				plugins,
				options: calendarOptions()
			});
			$$renderer.push(`<!----></div></div> `);
			LiveClassModalShell($$renderer, {
				get open() {
					return bind_get();
				},
				set open($$value) {
					bind_set($$value);
				},
				title: activeEditClass?.status === "ended" ? "שיעור לייב שהסתיים" : "עריכת שיעור לייב",
				icon: activeEditClass?.status === "ended" ? "task_alt" : "edit_calendar",
				iconColor: activeEditClass?.status === "ended" ? "var(--muted)" : "var(--sky-strong)",
				wide: true,
				children: ($$renderer) => {
					if (activeEditClass) {
						$$renderer.push("<!--[0-->");
						EditLiveClassForm($$renderer, {
							liveClass: activeEditClass,
							onSubmit: (data) => void submitReschedule(data),
							onCancel: () => {
								activeEditClass = null;
								editError = "";
							},
							onDelete: submitCancellation,
							onEndLive: () => {
								if (activeEditClass) onEnd(activeEditClass._id);
							},
							submitting
						});
						$$renderer.push(`<!----> `);
						if (editError) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="form-error svelte-1u0ub2e" role="alert"><span class="material-symbols-rounded svelte-1u0ub2e">error</span> ${escape_html(editError)}</div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!---->`);
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
//#region src/lib/features/app/components/FormSection.svelte
function FormSection($$renderer, $$props) {
	let { title, children } = $$props;
	$$renderer.push(`<section class="form-section svelte-gohi6t"><h3 class="svelte-gohi6t">${escape_html(title)}</h3> <div class="form-section__body svelte-gohi6t">`);
	children($$renderer);
	$$renderer.push(`<!----></div></section>`);
}
//#endregion
//#region src/lib/features/studio/components/StudioLiveClassForm.svelte
function StudioLiveClassForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = void 0, description = void 0, liveType = void 0, startsAtLocal = void 0, durationMinutes = void 0, joinOpensMinutesBefore = void 0, capacity = void 0, requiredEquipment = void 0, pending = false, onSubmit } = $$props;
		const liveTypeOptions = [{
			value: "group_live",
			label: "לייב קבוצתי",
			description: "עד 12 משתתפות, קרדיט לייב אחד"
		}, {
			value: "one_on_one",
			label: "1:1 אישי",
			description: "משתתפת אחת, קרדיט 1:1 אחד"
		}];
		let dateValue = void 0;
		let timeValue = "09:00";
		const endTimeDisplay = derived(() => {
			if (!startsAtLocal) return "--:--";
			const [_, timePart] = startsAtLocal.split("T");
			if (!timePart) return "--:--";
			const [h, m] = timePart.split(":").map(Number);
			const end = new Date(new Date(2e3, 0, 1, h, m).getTime() + durationMinutes * 6e4);
			const pad = (n) => String(n).padStart(2, "0");
			return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
		});
		function updateStartsAtLocal() {
			if (!dateValue) return;
			try {
				const time = parseTime(timeValue);
				startsAtLocal = toCalendarDateTime(dateValue, time).toString().slice(0, 16);
			} catch {}
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<form class="svelte-1hw0dn5"><div class="studio-form-columns svelte-1hw0dn5"><div class="studio-form-column svelte-1hw0dn5">`);
			FormSection($$renderer, {
				title: "תאריך ושעה",
				children: ($$renderer) => {
					DatePicker_1($$renderer, {
						label: "תאריך",
						onchange: updateStartsAtLocal,
						get value() {
							return dateValue;
						},
						set value($$value) {
							dateValue = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <div class="time-row svelte-1hw0dn5">`);
					NativeTimePicker($$renderer, {
						label: "שעת התחלה",
						onchange: updateStartsAtLocal,
						get value() {
							return timeValue;
						},
						set value($$value) {
							timeValue = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <div class="end-time-display svelte-1hw0dn5"><span class="end-time-label svelte-1hw0dn5">עד</span> <span class="end-time-value svelte-1hw0dn5">${escape_html(endTimeDisplay())}</span></div></div> <div class="duration-row svelte-1hw0dn5">`);
					Slider_1($$renderer, {
						label: "משך (דקות)",
						min: 15,
						max: 180,
						step: 5,
						get value() {
							return durationMinutes;
						},
						set value($$value) {
							durationMinutes = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <span class="duration-badge svelte-1hw0dn5">${escape_html(durationMinutes)} דק׳</span></div>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div> <div class="studio-form-column svelte-1hw0dn5">`);
			FormSection($$renderer, {
				title: "הגדרות שיעור",
				children: ($$renderer) => {
					RadioGroup_1($$renderer, {
						class: "live-type-switch",
						options: liveTypeOptions,
						get value() {
							return liveType;
						},
						set value($$value) {
							liveType = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <div class="hb-input-field"><span class="hb-input-field__label">כותרת</span> <input class="hb-input"${attr("value", title)} required="" maxlength="120" placeholder="למשל: פילאטיס מזרן דינמי"/></div> <div class="hb-input-field"><span class="hb-input-field__label">תיאור</span> <textarea class="hb-textarea" rows="3" maxlength="500" placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים...">`);
					const $$body = escape_html(description);
					if ($$body) $$renderer.push(`${$$body}`);
					$$renderer.push(`</textarea></div> <div class="sliders-stack svelte-1hw0dn5">`);
					Slider_1($$renderer, {
						label: "פתיחת כניסה (דקות לפני)",
						min: 0,
						max: 60,
						step: 5,
						get value() {
							return joinOpensMinutesBefore;
						},
						set value($$value) {
							joinOpensMinutesBefore = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> `);
					if (liveType === "group_live") {
						$$renderer.push("<!--[0-->");
						Slider_1($$renderer, {
							label: "קיבולת (מקומות)",
							min: 1,
							max: 12,
							step: 1,
							get value() {
								return capacity;
							},
							set value($$value) {
								capacity = $$value;
								$$settled = false;
							}
						});
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="one-on-one-capacity svelte-1hw0dn5"><span class="hb-input-field__label">קיבולת</span> <span class="one-on-one-badge svelte-1hw0dn5">1 משתתפת (אישי)</span></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div> <div class="picker-section svelte-1hw0dn5">`);
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
			$$renderer.push(`<!----></div> <div class="form-actions svelte-1hw0dn5">`);
			Button_1($$renderer, {
				tone: "ink",
				type: "submit",
				disabled: pending || requiredEquipment.length === 0,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(pending ? "יוצרות..." : "לתזמן לייב")}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></form>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, {
			title,
			description,
			liveType,
			startsAtLocal,
			durationMinutes,
			joinOpensMinutesBefore,
			capacity,
			requiredEquipment
		});
	});
}
//#endregion
//#region src/lib/features/studio/components/LiveStudioShell.svelte
function LiveStudioShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let profile = null;
		let classes = [];
		let loading = true;
		let error = "";
		let actionId = null;
		let showCreateModal = false;
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
		async function retryLoad() {
			await load();
		}
		const client = useConvexClient();
		async function createClass() {
			error = "";
			actionId = "create";
			try {
				await client.mutation(api.instructorLive.createLiveClass, {
					title,
					description,
					type: liveType,
					startsAt: new Date(startsAtLocal).getTime(),
					durationMinutes,
					joinOpensMinutesBefore,
					capacity: liveType === "one_on_one" ? 1 : capacity,
					requiredEquipment
				});
				startsAtLocal = defaultStartsAtLocal();
				durationMinutes = 50;
				showCreateModal = false;
				await load();
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו ליצור לייב.";
			} finally {
				actionId = null;
			}
		}
		async function startLive(liveClassId) {
			actionId = liveClassId;
			error = "";
			try {
				await client.mutation(api.instructorLive.startLive, { liveClassId });
				await load();
				window.location.assign(liveRoomHref(liveClassId));
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
				await client.mutation(api.instructorLive.endLive, { liveClassId });
				await load();
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לסיים את הלייב.";
			} finally {
				actionId = null;
			}
		}
		function handleSelectSlot(timeLocalString, slotDurationMinutes) {
			startsAtLocal = timeLocalString;
			durationMinutes = slotDurationMinutes;
			showCreateModal = true;
		}
		function openCreateModal() {
			startsAtLocal = defaultStartsAtLocal();
			durationMinutes = 50;
			showCreateModal = true;
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			PageShell($$renderer, {
				title: "לוח שידורים שבועי",
				description: "תזמון וניהול של כל שיעורי הפילאטיס בלייב.",
				badge: profile?.role === "admin" ? "מנהלת" : "מדריכה",
				loading,
				error: error || null,
				children: ($$renderer) => {
					if (!loading && !error) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="studio-container svelte-5z869d"><div class="calendar-actions-header svelte-5z869d">`);
						Button_1($$renderer, {
							tone: "ink",
							type: "button",
							onclick: openCreateModal,
							children: ($$renderer) => {
								$$renderer.push(`<span class="material-symbols-rounded">add_circle</span> שיעור לייב חדש`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----></div> `);
						WeeklyAgenda($$renderer, {
							classes,
							onStart: startLive,
							onEnd: endLive,
							actionId,
							onSelectSlot: handleSelectSlot,
							onRefreshClasses: load
						});
						$$renderer.push(`<!----></div> `);
						LiveClassModalShell($$renderer, {
							title: "תזמון שיעור לייב חדש",
							icon: "calendar_add_on",
							iconColor: "var(--sky-strong)",
							wide: true,
							get open() {
								return showCreateModal;
							},
							set open($$value) {
								showCreateModal = $$value;
								$$settled = false;
							},
							children: ($$renderer) => {
								StudioLiveClassForm($$renderer, {
									pending: actionId === "create",
									onSubmit: () => void createClass(),
									get title() {
										return title;
									},
									set title($$value) {
										title = $$value;
										$$settled = false;
									},
									get description() {
										return description;
									},
									set description($$value) {
										description = $$value;
										$$settled = false;
									},
									get liveType() {
										return liveType;
									},
									set liveType($$value) {
										liveType = $$value;
										$$settled = false;
									},
									get startsAtLocal() {
										return startsAtLocal;
									},
									set startsAtLocal($$value) {
										startsAtLocal = $$value;
										$$settled = false;
									},
									get durationMinutes() {
										return durationMinutes;
									},
									set durationMinutes($$value) {
										durationMinutes = $$value;
										$$settled = false;
									},
									get joinOpensMinutesBefore() {
										return joinOpensMinutesBefore;
									},
									set joinOpensMinutesBefore($$value) {
										joinOpensMinutesBefore = $$value;
										$$settled = false;
									},
									get capacity() {
										return capacity;
									},
									set capacity($$value) {
										capacity = $$value;
										$$settled = false;
									},
									get requiredEquipment() {
										return requiredEquipment;
									},
									set requiredEquipment($$value) {
										requiredEquipment = $$value;
										$$settled = false;
									}
								});
								$$renderer.push(`<!----> `);
								if (error) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<div class="form-error svelte-5z869d" role="alert"><span class="material-symbols-rounded svelte-5z869d">error</span> ${escape_html(error)}</div>`);
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!---->`);
					} else if (error) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<div class="retry-state svelte-5z869d">`);
						Button_1($$renderer, {
							tone: "ghost",
							type: "button",
							onclick: retryLoad,
							children: ($$renderer) => {
								$$renderer.push(`<!---->נסה שוב`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----></div>`);
					} else $$renderer.push("<!--[-1-->");
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
export { LiveStudioShell as t };
