<script lang="ts">
	import { Track, createLocalTracks, VideoPresets } from 'livekit-client';
	import { log, type LocalUserChoices } from '@livekit/components-core';
	import { sanitizeMediaDeviceId } from '$lib/media/device-id';
	import { usePersistentUserChoices } from '../hooks/usePersistentUserChoices.svelte';
	import { usePreJoinDevices } from '../hooks/usePreJoinDevices.svelte';
	import { tick } from 'svelte';
	import PreJoinControls from './PreJoinControls.svelte';
	import PreJoinVideoPreview from './PreJoinVideoPreview.svelte';
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
		secondaryJoinLabel?: string;
		onSecondaryJoin?: () => void;
		micLabel?: string;
		camLabel?: string;
		noDeviceLabel?: string;
		speakerLabel?: string;
		speakerHintSupported?: string;
		speakerHintUnsupported?: string;
		cameraNotFoundToast?: string;
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
		secondaryJoinLabel = '',
		onSecondaryJoin,
		micLabel = 'Microphone',
		camLabel = 'Camera',
		noDeviceLabel = 'אין מכשיר זמין',
		speakerLabel = 'רמקול',
		speakerHintSupported = 'בחירת הרמקול תחול על שמע השיעור לאחר הכניסה.',
		speakerHintUnsupported = 'הדפדפן לא תומך בבחירת רמקול — השמע יוצא למכשיר ברירת המחדל.',
		cameraNotFoundToast = 'לא זוהתה מצלמה',
		userLabel = 'Username',
		persistUserChoices = true,
		showUsername = true,
		class: className = '',
	}: PreJoinProps = $props();

	// svelte-ignore state_referenced_locally
	const {
		userChoices: initialUserChoices,
		saveUserChoices,
	} = usePersistentUserChoices({
		defaults,
		preventSave: !persistUserChoices,
		preventLoad: !persistUserChoices,
	});

	const {
		audioInputDevices,
		videoInputDevices,
		audioOutputDevices,
		refresh: refreshDevices,
	} = usePreJoinDevices();

	let audioEnabled = $state<boolean>(initialUserChoices.audioEnabled);
	let videoEnabled = $state<boolean>(initialUserChoices.videoEnabled);
	let audioDeviceId = $state<string>(initialUserChoices.audioDeviceId);
	let videoDeviceId = $state<string>(initialUserChoices.videoDeviceId);
	let username = $state<string>(initialUserChoices.username);

	let tracks = $state<Array<LocalAudioTrack | LocalVideoTrack>>([]);
	let videoEl = $state<HTMLVideoElement | null>(null);
	let centerToast = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	function showCenterToast(message: string) {
		centerToast = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			centerToast = '';
		}, 4500);
	}

	function isDeviceNotFoundError(err: unknown) {
		if (!(err instanceof DOMException)) return false;
		return err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError';
	}

	async function setAudioEnabled(enabled: boolean) {
		audioEnabled = enabled;
		if (enabled) await refreshDevices(true);
	}

	async function setVideoEnabled(enabled: boolean) {
		if (enabled) {
			await refreshDevices(true);
			if (videoInputDevices.length === 0) {
				showCenterToast(cameraNotFoundToast);
				videoEnabled = false;
				return;
			}
		}
		videoEnabled = enabled;
	}

	$effect(() => {
		if (audioEnabled || videoEnabled) {
			void refreshDevices(true);
		}
	});

	$effect(() => {
		return () => clearTimeout(toastTimer);
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
				if (!isCurrent) return;
				if (isDeviceNotFoundError(err) && video) {
					showCenterToast(cameraNotFoundToast);
					videoEnabled = false;
					return;
				}
				if (err instanceof Error) onError?.(err);
				else log.error(err);
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

	$effect(() => {
		saveUserChoices({
			audioEnabled,
			videoEnabled,
			audioDeviceId,
			videoDeviceId,
			username,
		});
	});

	function makeUserChoices(
		username: string,
		videoEnabled: boolean,
		videoDeviceId: string,
		audioEnabled: boolean,
		audioDeviceId: string,
	): LocalUserChoices {
		return {
			username,
			videoEnabled,
			videoDeviceId,
			audioEnabled,
			audioDeviceId,
		};
	}

	const userChoices = $derived(makeUserChoices(username, videoEnabled, videoDeviceId, audioEnabled, audioDeviceId));

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

	const handleAudioToggle = (enabled: boolean) => void setAudioEnabled(enabled);
	const handleAudioDeviceSelect = (id: string) => {
		audioDeviceId = id;
	};
	const handleVideoToggle = (enabled: boolean) => void setVideoEnabled(enabled);
	const handleVideoDeviceSelect = (id: string) => {
		videoDeviceId = id;
	};
	const handleEnableFailed = () => showCenterToast(cameraNotFoundToast);
</script>

<div class="lk-prejoin lk-prejoin--flat {className}">
	<PreJoinVideoPreview
		{videoEnabled}
		{videoTrack}
		{centerToast}
		bind:videoEl
	/>

	<PreJoinControls
		{micLabel}
		{camLabel}
		{noDeviceLabel}
		{speakerLabel}
		{speakerHintSupported}
		{speakerHintUnsupported}
		{joinLabel}
		{joinIcon}
		{joinButtonClass}
		{secondaryJoinLabel}
		{userLabel}
		{showUsername}
		audioEnabled={audioEnabled}
		videoEnabled={videoEnabled}
		audioDeviceId={audioDeviceId}
		videoDeviceId={videoDeviceId}
		audioInputDevices={audioInputDevices}
		videoInputDevices={videoInputDevices}
		audioOutputDevices={audioOutputDevices}
		bind:username
		{isValid}
		onToggleAudio={handleAudioToggle}
		onSelectAudioDevice={handleAudioDeviceSelect}
		onToggleVideo={handleVideoToggle}
		onSelectVideoDevice={handleVideoDeviceSelect}
		onEnableFailed={handleEnableFailed}
		onSubmit={handleSubmit}
		onSecondaryJoin={onSecondaryJoin}
	/>
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

</style>
