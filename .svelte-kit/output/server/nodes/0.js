import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DBOtLADj.js","_app/immutable/chunks/Co9uX_hQ.js","_app/immutable/chunks/BKu15lNO.js","_app/immutable/chunks/BSuc4Zc4.js","_app/immutable/chunks/CCi4sbZS.js","_app/immutable/chunks/CGGEpbdl.js"];
export const stylesheets = ["_app/immutable/assets/0.Q5FPJDZW.css"];
export const fonts = [];
