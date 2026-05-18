import * as universal from '../entries/pages/onboarding/_page.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/onboarding/+page.js";
export const imports = ["_app/immutable/nodes/12.DykLaEF-.js","_app/immutable/chunks/IR7L6Deb.js","_app/immutable/chunks/OFq3flSA.js","_app/immutable/chunks/CP97kCR3.js","_app/immutable/chunks/Czg4h2fA.js","_app/immutable/chunks/gZa5nGQd.js","_app/immutable/chunks/CaM_Ah6k.js","_app/immutable/chunks/CWenGQxk.js","_app/immutable/chunks/DYJxHt2-.js"];
export const stylesheets = ["_app/immutable/assets/AppLocked.Bc6dujN1.css","_app/immutable/assets/Button.DjrlDIIW.css","_app/immutable/assets/Notice.b_NcIejY.css","_app/immutable/assets/OnboardingForm.B1j-Pc21.css","_app/immutable/assets/12.Ddbr1CTw.css"];
export const fonts = [];
