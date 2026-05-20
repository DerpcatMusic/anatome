import { redirect } from "@sveltejs/kit";
//#region src/routes/(app)/צפייה/+page.ts
var load = () => {
	throw redirect(307, "/watch");
};
//#endregion
export { load };
