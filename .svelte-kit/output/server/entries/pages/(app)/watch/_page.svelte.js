import { H as attr, U as escape_html, a as derived } from "../../../../chunks/dev.js";
import { o as api, r as initAuth, s as resource, t as authQuery } from "../../../../chunks/session.svelte.js";
import { t as Notice } from "../../../../chunks/Notice.js";
import { i as equipmentLabel, r as durationLabel } from "../../../../chunks/labels.js";
import { t as AppLayout } from "../../../../chunks/AppLayout.js";
import "@mux/mux-player";
//#region src/components/video/MuxPlayer.svelte
function MuxPlayer($$renderer, $$props) {
	let { playbackId, playbackToken, thumbnailUrl, title } = $$props;
	$$renderer.push(`<div class="mux-player-wrapper svelte-1146wuj"><mux-player${attr("playback-id", playbackId)}${attr("playback-token", playbackToken ?? void 0)}${attr("poster", thumbnailUrl ?? void 0)}${attr("title", title)} accent-color="#4a90a4" style="--controls-backdrop-color: rgba(0,0,0,0.6);" class="svelte-1146wuj"></mux-player></div>`);
}
//#endregion
//#region src/components/app/WatchShell.svelte
function WatchShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const videoId = derived(() => new URLSearchParams(window.location.search).get("videoId"));
		const playbackResource = resource(() => auth.isAuthenticated && videoId(), async (shouldFetch) => {
			if (!shouldFetch || !videoId()) return null;
			return await authQuery(api.videos.getViewerPlayback, { videoId: videoId() });
		});
		const playbackData = derived(() => playbackResource.current);
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-1b2nemt"><div class="skeleton skeleton--large svelte-1b2nemt"></div> <div class="skeleton svelte-1b2nemt"></div></div>`);
				},
				$$slots: { default: true }
			});
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-1b2nemt"><p class="eyebrow svelte-1b2nemt">חשבון נעול</p> <h2 class="svelte-1b2nemt">צריך להתחבר כדי לצפות בווידאו</h2> <a class="button-link svelte-1b2nemt" href="/">כניסה</a></div>`);
				},
				$$slots: { default: true }
			});
		} else if (!videoId()) {
			$$renderer.push("<!--[2-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-1b2nemt">`);
					Notice($$renderer, {
						tone: "danger",
						children: ($$renderer) => {
							$$renderer.push(`<!---->לא צוין מזהה וידאו`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!----> <a class="button-link svelte-1b2nemt" href="/videos">חזרה לספרייה</a></div>`);
				},
				$$slots: { default: true }
			});
		} else if (playbackResource.error) {
			$$renderer.push("<!--[3-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-1b2nemt">`);
					Notice($$renderer, {
						tone: "danger",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(playbackResource.error?.message ?? "שגיאה בטעינת הווידאו")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!----> <a class="button-link svelte-1b2nemt" href="/videos">חזרה לספרייה</a></div>`);
				},
				$$slots: { default: true }
			});
		} else if (playbackData()) {
			$$renderer.push("<!--[4-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="watch-header svelte-1b2nemt"><p class="eyebrow svelte-1b2nemt">HomeBody Video</p> <h1 class="svelte-1b2nemt">${escape_html(playbackData().video.title)}</h1></div> `);
					if (playbackData().video.playbackId) {
						$$renderer.push("<!--[0-->");
						MuxPlayer($$renderer, {
							playbackId: playbackData().video.playbackId,
							thumbnailUrl: playbackData().video.thumbnailUrl,
							title: playbackData().video.title
						});
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="player-placeholder svelte-1b2nemt">`);
						Notice($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->הווידאו עדיין בעיבוד`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----></div>`);
					}
					$$renderer.push(`<!--]--> <div class="meta-card svelte-1b2nemt"><div class="meta-row svelte-1b2nemt"><span class="meta-label svelte-1b2nemt">משך</span> <span class="meta-value svelte-1b2nemt">${escape_html(durationLabel(playbackData().video.durationSeconds))}</span></div> <div class="meta-row svelte-1b2nemt"><span class="meta-label svelte-1b2nemt">ציוד נדרש</span> <span class="meta-value svelte-1b2nemt">${escape_html(playbackData().video.requiredEquipment.map(equipmentLabel).join(", ") || "ללא")}</span></div> <p class="desc svelte-1b2nemt">${escape_html(playbackData().video.description)}</p></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push("<!--[-1-->");
			AppLayout($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="state-card svelte-1b2nemt"><div class="skeleton skeleton--large svelte-1b2nemt"></div> <div class="skeleton svelte-1b2nemt"></div></div>`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/routes/(app)/watch/+page.svelte
function _page($$renderer) {
	WatchShell($$renderer, {});
}
//#endregion
export { _page as default };
