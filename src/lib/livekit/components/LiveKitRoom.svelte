<script lang="ts">
	import type { RoomOptions, RoomConnectOptions, Room } from "livekit-client";
	import { Room as RoomCtor } from "livekit-client";
	import type { Snippet } from "svelte";
	import { roomCtx } from "../contexts/room-context.svelte.js";
	import { LayoutContext } from "../contexts/layout-context.svelte.js";
	import LayoutContextProvider from "./LayoutContextProvider.svelte";
	import "$lib/livekit/styles/livekit-components.css";

	let {
		token,
		serverUrl,
		options,
		connectOptions,
		room: externalRoom,
		children,
	}: {
		token?: string;
		serverUrl?: string;
		options?: RoomOptions;
		connectOptions?: RoomConnectOptions;
		room?: Room;
		children: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const room = externalRoom ?? new RoomCtor(options);
	const layoutContext = new LayoutContext();
	roomCtx.set(room);

	$effect(() => {
		if (!externalRoom && token && serverUrl) {
			room.connect(serverUrl, token, connectOptions).catch((err) => {
				void err;
			});
		}
		return () => {
			if (!externalRoom) {
				room.disconnect();
			}
		};
	});
</script>

<LayoutContextProvider value={layoutContext}>
	<div class="lk-theme lk-room-root" data-lk-theme="homebody">
		{@render children()}
	</div>
</LayoutContextProvider>

<style>
	.lk-room-root {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		height: 100%;
		width: 100%;
	}
</style>
