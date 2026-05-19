import { U as attr, W as escape_html, a as derived } from "./dev.js";
import { n as routePath } from "./context.js";
import { c as resource, r as initAuth, s as api, t as authQuery } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { i as equipmentLabel, r as durationLabel } from "./labels.js";
import "@mux/mux-player";
//#region src/lib/components/video/MuxPlayer.svelte
function MuxPlayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { playbackId, playbackToken, thumbnailToken, storyboardToken, thumbnailUrl, title, startTime, videoId, viewerUserId, maxResolution, onProgress } = $$props;
		$$renderer.push(`<div class="mux-player-wrapper svelte-1sjks4b"><mux-player${attr("playback-id", playbackId)}${attr("playback-token", playbackToken ?? void 0)}${attr("thumbnail-token", thumbnailToken ?? void 0)}${attr("storyboard-token", storyboardToken ?? void 0)}${attr("poster", thumbnailUrl ?? void 0)}${attr("start-time", startTime && startTime > 0 ? startTime : void 0)}${attr("video-title", title)}${attr("metadata-video-id", videoId)}${attr("metadata-video-title", title)}${attr("metadata-viewer-user-id", viewerUserId ?? void 0)} stream-type="on-demand" playbackrates="0.75 1 1.25 1.5 2"${attr("max-resolution", maxResolution ?? void 0)} max-auto-resolution="1080p" cap-rendition-to-player-size="" accent-color="#4a90a4" style="--controls-backdrop-color: rgba(0,0,0,0.6);" class="svelte-1sjks4b"></mux-player></div>`);
	});
}
//#endregion
//#region src/lib/features/videos/components/WatchShell.svelte
function WatchShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const videoId = derived(() => new URLSearchParams(window.location.search).get("videoId"));
		const playbackResource = resource(() => auth.isAuthenticated && videoId(), async (shouldFetch) => {
			if (!shouldFetch || !videoId()) return null;
			return await authQuery(api.videos.getViewerPlayback, { videoId: videoId() });
		});
		const playbackData = derived(() => playbackResource.current);
		async function updateProgress(progress) {
			if (!videoId()) return;
			await null.mutation(api.videos.updateProgress, {
				videoId: videoId(),
				...progress
			});
		}
		if (auth.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="state-card svelte-ndauuo"><div class="skeleton skeleton--large svelte-ndauuo"></div> <div class="skeleton svelte-ndauuo"></div></div>`);
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="state-card svelte-ndauuo"><p class="eyebrow svelte-ndauuo">חשבון נעול</p> <h2 class="svelte-ndauuo">צריך להתחבר כדי לצפות בווידאו</h2> <a class="button-link svelte-ndauuo" href="/">כניסה</a></div>`);
		} else if (!videoId()) {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="state-card svelte-ndauuo">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->לא צוין מזהה וידאו`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> <a class="button-link svelte-ndauuo"${attr("href", routePath("customerVideos"))}>חזרה לספרייה</a></div>`);
		} else if (playbackResource.error) {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="state-card svelte-ndauuo">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(playbackResource.error?.message ?? "שגיאה בטעינת הווידאו")}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> <a class="button-link svelte-ndauuo"${attr("href", routePath("customerVideos"))}>חזרה לספרייה</a></div>`);
		} else if (playbackData()) {
			$$renderer.push("<!--[4-->");
			$$renderer.push(`<div class="watch-header svelte-ndauuo"><p class="eyebrow svelte-ndauuo">HomeBody Video</p> <h1 class="svelte-ndauuo">${escape_html(playbackData().video.title)}</h1></div> `);
			if (playbackData().video.playbackId) {
				$$renderer.push("<!--[0-->");
				MuxPlayer($$renderer, {
					playbackId: playbackData().video.playbackId,
					thumbnailUrl: playbackData().video.thumbnailUrl,
					title: playbackData().video.title,
					videoId: playbackData().video._id,
					onProgress: updateProgress
				});
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="player-placeholder svelte-ndauuo">`);
				Notice($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->הווידאו עדיין בעיבוד`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			}
			$$renderer.push(`<!--]--> <div class="meta-card svelte-ndauuo"><div class="meta-row svelte-ndauuo"><span class="meta-label svelte-ndauuo">משך</span> <span class="meta-value svelte-ndauuo">${escape_html(durationLabel(playbackData().video.durationSeconds))}</span></div> <div class="meta-row svelte-ndauuo"><span class="meta-label svelte-ndauuo">ציוד נדרש</span> <span class="meta-value svelte-ndauuo">${escape_html(playbackData().video.requiredEquipment.map(equipmentLabel).join(", ") || "ללא")}</span></div> <p class="desc svelte-ndauuo">${escape_html(playbackData().video.description)}</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="state-card svelte-ndauuo"><div class="skeleton skeleton--large svelte-ndauuo"></div> <div class="skeleton svelte-ndauuo"></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { WatchShell as t };
