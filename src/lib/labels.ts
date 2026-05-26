// ─── Shared label dictionaries ───
// Centralized here so they aren't duplicated across 6+ components.

export const experienceOptions = [
  ["new", "חדשה לגמרי"],
  ["some", "חדשה לייט"],
  ["steady", "מתרגלת קבועה"],
] as const;

export type Experience = (typeof experienceOptions)[number][0];

export const equipmentOptions = [
  ["mat", "Mat"],
  ["reformer", "Reformer"],
  ["cadillac", "Cadillac"],
  ["chair", "Chair"],
  ["spine_corrector", "Spine Corrector"],
  ["small_ball", "Small Ball"],
  ["resistance_band", "Resistance Band"],
  ["roller", "Roller"],
  ["light_weights", "Weights"],
  ["magic_circle", "Magic Circle"],
  ["spiky_balls", "Spiky Balls"],
] as const;

const legacyEquipmentLabels: Record<string, string> = {
  barrel: "Spine Corrector",
};

export type Equipment = (typeof equipmentOptions)[number][0] | "barrel";

export const goalOptions = [
  ["pelvic_floor_rehab", "שיקום רצפת אגן"],
  ["stress_breathing", "הפחתת סטרס ונשימה"],
  ["functional_daily", "חיזוק פונקציונלי יום יומי"],
  ["back_pathology", "טיפול בפתולוגיות גב"],
] as const;

export type Goal = (typeof goalOptions)[number][0];

const legacyGoalLabels: Record<string, string> = {
  strength: "כוח",
  mobility: "תנועה",
  posture: "יציבה",
  back_care: "גב",
  return_to_movement: "חזרה לתנועה",
};

export const pathologyOptions = [
  ["back_pain", "כאבי גב"],
  ["disc_herniation", "פריצת / בלוט דיסק"],
  ["neck_pain", "כאבי צוואר"],
  ["sciatica", "סיאטיקה"],
  ["pregnancy", "הריון"],
  ["postpartum", "שיקום אחרי לידה"],
  ["osteoporosis", "אוסטאופורוזיס / דליחת סידן"],
  ["scoliosis", "סקוליוזיס / עקמות גב"],
  ["diastasis_recti", "הפרדת שרירי הבטן (דיאסטזיס)"],
  ["pelvic_floor_weakness", "חולשת רצפת אגן"],
  ["hip_pain", "כאבי ירך / מפרק ירך"],
  ["knee_pain", "כאבי ברכיים"],
  ["shoulder_pain", "כאבי כתף / קרעים"],
  ["fibromyalgia", "כאב כרוני / פיבromyalgia"],
  ["arthritis", "דלקת פרקים"],
  ["post_surgery", "שיקום אחרי ניתוח"],
  ["incontinence", "דליפות שתן"],
  ["prolapse", "צניחה"],
] as const;

export type Pathology = (typeof pathologyOptions)[number][0];

export const experienceLabelMap: Record<string, string> = Object.fromEntries(experienceOptions);
export const equipmentLabelMap: Record<string, string> = Object.fromEntries(equipmentOptions);
export const goalLabelMap: Record<string, string> = Object.fromEntries(goalOptions);
export const pathologyLabelMap: Record<string, string> = Object.fromEntries(pathologyOptions);

export function equipmentLabel(id: string): string {
  return equipmentLabelMap[id] ?? legacyEquipmentLabels[id] ?? id;
}

export function normalizeEquipmentId(id: string): Equipment | null {
  const normalized = id === "barrel" ? "spine_corrector" : id;
  return equipmentOptions.some(([equipmentId]) => equipmentId === normalized)
    ? (normalized as Equipment)
    : null;
}

export function experienceLabel(id: string): string {
  return experienceLabelMap[id] ?? id;
}

export function goalLabel(id: string): string {
  return goalLabelMap[id] ?? legacyGoalLabels[id] ?? id;
}

export function pathologyLabel(id: string): string {
  return pathologyLabelMap[id] ?? id;
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

export function durationLabel(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || seconds <= 0) return "—";
  return `${Math.round(seconds / 60)} דקות`;
}

/** Instructor-facing labels for video access models (not internal Macroflow/Microflow jargon). */
export const videoAccessLabels = {
  macroflow: "רכישה חד-פעמית",
  microflow: "מנוי בלבד",
} as const;

export type VideoAccessKind = keyof typeof videoAccessLabels;

export function videoAccessLabel(kind: VideoAccessKind): string {
  return videoAccessLabels[kind];
}
