import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/profile/+page.ts
var load = () => {
	throw redirect(307, "/u/profile");
};
//#endregion
export { load };
