import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.BAVRMtTd.js","_app/immutable/chunks/DNelhIy7.js","_app/immutable/chunks/Dkwdqk_L.js","_app/immutable/chunks/DU2SdQ_i.js","_app/immutable/chunks/DJ4RyLIz.js","_app/immutable/chunks/DCbV68uA.js","_app/immutable/chunks/qCpTV9sU.js"];
export const stylesheets = ["_app/immutable/assets/0.xL1Xbvcg.css"];
export const fonts = [];
