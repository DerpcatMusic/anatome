import { useConvexClient } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { Id } from "$convex/_generated/dataModel";
import { authQuery } from "$lib/auth/session.svelte";
import { liveRoomHref } from "$lib/i18n/context";
import {
	createEmptyPainted,
	paintedEquals,
	rulesToPainted,
	type AvailabilityRule,
	type PaintedSlots,
} from "$features/studio/lib/one-on-one-availability";
import { saveAvailabilityFromPainted } from "$features/studio/lib/save-availability-rules";
import type { Equipment } from "$lib/labels";
import type { SelectionAnchor } from "$features/live/types/selection-anchor";
import { anchorFromCalendarSelection } from "$features/live/types/selection-anchor";
import {
	nextAppHourDateTimeLocalString,
	parseDateTimeLocal,
	toCalendarEventDate,
	toDateTimeLocalString,
} from "$lib/datetime/local";
import { useDebounce } from "runed";

type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];
type ClassTypeFilter = "all" | "group_live" | "one_on_one";

export interface UseLiveStudioOptions {
	clearCalendarSelection: () => void;
}

export interface LiveStudioState {
	error: string;
	actionId: string | null;
	typeFilter: ClassTypeFilter;
	pendingRequestCount: number;
	popoverOpen: boolean;
	popoverMode: "create" | "edit";
	popoverAnchor: SelectionAnchor | null;
	popoverEditClass: LiveClass | null;
	showRequestsPanel: boolean;
	availabilityPaintMode: boolean;
	availabilityRules: AvailabilityRule[];
	availabilityPainted: PaintedSlots;
	availabilitySavedPainted: PaintedSlots;
	availabilitySaving: boolean;
	availabilityError: string;
	title: string;
	description: string;
	liveType: "group_live" | "one_on_one";
	startsAtLocal: string;
	durationMinutes: number;
	joinOpensMinutesBefore: number;
	capacity: number;
	requiredEquipment: Equipment[];
	lastCreatedClassId: Id<"liveClasses"> | null;
}

export function useLiveStudio(opts: UseLiveStudioOptions) {
	const client = useConvexClient();

	const state = $state<LiveStudioState>({
		error: "",
		actionId: null,
		typeFilter: "all",
		pendingRequestCount: 0,
		popoverOpen: false,
		popoverMode: "create",
		popoverAnchor: null,
		popoverEditClass: null,
		showRequestsPanel: false,
		availabilityPaintMode: false,
		availabilityRules: [],
		availabilityPainted: createEmptyPainted(),
		availabilitySavedPainted: createEmptyPainted(),
		availabilitySaving: false,
		availabilityError: "",
		title: "פילאטיס לייב",
		description: "שיעור קטן עם תיקונים.",
		liveType: "group_live",
		startsAtLocal: defaultStartsAtLocal(),
		durationMinutes: 50,
		joinOpensMinutesBefore: 15,
		capacity: 12,
		requiredEquipment: ["mat"],
		lastCreatedClassId: null,
	});

	const availabilityDirty = $derived(
		!paintedEquals(state.availabilityPainted, state.availabilitySavedPainted),
	);

	const availabilityModeStatus = $derived(
		state.availabilitySaving
			? "שומרת זמינות..."
			: availabilityDirty
				? "שינויים נשמרים אוטומטית"
				: "הזמינות נשמרה",
	);

	const popoverPending = $derived(
		state.actionId === "create" || state.actionId === "edit" || state.actionId === "cancel",
	);

	function makeQuickCreatePreview(
		startsAtLocal: string,
		durationMinutes: number,
		requiredEquipment: Equipment[],
	) {
		return {
			startsAt: parseDateTimeLocal(startsAtLocal),
			endsAt: parseDateTimeLocal(startsAtLocal) + durationMinutes * 60 * 1000,
			requiredEquipment,
		};
	}

	const quickCreatePreview = $derived(
		state.popoverOpen && state.popoverMode === "create" && state.startsAtLocal
			? makeQuickCreatePreview(state.startsAtLocal, state.durationMinutes, state.requiredEquipment)
			: null,
	);

	function defaultStartsAtLocal() {
		return nextAppHourDateTimeLocalString();
	}

	function resetCreateForm() {
		state.title = "פילאטיס לייב";
		state.description = "שיעור קטן עם תיקונים.";
		state.liveType = "group_live";
		state.capacity = 12;
		state.joinOpensMinutesBefore = 15;
		state.requiredEquipment = ["mat"];
	}

	function populateFormFromClass(liveClass: LiveClass) {
		state.title = liveClass.title;
		state.description = liveClass.description ?? "";
		state.liveType = liveClass.type;
		state.startsAtLocal = toDateTimeLocalString(liveClass.startsAt);
		state.durationMinutes = Math.max(
			15,
			Math.round((liveClass.endsAt - liveClass.startsAt) / 60000),
		);
		state.joinOpensMinutesBefore = 15;
		state.capacity = liveClass.capacity;
		state.requiredEquipment =
			liveClass.requiredEquipment.length > 0 ? [...liveClass.requiredEquipment as Equipment[]] : ["mat"];
	}

	function closePopover() {
		state.popoverOpen = false;
		state.popoverAnchor = null;
		state.popoverEditClass = null;
		opts.clearCalendarSelection();
	}

	function openCreatePopover(anchor: SelectionAnchor) {
		state.popoverMode = "create";
		state.popoverEditClass = null;
		state.popoverAnchor = anchor;
		state.popoverOpen = true;
	}

	function openEditPopover(liveClass: LiveClass, anchor: SelectionAnchor) {
		state.popoverMode = "edit";
		state.popoverEditClass = liveClass;
		state.popoverAnchor = anchor;
		populateFormFromClass(liveClass);
		state.popoverOpen = true;
	}

	async function loadAvailability() {
		state.availabilityError = "";
		try {
			const loaded = (await authQuery(api.oneOnOne.instructor.listAvailability, {})) ?? [];
			state.availabilityRules = loaded;
			const painted = rulesToPainted(loaded);
			state.availabilityPainted = painted;
			state.availabilitySavedPainted = painted;
		} catch (reason) {
			state.availabilityError =
				reason instanceof Error ? reason.message : "לא הצלחנו לטעון זמינות 1:1.";
		}
	}

	async function retryLoad() {
		state.error = "";
		await loadAvailability();
	}

	async function saveAvailability() {
		if (!availabilityDirty) return;
		state.availabilitySaving = true;
		state.availabilityError = "";
		try {
			await saveAvailabilityFromPainted(client, state.availabilityPainted, state.availabilityRules);
			await loadAvailability();
		} catch (reason) {
			state.availabilityError =
				reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
		} finally {
			state.availabilitySaving = false;
		}
	}

	const scheduleAvailabilitySave = useDebounce(() => void saveAvailability(), 450);

	function handleAvailabilityPaintChange(next: PaintedSlots) {
		state.availabilityPainted = next;
		scheduleAvailabilitySave();
	}

	function toggleAvailabilityPaintMode(pressed: boolean) {
		state.availabilityPaintMode = pressed;
		opts.clearCalendarSelection();
		if (state.availabilityPaintMode) {
			closePopover();
		} else if (availabilityDirty) {
			void saveAvailability();
		}
	}

	async function createClass() {
		state.error = "";
		state.actionId = "create";
		const startsAt = parseDateTimeLocal(state.startsAtLocal);
		try {
			const liveClassId = await client.mutation(api.live.class.create, {
				title: state.title,
				description: state.description,
				type: state.liveType,
				startsAt,
				durationMinutes: state.liveType === "one_on_one" ? 45 : state.durationMinutes,
				joinOpensMinutesBefore: state.joinOpensMinutesBefore,
				capacity: state.liveType === "one_on_one" ? 1 : state.capacity,
				requiredEquipment: state.requiredEquipment.length > 0 ? state.requiredEquipment : ["mat"],
			});
			state.lastCreatedClassId = liveClassId;
			state.startsAtLocal = defaultStartsAtLocal();
			state.durationMinutes = 50;
			closePopover();
			resetCreateForm();
		} catch (reason) {
			state.error = reason instanceof Error ? reason.message : "לא הצלחנו ליצור לייב.";
		} finally {
			state.actionId = null;
		}
	}

	async function submitEdit() {
		if (!state.popoverEditClass) return;
		state.error = "";
		state.actionId = "edit";
		try {
			await client.mutation(api.live.class.reschedule, {
				liveClassId: state.popoverEditClass._id,
				startsAt: parseDateTimeLocal(state.startsAtLocal),
				durationMinutes: state.liveType === "one_on_one" ? 45 : state.durationMinutes,
				joinOpensMinutesBefore: state.joinOpensMinutesBefore,
				capacity: state.liveType === "one_on_one" ? 1 : state.capacity,
				requiredEquipment: state.requiredEquipment.length > 0 ? state.requiredEquipment : ["mat"],
				title: state.title.trim(),
				description: state.description.trim(),
			});
			closePopover();
		} catch (reason) {
			state.error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן את השיעור.";
		} finally {
			state.actionId = null;
		}
	}

	async function submitCancellation() {
		if (!state.popoverEditClass) return;
		state.error = "";
		state.actionId = "cancel";
		try {
			await client.mutation(api.live.class.cancel, {
				liveClassId: state.popoverEditClass._id,
			});
			closePopover();
		} catch (reason) {
			state.error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל את השיעור.";
		} finally {
			state.actionId = null;
		}
	}

	async function startLive(liveClassId: Id<"liveClasses">) {
		state.actionId = liveClassId;
		state.error = "";
		try {
			await client.mutation(api.live.class.start, { liveClassId });
			window.location.assign(liveRoomHref(liveClassId));
		} catch (reason) {
			state.error = reason instanceof Error ? reason.message : "לא הצלחנו להתחיל את הלייב.";
		} finally {
			state.actionId = null;
		}
	}

	async function endLive(liveClassId: Id<"liveClasses">) {
		state.actionId = liveClassId;
		state.error = "";
		try {
			await client.mutation(api.live.class.end, { liveClassId });
			closePopover();
		} catch (reason) {
			state.error = reason instanceof Error ? reason.message : "לא הצלחנו לסיים את הלייב.";
		} finally {
			state.actionId = null;
		}
	}

	function handleSelectSlot(
		timeLocalString: string,
		slotDurationMinutes: number,
		anchor?: SelectionAnchor,
	) {
		closePopover();
		state.startsAtLocal = timeLocalString;
		state.durationMinutes = slotDurationMinutes;
		if (state.requiredEquipment.length === 0) state.requiredEquipment = ["mat"];

		const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
		const startMs = parseDateTimeLocal(timeLocalString);
		const nextAnchor =
			anchor ??
			anchorFromCalendarSelection(
				container,
				toCalendarEventDate(startMs),
				toCalendarEventDate(startMs + slotDurationMinutes * 60 * 1000),
			);

		openCreatePopover(nextAnchor);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const previewEl = document.querySelector(".ec-quick-create-preview");
				if (!(previewEl instanceof HTMLElement)) return;
				const rect = previewEl.getBoundingClientRect();
				if (rect.width <= 0 && rect.height <= 0) return;
				state.popoverAnchor = {
					top: rect.top,
					left: rect.left,
					width: rect.width,
					height: rect.height,
				};
			});
		});
	}

	function handleCreatePreviewChange(startsAt: number, endsAt: number) {
		state.startsAtLocal = toDateTimeLocalString(startsAt);
		state.durationMinutes = Math.max(15, Math.round((endsAt - startsAt) / 60000));

		requestAnimationFrame(() => {
			const previewEl = document.querySelector(".ec-quick-create-preview");
			if (!(previewEl instanceof HTMLElement)) return;
			const rect = previewEl.getBoundingClientRect();
			if (rect.width <= 0 && rect.height <= 0) return;
			state.popoverAnchor = {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
			};
		});
	}

	function handleEventClick(liveClass: LiveClass, anchor: SelectionAnchor) {
		closePopover();
		openEditPopover(liveClass, anchor);
	}

	function openToolbarQuickCreate() {
		closePopover();
		resetCreateForm();
		state.startsAtLocal = defaultStartsAtLocal();
		state.durationMinutes = 50;

		const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
		const startMs = parseDateTimeLocal(state.startsAtLocal);
		openCreatePopover(
			anchorFromCalendarSelection(
				container,
				toCalendarEventDate(startMs),
				toCalendarEventDate(startMs + state.durationMinutes * 60 * 1000),
			),
		);
	}

	function handleTypeFilterChange(v: string) {
		if (v === "all" || v === "group_live" || v === "one_on_one") state.typeFilter = v;
	}

	function openRequestsPanel() {
		state.showRequestsPanel = true;
	}

	function endAvailabilityPaintMode() {
		toggleAvailabilityPaintMode(false);
	}

	function handlePopoverSubmit() {
		if (state.popoverMode === "create") {
			void createClass();
		} else {
			void submitEdit();
		}
	}

	function handlePopoverDelete() {
		void submitCancellation();
	}

	function handlePopoverEndLive() {
		if (state.popoverEditClass) void endLive(state.popoverEditClass._id);
	}

	function handlePendingCountChange(n: number) {
		state.pendingRequestCount = n;
	}

	return {
		state,
		get availabilityDirty() {
			return availabilityDirty;
		},
		get availabilityModeStatus() {
			return availabilityModeStatus;
		},
		get popoverPending() {
			return popoverPending;
		},
		get quickCreatePreview() {
			return quickCreatePreview;
		},
		loadAvailability,
		retryLoad,
		handleAvailabilityPaintChange,
		toggleAvailabilityPaintMode,
		createClass,
		submitEdit,
		submitCancellation,
		startLive,
		endLive,
		handleSelectSlot,
		handleCreatePreviewChange,
		handleEventClick,
		openToolbarQuickCreate,
		handleTypeFilterChange,
		openRequestsPanel,
		endAvailabilityPaintMode,
		handlePopoverSubmit,
		handlePopoverDelete,
		handlePopoverEndLive,
		handlePendingCountChange,
		closePopover,
		defaultStartsAtLocal,
		resetCreateForm,
	};
}
