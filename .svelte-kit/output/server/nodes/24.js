import * as universal from '../entries/pages/onboarding/_page.js';

export const index = 24;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/onboarding/+page.js";
export const imports = ["_app/immutable/nodes/24.PGLYaHTY.js","_app/immutable/chunks/Co9uX_hQ.js","_app/immutable/chunks/CCi4sbZS.js","_app/immutable/chunks/CGGEpbdl.js","_app/immutable/chunks/DEDNSdYc.js","_app/immutable/chunks/BKu15lNO.js","_app/immutable/chunks/BSuc4Zc4.js","_app/immutable/chunks/lKZdBvYW.js","_app/immutable/chunks/Cx40UKYZ.js","_app/immutable/chunks/CHL-txnG.js","_app/immutable/chunks/CCgQUC7U.js","_app/immutable/chunks/MPUMm7ks.js"];
export const stylesheets = ["_app/immutable/assets/Button.BJEJGbmT.css","_app/immutable/assets/Notice.cHHkOXRm.css","_app/immutable/assets/OnboardingForm.BbsdtiC1.css","_app/immutable/assets/OnboardingShell.DdOwP1PX.css"];
export const fonts = [];
