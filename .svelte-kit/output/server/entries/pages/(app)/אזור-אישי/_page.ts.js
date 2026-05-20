import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/אזור-אישי/+page.ts
var load = () => {
	throw redirect(307, "/u/dashboard");
};
//#endregion
export { load };
