export type BottomSheetSnap = "closed" | "half" | "full";

const HALF_VISIBLE_RATIO = 0.52;
const FULL_VISIBLE_RATIO = 0.9;
const DISMISS_DRAG_RATIO = 0.28;
const SNAP_VELOCITY_PX_MS = 0.55;
/** Movement below this is a tap, not a drag gesture. */
export const BOTTOM_SHEET_DRAG_THRESHOLD_PX = 8;

export function visibleHeightForSnap(snap: BottomSheetSnap, viewportHeight: number): number {
	if (snap === "closed") return 0;
	if (snap === "half") return viewportHeight * HALF_VISIBLE_RATIO;
	return viewportHeight * FULL_VISIBLE_RATIO;
}

export function translateYForSnap(
	snap: BottomSheetSnap,
	sheetHeight: number,
	viewportHeight: number,
	dragOffsetPx = 0,
): number {
	if (snap === "closed" || sheetHeight <= 0) return sheetHeight;
	const visible = visibleHeightForSnap(snap, viewportHeight);
	return Math.max(0, sheetHeight - visible + dragOffsetPx);
}

export function resolveSnapAfterDrag(input: {
	sheetHeight: number;
	viewportHeight: number;
	currentSnap: BottomSheetSnap;
	dragOffsetPx: number;
	velocityY: number;
	didDrag: boolean;
}): BottomSheetSnap {
	const { sheetHeight, viewportHeight, currentSnap, dragOffsetPx, velocityY, didDrag } = input;

	if (!didDrag || sheetHeight <= 0) {
		return currentSnap === "closed" ? "half" : currentSnap;
	}

	const currentY = translateYForSnap(currentSnap, sheetHeight, viewportHeight, dragOffsetPx);

	if (velocityY > SNAP_VELOCITY_PX_MS) {
		if (currentSnap === "full") return "half";
		return "closed";
	}
	if (velocityY < -SNAP_VELOCITY_PX_MS) {
		return "full";
	}

	const halfRestY = translateYForSnap("half", sheetHeight, viewportHeight, 0);
	const dismissThreshold = sheetHeight * DISMISS_DRAG_RATIO;
	if (currentY > halfRestY + dismissThreshold) {
		return "closed";
	}

	const candidates: BottomSheetSnap[] = ["half", "full"];
	let nearest: BottomSheetSnap = "half";
	let nearestDist = Infinity;
	for (const snap of candidates) {
		const targetY = translateYForSnap(snap, sheetHeight, viewportHeight, 0);
		const dist = Math.abs(currentY - targetY);
		if (dist < nearestDist) {
			nearestDist = dist;
			nearest = snap;
		}
	}
	return nearest;
}
