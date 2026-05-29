<script lang="ts">
	import { Track, createLocalTracks, VideoPresets } from 'livekit-client';
	import { log, type LocalUserChoices } from '@livekit/components-core';
	import { sanitizeMediaDeviceId } from '$lib/media/device-id';
	import { usePersistentUserChoices } from '../hooks/usePersistentUserChoices.svelte';
	import { usePreJoinDevices } from '../hooks/usePreJoinDevices.svelte';
	import { tick } from 'svelte';
	import { Button } from 'bits-ui';
	import PreJoinMediaControl from './PreJoinMediaControl.svelte';
	import PreJoinSpeakerControl from './PreJoinSpeakerControl.svelte';
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
		{#if centerToast}
			<div class="lk-prejoin__center-toast" role="alert">
				<p>{centerToast}</p>
			</div>
		{/if}
	</div>

	<div class="lk-prejoin__footer" dir="rtl">
		<div class="lk-prejoin__footer-controls">
			<PreJoinMediaControl
				kind="mic"
				label={micLabel}
				{noDeviceLabel}
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
				{noDeviceLabel}
				enabled={videoEnabled}
				devices={videoInputDevices}
				selectedDeviceId={videoDeviceId}
				onToggle={(enabled) => void setVideoEnabled(enabled)}
				onSelectDevice={(id) => {
					videoDeviceId = id;
				}}
				onEnableFailed={() => showCenterToast(cameraNotFoundToast)}
			/>
			<PreJoinSpeakerControl
				label={speakerLabel}
				{speakerHintSupported}
				{speakerHintUnsupported}
				devices={audioOutputDevices}
			/>
		</div>

		<div class="lk-prejoin__footer-join">
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
			{#if secondaryJoinLabel && onSecondaryJoin}
				<Button.Root
					class="hb-button hb-button--ghost lk-prejoin__secondary"
					type="button"
					onclick={onSecondaryJoin}
				>
					{secondaryJoinLabel}
				</Button.Root>
			{/if}
		</div>
	</div>
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
		border-radius: var(--radius-lg);
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

	.lk-prejoin__center-toast {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: grid;
		place-items: center;
		padding: var(--space-4);
		pointer-events: none;
	}

	.lk-prejoin__center-toast p {
		margin: 0;
		max-width: 26ch;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--foreground) 88%, transparent);
		color: var(--background);
		font-size: var(--step--1);
		font-weight: 700;
		text-align: center;
		line-height: 1.45;
		box-shadow: var(--shadow-md);
		direction: rtl;
	}

	.lk-prejoin__footer {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		gap: clamp(var(--space-3), 3vw, var(--space-5));
		align-items: start;
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
	}

	.lk-prejoin__footer-controls {
		display: grid;
		gap: var(--space-2);
		min-width: 0;
	}

	.lk-prejoin__footer-join {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-width: 0;
	}

	.lk-prejoin__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
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

	.lk-prejoin__secondary {
		width: 100%;
		justify-content: center;
	}

	@media (max-width: 40rem) {
		.lk-prejoin__footer {
			grid-template-columns: 1fr;
		}

		.lk-prejoin__footer-join {
			order: -1;
		}
	}
</style>
