import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/one-on-one/+page.ts
var load = () => {
	throw redirect(307, "/u/one-on-one");
};
//#endregion
export { load };
