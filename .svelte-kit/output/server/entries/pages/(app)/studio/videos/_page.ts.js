import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/studio/videos/+page.ts
var load = () => {
	throw redirect(307, "/i/videos");
};
//#endregion
export { load };
