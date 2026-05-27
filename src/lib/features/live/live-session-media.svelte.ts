import { Track, type Room, type TrackPublishDefaults } from "livekit-client";
import { LivePersistentDevices } from "./live-persistent-devices";
import { LiveSessionUi } from "./live-session-ui.svelte";
import { sanitizeMediaDeviceId } from "$lib/media/device-id";
import {
  accessStateFromError,
  getMediaErrorMessage,
  mediaErrorFromReason,
  i18n,
  participantIdentity,
  participantIsLocal,
  trackSource,
} from "./live-room-shared";
import type {
  AudioPresetChoice,
  BitrateChoice,
  ConnectionQualityLevel,
  DegradationPreferenceChoice,
  DeviceAccessState,
  MediaDevice,
  MediaSource,
  PerTrackStat,
  PreConnectStep,
  StreamStats,
  VideoCodecChoice,
  VideoFramerateChoice,
  VideoResolutionChoice,
} from "./types";

/** Preview, devices, publish profile, and local media controls. */
export class LiveSessionMedia extends LiveSessionUi {
  micEnabled = $state(false);
  cameraEnabled = $state(false);
  screenShareEnabled = $state(false);
  screenShareAudioEnabled = $state(true);
  pendingControl = $state<"mic" | "camera" | "screen" | null>(null);
  streamStats = $state<StreamStats>({
    bitrateMbps: null,
    packetLoss: null,
    width: null,
    height: null,
    fps: null,
    videoTracks: 0,
    audioTracks: 0,
  });
  trackStats = $state<PerTrackStat[]>([]);
  connectionQuality = $state<ConnectionQualityLevel>("unknown");
  networkWarning = $state("");
  audioLevel = $state(0);
  selfAudioMonitorEnabled = $state(false);

  preConnectStep = $state<PreConnectStep>("idle");
  previewStream = $state<MediaStream | null>(null);
  videoDevices = $state<MediaDevice[]>([]);
  audioDevices = $state<MediaDevice[]>([]);
  selectedVideoDevice = $state("");
  selectedAudioDevice = $state("");
  selectedCodec = $state<VideoCodecChoice>("h264");
  selectedResolution = $state<VideoResolutionChoice>("720p");
  selectedFramerate = $state<VideoFramerateChoice>(30);
  selectedBitrateMbps = $state<BitrateChoice>(2.5);
  selectedAudioPreset = $state<AudioPresetChoice>("speech");
  simulcastEnabled = $state(true);
  forceStereo = $state(false);
  degradationPreference = $state<DegradationPreferenceChoice>("maintain-framerate");
  audioProcessingEnabled = $state(true);
  cameraAccess = $state<DeviceAccessState>("unknown");
  micAccess = $state<DeviceAccessState>("unknown");
  wantsCameraOnJoin = $state(false);
  wantsMicOnJoin = $state(false);

  protected publishCameraOnNextJoin = false;
  protected publishMicOnNextJoin = false;
  protected instructorMicBeforeDrop = false;
  protected previousStats = new Map<string, { timestamp: number; bytes: number }>();
  protected statsTimer: number | null = null;

  private audioInterval: number | null = null;
  private audioContext: AudioContext | null = null;
  private readonly persistentDevices = new LivePersistentDevices();
  private persistentDevicesLoaded = false;

  /** Set by {@link LiveSessionLifecycle}. */
  protected _room: Room | null = null;
  declare readonly isInstructorRoom: boolean;
  declare connectionState: import("./types").ConnectionState;
  declare inRoom: boolean;

  protected shouldSubscribeToPublication(participant: unknown) {
    if (this.isInstructorRoom) return true;
    return this.isInstructorIdentity(participantIdentity(participant));
  }

  protected targetQualityForPublication(participant: unknown): 0 | 1 | 2 {
    return this.isInstructorIdentity(participantIdentity(participant)) ? 2 : 0;
  }

  protected subscribeIfAllowed(publication: unknown, participant: unknown) {
    const pub = publication as {
      setSubscribed?: (subscribed: boolean) => void;
      setVideoQuality?: (quality: number) => void;
      kind?: string;
      source?: string;
    };
    if (typeof pub.setSubscribed !== "function") return;
    if (participantIsLocal(participant)) return;
    const shouldSubscribe = this.shouldSubscribeToPublication(participant);
    pub.setSubscribed(shouldSubscribe);
    if (shouldSubscribe && pub.kind === "video" && typeof pub.setVideoQuality === "function") {
      pub.setVideoQuality(this.targetQualityForPublication(participant));
    }
  }

  private async collectTrackStats(
    track: unknown,
    id: string,
    name: string,
    source: MediaSource,
    kind: "video" | "audio"
  ): Promise<PerTrackStat> {
    const value = track as {
      getRTCStatsReport?: () => Promise<RTCStatsReport>;
      mediaStreamTrack?: { getSettings?: () => MediaTrackSettings };
    };
    const settings = value.mediaStreamTrack?.getSettings?.();
    let bitrate = 0;
    let packetsLost = 0;
    let packetsTotal = 0;
    const report = await value.getRTCStatsReport?.();
    report?.forEach((entry) => {
      const stats = entry as {
        type?: string;
        timestamp?: number;
        bytesSent?: number;
        bytesReceived?: number;
        packetsLost?: number;
        packetsReceived?: number;
      };
      if (stats.type !== "outbound-rtp" && stats.type !== "inbound-rtp") return;
      const bytes = stats.bytesSent ?? stats.bytesReceived;
      if (typeof bytes === "number" && typeof stats.timestamp === "number") {
        const key = `${id}:${entry.id}`;
        const previous = this.previousStats.get(key);
        if (previous && stats.timestamp > previous.timestamp) {
          bitrate +=
            ((bytes - previous.bytes) * 8) /
            ((stats.timestamp - previous.timestamp) / 1000);
        }
        this.previousStats.set(key, { timestamp: stats.timestamp, bytes });
      }
      if (typeof stats.packetsLost === "number") packetsLost += Math.max(0, stats.packetsLost);
      if (typeof stats.packetsReceived === "number")
        packetsTotal += stats.packetsReceived + Math.max(0, stats.packetsLost ?? 0);
    });
    return {
      id,
      name,
      kind,
      source,
      bitrateKbps: Math.round(bitrate / 1000),
      packetLoss: packetsTotal > 0 ? (packetsLost / packetsTotal) * 100 : null,
      width: settings?.width ?? null,
      height: settings?.height ?? null,
      fps: settings?.frameRate ?? null,
    };
  }

  async refreshStreamStats() {
    if (this._room === null) return;
    const publications: Array<{
      id: string;
      track: unknown;
      kind: "video" | "audio";
      name: string;
      source: MediaSource;
    }> = [];
    const local = this._room.localParticipant as {
      identity?: string;
      name?: string;
      trackPublications?: Map<string, unknown>;
    };
    local.trackPublications?.forEach((publication, id) => {
      const track = (publication as { track?: unknown }).track;
      const kind = String((publication as { kind?: string }).kind ?? "");
      if (track && (kind === "video" || kind === "audio"))
        publications.push({
          id: `local:${id}`,
          track,
          kind,
          name: local.name || local.identity || i18n.t.live.room.you(),
          source: trackSource(publication),
        });
    });
    this._room.remoteParticipants.forEach((participant) => {
      const remote = participant as {
        identity?: string;
        name?: string;
        trackPublications?: Map<string, unknown>;
      };
      remote.trackPublications?.forEach((publication, id) => {
        const track = (publication as { track?: unknown }).track;
        const kind = String((publication as { kind?: string }).kind ?? "");
        if (track && (kind === "video" || kind === "audio"))
          publications.push({
            id: `${remote.identity ?? "remote"}:${id}`,
            track,
            kind,
            name: remote.name || remote.identity || i18n.t.live.room.fallbackName(),
            source: trackSource(publication),
          });
      });
    });
    const results = await Promise.all(
      publications.map((p) =>
        this.collectTrackStats(p.track, p.id, p.name, p.source, p.kind)
      )
    );
    const activeIds = new Set(publications.map((p) => p.id));
    for (const key of this.previousStats.keys()) {
      const baseId = key.split(":")[0];
      if (!activeIds.has(baseId)) {
        this.previousStats.delete(key);
      }
    }
    this.trackStats = results;
    const videoResults = results.filter((r) => r.kind === "video");
    const primaryVideo =
      videoResults.find((r) => r.source === "screen_share") ??
      videoResults.find((r) => !r.id.startsWith("local:")) ??
      videoResults[0];
    const totalBitrate = videoResults.reduce((sum, r) => sum + r.bitrateKbps, 0);
    this.streamStats = {
      bitrateMbps: totalBitrate > 0 ? totalBitrate / 1000 : null,
      packetLoss: primaryVideo?.packetLoss ?? null,
      width: primaryVideo?.width ?? null,
      height: primaryVideo?.height ?? null,
      fps: primaryVideo?.fps ?? null,
      videoTracks: results.filter((r) => r.kind === "video").length,
      audioTracks: results.filter((r) => r.kind === "audio").length,
    };
  }

  protected startStatsTimer() {
    if (this.statsTimer !== null) return;
    this.statsTimer = window.setInterval(() => {
      if (!this.inRoom) return;
      if (this.sidebarTab === "info") {
        void this.refreshStreamStats();
        return;
      }
      if (this.isInstructorRoom) {
        void this.refreshConnectionHealth();
      }
    }, 5000);
  }

  protected mapConnectionQuality(value: string): ConnectionQualityLevel {
    if (value === "excellent" || value === "good" || value === "poor" || value === "lost") {
      return value;
    }
    return "unknown";
  }

  protected updateConnectionQualityFromRoom() {
    if (this._room === null) return;
    const localQuality = this._room.localParticipant.connectionQuality;
    this.connectionQuality = this.mapConnectionQuality(String(localQuality));
  }

  protected async refreshConnectionHealth() {
    if (this._room === null) return;
    this.updateConnectionQualityFromRoom();
    if (this.isInstructorRoom) {
      this.audioLevel = this._room.localParticipant.audioLevel ?? 0;
    }
    if (this.isInstructorRoom) return;
    const instructor = [...this._room.remoteParticipants.values()].find((participant) =>
      this.isInstructorIdentity(participant.identity),
    );
    if (instructor === undefined) return;
    const instructorQuality = this.mapConnectionQuality(String(instructor.connectionQuality));
    if (instructorQuality === "poor" || instructorQuality === "lost") {
      this.networkWarning = i18n.t.live.room.connectionPoor();
    } else if (this.streamStats.packetLoss !== null && this.streamStats.packetLoss > 4) {
      this.networkWarning = i18n.t.live.room.connectionPoor();
    } else if (this.connectionQuality !== "poor" && this.connectionQuality !== "lost") {
      this.networkWarning = "";
    }
  }

  protected stopStatsTimer() {
    if (this.statsTimer !== null) window.clearInterval(this.statsTimer);
    this.statsTimer = null;
    this.previousStats.clear();
  }

  protected async restoreInstructorMicIfNeeded() {
    if (!this._room || !this.isInstructorRoom) return;
    if (!this.instructorMicBeforeDrop && this.micEnabled) return;
    try {
      await this._room.localParticipant.setMicrophoneEnabled(
        true,
        this.microphoneCaptureOptions(),
      );
      this.micEnabled = true;
      this.instructorMicBeforeDrop = false;
    } catch (reason) {
      console.warn("[LiveKit] Instructor mic restore failed:", reason);
    }
  }

  async applyAudioProcessing() {
    if (this._room !== null && this.connectionState === "connected") {
      if (this.micEnabled) {
        try {
          await this._room.localParticipant.setMicrophoneEnabled(
            true,
            this.microphoneCaptureOptions(),
          );
        } catch (reason) {
          this.mediaError = getMediaErrorMessage("microphone", reason);
        }
      }
      return;
    }
    await this.switchPreviewDevice();
  }

  /** Load PreJoin-style prefs from localStorage (reference: usePersistentUserChoices). */
  ensurePersistentDevicesLoaded() {
    if (this.persistentDevicesLoaded) return;
    this.persistentDevicesLoaded = true;
    this.persistentDevices.loadInto(this);
  }

  private persistDeviceChoices() {
    this.persistentDevices.saveFrom(this);
  }

  /** Sync lists from `createLiveKitDeviceLists` (components-core observers). */
  syncDeviceLists(video: MediaDevice[], audio: MediaDevice[]) {
    this.ensurePersistentDevicesLoaded();
    this.videoDevices = video;
    this.audioDevices = audio;
    const videoIds = new Set(video.map((d) => d.deviceId));
    const audioIds = new Set(audio.map((d) => d.deviceId));
    if (
      this.selectedVideoDevice !== "" &&
      videoIds.has(this.selectedVideoDevice)
    ) {
      // keep persisted selection
    } else if (this.selectedVideoDevice === "" && video[0]) {
      this.selectedVideoDevice = video[0].deviceId;
    }
    if (
      this.selectedAudioDevice !== "" &&
      audioIds.has(this.selectedAudioDevice)
    ) {
      // keep persisted selection
    } else if (this.selectedAudioDevice === "" && audio[0]) {
      this.selectedAudioDevice = audio[0].deviceId;
    }
  }

  private async enumerateDevicesFallback() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.syncDeviceLists(
      devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || i18n.t.live.preConnect.cameraLabel() })),
      devices
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || i18n.t.live.preConnect.micLabel() })),
    );
  }

  /** Refresh mic/camera pickers after joining the room. */
  get cameraAvailable(): boolean {
    return this.videoDevices.length > 0 && this.cameraAccess !== "missing";
  }

  protected syncLocalMediaFromRoom() {
    if (this._room === null) return;
    const local = this._room.localParticipant;
    this.micEnabled = local.isMicrophoneEnabled;
    this.cameraEnabled = local.isCameraEnabled;
    this.screenShareEnabled = local.isScreenShareEnabled;
  }

  async refreshInRoomDevices() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      await this.enumerateDevicesFallback();
      if (this.videoDevices.length === 0) {
        this.cameraAccess = "missing";
        this.cameraEnabled = false;
      }
    } catch (reason) {
      console.warn("[LiveSession] Device enumeration failed:", reason);
    }
  }

  private releasePreviewStreamTracks() {
    if (!this.previewStream) return;
    for (const track of this.previewStream.getTracks()) {
      track.stop();
    }
    this.previewStream = null;
  }

  private buildPreviewStream(videoTrack?: MediaStreamTrack, audioTrack?: MediaStreamTrack) {
    this.releasePreviewStreamTracks();
    const tracks = [videoTrack, audioTrack].filter((track): track is MediaStreamTrack => {
      return track !== undefined && track.readyState !== "ended";
    });
    this.previewStream = tracks.length > 0 ? new MediaStream(tracks) : null;
  }

  private startAudioMeter(stream: MediaStream) {
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

  private takeLiveTrack(stream: MediaStream, kind: "video" | "audio"): MediaStreamTrack | undefined {
    const track = kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
    for (const other of stream.getTracks()) {
      if (other !== track) other.stop();
    }
    return track?.readyState === "ended" ? undefined : track;
  }

  private async requestPreviewVideoTrack(): Promise<MediaStreamTrack | undefined> {
    const videoDeviceId = sanitizeMediaDeviceId(this.selectedVideoDevice);
    const attempts: MediaStreamConstraints[] = [
      videoDeviceId
        ? { video: { deviceId: { ideal: videoDeviceId } }, audio: false }
        : { video: true, audio: false },
      { video: true, audio: false },
    ];

    for (const [index, constraints] of attempts.entries()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const track = this.takeLiveTrack(stream, "video");
        if (!track) continue;
        const settings = track.getSettings();
        if (settings.deviceId) this.selectedVideoDevice = settings.deviceId;
        this.cameraAccess = "ready";
        this.wantsCameraOnJoin = true;
        this.persistDeviceChoices();
        return track;
      } catch (reason) {
        if (index === attempts.length - 1) {
          console.warn("[LiveKit] Camera preview failed:", reason);
          this.cameraAccess = accessStateFromError(reason);
          this.wantsCameraOnJoin = false;
          throw reason;
        }
      }
    }
    return undefined;
  }

  private async requestPreviewAudioTrack(): Promise<MediaStreamTrack | undefined> {
    const audioDeviceId = sanitizeMediaDeviceId(this.selectedAudioDevice);
    const attempts: MediaStreamConstraints[] = [
      audioDeviceId
        ? {
            video: false,
            audio: {
              deviceId: { ideal: audioDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }
        : {
            video: false,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          },
      {
        video: false,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      },
    ];

    for (const [index, constraints] of attempts.entries()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const track = this.takeLiveTrack(stream, "audio");
        if (!track) continue;
        const settings = track.getSettings();
        if (settings.deviceId) this.selectedAudioDevice = settings.deviceId;
        this.micAccess = "ready";
        this.wantsMicOnJoin = true;
        this.persistDeviceChoices();
        return track;
      } catch (reason) {
        if (index === attempts.length - 1) {
          console.warn("[LiveKit] Microphone preview failed:", reason);
          this.micAccess = accessStateFromError(reason);
          this.wantsMicOnJoin = false;
          throw reason;
        }
      }
    }
    return undefined;
  }

  private async requestPreviewTracks() {
    const messages: string[] = [];
    let videoTrack: MediaStreamTrack | undefined;
    let audioTrack: MediaStreamTrack | undefined;

    try {
      videoTrack = await this.requestPreviewVideoTrack();
    } catch (reason) {
      messages.push(getMediaErrorMessage("camera", reason));
    }

    try {
      audioTrack = await this.requestPreviewAudioTrack();
    } catch (reason) {
      messages.push(getMediaErrorMessage("microphone", reason));
    }

    this.buildPreviewStream(videoTrack, audioTrack);
    if (this.videoDevices.length === 0 && this.audioDevices.length === 0) {
      await this.enumerateDevicesFallback();
    }
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
      this.mediaError =
        messages.length > 0
          ? `${messages.join(" ")} ${i18n.t.live.preConnect.enterWithoutCamera()}`
          : i18n.t.live.preConnect.noCameraOrMic();
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
      this.persistDeviceChoices();
    } else {
      this.mediaError =
        messages.length > 0
          ? `${messages.join(" ")} ${i18n.t.live.preConnect.enterWithoutCamera()}`
          : i18n.t.live.preConnect.noDevicesAccess();
      this.preConnectStep = "no-devices";
    }
  }

  async retryCamera() {
    this.selectedVideoDevice = "";
    await this.switchPreviewDevice();
  }

  async switchStreamDevice(kind: "audioinput" | "videoinput", deviceId: string) {
    if (!this._room) return;
    try {
      await this._room.switchActiveDevice(kind, deviceId, true);
      if (kind === "audioinput") this.selectedAudioDevice = deviceId;
      if (kind === "videoinput") this.selectedVideoDevice = deviceId;
    } catch (reason) {
      console.warn(`[LiveKit] Failed to switch ${kind}:`, reason);
    }
  }

  stopPreview() {
    this.releasePreviewStreamTracks();
    if (this.audioInterval !== null) {
      window.clearInterval(this.audioInterval);
      this.audioInterval = null;
    }
    if (this.audioContext !== null) {
      void this.audioContext.close();
      this.audioContext = null;
    }
    this.audioLevel = 0;
  }

  protected resolutionDimensions(isInstructor: boolean) {
    const frameRate = this.selectedFramerate;
    if (this.selectedResolution === "1080p" && isInstructor) return { width: 1920, height: 1080, frameRate };
    if (this.selectedResolution === "720p" || isInstructor) return { width: 1280, height: 720, frameRate };
    return { width: 640, height: 360, frameRate: Math.min(frameRate, 30) };
  }

  protected cameraCaptureOptions(isInstructor: boolean) {
    const deviceId = sanitizeMediaDeviceId(this.selectedVideoDevice);
    return {
      resolution: this.resolutionDimensions(isInstructor),
      frameRate: this.selectedFramerate,
      ...(deviceId ? { deviceId } : {}),
    };
  }

  protected microphoneCaptureOptions() {
    const deviceId = sanitizeMediaDeviceId(this.selectedAudioDevice);
    return {
      echoCancellation: this.audioProcessingEnabled,
      noiseSuppression: this.audioProcessingEnabled,
      autoGainControl: this.audioProcessingEnabled,
      ...(deviceId ? { deviceId } : {}),
    };
  }

  protected publishProfile(
    isInstructor: boolean,
    VideoPreset: typeof import("livekit-client").VideoPreset,
    AudioPresets: typeof import("livekit-client").AudioPresets,
  ): TrackPublishDefaults {
    const targetBitrate = Math.round(this.selectedBitrateMbps * 1_000_000);
    const frameRate = this.selectedFramerate;
    const isSvc = this.selectedCodec === "vp9" || this.selectedCodec === "av1";

    const audioPresets: Record<AudioPresetChoice, typeof AudioPresets.telephone> = {
      speech: AudioPresets.speech,
      music: AudioPresets.music,
      musicStereo: AudioPresets.musicStereo,
      musicHighQuality: AudioPresets.musicHighQuality,
      musicHighQualityStereo: AudioPresets.musicHighQualityStereo,
    };
    const audioPresetKey: AudioPresetChoice =
      isInstructor && this.selectedAudioPreset === "speech"
        ? "music"
        : this.selectedAudioPreset;

    const scalabilityMode = isSvc
      ? (this.selectedResolution === "1080p" ? "L3T3_KEY" : "L2T3_KEY") as import("livekit-client").ScalabilityMode
      : undefined;

    return {
      simulcast: this.simulcastEnabled && !isSvc,
      videoCodec: this.selectedCodec,
      videoEncoding: {
        maxBitrate: targetBitrate,
        maxFramerate: frameRate,
      },
      videoSimulcastLayers: this.simulcastEnabled && !isSvc
        ? [
            new VideoPreset(1280, 720, Math.round(targetBitrate * 0.4), Math.min(frameRate, 30)),
            new VideoPreset(640, 360, Math.round(targetBitrate * 0.15), Math.min(frameRate, 30)),
          ]
        : undefined,
      screenShareEncoding: { maxBitrate: 4_000_000, maxFramerate: 15 },
      screenShareSimulcastLayers: [
        new VideoPreset(1280, 720, 2_000_000, 15),
        new VideoPreset(640, 360, 800_000, 15),
      ],
      audioPreset: audioPresets[audioPresetKey],
      red: true,
      dtx: !isInstructor && this.selectedAudioPreset === "speech",
      forceStereo: this.forceStereo,
      degradationPreference: this.degradationPreference,
      scalabilityMode,
      backupCodec: {
        codec: (this.selectedCodec === "h264" ? "vp8" : "h264") as "vp8" | "h264",
        encoding: { maxBitrate: Math.round(targetBitrate * 0.7), maxFramerate: frameRate },
      },
    };
  }

  async toggleCamera() {
    if (this._room === null || this.pendingControl !== null) return;
    const next = !this.cameraEnabled;
    if (next && !this.cameraAvailable) {
      return;
    }
    this.pendingControl = "camera";
    try {
      if (next && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }
      await this._room.localParticipant.setCameraEnabled(
        next,
        this.cameraCaptureOptions(this.isInstructorRoom),
      );
      this.syncLocalMediaFromRoom();
      this.mediaError = "";
    } catch (reason) {
      const message = mediaErrorFromReason("camera", reason);
      if (message) this.mediaError = message;
      this.syncLocalMediaFromRoom();
    } finally {
      this.pendingControl = null;
    }
  }

  async toggleMic() {
    if (this._room === null || this.pendingControl !== null) return;
    const next = !this.micEnabled;
    this.pendingControl = "mic";
    try {
      if (next && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }
      await this._room.localParticipant.setMicrophoneEnabled(next, this.microphoneCaptureOptions());
      this.syncLocalMediaFromRoom();
      this.mediaError = "";
    } catch (reason) {
      this.mediaError = getMediaErrorMessage("microphone", reason);
      if (!next) {
        this.micEnabled = false;
      }
    } finally {
      this.pendingControl = null;
    }
  }

  async toggleScreenShare() {
    if (
      this._room === null ||
      !this.isInstructorRoom ||
      !this._room.localParticipant.setScreenShareEnabled ||
      this.pendingControl !== null
    )
      return;
    const next = !this.screenShareEnabled;
    this.pendingControl = "screen";
    try {
      await this._room.localParticipant.setScreenShareEnabled(
        next,
        next ? { audio: this.screenShareAudioEnabled } : undefined,
      );
      this.screenShareEnabled = next;
      if (!next) {
        this.screenShareAudioEnabled = true;
      }
    } catch {
      this.mediaError = i18n.t.live.room.screenShareError();
    } finally {
      this.pendingControl = null;
    }
  }

  toggleSelfAudioMonitor() {
    this.selfAudioMonitorEnabled = !this.selfAudioMonitorEnabled;
  }

  async setScreenShareAudioEnabled(enabled: boolean) {
    if (
      this._room === null ||
      !this.screenShareEnabled ||
      this.pendingControl !== null ||
      enabled === this.screenShareAudioEnabled
    ) {
      return;
    }
    const next = enabled;
    this.pendingControl = "screen";
    try {
      const publication = this._room.localParticipant.getTrackPublication(
        Track.Source.ScreenShareAudio,
      );
      const track = publication?.track;
      if (track) {
        if (next) {
          await track.unmute();
        } else {
          await track.mute();
        }
        this.screenShareAudioEnabled = next;
        return;
      }
      await this._room.localParticipant.setScreenShareEnabled(true, { audio: next });
      this.screenShareAudioEnabled = next;
    } catch (reason) {
      console.warn("[LiveKit] Screen share audio toggle failed:", reason);
    } finally {
      this.pendingControl = null;
    }
  }

  async sendChatMessage() {
    if (this._room === null) return;
    const text = this.chatDraft.trim();
    if (!text) return;
    const previous = text;
    this.chatDraft = "";

    const local = this._room.localParticipant;
    const optimisticId = `local:${Date.now()}`;
    const optimistic = {
      id: optimisticId,
      identity: local.identity,
      name: local.name || local.identity,
      text: previous,
      createdAt: Date.now(),
      isLocal: true,
    };
    const nextMessages = [...this.chatMessages, optimistic];
    this.chatMessages = nextMessages.length > 200 ? nextMessages.slice(-200) : nextMessages;

    try {
      await local.sendText(previous, { topic: "homebody.chat" });
    } catch (reason) {
      console.warn("[LiveKit] Chat send failed:", reason);
      this.chatDraft = previous;
      this.chatMessages = this.chatMessages.filter((message) => message.id !== optimisticId);
      this.mediaError = i18n.t.live.room.chatSendError();
    }
  }

  protected stopMediaSession() {
    this.stopPreview();
    this.stopStatsTimer();
    this.selfAudioMonitorEnabled = false;
  }

  protected async connectRoom(_info: NonNullable<typeof this.joinInfo>): Promise<void> {
    throw new Error("connectRoom is implemented by LiveSession");
  }
}
