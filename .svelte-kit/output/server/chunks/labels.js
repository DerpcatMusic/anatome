//#region src/lib/labels.ts
var experienceOptions = [
	["new", "חדשה לגמרי"],
	["some", "קצת ניסיון"],
	["steady", "מתרגלת קבועה"]
];
var equipmentOptions = [
	["mat", "מזרן"],
	["reformer", "רפורמר"],
	["cadillac", "קדילאק"],
	["chair", "כיסא"],
	["barrel", "ברל"],
	["magic_circle", "Magic Circle"],
	["small_ball", "כדור קטן"],
	["resistance_band", "גומייה"],
	["light_weights", "משקולות קלות"]
];
var goalOptions = [
	["strength", "כוח"],
	["mobility", "תנועה"],
	["posture", "יציבה"],
	["back_care", "גב"],
	["return_to_movement", "חזרה לתנועה"]
];
var experienceLabelMap = Object.fromEntries(experienceOptions);
var equipmentLabelMap = Object.fromEntries(equipmentOptions);
var goalLabelMap = Object.fromEntries(goalOptions);
function equipmentLabel(id) {
	return equipmentLabelMap[id] ?? id;
}
function experienceLabel(id) {
	return experienceLabelMap[id] ?? id;
}
function goalLabel(id) {
	return goalLabelMap[id] ?? id;
}
function classTypeLabel(type) {
	return type === "one_on_one" ? "1:1 אישי" : "לייב קבוצתי";
}
function creditLabel(kind) {
	return kind === "oneOnOne" ? "קרדיט 1:1 אחד" : "קרדיט לייב אחד";
}
function durationLabel(seconds) {
	return `${Math.round(seconds / 60)} דקות`;
}
//#endregion
export { equipmentLabelMap as a, experienceLabelMap as c, goalLabelMap as d, goalOptions as f, equipmentLabel as i, experienceOptions as l, creditLabel as n, equipmentOptions as o, durationLabel as r, experienceLabel as s, classTypeLabel as t, goalLabel as u };
