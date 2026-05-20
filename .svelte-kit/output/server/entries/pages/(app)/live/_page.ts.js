import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/live/+page.ts
var load = () => {
	throw redirect(307, "/i/live");
};
//#endregion
export { load };
