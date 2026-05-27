<script lang="ts">
	import { Track, createLocalTracks, VideoPresets } from 'livekit-client';
	import { log, type LocalUserChoices } from '@livekit/components-core';
	import { sanitizeMediaDeviceId } from '$lib/media/device-id';
	import { usePersistentUserChoices } from '../hooks/usePersistentUserChoices.svelte';
	import { usePreJoinDevices } from '../hooks/usePreJoinDevices.svelte';
	import { tick } from 'svelte';
	import { Button } from 'bits-ui';
	import PreJoinMediaControl from './PreJoinMediaControl.svelte';
	import ParticipantPlaceholder from '../components/participant/ParticipantPlaceholder.svelte';
	import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

	interface PreJoinProps {
		onSubmit?: (values: LocalUserChoices) => void;
		onValidate?: (values: LocalUserChoices) => boolean;
		onError?: (error: Error) => void;
		defaults?: Partial<LocalUserChoices>;
		joinLabel?: string;
		/** Material Symbols name for the primary submit button. */
		joinIcon?: string;
		/** Extra classes on the primary submit (e.g. start-live variant). */
		joinButtonClass?: string;
		micLabel?: string;
		camLabel?: string;
		userLabel?: string;
		persistUserChoices?: boolean;
		showUsername?: boolean;
		class?: string;
	}

	let {
		onSubmit,
		onValidate,
		onError,
		defaults = {},
		joinLabel = 'Join Room',
		joinIcon = 'sensors',
		joinButtonClass = '',
		micLabel = 'Microphone',
		camLabel = 'Camera',
		userLabel = 'Username',
		persistUserChoices = true,
		showUsername = true,
		class: className = '',
	}: PreJoinProps = $props();

	const {
		userChoices: initialUserChoices,
		saveUserChoices,
	} = usePersistentUserChoices({
		defaults,
		preventSave: !persistUserChoices,
		preventLoad: !persistUserChoices,
	});

	const { audioInputDevices, videoInputDevices, refresh: refreshDevices } = usePreJoinDevices();

	let audioEnabled = $state<boolean>(initialUserChoices.audioEnabled);
	let videoEnabled = $state<boolean>(initialUserChoices.videoEnabled);
	let audioDeviceId = $state<string>(initialUserChoices.audioDeviceId);
	let videoDeviceId = $state<string>(initialUserChoices.videoDeviceId);
	let username = $state<string>(initialUserChoices.username);

	let tracks = $state<Array<LocalAudioTrack | LocalVideoTrack>>([]);
	let videoEl = $state<HTMLVideoElement | null>(null);

	async function setAudioEnabled(enabled: boolean) {
		audioEnabled = enabled;
		if (enabled) await refreshDevices(true);
	}

	async function setVideoEnabled(enabled: boolean) {
		videoEnabled = enabled;
		if (enabled) await refreshDevices(true);
	}

	$effect(() => {
		if (audioEnabled || videoEnabled) {
			void refreshDevices(true);
		}
	});

	// Preview tracks — re-run when toggles or device ids change.
	$effect(() => {
		const audioId = sanitizeMediaDeviceId(audioDeviceId);
		const videoId = sanitizeMediaDeviceId(videoDeviceId);
		const audio = audioEnabled ? (audioId ? { deviceId: audioId } : true) : false;
		const video = videoEnabled
			? {
					...(videoId ? { deviceId: videoId } : {}),
					resolution: VideoPresets.h720.resolution,
				}
			: false;

		let isCurrent = true;
		let createdTracks: Array<LocalAudioTrack | LocalVideoTrack> = [];

		async function setup() {
			if (!audio && !video) {
				tracks = [];
				return;
			}
			try {
				createdTracks = (await createLocalTracks({ audio, video })) as Array<
					LocalAudioTrack | LocalVideoTrack
				>;
				if (isCurrent) {
					tracks = createdTracks;
				} else {
					createdTracks.forEach((t) => t.stop());
				}
			} catch (err) {
				if (isCurrent) {
					if (err instanceof Error) onError?.(err);
					else log.error(err);
				}
			}
		}

		void setup();

		return () => {
			isCurrent = false;
			createdTracks.forEach((t) => t.stop());
		};
	});

	const videoTrack = $derived(
		tracks.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack | undefined,
	);

	// Attach only after <video> is in the DOM (avoids Firefox "object can not be found here").
	$effect(() => {
		const el = videoEl;
		const track = videoTrack;
		if (!el || !track) return;

		let cancelled = false;
		void tick().then(() => {
			if (cancelled || !el.isConnected) return;
			track.attach(el);
		});

		return () => {
			cancelled = true;
			track.detach(el);
		};
	});

	// Debounced persistence (single writer — see usePersistentUserChoices)
	$effect(() => {
		saveUserChoices({
			audioEnabled,
			videoEnabled,
			audioDeviceId,
			videoDeviceId,
			username,
		});
	});

	const userChoices = $derived<LocalUserChoices>({
		username,
		videoEnabled,
		videoDeviceId,
		audioEnabled,
		audioDeviceId,
	});

	const isValid = $derived(
		(onValidate ??
			((values: LocalUserChoices) => !showUsername || values.username.trim() !== ''))(
			userChoices,
		),
	);

	function stopPreviewTracks() {
		for (const track of tracks) {
			track.stop();
		}
		tracks = [];
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isValid) {
			stopPreviewTracks();
			onSubmit?.(userChoices);
		} else {
			log.warn('Validation failed with: ', userChoices);
		}
	}
</script>

<div class="lk-prejoin lk-prejoin--flat {className}">
	<div class="lk-prejoin__video">
		{#if videoEnabled}
			<video bind:this={videoEl} width="1280" height="720" autoplay playsinline muted></video>
		{/if}
		{#if !videoEnabled || !videoTrack}
			<div class="lk-prejoin__placeholder">
				<ParticipantPlaceholder />
			</div>
		{/if}
	</div>

	<div class="lk-prejoin__controls">
		<PreJoinMediaControl
			kind="mic"
			label={micLabel}
			enabled={audioEnabled}
			devices={audioInputDevices}
			selectedDeviceId={audioDeviceId}
			onToggle={(enabled) => void setAudioEnabled(enabled)}
			onSelectDevice={(id) => {
				audioDeviceId = id;
			}}
		/>
		<PreJoinMediaControl
			kind="camera"
			label={camLabel}
			enabled={videoEnabled}
			devices={videoInputDevices}
			selectedDeviceId={videoDeviceId}
			onToggle={(enabled) => void setVideoEnabled(enabled)}
			onSelectDevice={(id) => {
				videoDeviceId = id;
			}}
		/>
	</div>

	<form class="lk-prejoin__form" onsubmit={handleSubmit}>
		{#if showUsername}
			<input
				class="lk-prejoin__input"
				id="username"
				name="username"
				type="text"
				bind:value={username}
				placeholder={userLabel}
				autocomplete="off"
			/>
		{/if}
		<Button.Root
			class="hb-button hb-button--primary hb-button--md lk-prejoin__join {joinButtonClass}"
			type="submit"
			disabled={!isValid}
		>
			<span class="material-symbols-rounded" aria-hidden="true">{joinIcon}</span>
			{joinLabel}
		</Button.Root>
	</form>
</div>

<style>
	.lk-prejoin {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		align-items: stretch;
		width: 100%;
	}

	.lk-prejoin--flat {
		padding: 0;
		background: transparent;
		border: 0;
		box-shadow: none;
	}

	.lk-prejoin__video {
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
		aspect-ratio: 16 / 9;
		background: var(--muted);
		border-radius: var(--radius-md);
		overflow: hidden;
		position: relative;
	}

	.lk-prejoin__video video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scaleX(-1);
	}

	.lk-prejoin__placeholder {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.lk-prejoin__controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		justify-content: flex-start;
		direction: rtl;
	}

	.lk-prejoin__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
		max-width: 22rem;
		margin-inline: auto;
	}

	.lk-prejoin__input {
		flex: 1;
		min-height: 40px;
		padding-inline: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-sm);
		background: var(--card);
		color: var(--foreground);
		font: inherit;
	}

	.lk-prejoin__input:focus {
		outline: none;
		border-color: var(--secondary);
		box-shadow: var(--ring);
	}

	.lk-prejoin__join {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
	}

	.lk-prejoin__join .material-symbols-rounded {
		--icon-size: 1.25rem;
	}

	@media (max-width: 40rem) {
		.lk-prejoin__controls {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
