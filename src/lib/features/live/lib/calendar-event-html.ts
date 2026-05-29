import {
  equipmentAriaLabel,
  renderEquipmentIconsHtml,
  renderEquipmentRowHtml,
} from "$components/icons/equipment-icon-paths";
import { formatAppTime } from "$lib/datetime/local";

export function escapeCalendarHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type ClassEventInput = {
  title: string;
  startsAt: number;
  endsAt: number;
  status: string;
  requiredEquipment: string[];
  seatsTaken?: number;
  capacity?: number;
  lobbyWaitingCount?: number;
};

export function buildLiveClassEventHtml(c: ClassEventInput): string {
  const formattedTime = `${formatAppTime(c.startsAt)} \u2013 ${formatAppTime(c.endsAt)}`;
  const equipmentLabels = equipmentAriaLabel(c.requiredEquipment);
  const equipmentHtml = renderEquipmentRowHtml(c.requiredEquipment);
  const tooltip = [c.title, formattedTime, equipmentLabels].filter(Boolean).join(" \u2022 ");
  const livePulse =
    c.status === "live"
      ? `<span class="pulse-indicator" aria-label="\u05e9\u05d9\u05d3\u05d5\u05e8 \u05d7\u05d9"></span>`
      : "";

  const metaParts: string[] = [];
  if (formattedTime) {
    metaParts.push(`<span class="event-time">${escapeCalendarHtml(formattedTime)}</span>`);
  }
  if (typeof c.seatsTaken === "number" && typeof c.capacity === "number") {
    const seatsLine = `${c.seatsTaken}/${c.capacity} שמורות`;
    const waiting =
      typeof c.lobbyWaitingCount === "number" && c.lobbyWaitingCount > 0
        ? ` · ${c.lobbyWaitingCount} ממתינות`
        : "";
    metaParts.push(
      `<span class="event-seats">${escapeCalendarHtml(seatsLine + waiting)}</span>`,
    );
  }
  if (equipmentHtml) {
    metaParts.push(equipmentHtml);
  }
  if (livePulse) {
    metaParts.push(livePulse);
  }

  const metaRow =
    metaParts.length > 0 ? `<div class="event-meta">${metaParts.join("")}</div>` : "";

  return `
    <div class="calendar-class-event-body status-${escapeCalendarHtml(c.status)}" title="${escapeCalendarHtml(tooltip)}">
      <div class="event-title">${escapeCalendarHtml(c.title)}</div>
      ${metaRow}
    </div>
  `.trim();
}

export function buildPreviewEventHtml(input: {
  startLabel: string;
  endLabel: string;
  durationMinutes: number;
  requiredEquipment: string[];
}): string {
  const equipmentHtml = renderEquipmentRowHtml(input.requiredEquipment, { sizePx: 12 });
  const equipmentRow = equipmentHtml
    ? `<div class="event-meta preview-equipment">${equipmentHtml}</div>`
    : "";

  return `
    <div class="calendar-preview-event">
      <span class="preview-start">${escapeCalendarHtml(input.startLabel)}</span>
      <span class="preview-divider">${input.durationMinutes} דק׳</span>
      <span class="preview-end">${escapeCalendarHtml(input.endLabel)}</span>
      ${equipmentRow}
    </div>
  `.trim();
}
