import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/וידאו/+page.ts
var load = () => {
	throw redirect(307, "/u/videos");
};
//#endregion
export { load };
