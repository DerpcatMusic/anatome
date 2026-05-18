import { n as onDestroy } from "../../../../chunks/index-server.js";
import { U as escape_html, a as derived, r as attr_style } from "../../../../chunks/dev.js";
import { r as initAuth } from "../../../../chunks/session.svelte.js";
import { t as Notice } from "../../../../chunks/Notice.js";
//#region src/components/live/LiveRoomShell.svelte
function LiveRoomShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		let status = "checking";
		let connectionState = "idle";
		let error = "";
		let joinInfo = null;
		let room = null;
		let mediaTiles = [];
		let participants = [];
		let navbarBlockSize = 0;
		let navbarObserver = null;
		let streamStats = {
			bitrateMbps: null,
			packetLoss: null,
			width: null,
			height: null,
			fps: null,
			videoTracks: 0,
			audioTracks: 0
		};
		let statsTimer = null;
		const previousStats = /* @__PURE__ */ new Map();
		derived(() => joinInfo?.participantRole === "instructor");
		const videoTiles = derived(() => mediaTiles.filter((tile) => tile.kind === "video"));
		derived(() => mediaTiles.filter((tile) => tile.kind === "audio"));
		const instructorVideos = derived(() => videoTiles().filter((tile) => tile.isInstructor).sort(tileSort));
		derived(() => videoTiles().filter((tile) => !tile.isInstructor).sort(tileSort));
		const screenShareVideo = derived(() => videoTiles().find((tile) => tile.source === "screen_share") ?? null);
		derived(() => screenShareVideo() ?? instructorVideos().find((tile) => !tile.isLocal) ?? instructorVideos()[0] ?? null);
		derived(() => videoTiles().find((tile) => tile.isLocal && tile.source !== "screen_share") ?? null);
		derived(() => participants.filter((participant) => !participant.isInstructor));
		derived(() => connectionState === "connected" ? "מחובר" : connectionState === "reconnecting" ? "מתחבר מחדש" : connectionState === "connecting" ? "מתחבר" : "מנותק");
		derived(() => streamStats.bitrateMbps === null ? "—" : `${streamStats.bitrateMbps.toFixed(1)} Mbps`);
		derived(() => streamStats.width && streamStats.height ? `${streamStats.width}×${streamStats.height}` : "—");
		derived(() => streamStats.fps === null ? "—" : `${Math.round(streamStats.fps)} fps`);
		derived(() => streamStats.packetLoss === null ? "—" : `${streamStats.packetLoss.toFixed(1)}%`);
		function tileSort(a, b) {
			if (a.source === "screen_share" && b.source !== "screen_share") return -1;
			if (a.source !== "screen_share" && b.source === "screen_share") return 1;
			if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
			return a.name.localeCompare(b.name);
		}
		function clearMediaTiles() {
			mediaTiles.forEach((tile) => tile.element.remove());
			mediaTiles = [];
		}
		function stopStatsTimer() {
			if (statsTimer !== null) window.clearInterval(statsTimer);
			statsTimer = null;
			previousStats.clear();
		}
		onDestroy(() => {
			console.log("[LiveKit] Disconnecting room");
			clearMediaTiles();
			stopStatsTimer();
			navbarObserver?.disconnect();
			room?.disconnect();
			room = null;
		});
		$$renderer.push(`<section class="live-room svelte-15k71uc"${attr_style(`--navbar-block-size: ${navbarBlockSize}px;`)}>`);
		if (auth.isLoading || status === "checking") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="state-card svelte-15k71uc"><p class="kicker svelte-15k71uc">HomeBody Live</p> <h1 class="svelte-15k71uc">בודקים הרשאה ללייב</h1> <div class="skeleton svelte-15k71uc"></div></div>`);
		} else if (status === "locked") {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="state-card svelte-15k71uc"><p class="kicker svelte-15k71uc">חשבון נעול</p> <h1 class="svelte-15k71uc">צריך להתחבר כדי להיכנס ללייב</h1> `);
			if (auth.error) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(auth.error)}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <a class="button-link svelte-15k71uc" href="/">כניסה</a></div>`);
		} else if (status === "missing") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="state-card svelte-15k71uc"><p class="kicker svelte-15k71uc">חסר שיעור</p> <h1 class="svelte-15k71uc">לא נבחר שיעור לייב</h1> <a class="button-link svelte-15k71uc" href="/calendar">חזרה ללוח</a></div>`);
		} else if (status === "error") {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="state-card svelte-15k71uc"><p class="kicker svelte-15k71uc">לא נכנסים עדיין</p> <h1 class="svelte-15k71uc">הכניסה ללייב נחסמה</h1> `);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(error)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> <div class="state-actions svelte-15k71uc"><button type="button" class="svelte-15k71uc">לנסות שוב</button> <a href="/calendar" class="svelte-15k71uc">חזרה ללוח</a></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
//#region src/routes/(app)/live-room/+page.svelte
function _page($$renderer) {
	LiveRoomShell($$renderer, {});
}
//#endregion
export { _page as default };
