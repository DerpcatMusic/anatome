import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/calendar/+page.ts
var load = () => {
	throw redirect(307, "/u/calendar");
};
//#endregion
export { load };
