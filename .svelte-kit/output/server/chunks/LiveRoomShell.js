import { n as onDestroy } from "./index-server.js";
import { U as attr, W as escape_html, a as derived, l as stringify, n as attr_class, o as ensure_array_like, r as attr_style } from "./dev.js";
import { n as routePath } from "./context.js";
import { n as useConvexClient } from "./client.svelte.js";
import { r as initAuth, s as api } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
//#region src/lib/features/live/room.svelte.ts
var i18n = useI18n();
var LiveRoom = class {
	client;
	auth = initAuth();
	status = "checking";
	connectionState = "idle";
	error = "";
	mediaError = "";
	joinInfo = null;
	_room = null;
	mediaTiles = [];
	participants = [];
	micEnabled = false;
	cameraEnabled = false;
	screenShareEnabled = false;
	pendingControl = null;
	streamStats = {
		bitrateMbps: null,
		packetLoss: null,
		width: null,
		height: null,
		fps: null,
		videoTracks: 0,
		audioTracks: 0
	};
	trackStats = [];
	activeSpeakerIdentity = null;
	showParticipants = true;
	showQualityPanel = false;
	statsTimer = null;
	previousStats = /* @__PURE__ */ new Map();
	preConnectStep = "idle";
	previewStream = null;
	audioLevel = 0;
	audioInterval = null;
	audioContext = null;
	videoDevices = [];
	audioDevices = [];
	selectedVideoDevice = "";
	selectedAudioDevice = "";
	selectedCodec = "h264";
	selectedResolution = "1080p";
	audioProcessingEnabled = true;
	cameraAccess = "unknown";
	micAccess = "unknown";
	wantsCameraOnJoin = false;
	wantsMicOnJoin = false;
	publishCameraOnNextJoin = false;
	publishMicOnNextJoin = false;
	chatMessages = [];
	chatDraft = "";
	tileSort = (a, b) => {
		if (a.source === "screen_share" && b.source !== "screen_share") return -1;
		if (a.source !== "screen_share" && b.source === "screen_share") return 1;
		if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
		return a.name.localeCompare(b.name);
	};
	#isInstructorRoom = derived(() => this.joinInfo?.participantRole === "instructor" || this.joinInfo?.participantRole === "admin");
	get isInstructorRoom() {
		return this.#isInstructorRoom();
	}
	set isInstructorRoom($$value) {
		return this.#isInstructorRoom($$value);
	}
	#videoTiles = derived(() => this.mediaTiles.filter((tile) => tile.kind === "video"));
	get videoTiles() {
		return this.#videoTiles();
	}
	set videoTiles($$value) {
		return this.#videoTiles($$value);
	}
	#audioTiles = derived(() => this.mediaTiles.filter((tile) => tile.kind === "audio"));
	get audioTiles() {
		return this.#audioTiles();
	}
	set audioTiles($$value) {
		return this.#audioTiles($$value);
	}
	#screenShareTiles = derived(() => this.videoTiles.filter((t) => t.source === "screen_share"));
	get screenShareTiles() {
		return this.#screenShareTiles();
	}
	set screenShareTiles($$value) {
		return this.#screenShareTiles($$value);
	}
	#hasScreenShare = derived(() => this.screenShareTiles.length > 0);
	get hasScreenShare() {
		return this.#hasScreenShare();
	}
	set hasScreenShare($$value) {
		return this.#hasScreenShare($$value);
	}
	#instructorVideos = derived(() => this.videoTiles.filter((tile) => tile.isInstructor && tile.source !== "screen_share").sort(this.tileSort));
	get instructorVideos() {
		return this.#instructorVideos();
	}
	set instructorVideos($$value) {
		return this.#instructorVideos($$value);
	}
	#studentVideos = derived(() => this.videoTiles.filter((tile) => !tile.isInstructor).sort(this.tileSort));
	get studentVideos() {
		return this.#studentVideos();
	}
	set studentVideos($$value) {
		return this.#studentVideos($$value);
	}
	#primaryInstructorVideo = derived(() => this.hasScreenShare ? this.screenShareTiles[0] : this.instructorVideos.find((t) => !t.isLocal) ?? this.instructorVideos[0] ?? null);
	get primaryInstructorVideo() {
		return this.#primaryInstructorVideo();
	}
	set primaryInstructorVideo($$value) {
		return this.#primaryInstructorVideo($$value);
	}
	#selfVideo = derived(() => this.videoTiles.find((tile) => tile.isLocal && tile.source !== "screen_share") ?? null);
	get selfVideo() {
		return this.#selfVideo();
	}
	set selfVideo($$value) {
		return this.#selfVideo($$value);
	}
	#connectionLabel = derived(() => this.connectionState === "connected" ? i18n.t.live.room.connected() : this.connectionState === "reconnecting" ? i18n.t.live.room.reconnecting() : this.connectionState === "connecting" ? i18n.t.live.room.connecting() : i18n.t.live.room.disconnected());
	get connectionLabel() {
		return this.#connectionLabel();
	}
	set connectionLabel($$value) {
		return this.#connectionLabel($$value);
	}
	#formattedBitrate = derived(() => this.streamStats.bitrateMbps === null ? "—" : `${this.streamStats.bitrateMbps.toFixed(1)} Mbps`);
	get formattedBitrate() {
		return this.#formattedBitrate();
	}
	set formattedBitrate($$value) {
		return this.#formattedBitrate($$value);
	}
	#formattedResolution = derived(() => this.streamStats.width && this.streamStats.height ? `${this.streamStats.width}×${this.streamStats.height}` : "—");
	get formattedResolution() {
		return this.#formattedResolution();
	}
	set formattedResolution($$value) {
		return this.#formattedResolution($$value);
	}
	#formattedFps = derived(() => this.streamStats.fps === null ? "—" : `${Math.round(this.streamStats.fps)} fps`);
	get formattedFps() {
		return this.#formattedFps();
	}
	set formattedFps($$value) {
		return this.#formattedFps($$value);
	}
	#formattedPacketLoss = derived(() => this.streamStats.packetLoss === null ? "—" : `${this.streamStats.packetLoss.toFixed(1)}%`);
	get formattedPacketLoss() {
		return this.#formattedPacketLoss();
	}
	set formattedPacketLoss($$value) {
		return this.#formattedPacketLoss($$value);
	}
	#gridCols = derived(() => () => {
		const count = this.videoTiles.length;
		if (count <= 1) return 1;
		if (count <= 4) return 2;
		if (count <= 9) return 3;
		return 4;
	});
	get gridCols() {
		return this.#gridCols();
	}
	set gridCols($$value) {
		return this.#gridCols($$value);
	}
	#hasPreviewCamera = derived(() => Boolean(this.previewStream?.getVideoTracks().length));
	get hasPreviewCamera() {
		return this.#hasPreviewCamera();
	}
	set hasPreviewCamera($$value) {
		return this.#hasPreviewCamera($$value);
	}
	#hasPreviewMic = derived(() => Boolean(this.previewStream?.getAudioTracks().length));
	get hasPreviewMic() {
		return this.#hasPreviewMic();
	}
	set hasPreviewMic($$value) {
		return this.#hasPreviewMic($$value);
	}
	#expiresAt = derived(() => this.joinInfo?.joinClosesAt ?? null);
	get expiresAt() {
		return this.#expiresAt();
	}
	set expiresAt($$value) {
		return this.#expiresAt($$value);
	}
	#secondsUntilExpiry = derived(() => this.expiresAt === null ? null : Math.max(0, Math.floor((this.expiresAt - Date.now()) / 1e3)));
	get secondsUntilExpiry() {
		return this.#secondsUntilExpiry();
	}
	set secondsUntilExpiry($$value) {
		return this.#secondsUntilExpiry($$value);
	}
	constructor(client) {
		this.client = client;
	}
	getClassId() {
		return new URLSearchParams(window.location.search).get("classId");
	}
	isInstructorIdentity(identity) {
		return identity.startsWith("instructor_") || identity.startsWith("admin_");
	}
	participantName(participant) {
		const value = participant;
		return value.name || value.identity || i18n.t.live.room.fallbackName();
	}
	participantIdentity(participant) {
		return participant.identity ?? "unknown";
	}
	participantIsLocal(participant) {
		return Boolean(participant.isLocal);
	}
	publicationId(publication, track, fallback) {
		const pub = publication;
		const value = track;
		return pub.trackSid ?? pub.sid ?? value.sid ?? value.mediaStreamTrack?.id ?? fallback;
	}
	trackSource(publication) {
		const source = String(publication.source ?? "unknown");
		if (source === "camera" || source === "microphone" || source === "screen_share" || source === "screen_share_audio") return source;
		return "unknown";
	}
	upsertTile(tile) {
		const existing = this.mediaTiles.find((item) => item.id === tile.id);
		if (existing) existing.element.remove();
		this.mediaTiles = [...this.mediaTiles.filter((item) => item.id !== tile.id), tile];
	}
	detachTrack(track) {
		track.detach?.().forEach((element) => element.remove());
	}
	removeTiles(predicate) {
		this.mediaTiles.filter(predicate).forEach((tile) => tile.element.remove());
		this.mediaTiles = this.mediaTiles.filter((tile) => !predicate(tile));
	}
	removeTileByPublication(participant, publication, track) {
		const identity = this.participantIdentity(participant);
		const source = this.trackSource(publication);
		const id = `${identity}_${source}_${this.publicationId(publication, track, "track")}`;
		this.removeTiles((tile) => tile.id === id || tile.identity === identity && tile.source === source);
		this.detachTrack(track);
	}
	clearMediaTiles() {
		this.mediaTiles.forEach((tile) => tile.element.remove());
		this.mediaTiles = [];
	}
	addTrackTile(track, publication, participant, prefix) {
		const value = track;
		if (typeof value.attach !== "function") return;
		const identity = this.participantIdentity(participant);
		const source = this.trackSource(publication);
		const tileId = `${identity}_${source}_${this.publicationId(publication, track, prefix)}`;
		this.detachTrack(track);
		const element = value.attach();
		const kind = element instanceof HTMLAudioElement ? "audio" : "video";
		const isLocal = this.participantIsLocal(participant);
		if (kind === "video") {
			element.setAttribute("playsinline", "true");
			element.setAttribute("data-source", source);
			element.muted = isLocal;
		}
		this.upsertTile({
			id: tileId,
			identity,
			name: this.participantName(participant),
			element,
			kind,
			source,
			isLocal,
			isInstructor: this.isInstructorIdentity(identity)
		});
	}
	shouldSubscribeToPublication(participant) {
		if (this.isInstructorRoom) return true;
		return this.isInstructorIdentity(this.participantIdentity(participant));
	}
	targetQualityForPublication(participant) {
		return this.isInstructorIdentity(this.participantIdentity(participant)) ? 2 : 0;
	}
	subscribeIfAllowed(publication, participant) {
		const pub = publication;
		if (typeof pub.setSubscribed !== "function") return;
		const shouldSubscribe = this.shouldSubscribeToPublication(participant);
		pub.setSubscribed(shouldSubscribe);
		if (shouldSubscribe && pub.kind === "video" && typeof pub.setVideoQuality === "function") pub.setVideoQuality(this.targetQualityForPublication(participant));
	}
	attachParticipantListeners(participant, participantEvent) {
		const value = participant;
		value.on?.(participantEvent.IsSpeakingChanged, () => this.refreshParticipants());
		value.trackPublications?.forEach((publication) => {
			this.subscribeIfAllowed(publication, participant);
			const track = publication.track;
			if (track) this.addTrackTile(track, publication, participant, "remote");
		});
	}
	refreshParticipants() {
		if (this._room === null) return;
		const local = this._room.localParticipant;
		const next = [{
			identity: local.identity,
			name: local.name || local.identity,
			isInstructor: this.isInstructorIdentity(local.identity),
			isLocal: true,
			isSpeaking: Boolean(local.isSpeaking),
			hasCamera: Boolean([...local.trackPublications.values()].some((p) => this.trackSource(p) === "camera" && p.track)),
			hasMic: Boolean([...local.trackPublications.values()].some((p) => this.trackSource(p) === "microphone" && p.track))
		}];
		this._room.remoteParticipants.forEach((participant) => {
			const value = participant;
			next.push({
				identity: value.identity,
				name: value.name || value.identity,
				isInstructor: this.isInstructorIdentity(value.identity),
				isLocal: false,
				isSpeaking: Boolean(value.isSpeaking),
				hasCamera: Boolean([...value.trackPublications?.values() ?? []].some((p) => this.trackSource(p) === "camera" && p.track)),
				hasMic: Boolean([...value.trackPublications?.values() ?? []].some((p) => this.trackSource(p) === "microphone" && p.track))
			});
		});
		this.participants = next.sort((a, b) => Number(b.isInstructor) - Number(a.isInstructor) || a.name.localeCompare(b.name));
	}
	async collectTrackStats(track, id, name, source, kind) {
		const value = track;
		const settings = value.mediaStreamTrack?.getSettings?.();
		let bitrate = 0;
		let packetsLost = 0;
		let packetsTotal = 0;
		(await value.getRTCStatsReport?.())?.forEach((entry) => {
			const stats = entry;
			if (stats.type !== "outbound-rtp" && stats.type !== "inbound-rtp") return;
			const bytes = stats.bytesSent ?? stats.bytesReceived;
			if (typeof bytes === "number" && typeof stats.timestamp === "number") {
				const key = `${id}:${entry.id}`;
				const previous = this.previousStats.get(key);
				if (previous && stats.timestamp > previous.timestamp) bitrate += (bytes - previous.bytes) * 8 / ((stats.timestamp - previous.timestamp) / 1e3);
				this.previousStats.set(key, {
					timestamp: stats.timestamp,
					bytes
				});
			}
			if (typeof stats.packetsLost === "number") packetsLost += Math.max(0, stats.packetsLost);
			if (typeof stats.packetsReceived === "number") packetsTotal += stats.packetsReceived + Math.max(0, stats.packetsLost ?? 0);
		});
		return {
			id,
			name,
			kind,
			source,
			bitrateKbps: Math.round(bitrate / 1e3),
			packetLoss: packetsTotal > 0 ? packetsLost / packetsTotal * 100 : null,
			width: settings?.width ?? null,
			height: settings?.height ?? null,
			fps: settings?.frameRate ?? null
		};
	}
	async refreshStreamStats() {
		if (this._room === null) return;
		const publications = [];
		const local = this._room.localParticipant;
		local.trackPublications?.forEach((publication, id) => {
			const track = publication.track;
			const kind = String(publication.kind ?? "");
			if (track && (kind === "video" || kind === "audio")) publications.push({
				id: `local:${id}`,
				track,
				kind,
				name: local.name || local.identity || i18n.t.live.room.you(),
				source: this.trackSource(publication)
			});
		});
		this._room.remoteParticipants.forEach((participant) => {
			const remote = participant;
			remote.trackPublications?.forEach((publication, id) => {
				const track = publication.track;
				const kind = String(publication.kind ?? "");
				if (track && (kind === "video" || kind === "audio")) publications.push({
					id: `${remote.identity ?? "remote"}:${id}`,
					track,
					kind,
					name: remote.name || remote.identity || i18n.t.live.room.fallbackName(),
					source: this.trackSource(publication)
				});
			});
		});
		const results = await Promise.all(publications.map((p) => this.collectTrackStats(p.track, p.id, p.name, p.source, p.kind)));
		this.trackStats = results;
		const videoResults = results.filter((r) => r.kind === "video");
		const primaryVideo = videoResults.find((r) => r.source === "screen_share") ?? videoResults.find((r) => !r.id.startsWith("local:")) ?? videoResults[0];
		const totalBitrate = videoResults.reduce((sum, r) => sum + r.bitrateKbps, 0);
		this.streamStats = {
			bitrateMbps: totalBitrate > 0 ? totalBitrate / 1e3 : null,
			packetLoss: primaryVideo?.packetLoss ?? null,
			width: primaryVideo?.width ?? null,
			height: primaryVideo?.height ?? null,
			fps: primaryVideo?.fps ?? null,
			videoTracks: this.videoTiles.length,
			audioTracks: this.audioTiles.length
		};
	}
	startStatsTimer() {
		if (this.statsTimer !== null) return;
		this.refreshStreamStats();
		this.statsTimer = window.setInterval(() => void this.refreshStreamStats(), 2500);
	}
	stopStatsTimer() {
		if (this.statsTimer !== null) window.clearInterval(this.statsTimer);
		this.statsTimer = null;
		this.previousStats.clear();
	}
	getMediaErrorMessage(kind, reason) {
		const errName = reason instanceof DOMException ? reason.name : "";
		if (errName === "NotAllowedError" || errName === "PermissionDeniedError") return kind === "camera" ? i18n.t.live.preConnect.cameraNotAllowed() : i18n.t.live.preConnect.micNotAllowed();
		if (errName === "NotFoundError" || errName === "DevicesNotFoundError") return kind === "camera" ? i18n.t.live.preConnect.cameraNotFound() : i18n.t.live.preConnect.micNotFound();
		if (errName === "NotReadableError" || errName === "TrackStartError") return kind === "camera" ? i18n.t.live.preConnect.cameraNotReadable() : i18n.t.live.preConnect.micNotReadable();
		if (errName === "AbortError") return kind === "camera" ? i18n.t.live.preConnect.cameraAborted() : i18n.t.live.preConnect.micAborted();
		return kind === "camera" ? i18n.t.live.preConnect.cameraGeneric() : i18n.t.live.preConnect.micGeneric();
	}
	accessStateFromError(reason) {
		const errName = reason instanceof DOMException ? reason.name : "";
		if (errName === "NotAllowedError" || errName === "PermissionDeniedError") return "denied";
		if (errName === "NotFoundError" || errName === "DevicesNotFoundError") return "missing";
		return "failed";
	}
	async enumerateDevices() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		this.videoDevices = devices.filter((d) => d.kind === "videoinput").map((d) => ({
			deviceId: d.deviceId,
			label: d.label || i18n.t.live.preConnect.cameraLabel()
		}));
		this.audioDevices = devices.filter((d) => d.kind === "audioinput").map((d) => ({
			deviceId: d.deviceId,
			label: d.label || i18n.t.live.preConnect.micLabel()
		}));
	}
	buildPreviewStream(videoTrack, audioTrack) {
		const tracks = [videoTrack, audioTrack].filter((track) => Boolean(track));
		this.previewStream = tracks.length > 0 ? new MediaStream(tracks) : null;
	}
	startAudioMeter(stream) {
		if (!stream.getAudioTracks()[0]) return;
		this.audioContext = new AudioContext();
		const source = this.audioContext.createMediaStreamSource(stream);
		const analyser = this.audioContext.createAnalyser();
		analyser.fftSize = 256;
		source.connect(analyser);
		const data = new Uint8Array(analyser.frequencyBinCount);
		this.audioInterval = window.setInterval(() => {
			analyser.getByteFrequencyData(data);
			const avg = data.reduce((a, b) => a + b, 0) / data.length;
			this.audioLevel = avg / 255;
		}, 100);
	}
	async requestPreviewTracks() {
		const messages = [];
		let videoTrack;
		let audioTrack;
		try {
			const constraints = {
				video: this.selectedVideoDevice ? { deviceId: { exact: this.selectedVideoDevice } } : true,
				audio: false
			};
			videoTrack = (await navigator.mediaDevices.getUserMedia(constraints)).getVideoTracks()[0];
			this.cameraAccess = videoTrack ? "ready" : "missing";
			this.wantsCameraOnJoin = Boolean(videoTrack);
			const settings = videoTrack?.getSettings();
			if (settings?.deviceId) this.selectedVideoDevice = settings.deviceId;
		} catch (reason) {
			console.warn("[LiveKit] Camera preview failed:", reason);
			this.cameraAccess = this.accessStateFromError(reason);
			this.wantsCameraOnJoin = false;
			messages.push(this.getMediaErrorMessage("camera", reason));
		}
		try {
			const constraints = {
				video: false,
				audio: this.selectedAudioDevice ? {
					deviceId: { exact: this.selectedAudioDevice },
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				} : {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			};
			audioTrack = (await navigator.mediaDevices.getUserMedia(constraints)).getAudioTracks()[0];
			this.micAccess = audioTrack ? "ready" : "missing";
			this.wantsMicOnJoin = Boolean(audioTrack);
			const settings = audioTrack?.getSettings();
			if (settings?.deviceId) this.selectedAudioDevice = settings.deviceId;
		} catch (reason) {
			console.warn("[LiveKit] Microphone preview failed:", reason);
			this.micAccess = this.accessStateFromError(reason);
			this.wantsMicOnJoin = false;
			messages.push(this.getMediaErrorMessage("microphone", reason));
		}
		this.buildPreviewStream(videoTrack, audioTrack);
		await this.enumerateDevices();
		return messages;
	}
	async startPreview() {
		this.stopPreview();
		this.preConnectStep = "requesting";
		this.mediaError = "";
		this.cameraAccess = "unknown";
		this.micAccess = "unknown";
		const messages = await this.requestPreviewTracks();
		if (this.previewStream) {
			this.preConnectStep = "preview";
			this.startAudioMeter(this.previewStream);
			this.mediaError = messages.join(" ");
		} else {
			this.mediaError = messages.length > 0 ? `${messages.join(" ")} ${i18n.t.live.preConnect.enterWithoutCamera()}` : i18n.t.live.preConnect.noCameraOrMic();
			this.preConnectStep = "no-devices";
		}
	}
	async switchPreviewDevice() {
		this.stopPreview();
		this.preConnectStep = "requesting";
		this.mediaError = "";
		const messages = await this.requestPreviewTracks();
		if (this.previewStream) {
			this.preConnectStep = "preview";
			this.startAudioMeter(this.previewStream);
			this.mediaError = messages.join(" ");
		} else {
			this.mediaError = messages.length > 0 ? `${messages.join(" ")} ${i18n.t.live.preConnect.enterWithoutCamera()}` : i18n.t.live.preConnect.noDevicesAccess();
			this.preConnectStep = "no-devices";
		}
	}
	async retryCamera() {
		this.selectedVideoDevice = "";
		await this.switchPreviewDevice();
	}
	stopPreview() {
		if (this.previewStream) {
			this.previewStream.getTracks().forEach((t) => t.stop());
			this.previewStream = null;
		}
		if (this.audioInterval !== null) {
			window.clearInterval(this.audioInterval);
			this.audioInterval = null;
		}
		if (this.audioContext !== null) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.audioLevel = 0;
	}
	resolutionDimensions(isInstructor) {
		if (this.selectedResolution === "1080p" && isInstructor) return {
			width: 1920,
			height: 1080,
			frameRate: 30
		};
		if (this.selectedResolution === "720p" || isInstructor) return {
			width: 1280,
			height: 720,
			frameRate: 30
		};
		return {
			width: 640,
			height: 360,
			frameRate: 24
		};
	}
	cameraCaptureOptions(isInstructor) {
		return {
			resolution: this.resolutionDimensions(isInstructor),
			...this.selectedVideoDevice ? { deviceId: this.selectedVideoDevice } : {}
		};
	}
	microphoneCaptureOptions() {
		return {
			echoCancellation: this.audioProcessingEnabled,
			noiseSuppression: this.audioProcessingEnabled,
			autoGainControl: this.audioProcessingEnabled,
			...this.selectedAudioDevice ? { deviceId: this.selectedAudioDevice } : {}
		};
	}
	publishProfile(isInstructor, VideoPreset, AudioPresets) {
		const premium = isInstructor && this.selectedResolution === "1080p";
		const balanced = this.selectedResolution !== "360p";
		return {
			simulcast: true,
			videoCodec: this.selectedCodec,
			videoEncoding: {
				maxBitrate: premium ? 45e5 : balanced ? 18e5 : 65e4,
				maxFramerate: this.selectedResolution === "360p" ? 24 : 30
			},
			videoSimulcastLayers: premium ? [new VideoPreset(1280, 720, 18e5, 30), new VideoPreset(640, 360, 6e5, 30)] : balanced ? [new VideoPreset(640, 360, 6e5, 30), new VideoPreset(320, 180, 18e4, 24)] : [new VideoPreset(320, 180, 18e4, 24)],
			screenShareEncoding: {
				maxBitrate: 4e6,
				maxFramerate: 15
			},
			screenShareSimulcastLayers: [new VideoPreset(1280, 720, 2e6, 15), new VideoPreset(640, 360, 8e5, 15)],
			audioPreset: isInstructor ? AudioPresets.music : AudioPresets.speech,
			red: true,
			dtx: !isInstructor,
			backupCodec: {
				codec: this.selectedCodec === "h264" ? "vp8" : "h264",
				encoding: {
					maxBitrate: premium ? 3e6 : 1e6,
					maxFramerate: 30
				}
			}
		};
	}
	async enterRoom(publishAvailableDevices = true) {
		this.publishCameraOnNextJoin = publishAvailableDevices && this.wantsCameraOnJoin;
		this.publishMicOnNextJoin = publishAvailableDevices && this.wantsMicOnJoin;
		this.stopPreview();
		await new Promise((r) => setTimeout(r, 500));
		if (this.joinInfo) this.connectRoom(this.joinInfo);
	}
	async loadToken() {
		if (!this.auth.isAuthenticated) {
			this.status = "locked";
			return;
		}
		const liveClassId = this.getClassId();
		if (liveClassId === null) {
			this.status = "missing";
			return;
		}
		this.status = "checking";
		this.error = "";
		this.mediaError = "";
		try {
			this.joinInfo = await this.client.action(api.livekit.issueJoinToken, { liveClassId });
			this.status = "ready";
		} catch (reason) {
			console.error("[LiveKit] Token fetch failed:", reason);
			if (!this.auth.isAuthenticated) {
				this.status = "locked";
				return;
			}
			this.error = this.auth.error || (reason instanceof Error ? reason.message : i18n.t.live.room.tokenError());
			this.status = "error";
		}
	}
	async connectRoom(info) {
		this.connectionState = "connecting";
		try {
			const { Room, RoomEvent, ParticipantEvent, VideoPreset, AudioPresets } = await import("livekit-client");
			const isInstructor = info.participantRole === "instructor" || info.participantRole === "admin";
			const lkRoom = new Room({
				adaptiveStream: true,
				dynacast: true,
				disconnectOnPageLeave: false,
				stopLocalTrackOnUnpublish: false,
				reconnectPolicy: { nextRetryDelayInMs(ctx) {
					if (ctx.retryCount >= 10) return null;
					return Math.min(3e3 * (ctx.retryCount + 1), 15e3);
				} },
				audioCaptureDefaults: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				},
				videoCaptureDefaults: { resolution: this.resolutionDimensions(isInstructor) },
				publishDefaults: this.publishProfile(isInstructor, VideoPreset, AudioPresets)
			});
			this._room = lkRoom;
			lkRoom.registerTextStreamHandler("homebody.chat", (reader, participantInfo) => {
				(async () => {
					const text = await reader.readAll();
					const participant = participantInfo.identity === lkRoom.localParticipant.identity ? lkRoom.localParticipant : lkRoom.remoteParticipants.get(participantInfo.identity);
					this.chatMessages = [...this.chatMessages, {
						id: reader.info?.id ?? `${participantInfo.identity}:${Date.now()}`,
						identity: participantInfo.identity,
						name: participant?.name || participantInfo.identity,
						text,
						createdAt: reader.info?.timestamp ?? Date.now(),
						isLocal: participantInfo.identity === lkRoom.localParticipant.identity
					}];
				})();
			});
			lkRoom.on(RoomEvent.Reconnecting, () => {
				this.connectionState = "reconnecting";
			}).on(RoomEvent.Reconnected, () => {
				this.connectionState = "connected";
				this.refreshParticipants();
			}).on(RoomEvent.Disconnected, () => {
				this.connectionState = "disconnected";
			}).on(RoomEvent.ParticipantConnected, (participant) => {
				this.attachParticipantListeners(participant, ParticipantEvent);
				this.refreshParticipants();
			}).on(RoomEvent.ParticipantDisconnected, (participant) => {
				this.removeTiles((tile) => tile.identity === this.participantIdentity(participant));
				this.refreshParticipants();
			}).on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
				this.activeSpeakerIdentity = speakers.find((s) => s.isSpeaking)?.identity ?? null;
				this.refreshParticipants();
			}).on(RoomEvent.LocalTrackPublished, (publication, participant) => {
				this.addTrackTile(publication.track, publication, participant, "local");
			}).on(RoomEvent.LocalTrackUnpublished, (publication, participant) => {
				this.removeTileByPublication(participant, publication, publication.track);
				const source = this.trackSource(publication);
				if (source === "screen_share" || source === "screen_share_audio") this.screenShareEnabled = false;
			}).on(RoomEvent.TrackUnpublished, (publication, participant) => {
				this.removeTileByPublication(participant, publication, publication.track);
			}).on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
				this.addTrackTile(track, publication, participant, "remote");
			}).on(RoomEvent.TrackPublished, (publication, participant) => {
				this.subscribeIfAllowed(publication, participant);
			}).on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
				this.removeTileByPublication(participant, publication, track);
			});
			await lkRoom.connect(info.wsUrl, info.token);
			if (this.publishCameraOnNextJoin) try {
				await lkRoom.localParticipant.setCameraEnabled(true, this.cameraCaptureOptions(isInstructor));
				this.cameraEnabled = true;
			} catch (cameraReason) {
				this.cameraEnabled = false;
				console.warn("[LiveKit] Camera failed:", cameraReason);
				this.mediaError = this.getMediaErrorMessage("camera", cameraReason);
			}
			if (this.publishMicOnNextJoin) try {
				await lkRoom.localParticipant.setMicrophoneEnabled(true, this.microphoneCaptureOptions());
				this.micEnabled = true;
			} catch (micReason) {
				this.micEnabled = false;
				console.warn("[LiveKit] Microphone failed:", micReason);
				this.mediaError = [this.mediaError, this.getMediaErrorMessage("microphone", micReason)].filter(Boolean).join(" ");
			}
			this.connectionState = "connected";
			this.refreshParticipants();
			this.startStatsTimer();
			lkRoom.remoteParticipants.forEach((participant) => this.attachParticipantListeners(participant, ParticipantEvent));
		} catch (reason) {
			this.connectionState = "disconnected";
			throw reason;
		}
	}
	async toggleCamera() {
		if (this._room === null || this.pendingControl !== null) return;
		const next = !this.cameraEnabled;
		this.pendingControl = "camera";
		try {
			await this._room.localParticipant.setCameraEnabled(next, this.cameraCaptureOptions(this.isInstructorRoom));
			this.cameraEnabled = next;
			this.mediaError = "";
		} catch (reason) {
			this.mediaError = this.getMediaErrorMessage("camera", reason);
		} finally {
			this.pendingControl = null;
		}
	}
	async toggleMic() {
		if (this._room === null || this.pendingControl !== null) return;
		const next = !this.micEnabled;
		this.pendingControl = "mic";
		try {
			await this._room.localParticipant.setMicrophoneEnabled(next, this.microphoneCaptureOptions());
			this.micEnabled = next;
			this.mediaError = "";
		} catch (reason) {
			this.mediaError = this.getMediaErrorMessage("microphone", reason);
		} finally {
			this.pendingControl = null;
		}
	}
	async toggleScreenShare() {
		if (this._room === null || !this.isInstructorRoom || !this._room.localParticipant.setScreenShareEnabled || this.pendingControl !== null) return;
		const next = !this.screenShareEnabled;
		this.pendingControl = "screen";
		try {
			await this._room.localParticipant.setScreenShareEnabled(next);
			this.screenShareEnabled = next;
			if (!next) this.removeTiles((tile) => tile.isLocal && tile.source === "screen_share");
		} catch (reason) {
			this.mediaError = i18n.t.live.room.screenShareError();
		} finally {
			this.pendingControl = null;
		}
	}
	async sendChatMessage() {
		if (this._room === null) return;
		const text = this.chatDraft.trim();
		if (!text) return;
		this.chatDraft = "";
		await this._room.localParticipant.sendText(text, { topic: "homebody.chat" });
	}
	destroy() {
		this.stopPreview();
		this.clearMediaTiles();
		this.stopStatsTimer();
		this._room?.unregisterTextStreamHandler("homebody.chat");
		this._room?.disconnect();
		this._room = null;
	}
};
//#endregion
//#region src/lib/features/live/components/room/PreConnectOverlay.svelte
function PreConnectOverlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		const backHref = derived(() => room.isInstructorRoom ? routePath("studioLive") : routePath("customerCalendar"));
		const backLabel = derived(() => room.isInstructorRoom ? t.live.preConnect.backStudio() : t.live.preConnect.backCalendar());
		if (room.status === "checking") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="setup-overlay svelte-ikmx6e"><div class="setup-box svelte-ikmx6e"><div class="spinner svelte-ikmx6e"></div> <p class="setup-text svelte-ikmx6e">${escape_html(t.live.preConnect.checking())}</p></div></div>`);
		} else if (room.status === "locked") {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="setup-overlay svelte-ikmx6e"><div class="setup-box svelte-ikmx6e"><h1 class="svelte-ikmx6e">${escape_html(t.live.preConnect.lockedTitle())}</h1> `);
			if (room.auth.error) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(room.auth.error)}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <a class="btn-primary svelte-ikmx6e" href="/">${escape_html(t.live.preConnect.lockedCta())}</a></div></div>`);
		} else if (room.status === "missing") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="setup-overlay svelte-ikmx6e"><div class="setup-box svelte-ikmx6e"><h1 class="svelte-ikmx6e">${escape_html(t.live.preConnect.missingTitle())}</h1> <a class="btn-primary svelte-ikmx6e"${attr("href", routePath("customerCalendar"))}>${escape_html(t.live.preConnect.missingCta())}</a></div></div>`);
		} else if (room.status === "error") {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="setup-overlay svelte-ikmx6e"><div class="setup-box svelte-ikmx6e"><h1 class="svelte-ikmx6e">${escape_html(t.live.preConnect.errorTitle())}</h1> `);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(room.error)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> <div class="row-buttons svelte-ikmx6e"><button class="btn-primary svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.retry())}</button> <a class="btn-secondary svelte-ikmx6e"${attr("href", routePath("customerCalendar"))}>${escape_html(t.live.preConnect.backCalendar())}</a></div></div></div>`);
		} else if (room.status === "ready" && room.joinInfo && room.connectionState === "idle") {
			$$renderer.push("<!--[4-->");
			$$renderer.push(`<div class="setup-overlay svelte-ikmx6e"><div class="setup-card svelte-ikmx6e"><div class="setup-card__header svelte-ikmx6e"><a class="setup-back svelte-ikmx6e"${attr("href", backHref())}><span class="material-symbols-rounded svelte-ikmx6e" aria-hidden="true">arrow_forward</span> <span>${escape_html(backLabel())}</span></a> <div class="setup-title svelte-ikmx6e"><span class="setup-card__kicker svelte-ikmx6e">${escape_html(t.live.preConnect.kicker())}</span> <h1 class="svelte-ikmx6e">${escape_html(t.live.preConnect.title())}</h1></div></div> `);
			if (room.mediaError) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					tone: "caution",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(room.mediaError)}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (room.preConnectStep === "requesting") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="setup-box svelte-ikmx6e"><div class="spinner svelte-ikmx6e"></div> <p class="setup-text svelte-ikmx6e">${escape_html(t.live.preConnect.requesting())}</p></div>`);
			} else if (room.preConnectStep === "denied" || room.preConnectStep === "no-devices") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="setup-box svelte-ikmx6e">`);
				if (room.mediaError) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "caution",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(room.mediaError)}`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="row-buttons svelte-ikmx6e"><button class="btn-enter svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.enterNoDevices())}</button> <button class="btn-secondary svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.retryDevices())}</button></div></div>`);
			} else if (room.preConnectStep === "preview" && room.previewStream) {
				$$renderer.push("<!--[2-->");
				$$renderer.push(`<div class="preview-stage svelte-ikmx6e">`);
				if (room.hasPreviewCamera) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="preview-video-wrap svelte-ikmx6e"><video${attr("srcobject", room.previewStream)} autoplay="" playsinline="" muted="" class="preview-video svelte-ikmx6e"></video></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="preview-audio-only svelte-ikmx6e"><span class="material-symbols-rounded svelte-ikmx6e" aria-hidden="true">mic</span> <strong class="svelte-ikmx6e">${escape_html(t.live.preConnect.cameraConnected())}</strong> <span class="svelte-ikmx6e">${escape_html(t.live.preConnect.noCamera())}</span> <button class="btn-secondary svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.retryCamera())}</button></div>`);
				}
				$$renderer.push(`<!--]--> <div class="preview-controls svelte-ikmx6e">`);
				if (room.isInstructorRoom) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<label class="device-select svelte-ikmx6e"><span class="svelte-ikmx6e">Resolution</span> `);
					$$renderer.select({
						value: room.selectedResolution,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: "1080p" }, ($$renderer) => {
							$$renderer.push(`1080p premium`);
						});
						$$renderer.option({ value: "720p" }, ($$renderer) => {
							$$renderer.push(`720p balanced`);
						});
					}, "svelte-ikmx6e");
					$$renderer.push(`</label> <label class="device-select svelte-ikmx6e"><span class="svelte-ikmx6e">Codec</span> `);
					$$renderer.select({
						value: room.selectedCodec,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: "h264" }, ($$renderer) => {
							$$renderer.push(`H.264 compatibility`);
						});
						$$renderer.option({ value: "vp8" }, ($$renderer) => {
							$$renderer.push(`VP8 simulcast`);
						});
						$$renderer.option({ value: "vp9" }, ($$renderer) => {
							$$renderer.push(`VP9 efficient`);
						});
					}, "svelte-ikmx6e");
					$$renderer.push(`</label>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<label class="device-select svelte-ikmx6e"><span class="svelte-ikmx6e">Resolution</span> `);
					$$renderer.select({
						value: room.selectedResolution,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: "720p" }, ($$renderer) => {
							$$renderer.push(`720p`);
						});
						$$renderer.option({ value: "360p" }, ($$renderer) => {
							$$renderer.push(`360p low data`);
						});
					}, "svelte-ikmx6e");
					$$renderer.push(`</label>`);
				}
				$$renderer.push(`<!--]--> `);
				if (room.videoDevices.length > 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<label class="device-select svelte-ikmx6e"><span class="svelte-ikmx6e">${escape_html(t.live.preConnect.cameraLabel())}</span> `);
					$$renderer.select({
						value: room.selectedVideoDevice,
						onchange: () => room.switchPreviewDevice(),
						class: ""
					}, ($$renderer) => {
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(room.videoDevices);
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let d = each_array[$$index];
							$$renderer.option({ value: d.deviceId }, ($$renderer) => {
								$$renderer.push(`${escape_html(d.label)}`);
							});
						}
						$$renderer.push(`<!--]-->`);
					}, "svelte-ikmx6e");
					$$renderer.push(`</label>`);
				} else if (!room.hasPreviewCamera) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<button class="btn-secondary device-retry svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.refreshCamera())}</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (room.audioDevices.length > 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<label class="device-select svelte-ikmx6e"><span class="svelte-ikmx6e">${escape_html(t.live.preConnect.micLabel())}</span> `);
					$$renderer.select({
						value: room.selectedAudioDevice,
						onchange: () => room.switchPreviewDevice(),
						class: ""
					}, ($$renderer) => {
						$$renderer.push(`<!--[-->`);
						const each_array_1 = ensure_array_like(room.audioDevices);
						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let d = each_array_1[$$index_1];
							$$renderer.option({ value: d.deviceId }, ($$renderer) => {
								$$renderer.push(`${escape_html(d.label)}`);
							});
						}
						$$renderer.push(`<!--]-->`);
					}, "svelte-ikmx6e");
					$$renderer.push(`</label>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <label class="device-toggle svelte-ikmx6e"><input type="checkbox"${attr("checked", room.audioProcessingEnabled, true)}/> <span>Echo cancellation / noise suppression</span></label> `);
				if (room.hasPreviewMic) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="audio-meter svelte-ikmx6e"><span class="svelte-ikmx6e">${escape_html(t.live.preConnect.audioLevel())}</span> <div class="audio-bar svelte-ikmx6e"><div class="audio-fill svelte-ikmx6e"${attr_style(`width: ${stringify(Math.round(room.audioLevel * 100))}%`)}></div></div></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div> <div class="preview-actions svelte-ikmx6e"><button class="btn-enter svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.enterRoom())}</button> <button class="btn-text svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.enterWithoutDevices())}</button></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="setup-box svelte-ikmx6e"><button class="btn-enter svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.startDevices())}</button> <p class="setup-hint svelte-ikmx6e">${escape_html(t.live.preConnect.devicesHint())}</p> <button class="btn-secondary svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.refreshCamera())}</button> <button class="btn-text svelte-ikmx6e" type="button">${escape_html(t.live.preConnect.enterWithoutCamera())}</button></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/RoomHeader.svelte
function RoomHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		const backHref = derived(() => room.isInstructorRoom ? routePath("studioLive") : routePath("customerCalendar"));
		$$renderer.push(`<header class="room-header svelte-1ls2kld"><div class="header-left svelte-1ls2kld"><a${attr("href", backHref())} class="header-back svelte-1ls2kld"><span class="material-symbols-rounded svelte-1ls2kld" aria-hidden="true">arrow_forward</span> <span>${escape_html(t.live.room.back())}</span></a> <div class="header-divider svelte-1ls2kld"></div> <div class="header-status svelte-1ls2kld"><span${attr_class("status-dot svelte-1ls2kld", void 0, { "on": room.connectionState === "connected" })}></span> <span class="status-label svelte-1ls2kld">${escape_html(room.connectionLabel)}</span></div> <button class="header-participants-btn svelte-1ls2kld" type="button"><span class="material-symbols-rounded svelte-1ls2kld" aria-hidden="true">people</span> <span>${escape_html(room.participants.length)}</span></button></div> <div class="header-right svelte-1ls2kld">`);
		if (room.isInstructorRoom) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="header-icon-btn svelte-1ls2kld" type="button"${attr("aria-label", t.live.stats.title())}${attr("title", t.live.stats.title())}><span class="material-symbols-rounded svelte-1ls2kld" aria-hidden="true">monitoring</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <a class="header-icon-btn leave svelte-1ls2kld"${attr("href", backHref())}${attr("aria-label", t.live.room.leave())}${attr("title", t.live.room.leave())}><span class="material-symbols-rounded svelte-1ls2kld" aria-hidden="true">logout</span></a></div></header>`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/VideoStage.svelte
function VideoStage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<main class="stage svelte-1ows5l0">`);
		if (room.isInstructorRoom) {
			$$renderer.push("<!--[0-->");
			if (room.hasScreenShare) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="spotlight-layout svelte-1ows5l0"><div class="spotlight-main svelte-1ows5l0"><!--[-->`);
				const each_array = ensure_array_like(room.screenShareTiles);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let tile = each_array[$$index];
					$$renderer.push(`<figure class="spotlight-tile svelte-1ows5l0"><div class="svelte-1ows5l0"></div> <span class="badge-screen svelte-1ows5l0">${escape_html(t.live.room.screenShare())}</span> <figcaption class="svelte-1ows5l0">${escape_html(tile.name)}</figcaption></figure>`);
				}
				$$renderer.push(`<!--]--></div> <div class="spotlight-strip svelte-1ows5l0"><!--[-->`);
				const each_array_1 = ensure_array_like(room.videoTiles.filter((t) => t.source !== "screen_share").sort(room.tileSort));
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let tile = each_array_1[$$index_1];
					$$renderer.push(`<figure${attr_class("strip-tile svelte-1ows5l0", void 0, {
						"strip-tile--self": tile.isLocal,
						"strip-tile--speaking": tile.identity === room.activeSpeakerIdentity
					})}><div class="svelte-1ows5l0"></div> <figcaption class="svelte-1ows5l0">${escape_html(tile.name)}</figcaption></figure>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="video-grid svelte-1ows5l0"${attr_style(`--grid-cols: ${stringify(room.gridCols())}`)}>`);
				if (room.videoTiles.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="empty-stage svelte-1ows5l0">${escape_html(t.live.room.waitingForCameras())}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <!--[-->`);
				const each_array_2 = ensure_array_like(room.videoTiles.sort(room.tileSort));
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let tile = each_array_2[$$index_2];
					$$renderer.push(`<figure${attr_class("grid-tile svelte-1ows5l0", void 0, {
						"grid-tile--self": tile.isLocal,
						"grid-tile--speaking": tile.identity === room.activeSpeakerIdentity
					})}><div class="svelte-1ows5l0"></div> `);
					if (tile.source === "screen_share") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="badge-screen svelte-1ows5l0">${escape_html(t.live.room.screenShare())}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <figcaption class="svelte-1ows5l0">${escape_html(tile.name)}</figcaption></figure>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="student-stage svelte-1ows5l0">`);
			if (room.primaryInstructorVideo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<figure class="student-main svelte-1ows5l0"><div class="svelte-1ows5l0"></div> `);
				if (room.primaryInstructorVideo.source === "screen_share") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="badge-screen svelte-1ows5l0">${escape_html(t.live.room.screenShare())}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <figcaption class="svelte-1ows5l0">${escape_html(room.primaryInstructorVideo.name)}</figcaption></figure>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="empty-stage svelte-1ows5l0">${escape_html(t.live.room.waitingForInstructor())}</div>`);
			}
			$$renderer.push(`<!--]--> `);
			if (room.selfVideo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<figure class="student-pip svelte-1ows5l0"><div class="svelte-1ows5l0"></div> <figcaption class="svelte-1ows5l0">${escape_html(room.selfVideo.name)}</figcaption></figure>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></main>`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/ParticipantSidebar.svelte
function ParticipantSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		if (room.showParticipants) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<aside class="participant-sidebar svelte-1dln1jg"${attr("aria-label", t.live.room.participantsTitle())}><div class="sidebar-header svelte-1dln1jg"><h3 class="svelte-1dln1jg">${escape_html(t.live.room.participantsTitle())}</h3> <button class="sidebar-close svelte-1dln1jg" type="button"${attr("aria-label", t.live.room.close())}><span class="material-symbols-rounded svelte-1dln1jg">close</span></button></div> <div class="sidebar-list svelte-1dln1jg"><!--[-->`);
			const each_array = ensure_array_like(room.participants);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let p = each_array[$$index];
				$$renderer.push(`<div${attr_class("participant-item svelte-1dln1jg", void 0, {
					"participant-item--speaking": p.isSpeaking,
					"participant-item--instructor": p.isInstructor
				})}><div class="participant-item__left svelte-1dln1jg"><span class="participant-item__name svelte-1dln1jg">${escape_html(p.name)}</span> `);
				if (p.isInstructor) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="participant-item__role svelte-1dln1jg">${escape_html(t.live.room.instructor())}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (p.isLocal) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="participant-item__role svelte-1dln1jg">${escape_html(t.live.room.you())}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="participant-item__indicators svelte-1dln1jg"><span${attr_class("indicator svelte-1dln1jg", void 0, {
					"indicator--on": p.hasMic,
					"indicator--off": !p.hasMic
				})}${attr("title", p.hasMic ? t.live.room.micOn() : t.live.room.micOff())}><span class="material-symbols-rounded svelte-1dln1jg" aria-hidden="true">${escape_html(p.hasMic ? "mic" : "mic_off")}</span></span> <span${attr_class("indicator svelte-1dln1jg", void 0, {
					"indicator--on": p.hasCamera,
					"indicator--off": !p.hasCamera
				})}${attr("title", p.hasCamera ? t.live.room.cameraOn() : t.live.room.cameraOff())}><span class="material-symbols-rounded svelte-1dln1jg" aria-hidden="true">${escape_html(p.hasCamera ? "videocam" : "videocam_off")}</span></span></div></div>`);
			}
			$$renderer.push(`<!--]--></div></aside>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/RoomChat.svelte
function RoomChat($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		$$renderer.push(`<aside class="room-chat svelte-1ss84dm" aria-label="Room chat"><div class="chat-header svelte-1ss84dm"><h3 class="svelte-1ss84dm">Chat</h3></div> <div class="chat-list svelte-1ss84dm"><!--[-->`);
		const each_array = ensure_array_like(room.chatMessages);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let message = each_array[$$index];
			$$renderer.push(`<article${attr_class("chat-message svelte-1ss84dm", void 0, { "chat-message--local": message.isLocal })}><div class="chat-message__meta svelte-1ss84dm"><span>${escape_html(message.name)}</span> <time>${escape_html(new Intl.DateTimeFormat("he-IL", {
				hour: "2-digit",
				minute: "2-digit"
			}).format(new Date(message.createdAt)))}</time></div> <p class="svelte-1ss84dm">${escape_html(message.text)}</p></article>`);
		}
		$$renderer.push(`<!--]--></div> <form class="chat-form svelte-1ss84dm"><input${attr("value", room.chatDraft)} maxlength="500" placeholder="Message" class="svelte-1ss84dm"/> <button type="submit"${attr("disabled", !room.chatDraft.trim(), true)} class="svelte-1ss84dm">Send</button></form></aside>`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/ControlBar.svelte
function ControlBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<footer class="control-bar svelte-1m9mm61"><button${attr_class("ctrl-btn svelte-1m9mm61", void 0, {
			"ctrl-on": room.micEnabled,
			"ctrl-off": !room.micEnabled
		})} type="button"${attr("disabled", room.pendingControl !== null, true)}${attr("aria-label", room.micEnabled ? t.live.controls.muteMic() : t.live.controls.unmuteMic())}><span class="material-symbols-rounded svelte-1m9mm61" aria-hidden="true">${escape_html(room.micEnabled ? "mic" : "mic_off")}</span> <span class="ctrl-label svelte-1m9mm61">${escape_html(room.micEnabled ? t.live.controls.micOnLabel() : t.live.controls.micOffLabel())}</span></button> <button${attr_class("ctrl-btn svelte-1m9mm61", void 0, {
			"ctrl-on": room.cameraEnabled,
			"ctrl-off": !room.cameraEnabled
		})} type="button"${attr("disabled", room.pendingControl !== null, true)}${attr("aria-label", room.cameraEnabled ? t.live.controls.stopCamera() : t.live.controls.startCamera())}><span class="material-symbols-rounded svelte-1m9mm61" aria-hidden="true">${escape_html(room.cameraEnabled ? "videocam" : "videocam_off")}</span> <span class="ctrl-label svelte-1m9mm61">${escape_html(room.cameraEnabled ? t.live.controls.cameraOnLabel() : t.live.controls.cameraOffLabel())}</span></button> `);
		if (room.isInstructorRoom) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button${attr_class("ctrl-btn svelte-1m9mm61", void 0, {
				"ctrl-on": room.screenShareEnabled,
				"ctrl-off": !room.screenShareEnabled
			})} type="button"${attr("disabled", room.pendingControl !== null, true)}${attr("aria-label", room.screenShareEnabled ? t.live.controls.stopScreen() : t.live.controls.startScreen())}><span class="material-symbols-rounded svelte-1m9mm61" aria-hidden="true">${escape_html(room.screenShareEnabled ? "stop_screen_share" : "screen_share")}</span> <span class="ctrl-label svelte-1m9mm61">${escape_html(room.screenShareEnabled ? t.live.controls.screenOnLabel() : t.live.controls.screenOffLabel())}</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button${attr_class("ctrl-btn ctrl-participants svelte-1m9mm61", void 0, { "ctrl-on": room.showParticipants })} type="button"${attr("aria-label", t.live.room.participantsTitle())}><span class="material-symbols-rounded svelte-1m9mm61" aria-hidden="true">people</span> <span class="ctrl-label svelte-1m9mm61">${escape_html(t.live.room.participantsTitle())}</span></button></footer>`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/QualityPanel.svelte
function QualityPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { room } = $$props;
		const { t } = useI18n();
		if (room.isInstructorRoom && room.showQualityPanel) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<aside class="quality-drawer svelte-y2tmce"${attr("aria-label", t.live.stats.title())}><div class="drawer-header svelte-y2tmce"><h3 class="svelte-y2tmce">${escape_html(t.live.stats.title())}</h3> <button class="drawer-close svelte-y2tmce" type="button"${attr("aria-label", t.live.room.close())}><span class="material-symbols-rounded svelte-y2tmce">close</span></button></div> <dl class="quality-headline svelte-y2tmce"><div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.participants())}</dt><dd class="svelte-y2tmce">${escape_html(room.participants.length)}</dd></div> <div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.video())}</dt><dd class="svelte-y2tmce">${escape_html(room.streamStats.videoTracks)}</dd></div> <div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.audio())}</dt><dd class="svelte-y2tmce">${escape_html(room.streamStats.audioTracks)}</dd></div> <div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.bitrate())}</dt><dd class="svelte-y2tmce">${escape_html(room.formattedBitrate)}</dd></div> <div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.resolution())}</dt><dd class="svelte-y2tmce">${escape_html(room.formattedResolution)}</dd></div> <div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.fps())}</dt><dd class="svelte-y2tmce">${escape_html(room.formattedFps)}</dd></div> <div class="svelte-y2tmce"><dt class="svelte-y2tmce">${escape_html(t.live.stats.packetLoss())}</dt><dd class="svelte-y2tmce">${escape_html(room.formattedPacketLoss)}</dd></div></dl> `);
			if (room.trackStats.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<details class="track-stats svelte-y2tmce" open=""><summary class="svelte-y2tmce">${escape_html(t.live.stats.videoSources())}</summary> <div class="track-stats-list svelte-y2tmce"><!--[-->`);
				const each_array = ensure_array_like(room.trackStats.filter((t) => t.kind === "video"));
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let stat = each_array[$$index];
					$$renderer.push(`<div class="track-stat-row svelte-y2tmce"><span class="track-stat-name svelte-y2tmce">${escape_html(stat.name)}</span> <span${attr_class("track-stat-badge svelte-y2tmce", void 0, { "track-stat-badge--screen": stat.source === "screen_share" })}>${escape_html(stat.source === "screen_share" ? t.live.stats.sourceScreen() : stat.source === "camera" ? t.live.stats.sourceCamera() : t.live.stats.sourceUnknown())}</span> <span class="track-stat-detail svelte-y2tmce">${escape_html(stat.width ?? "—")}×${escape_html(stat.height ?? "—")} @ ${escape_html(stat.bitrateKbps > 0 ? `${stat.bitrateKbps} kbps` : "—")}</span></div>`);
				}
				$$renderer.push(`<!--]--></div></details>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></aside>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/live/components/room/LiveRoomShell.svelte
function LiveRoomShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const room = new LiveRoom(useConvexClient());
		onDestroy(() => {
			room.destroy();
		});
		if (room.auth.isLoading || room.status === "checking") {
			$$renderer.push("<!--[0-->");
			PreConnectOverlay($$renderer, { room });
		} else if (room.status === "locked" || room.status === "missing" || room.status === "error" || room.status === "ready" && room.joinInfo && room.connectionState === "idle") {
			$$renderer.push("<!--[1-->");
			PreConnectOverlay($$renderer, { room });
		} else if (room.connectionState !== "idle") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="live-room svelte-8bmq7k">`);
			RoomHeader($$renderer, { room });
			$$renderer.push(`<!----> <div class="room-body svelte-8bmq7k">`);
			VideoStage($$renderer, { room });
			$$renderer.push(`<!----> `);
			ParticipantSidebar($$renderer, { room });
			$$renderer.push(`<!----> `);
			RoomChat($$renderer, { room });
			$$renderer.push(`<!----></div> `);
			if (room.mediaError) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="room-media-error svelte-8bmq7k" role="status">${escape_html(room.mediaError)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			ControlBar($$renderer, { room });
			$$renderer.push(`<!----> `);
			QualityPanel($$renderer, { room });
			$$renderer.push(`<!----> <div class="audio-sink svelte-8bmq7k" aria-hidden="true"><!--[-->`);
			const each_array = ensure_array_like(room.audioTiles);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				each_array[$$index];
				$$renderer.push(`<div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { LiveRoomShell as t };
