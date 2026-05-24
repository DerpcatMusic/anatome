import type { Room, TrackPublishDefaults } from "livekit-client";
import { useDebounce } from "runed";
import { LiveRoomUi } from "./live-room-ui.svelte";
import {
  accessStateFromError,
  getMediaErrorMessage,
  i18n,
  participantIdentity,
  participantIsLocal,
  participantName,
  publicationId,
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
  MediaTile,
  ParticipantItem,
  PerTrackStat,
  PreConnectStep,
  StreamStats,
  VideoCodecChoice,
  VideoFramerateChoice,
  VideoResolutionChoice,
} from "./types";

/** Preview, devices, track tiles, publish profile, and local media controls. */
export class LiveRoomMedia extends LiveRoomUi {
  mediaTiles = $state<MediaTile[]>([]);
  participants = $state<ParticipantItem[]>([]);
  micEnabled = $state(false);
  cameraEnabled = $state(false);
  screenShareEnabled = $state(false);
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
  activeSpeakerIdentity = $state<string | null>(null);
  connectionQuality = $state<ConnectionQualityLevel>("unknown");
  networkWarning = $state("");
  audioLevel = $state(0);

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
  protected debouncedRefreshParticipants = useDebounce(() => this._refreshParticipants(), 80);

  private audioInterval: number | null = null;
  private audioContext: AudioContext | null = null;

  /** Set by {@link LiveRoomConnection}. */
  protected _room: Room | null = null;
  declare readonly isInstructorRoom: boolean;
  declare readonly videoTiles: MediaTile[];
  declare readonly audioTiles: MediaTile[];
  declare connectionState: import("./types").ConnectionState;

  tileSort = (a: MediaTile, b: MediaTile): number => {
    if (a.source === "screen_share" && b.source !== "screen_share") return -1;
    if (a.source !== "screen_share" && b.source === "screen_share") return 1;
    if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
    return a.name.localeCompare(b.name);
  };

  private upsertTile(tile: MediaTile) {
    const existing = this.mediaTiles.find((item) => item.id === tile.id);
    if (existing) existing.element.remove();
    this.mediaTiles = [...this.mediaTiles.filter((item) => item.id !== tile.id), tile];
  }

  private detachTrack(track: unknown) {
    const value = track as { detach?: () => HTMLElement[] };
    value.detach?.().forEach((element) => element.remove());
  }

  protected removeTiles(predicate: (tile: MediaTile) => boolean) {
    const removed = this.mediaTiles.filter(predicate);
    removed.forEach((tile) => tile.element.remove());
    this.mediaTiles = this.mediaTiles.filter((tile) => !predicate(tile));
  }

  protected removeTileByPublication(participant: unknown, publication: unknown, track: unknown) {
    const identity = participantIdentity(participant);
    const source = trackSource(publication);
    const id = `${identity}_${source}_${publicationId(publication, track, "track")}`;
    this.removeTiles((tile) => tile.id === id || (tile.identity === identity && tile.source === source));
    this.detachTrack(track);
  }

  clearMediaTiles() {
    this.mediaTiles.forEach((tile) => tile.element.remove());
    this.mediaTiles = [];
  }

  protected addTrackTile(
    track: unknown,
    publication: unknown,
    participant: unknown,
    prefix: "local" | "remote"
  ) {
    const value = track as { attach?: () => HTMLElement };
    if (typeof value.attach !== "function") return;
    const identity = participantIdentity(participant);
    const source = trackSource(publication);
    const tileId = `${identity}_${source}_${publicationId(publication, track, prefix)}`;
    this.detachTrack(track);
    const element = value.attach();
    const kind = element instanceof HTMLAudioElement ? "audio" : "video";
    const isLocal = participantIsLocal(participant);
    if (kind === "video") {
      element.setAttribute("playsinline", "true");
      element.setAttribute("data-source", source);
      (element as HTMLMediaElement).muted = isLocal;
    }
    this.upsertTile({
      id: tileId,
      identity,
      name: participantName(participant),
      element,
      kind,
      source,
      isLocal,
      isInstructor: this.isInstructorIdentity(identity),
    });
  }

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
    };
    if (typeof pub.setSubscribed !== "function") return;
    const shouldSubscribe = this.shouldSubscribeToPublication(participant);
    pub.setSubscribed(shouldSubscribe);
    if (shouldSubscribe && pub.kind === "video" && typeof pub.setVideoQuality === "function") {
      pub.setVideoQuality(this.targetQualityForPublication(participant));
    }
  }

  refreshParticipants() {
    this.debouncedRefreshParticipants();
  }

  protected _refreshParticipants() {
    if (this._room === null) return;
    const local = this._room.localParticipant;
    const next: ParticipantItem[] = [
      {
        identity: local.identity,
        name: local.name || local.identity,
        isInstructor: this.isInstructorIdentity(local.identity),
        isLocal: true,
        isSpeaking: Boolean(local.isSpeaking),
        hasCamera: Boolean(
          [...local.trackPublications.values()].some(
            (p: unknown) =>
              trackSource(p) === "camera" && (p as { track?: unknown }).track
          )
        ),
        hasMic: Boolean(
          [...local.trackPublications.values()].some(
            (p: unknown) =>
              trackSource(p) === "microphone" && (p as { track?: unknown }).track
          )
        ),
      },
    ];
    this._room.remoteParticipants.forEach((participant) => {
      const value = participant as {
        identity: string;
        name?: string;
        isSpeaking?: boolean;
        trackPublications?: Map<string, unknown>;
      };
      next.push({
        identity: value.identity,
        name: value.name || value.identity,
        isInstructor: this.isInstructorIdentity(value.identity),
        isLocal: false,
        isSpeaking: Boolean(value.isSpeaking),
        hasCamera: Boolean(
          [...(value.trackPublications?.values() ?? [])].some(
            (p: unknown) =>
              trackSource(p) === "camera" && (p as { track?: unknown }).track
          )
        ),
        hasMic: Boolean(
          [...(value.trackPublications?.values() ?? [])].some(
            (p: unknown) =>
              trackSource(p) === "microphone" && (p as { track?: unknown }).track
          )
        ),
      });
    });
    this.participants = next.sort(
      (a, b) => Number(b.isInstructor) - Number(a.isInstructor) || a.name.localeCompare(b.name)
    );
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
      videoTracks: this.videoTiles.length,
      audioTracks: this.audioTiles.length,
    };
  }

  protected startStatsTimer() {
    if (this.statsTimer !== null) return;
    this.statsTimer = window.setInterval(() => {
      if (this.showQualityPanel) {
        void this.refreshStreamStats();
      } else {
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

  private async enumerateDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.videoDevices = devices
      .filter((d) => d.kind === "videoinput")
      .map((d) => ({ deviceId: d.deviceId, label: d.label || i18n.t.live.preConnect.cameraLabel() }));
    this.audioDevices = devices
      .filter((d) => d.kind === "audioinput")
      .map((d) => ({ deviceId: d.deviceId, label: d.label || i18n.t.live.preConnect.micLabel() }));
  }

  private buildPreviewStream(videoTrack?: MediaStreamTrack, audioTrack?: MediaStreamTrack) {
    const tracks = [videoTrack, audioTrack].filter((track): track is MediaStreamTrack => Boolean(track));
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

  private async requestPreviewTracks() {
    const messages: string[] = [];
    let videoTrack: MediaStreamTrack | undefined;
    let audioTrack: MediaStreamTrack | undefined;

    try {
      const constraints: MediaStreamConstraints = {
        video: this.selectedVideoDevice ? { deviceId: { exact: this.selectedVideoDevice } } : true,
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoTrack = stream.getVideoTracks()[0];
      this.cameraAccess = videoTrack ? "ready" : "missing";
      this.wantsCameraOnJoin = Boolean(videoTrack);
      const settings = videoTrack?.getSettings();
      if (settings?.deviceId) this.selectedVideoDevice = settings.deviceId;
    } catch (reason) {
      console.warn("[LiveKit] Camera preview failed:", reason);
      this.cameraAccess = accessStateFromError(reason);
      this.wantsCameraOnJoin = false;
      messages.push(getMediaErrorMessage("camera", reason));
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: false,
        audio: this.selectedAudioDevice
          ? {
              deviceId: { exact: this.selectedAudioDevice },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      audioTrack = stream.getAudioTracks()[0];
      this.micAccess = audioTrack ? "ready" : "missing";
      this.wantsMicOnJoin = Boolean(audioTrack);
      const settings = audioTrack?.getSettings();
      if (settings?.deviceId) this.selectedAudioDevice = settings.deviceId;
    } catch (reason) {
      console.warn("[LiveKit] Microphone preview failed:", reason);
      this.micAccess = accessStateFromError(reason);
      this.wantsMicOnJoin = false;
      messages.push(getMediaErrorMessage("microphone", reason));
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
    if (this.previewStream) {
      this.previewStream.getTracks().forEach((t) => t.stop());
      this.previewStream = null;
    }
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
    return {
      resolution: this.resolutionDimensions(isInstructor),
      frameRate: this.selectedFramerate,
      ...(this.selectedVideoDevice ? { deviceId: this.selectedVideoDevice } : {}),
    };
  }

  protected microphoneCaptureOptions() {
    return {
      echoCancellation: this.audioProcessingEnabled,
      noiseSuppression: this.audioProcessingEnabled,
      autoGainControl: this.audioProcessingEnabled,
      ...(this.selectedAudioDevice ? { deviceId: this.selectedAudioDevice } : {}),
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

  async enterRoom(publishAvailableDevices = true) {
    this.publishCameraOnNextJoin = publishAvailableDevices && this.wantsCameraOnJoin;
    this.publishMicOnNextJoin =
      this.isInstructorRoom || (publishAvailableDevices && this.wantsMicOnJoin);
    this.stopPreview();
    this.mediaError = "";
    const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
    if (isFirefox) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (this.joinInfo) void this.connectRoom(this.joinInfo);
  }

  async toggleCamera() {
    if (this._room === null || this.pendingControl !== null) return;
    const next = !this.cameraEnabled;
    this.pendingControl = "camera";
    try {
      await this._room.localParticipant.setCameraEnabled(
        next,
        this.cameraCaptureOptions(this.isInstructorRoom)
      );
      this.cameraEnabled = next;
      this.mediaError = "";
    } catch (reason) {
      this.mediaError = getMediaErrorMessage("camera", reason);
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
      this.mediaError = getMediaErrorMessage("microphone", reason);
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
      await this._room.localParticipant.setScreenShareEnabled(next);
      this.screenShareEnabled = next;
      if (!next) this.removeTiles((tile) => tile.isLocal && tile.source === "screen_share");
    } catch {
      this.mediaError = i18n.t.live.room.screenShareError();
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
    try {
      await this._room.localParticipant.sendText(previous, { topic: "homebody.chat" });
    } catch (reason) {
      console.warn("[LiveKit] Chat send failed:", reason);
      this.chatDraft = previous;
      this.mediaError = i18n.t.live.room.chatSendError();
    }
  }

  protected stopMediaSession() {
    this.stopPreview();
    this.stopStatsTimer();
    this.clearMediaTiles();
  }

  protected async connectRoom(_info: NonNullable<typeof this.joinInfo>): Promise<void> {
    throw new Error("connectRoom must be called on LiveRoomConnection");
  }
}
