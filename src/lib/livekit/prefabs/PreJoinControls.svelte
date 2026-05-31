<script lang="ts">
	import { Button } from 'bits-ui';
	import PreJoinMediaControl from './PreJoinMediaControl.svelte';
	import PreJoinSpeakerControl from './PreJoinSpeakerControl.svelte';
	import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

	interface Props {
		micLabel?: string;
		camLabel?: string;
		noDeviceLabel?: string;
		speakerLabel?: string;
		speakerHintSupported?: string;
		speakerHintUnsupported?: string;
		joinLabel?: string;
		joinIcon?: string;
		joinButtonClass?: string;
		secondaryJoinLabel?: string;
		userLabel?: string;
		showUsername?: boolean;
		audioEnabled: boolean;
		videoEnabled: boolean;
		audioDeviceId: string;
		videoDeviceId: string;
		audioInputDevices: MediaDeviceInfo[];
		videoInputDevices: MediaDeviceInfo[];
		audioOutputDevices: MediaDeviceInfo[];
		username?: string;
		isValid: boolean;
		onToggleAudio: (enabled: boolean) => void;
		onSelectAudioDevice: (id: string) => void;
		onToggleVideo: (enabled: boolean) => void;
		onSelectVideoDevice: (id: string) => void;
		onEnableFailed: () => void;
		onSubmit: (event: SubmitEvent) => void;
		onSecondaryJoin?: () => void;
	}

	let {
		micLabel = 'Microphone',
		camLabel = 'Camera',
		noDeviceLabel = 'אין מכשיר זמין',
		speakerLabel = 'רמקול',
		speakerHintSupported = 'בחירת הרמקול תחול על שמע השיעור לאחר הכניסה.',
		speakerHintUnsupported = 'הדפדפן לא תומך בבחירת רמקול — השמע יוצא למכשיר ברירת המחדל.',
		joinLabel = 'Join Room',
		joinIcon = 'sensors',
		joinButtonClass = '',
		secondaryJoinLabel = '',
		userLabel = 'Username',
		showUsername = true,
		audioEnabled,
		videoEnabled,
		audioDeviceId,
		videoDeviceId,
		audioInputDevices,
		videoInputDevices,
		audioOutputDevices,
		username = $bindable(''),
		isValid,
		onToggleAudio,
		onSelectAudioDevice,
		onToggleVideo,
		onSelectVideoDevice,
		onEnableFailed,
		onSubmit,
		onSecondaryJoin,
	}: Props = $props();
</script>

<div class="lk-prejoin__footer" dir="rtl">
	<div class="lk-prejoin__footer-controls">
		<PreJoinMediaControl
			kind="mic"
			label={micLabel}
			{noDeviceLabel}
			enabled={audioEnabled}
			devices={audioInputDevices}
			selectedDeviceId={audioDeviceId}
			onToggle={onToggleAudio}
			onSelectDevice={onSelectAudioDevice}
		/>
		<PreJoinMediaControl
			kind="camera"
			label={camLabel}
			{noDeviceLabel}
			enabled={videoEnabled}
			devices={videoInputDevices}
			selectedDeviceId={videoDeviceId}
			onToggle={onToggleVideo}
			onSelectDevice={onSelectVideoDevice}
			onEnableFailed={onEnableFailed}
		/>
		<PreJoinSpeakerControl
			label={speakerLabel}
			{speakerHintSupported}
			{speakerHintUnsupported}
			devices={audioOutputDevices}
		/>
	</div>

	<div class="lk-prejoin__footer-join">
		<form class="lk-prejoin__form" onsubmit={onSubmit}>
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

<style>
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
