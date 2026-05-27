import { equipmentLabel, normalizeEquipmentId } from "$lib/labels";

/** Inline SVG path fragments (viewBox 0 0 64 64). */
export const EQUIPMENT_ICON_PATHS: Record<string, string> = {
  mat: `<rect x="4" y="14" width="56" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="34" x2="48" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,

  reformer: `<rect x="6" y="20" width="48" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="16" width="20" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="36" x2="10" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="36" x2="50" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="42" x2="54" y2="42" stroke="currentColor" stroke-width="2"/>`,

  cadillac: `<rect x="8" y="12" width="44" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="20" x2="52" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="8" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="18" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="42" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="52" y1="12" x2="52" y2="6" stroke="currentColor" stroke-width="2"/>`,

  chair: `<rect x="20" y="12" width="20" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="22" x2="40" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="40" x2="24" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="36" y1="40" x2="36" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="48" x2="38" y2="48" stroke="currentColor" stroke-width="2"/>`,

  barrel: `<path d="M16 12 C12 12, 8 24, 8 30 C8 36, 12 48, 16 48 L48 48 C52 48, 56 36, 56 30 C56 24, 52 12, 48 12 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="10" y1="30" x2="54" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="38" x2="52" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,

  spine_corrector: `<path d="M14 14 C10 14, 8 26, 8 32 C8 40, 12 50, 16 50 L48 50 C52 50, 56 38, 56 32 C56 24, 52 14, 48 14 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 18 L32 46" stroke="currentColor" stroke-width="2"/><line x1="14" y1="26" x2="50" y2="26" stroke="currentColor" stroke-width="1.5" opacity="0.35"/><line x1="16" y1="38" x2="48" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.35"/>`,

  magic_circle: `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="10" r="3" fill="currentColor"/><circle cx="32" cy="54" r="3" fill="currentColor"/><circle cx="10" cy="32" r="3" fill="currentColor"/><circle cx="54" cy="32" r="3" fill="currentColor"/>`,

  small_ball: `<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 24 Q32 18, 46 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><path d="M16 34 Q32 28, 48 34" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,

  resistance_band: `<path d="M12 16 Q32 8, 52 16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 32 Q32 24, 52 32" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 48 Q32 40, 52 48" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="16" x2="12" y2="48" stroke="currentColor" stroke-width="2"/><line x1="52" y1="16" x2="52" y2="48" stroke="currentColor" stroke-width="2"/>`,

  light_weights: `<rect x="12" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="40" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2.5"/><rect x="24" y="12" width="12" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>`,

  roller: `<rect x="10" y="24" width="44" height="16" rx="8" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="14" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.35"/><line x1="14" y1="34" x2="50" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.35"/>`,

  spiky_balls: `<circle cx="24" cy="34" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="40" cy="30" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="24" r="2" fill="currentColor"/><circle cx="28" cy="22" r="2" fill="currentColor"/><circle cx="36" cy="22" r="2" fill="currentColor"/><circle cx="44" cy="24" r="2" fill="currentColor"/>`,
};

const DEFAULT_PATH = EQUIPMENT_ICON_PATHS.mat;

export function equipmentIconPath(id: string): string {
  const normalized = normalizeEquipmentId(id);
  if (normalized && EQUIPMENT_ICON_PATHS[normalized]) {
    return EQUIPMENT_ICON_PATHS[normalized];
  }
  return DEFAULT_PATH;
}

export type RenderEquipmentIconsOptions = {
  max?: number;
  sizePx?: number;
};

/** Safe inline SVG snippets for calendar `eventContent` HTML (ids must be pre-trusted from our DB). */
export function renderEquipmentIconsHtml(
  ids: string[],
  options: RenderEquipmentIconsOptions = {},
): string {
  const max = options.max ?? 4;
  const sizePx = options.sizePx ?? 14;
  const unique: string[] = [];
  for (const id of ids) {
    const normalized = normalizeEquipmentId(id) ?? id;
    if (!unique.includes(normalized)) unique.push(normalized);
  }
  if (unique.length === 0) return "";

  const visible = unique.slice(0, max);
  const overflow = unique.length - visible.length;

  const icons = visible
    .map((id) => {
      const path = equipmentIconPath(id);
      return `<span class="event-equipment__icon" title="${escapeAttr(equipmentLabel(id))}"><svg viewBox="0 0 64 64" width="${sizePx}" height="${sizePx}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${path}</svg></span>`;
    })
    .join("");

  const overflowBadge =
    overflow > 0
      ? `<span class="event-equipment__overflow meta-badge" aria-hidden="true">+${overflow}</span>`
      : "";

  return `<span class="event-equipment">${icons}${overflowBadge}</span>`;
}

/** Wraps icons with an accessible label when used in calendar event HTML. */
export function renderEquipmentRowHtml(ids: string[], options?: RenderEquipmentIconsOptions): string {
  const inner = renderEquipmentIconsHtml(ids, options);
  if (!inner) return "";
  const label = equipmentAriaLabel(ids);
  return `<span class="event-equipment-row" aria-label="${escapeAttr(label)}">${inner}</span>`;
}

export function equipmentAriaLabel(ids: string[]): string {
  const labels = ids
    .map((id) => {
      const normalized = normalizeEquipmentId(id);
      return normalized ? equipmentLabel(normalized) : equipmentLabel(id);
    })
    .filter((label, index, arr) => arr.indexOf(label) === index);
  if (labels.length === 0) return "";
  return `ציוד: ${labels.join(", ")}`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
