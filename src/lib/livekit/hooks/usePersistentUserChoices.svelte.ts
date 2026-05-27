import type { LocalUserChoices } from "@livekit/components-core";
import { PersistedState } from "runed";

export type UsePersistentUserChoicesOptions = {
	defaults?: Partial<LocalUserChoices>;
	preventSave?: boolean;
	preventLoad?: boolean;
};

const PREFIX = "hb-live";
const LEGACY_PREFIX = "lk";
const SAVE_DEBOUNCE_MS = 300;

const defaultChoices: LocalUserChoices = {
	audioEnabled: true,
	videoEnabled: true,
	audioDeviceId: "",
	videoDeviceId: "",
	username: "",
};

function mergeDefaults(defaults: Partial<LocalUserChoices>): LocalUserChoices {
	return { ...defaultChoices, ...defaults };
}

function migrateLegacyStorageKey(newKey: string, legacyKey: string) {
	if (typeof localStorage === "undefined") return;
	try {
		if (localStorage.getItem(newKey) !== null) return;
		const legacy = localStorage.getItem(legacyKey);
		if (legacy === null) return;
		localStorage.setItem(newKey, legacy);
		localStorage.removeItem(legacyKey);
	} catch {
		/* ignore quota / private mode */
	}
}

/**
 * Persist user media choices to localStorage via RUNED PersistedState.
 * Writes are debounced so PreJoin does not hammer storage on every keystroke.
 * @alpha
 */
export function usePersistentUserChoices(options: UsePersistentUserChoicesOptions = {}) {
	const initial = mergeDefaults(options.defaults ?? {});
	const preventSave = options.preventSave ?? false;
	const preventLoad = options.preventLoad ?? false;

	function makeState<T>(key: string, legacyKey: string, fallback: T) {
		if (!preventLoad) {
			migrateLegacyStorageKey(key, legacyKey);
		}
		if (preventLoad) {
			let val = $state(fallback);
			return {
				get current() {
					return val;
				},
				set current(v: T) {
					val = v as unknown as typeof val;
				},
				disconnect() {},
			};
		}
		const persisted = new PersistedState(key, fallback, { storage: "local" });
		if (preventSave) {
			persisted.disconnect();
		}
		return persisted;
	}

	const audioEnabled = makeState(
		`${PREFIX}-audio-enabled`,
		`${LEGACY_PREFIX}-audio-enabled`,
		initial.audioEnabled,
	);
	const videoEnabled = makeState(
		`${PREFIX}-video-enabled`,
		`${LEGACY_PREFIX}-video-enabled`,
		initial.videoEnabled,
	);
	const audioDeviceId = makeState(
		`${PREFIX}-audio-device`,
		`${LEGACY_PREFIX}-audio-device`,
		initial.audioDeviceId,
	);
	const videoDeviceId = makeState(
		`${PREFIX}-video-device`,
		`${LEGACY_PREFIX}-video-device`,
		initial.videoDeviceId,
	);
	const username = makeState(`${LEGACY_PREFIX}-username`, `${LEGACY_PREFIX}-username`, initial.username);

	const userChoices = $derived<LocalUserChoices>({
		audioEnabled: audioEnabled.current,
		videoEnabled: videoEnabled.current,
		audioDeviceId: audioDeviceId.current,
		videoDeviceId: videoDeviceId.current,
		username: username.current,
	});

	let debounceHandle: ReturnType<typeof setTimeout> | undefined;
	let pending: Partial<LocalUserChoices> = {};

	function flushPending() {
		if (preventSave) return;
		const next = pending;
		pending = {};
		debounceHandle = undefined;
		if (next.audioEnabled !== undefined) audioEnabled.current = next.audioEnabled;
		if (next.videoEnabled !== undefined) videoEnabled.current = next.videoEnabled;
		if (next.audioDeviceId !== undefined) audioDeviceId.current = next.audioDeviceId;
		if (next.videoDeviceId !== undefined) videoDeviceId.current = next.videoDeviceId;
		if (next.username !== undefined) username.current = next.username;
	}

	function saveUserChoices(partial: Partial<LocalUserChoices>) {
		if (preventSave) return;
		Object.assign(pending, partial);
		clearTimeout(debounceHandle);
		debounceHandle = setTimeout(flushPending, SAVE_DEBOUNCE_MS);
	}

	$effect(() => {
		return () => {
			clearTimeout(debounceHandle);
			flushPending();
		};
	});

	return {
		get userChoices() {
			return userChoices;
		},
		saveUserChoices,
		saveAudioInputEnabled: (v: boolean) => {
			saveUserChoices({ audioEnabled: v });
		},
		saveVideoInputEnabled: (v: boolean) => {
			saveUserChoices({ videoEnabled: v });
		},
		saveAudioInputDeviceId: (v: string) => {
			saveUserChoices({ audioDeviceId: v });
		},
		saveVideoInputDeviceId: (v: string) => {
			saveUserChoices({ videoDeviceId: v });
		},
		saveUsername: (v: string) => {
			saveUserChoices({ username: v });
		},
	};
}
