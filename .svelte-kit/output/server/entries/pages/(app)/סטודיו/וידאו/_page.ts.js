import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/סטודיו/וידאו/+page.ts
var load = () => {
	throw redirect(307, "/i/videos");
};
//#endregion
export { load };
