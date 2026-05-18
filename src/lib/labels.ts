// ─── Shared label dictionaries ───
// Centralized here so they aren't duplicated across 6+ components.

export const experienceOptions = [
  ["new", "חדשה לגמרי"],
  ["some", "קצת ניסיון"],
  ["steady", "מתרגלת קבועה"],
] as const;

export type Experience = (typeof experienceOptions)[number][0];

export const equipmentOptions = [
  ["mat", "מזרן"],
  ["reformer", "רפורמר"],
  ["cadillac", "קדילאק"],
  ["chair", "כיסא"],
  ["barrel", "ברל"],
  ["magic_circle", "Magic Circle"],
  ["small_ball", "כדור קטן"],
  ["resistance_band", "גומייה"],
  ["light_weights", "משקולות קלות"],
] as const;

export type Equipment = (typeof equipmentOptions)[number][0];

export const goalOptions = [
  ["strength", "כוח"],
  ["mobility", "תנועה"],
  ["posture", "יציבה"],
  ["back_care", "גב"],
  ["return_to_movement", "חזרה לתנועה"],
] as const;

export type Goal = (typeof goalOptions)[number][0];

export const experienceLabelMap: Record<string, string> = Object.fromEntries(experienceOptions);
export const equipmentLabelMap: Record<string, string> = Object.fromEntries(equipmentOptions);
export const goalLabelMap: Record<string, string> = Object.fromEntries(goalOptions);

export function equipmentLabel(id: string): string {
  return equipmentLabelMap[id] ?? id;
}

export function experienceLabel(id: string): string {
  return experienceLabelMap[id] ?? id;
}

export function goalLabel(id: string): string {
  return goalLabelMap[id] ?? id;
}

export function fmtList(arr: string[], labels: Record<string, string>): string {
  return arr.map((v) => labels[v] ?? v).filter(Boolean).join(", ") || "—";
}

export function classTypeLabel(type: "group_live" | "one_on_one"): string {
  return type === "one_on_one" ? "1:1 אישי" : "לייב קבוצתי";
}

export function creditLabel(kind: "live" | "oneOnOne"): string {
  return kind === "oneOnOne" ? "קרדיט 1:1 אחד" : "קרדיט לייב אחד";
}

export function durationLabel(seconds: number): string {
  return `${Math.round(seconds / 60)} דקות`;
}
