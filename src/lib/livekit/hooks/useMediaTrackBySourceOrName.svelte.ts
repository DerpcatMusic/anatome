import type { TrackIdentifier } from "@livekit/components-core";
import { getTrackByIdentifier, log, setupMediaTrack } from "@livekit/components-core";
import type { TrackPublication } from "livekit-client";
import type { HTMLAttributes } from "svelte/elements";

export interface UseMediaTrackOptions {
	element?: HTMLMediaElement;
	props?: HTMLAttributes<HTMLVideoElement | HTMLAudioElement>;
}

/**
 * The `useMediaTrackBySourceOrName` hook manages the lifecycle of a media track
 * identified by source or name, including attach/detach and reactive state.
 *
 * @public
 */
export function useMediaTrackBySourceOrName(
	observerOptions: TrackIdentifier,
	options: UseMediaTrackOptions = {},
) {
	let publication = $state<TrackPublication | undefined>(getTrackByIdentifier(observerOptions));
	// svelte-ignore state_referenced_locally
	let isMuted = $state(publication?.isMuted);
	// svelte-ignore state_referenced_locally
	let isSubscribed = $state(publication?.isSubscribed);
	// svelte-ignore state_referenced_locally
	let track = $state(publication?.track);
	let orientation = $state<"landscape" | "portrait">("landscape");

	const { className, trackObserver } = setupMediaTrack(observerOptions);

	$effect(() => {
		let active = true;
		const subscription = trackObserver.subscribe((pub) => {
			if (!active) return;
			log.debug("update track", pub);
			publication = pub;
			isMuted = pub?.isMuted;
			isSubscribed = pub?.isSubscribed;
			track = pub?.track;
		});
		return () => {
			active = false;
			subscription.unsubscribe();
		};
	});

	$effect(() => {
		const el = options.element;
		if (track && el && !(observerOptions.participant.isLocal && track.kind === "audio")) {
			track.attach(el);
		}
		return () => {
			if (track && el) {
				track.detach(el);
			}
		};
	});

	$effect(() => {
		if (
			typeof publication?.dimensions?.width === "number" &&
			typeof publication?.dimensions?.height === "number"
		) {
			const next =
				publication.dimensions.width > publication.dimensions.height ? "landscape" : "portrait";
			orientation = next;
		}
	});

	return {
		get publication() {
			return publication;
		},
		get isMuted() {
			return isMuted;
		},
		get isSubscribed() {
			return isSubscribed;
		},
		get track() {
			return track;
		},
		get className() {
			return className;
		},
		get orientation() {
			return orientation;
		},
		get elementProps() {
			return {
				class: className,
				"data-lk-local-participant": observerOptions.participant.isLocal,
				"data-lk-source": publication?.source,
				...(publication?.kind === "video" && { "data-lk-orientation": orientation }),
				...options.props,
			};
		},
	};
}
