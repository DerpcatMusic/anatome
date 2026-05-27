/** Canonical pathology IDs — single source of truth for validators and onboarding UI. */

export const PATHOLOGY_IDS = [
  "back_pain",
  "disc_herniation",
  "neck_pain",
  "sciatica",
  "pregnancy",
  "postpartum",
  "osteoporosis",
  "scoliosis",
  "diastasis_recti",
  "pelvic_floor_weakness",
  "hip_pain",
  "knee_pain",
  "shoulder_pain",
  "fibromyalgia",
  "arthritis",
  "post_surgery",
  "incontinence",
  "prolapse",
] as const;

export type PathologyId = (typeof PATHOLOGY_IDS)[number];

const pathologySet = new Set<string>(PATHOLOGY_IDS);

/** Hebrew labels for onboarding and profile display. */
export const pathologyDisplayLabels: Record<PathologyId, string> = {
  back_pain: "כאבי גב",
  disc_herniation: "פריצת / בלוט דיסק",
  neck_pain: "כאבי צוואר",
  sciatica: "סיאטיקה",
  pregnancy: "הריון",
  postpartum: "שיקום אחרי לידה",
  osteoporosis: "אוסטאופורוזיס / דליחת סידן",
  scoliosis: "סקוליוזיס / עקמות גב",
  diastasis_recti: "הפרדת שרירי הבטן (דיאסטזיס)",
  pelvic_floor_weakness: "חולשת רצפת אגן",
  hip_pain: "כאבי ירך / מפרק ירך",
  knee_pain: "כאבי ברכיים",
  shoulder_pain: "כאבי כתף / קרעים",
  fibromyalgia: "כאב כרוני / פיבromyalgia",
  arthritis: "דלקת פרקים",
  post_surgery: "שיקום אחרי ניתוח",
  incontinence: "דליפות שתן",
  prolapse: "צניחה",
};

export function isPathologyId(id: string): id is PathologyId {
  return pathologySet.has(id);
}

export function normalizePathologyList(ids: readonly string[]): PathologyId[] {
  const result: PathologyId[] = [];
  for (const id of ids) {
    if (isPathologyId(id) && !result.includes(id)) {
      result.push(id);
    }
  }
  return result;
}

export function pathologyDisplayLabel(id: string): string {
  return isPathologyId(id) ? pathologyDisplayLabels[id] : id;
}
