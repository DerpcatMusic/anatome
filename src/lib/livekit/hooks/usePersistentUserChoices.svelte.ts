import type { LocalUserChoices } from "@livekit/components-core";
import { PersistedState } from "runed";

export type UsePersistentUserChoicesOptions = {
	defaults?: Partial<LocalUserChoices>;
	preventSave?: boolean;
	preventLoad?: boolean;
};

const PREFIX = "hb-live";
const LEGACY_PREFIX = "lk";

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
 * Persist user media choices to localStorage via Runed PersistedState.
 * PersistedState debounces storage writes internally — no manual setTimeout needed.
 * Shared storage schema with LivePersistentDevices for Live room sessions.
 * @alpha
 */
export function usePersistentUserChoices(options: UsePersistentUserChoicesOptions = {}) {
	const initial = mergeDefaults(options.defaults ?? {});
	const preventSave = options.preventSave ?? false;
	const preventLoad = options.preventLoad ?? false;

	/**
	 * Build a per-field PersistedState (shared storage schema with LivePersistentDevices).
	 * Each field has its own key for independent cross-tab sync granularity.
	 */
	function makeField<T>(key: string, legacyKey: string, fallback: T): { current: T } {
		if (!preventLoad) {
			migrateLegacyStorageKey(key, legacyKey);
		}
		if (preventLoad) {
			// In-memory only — never touch localStorage on read.
			let val = $state<T>(fallback);
			return {
				get current() {
					return val;
				},
				set current(v: T) {
					val = v;
				},
			};
		}
		const persisted = new PersistedState(key, fallback, { storage: "local" });
		if (preventSave) {
			persisted.disconnect();
		}
		return persisted;
	}

	const audioEnabled = makeField(
		`${PREFIX}-audio-enabled`,
		`${LEGACY_PREFIX}-audio-enabled`,
		initial.audioEnabled,
	);
	const videoEnabled = makeField(
		`${PREFIX}-video-enabled`,
		`${LEGACY_PREFIX}-video-enabled`,
		initial.videoEnabled,
	);
	const audioDeviceId = makeField(
		`${PREFIX}-audio-device`,
		`${LEGACY_PREFIX}-audio-device`,
		initial.audioDeviceId,
	);
	const videoDeviceId = makeField(
		`${PREFIX}-video-device`,
		`${LEGACY_PREFIX}-video-device`,
		initial.videoDeviceId,
	);
	const username = makeField(
		`${LEGACY_PREFIX}-username`,
		`${LEGACY_PREFIX}-username`,
		initial.username,
	);

	const userChoices = $derived<LocalUserChoices>({
		audioEnabled: audioEnabled.current,
		videoEnabled: videoEnabled.current,
		audioDeviceId: audioDeviceId.current,
		videoDeviceId: videoDeviceId.current,
		username: username.current,
	});

	/**
	 * Write partial choices to PersistedState.
	 * PersistedState debounces storage writes internally — direct assignment is fine.
	 */
	function saveUserChoices(partial: Partial<LocalUserChoices>) {
		if (preventSave) return;
		if (partial.audioEnabled !== undefined) audioEnabled.current = partial.audioEnabled;
		if (partial.videoEnabled !== undefined) videoEnabled.current = partial.videoEnabled;
		if (partial.audioDeviceId !== undefined) audioDeviceId.current = partial.audioDeviceId;
		if (partial.videoDeviceId !== undefined) videoDeviceId.current = partial.videoDeviceId;
		if (partial.username !== undefined) username.current = partial.username;
	}

	return {
		get userChoices() {
			return userChoices;
		},
		saveUserChoices,
		saveAudioInputEnabled: (v: boolean) => saveUserChoices({ audioEnabled: v }),
		saveVideoInputEnabled: (v: boolean) => saveUserChoices({ videoEnabled: v }),
		saveAudioInputDeviceId: (v: string) => saveUserChoices({ audioDeviceId: v }),
		saveVideoInputDeviceId: (v: string) => saveUserChoices({ videoDeviceId: v }),
		saveUsername: (v: string) => saveUserChoices({ username: v }),
	};
}
