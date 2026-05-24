import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
import type { ConvexClient } from "convex/browser";
import type { Room, TrackPublishDefaults } from "livekit-client";
import { initAuth, getCachedRole } from "$lib/auth/session.svelte";
import { useI18n } from "$lib/i18n/runes.svelte";
import { useDebounce } from "runed";
import type {
  ParticipantRole,
  RoomStatus,
  ConnectionState,
  ConnectionQualityLevel,
  LiveClassType,
  MediaSource,
  PreConnectStep,
  DeviceAccessState,
  MediaTile,
  ParticipantItem,
  StreamStats,
  PerTrackStat,
  MediaDevice,
  VideoCodecChoice,
  VideoResolutionChoice,
  VideoFramerateChoice,
  BitrateChoice,
  AudioPresetChoice,
  DegradationPreferenceChoice,
  ChatMessage,
} from "./types";

const i18n = useI18n();

/** @see @livekit/protocol DisconnectReason — stable numeric codes */
const LK_DISCONNECT = {
  DUPLICATE_IDENTITY: 2,
  PARTICIPANT_REMOVED: 4,
  ROOM_DELETED: 5,
  JOIN_FAILURE: 7,
  ROOM_CLOSED: 10,
  CONNECTION_TIMEOUT: 14,
  MEDIA_FAILURE: 15,
} as const;

export class LiveRoom {
  // Dependencies
  private client: ConvexClient;
  auth = initAuth();

  // Core state
  status = $state<RoomStatus>("checking");
  connectionState = $state<ConnectionState>("idle");
  error = $state("");
  mediaError = $state("");
  joinInfo = $state<{
    wsUrl: string;
    token: string;
    roomName: string;
    participantRole: ParticipantRole;
    joinClosesAt: number;
    classTitle: string;
    instructorName: string;
    liveClassType: LiveClassType;
  } | null>(null);
  /** True after first successful room connect until destroy. */
  inRoom = $state(false);
  needsManualReconnect = $state(false);
  sessionEndedByHost = $state(false);
  browserOffline = $state(false);
  showJoinExpiryModal = $state(false);
  connectionQuality = $state<ConnectionQualityLevel>("unknown");
  networkWarning = $state("");
  unreadChatCount = $state(0);
  private joinExpiryWarned = false;
  private instructorMicBeforeDrop = false;
  private wakeLockSentinel: WakeLockSentinel | null = null;
  private browserHandlersBound = false;
  private onOnlineHandler: (() => void) | null = null;
  private onOfflineHandler: (() => void) | null = null;
  private onVisibilityHandler: (() => void) | null = null;
  private _room: Room | null = null;
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
  showParticipants = $state(false);
  showChat = $state(false);
  showQualityPanel = $state(false);
  private statsTimer: number | null = null;
  private debouncedRefreshParticipants = useDebounce(() => this._refreshParticipants(), 80);
  private expiryTimer: number | null = null;
  private clockTimer: number | null = null;
  private tokenRefreshTimer: number | null = null;
  private nowMs = $state(Date.now());
  private previousStats = new Map<string, { timestamp: number; bytes: number }>();

  // Pre-connect state
  preConnectStep = $state<PreConnectStep>("idle");
  previewStream = $state<MediaStream | null>(null);
  audioLevel = $state(0);
  private audioInterval: number | null = null;
  private audioContext: AudioContext | null = null;
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
  private publishCameraOnNextJoin = false;
  private publishMicOnNextJoin = false;
  chatMessages = $state<ChatMessage[]>([]);
  chatDraft = $state("");

  // Derived
  tileSort = (a: MediaTile, b: MediaTile): number => {
    if (a.source === "screen_share" && b.source !== "screen_share") return -1;
    if (a.source !== "screen_share" && b.source === "screen_share") return 1;
    if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
    return a.name.localeCompare(b.name);
  };

  readonly isInstructorRoom = $derived.by(() => {
    if (this.joinInfo) {
      return this.joinInfo.participantRole === "instructor" || this.joinInfo.participantRole === "admin";
    }
    const role = getCachedRole();
    return role === "instructor" || role === "admin";
  });
  readonly videoTiles = $derived(this.mediaTiles.filter((tile) => tile.kind === "video"));
  readonly audioTiles = $derived(this.mediaTiles.filter((tile) => tile.kind === "audio"));
  readonly screenShareTiles = $derived(this.mediaTiles.filter((t) => t.kind === "video" && t.source === "screen_share"));
  readonly hasScreenShare = $derived(this.screenShareTiles.length > 0);
  readonly instructorVideos = $derived(
    this.mediaTiles
      .filter((tile) => tile.kind === "video" && tile.isInstructor && tile.source !== "screen_share")
      .sort(this.tileSort)
  );
  readonly studentVideos = $derived(
    this.mediaTiles.filter((tile) => tile.kind === "video" && !tile.isInstructor).sort(this.tileSort)
  );
  readonly primaryInstructorVideo = $derived.by(() => {
    const screenShares = this.mediaTiles.filter((t) => t.kind === "video" && t.source === "screen_share");
    if (screenShares.length > 0) return screenShares[0];
    const instructors = this.mediaTiles
      .filter((t) => t.kind === "video" && t.isInstructor && t.source !== "screen_share")
      .sort(this.tileSort);
    return instructors.find((t) => !t.isLocal) ?? instructors[0] ?? null;
  });
  readonly selfVideo = $derived(
    this.mediaTiles.find((tile) => tile.kind === "video" && tile.isLocal && tile.source !== "screen_share") ?? null
  );
  readonly connectionLabel = $derived(
    this.connectionState === "connected"
      ? i18n.t.live.room.connected()
      : this.connectionState === "reconnecting"
        ? i18n.t.live.room.reconnecting()
        : this.connectionState === "connecting"
          ? i18n.t.live.room.connecting()
          : i18n.t.live.room.disconnected()
  );
  readonly formattedBitrate = $derived(
    this.streamStats.bitrateMbps === null
      ? "—"
      : `${this.streamStats.bitrateMbps.toFixed(1)} Mbps`
  );
  readonly formattedResolution = $derived(
    this.streamStats.width && this.streamStats.height
      ? `${this.streamStats.width}×${this.streamStats.height}`
      : "—"
  );
  readonly formattedFps = $derived(
    this.streamStats.fps === null ? "—" : `${Math.round(this.streamStats.fps)} fps`
  );
  readonly formattedPacketLoss = $derived(
    this.streamStats.packetLoss === null
      ? "—"
      : `${this.streamStats.packetLoss.toFixed(1)}%`
  );
  readonly gridCols = $derived(() => {
    const count = this.videoTiles.length;
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  });
  readonly hasPreviewCamera = $derived(Boolean(this.previewStream?.getVideoTracks().length));
  readonly hasPreviewMic = $derived(Boolean(this.previewStream?.getAudioTracks().length));
  readonly expiresAt = $derived(this.joinInfo?.joinClosesAt ?? null);
  readonly secondsUntilExpiry = $derived(
    this.expiresAt === null ? null : Math.max(0, Math.floor((this.expiresAt - this.nowMs) / 1000))
  );
  readonly joinExpiryLabel = $derived.by(() => {
    const seconds = this.secondsUntilExpiry;
    if (seconds === null) return null;
    if (seconds <= 120) return i18n.t.live.room.joinClosesSoon();
    const minutes = Math.ceil(seconds / 60);
    return i18n.t.live.room.joinClosesIn({ minutes });
  });
  readonly connectionQualityLabel = $derived.by(() => {
    switch (this.connectionQuality) {
      case "excellent":
        return i18n.t.live.room.connectionExcellent();
      case "good":
        return i18n.t.live.room.connectionGood();
      case "poor":
        return i18n.t.live.room.connectionPoor();
      case "lost":
        return i18n.t.live.room.connectionLost();
      default:
        return null;
    }
  });
  readonly showConnectionWarning = $derived(
    this.connectionQuality === "poor" || this.connectionQuality === "lost"
  );
  readonly statusBanner = $derived(
    this.browserOffline
      ? i18n.t.live.room.offlineBanner()
      : this.networkWarning,
  );

  constructor(client: ConvexClient) {
    this.client = client;
  }

  // ── Helpers ────────────────────────────────────────────────
  private getClassId() {
    const classId = new URLSearchParams(window.location.search).get("classId");
    return classId as Id<"liveClasses"> | null;
  }

  isInstructorIdentity(identity: string) {
    return identity.startsWith("instructor_") || identity.startsWith("admin_");
  }

  private participantName(participant: unknown) {
    const value = participant as { name?: string; identity?: string };
    return value.name || value.identity || i18n.t.live.room.fallbackName();
  }

  private participantIdentity(participant: unknown) {
    return (participant as { identity?: string }).identity ?? "unknown";
  }

  private participantIsLocal(participant: unknown) {
    return Boolean((participant as { isLocal?: boolean }).isLocal);
  }

  private publicationId(publication: unknown, track: unknown, fallback: string) {
    const pub = publication as { trackSid?: string; sid?: string };
    const value = track as { sid?: string; mediaStreamTrack?: { id?: string } };
    return pub.trackSid ?? pub.sid ?? value.sid ?? value.mediaStreamTrack?.id ?? fallback;
  }

  private trackSource(publication: unknown): MediaSource {
    const source = String((publication as { source?: string }).source ?? "unknown");
    if (
      source === "camera" ||
      source === "microphone" ||
      source === "screen_share" ||
      source === "screen_share_audio"
    )
      return source;
    return "unknown";
  }

  private upsertTile(tile: MediaTile) {
    const existing = this.mediaTiles.find((item) => item.id === tile.id);
    if (existing) existing.element.remove();
    this.mediaTiles = [...this.mediaTiles.filter((item) => item.id !== tile.id), tile];
  }

  private detachTrack(track: unknown) {
    const value = track as { detach?: () => HTMLElement[] };
    value.detach?.().forEach((element) => element.remove());
  }

  private removeTiles(predicate: (tile: MediaTile) => boolean) {
    const removed = this.mediaTiles.filter(predicate);
    removed.forEach((tile) => tile.element.remove());
    this.mediaTiles = this.mediaTiles.filter((tile) => !predicate(tile));
  }

  private removeTileByPublication(participant: unknown, publication: unknown, track: unknown) {
    const identity = this.participantIdentity(participant);
    const source = this.trackSource(publication);
    const id = `${identity}_${source}_${this.publicationId(publication, track, "track")}`;
    this.removeTiles((tile) => tile.id === id || (tile.identity === identity && tile.source === source));
    this.detachTrack(track);
  }

  clearMediaTiles() {
    this.mediaTiles.forEach((tile) => tile.element.remove());
    this.mediaTiles = [];
  }

  private addTrackTile(
    track: unknown,
    publication: unknown,
    participant: unknown,
    prefix: "local" | "remote"
  ) {
    const value = track as { attach?: () => HTMLElement };
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
      (element as HTMLMediaElement).muted = isLocal;
    }
    this.upsertTile({
      id: tileId,
      identity,
      name: this.participantName(participant),
      element,
      kind,
      source,
      isLocal,
      isInstructor: this.isInstructorIdentity(identity),
    });
  }

  private shouldSubscribeToPublication(participant: unknown) {
    if (this.isInstructorRoom) return true;
    return this.isInstructorIdentity(this.participantIdentity(participant));
  }

  private targetQualityForPublication(participant: unknown): 0 | 1 | 2 {
    return this.isInstructorIdentity(this.participantIdentity(participant)) ? 2 : 0;
  }

  private subscribeIfAllowed(publication: unknown, participant: unknown) {
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

  private attachParticipantListeners(
    participant: unknown,
    participantEvent: { IsSpeakingChanged: unknown }
  ) {
    const value = participant as {
      identity?: string;
      on?: (event: unknown, handler: () => void) => void;
      trackPublications?: Map<string, unknown>;
    };
    value.on?.(participantEvent.IsSpeakingChanged, () => this.refreshParticipants());
    value.trackPublications?.forEach((publication) => {
      this.subscribeIfAllowed(publication, participant);
      const track = (publication as { track?: unknown }).track;
      if (track) this.addTrackTile(track, publication, participant, "remote");
    });
  }

  refreshParticipants() {
    this.debouncedRefreshParticipants();
  }

  private _refreshParticipants() {
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
              this.trackSource(p) === "camera" && (p as { track?: unknown }).track
          )
        ),
        hasMic: Boolean(
          [...local.trackPublications.values()].some(
            (p: unknown) =>
              this.trackSource(p) === "microphone" && (p as { track?: unknown }).track
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
              this.trackSource(p) === "camera" && (p as { track?: unknown }).track
          )
        ),
        hasMic: Boolean(
          [...(value.trackPublications?.values() ?? [])].some(
            (p: unknown) =>
              this.trackSource(p) === "microphone" && (p as { track?: unknown }).track
          )
        ),
      });
    });
    this.participants = next.sort(
      (a, b) => Number(b.isInstructor) - Number(a.isInstructor) || a.name.localeCompare(b.name)
    );
  }

  // ── Stats ──────────────────────────────────────────────────
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
          source: this.trackSource(publication),
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
            source: this.trackSource(publication),
          });
      });
    });
    const results = await Promise.all(
      publications.map((p) =>
        this.collectTrackStats(p.track, p.id, p.name, p.source, p.kind)
      )
    );
    // Prune stale previousStats entries for removed tracks
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

  private startStatsTimer() {
    if (this.statsTimer !== null) return;
    this.statsTimer = window.setInterval(() => {
      if (this.showQualityPanel) {
        void this.refreshStreamStats();
      } else {
        void this.refreshConnectionHealth();
      }
    }, 5000);
  }

  private mapConnectionQuality(value: string): ConnectionQualityLevel {
    if (value === "excellent" || value === "good" || value === "poor" || value === "lost") {
      return value;
    }
    return "unknown";
  }

  private updateConnectionQualityFromRoom() {
    if (this._room === null) return;
    const localQuality = this._room.localParticipant.connectionQuality;
    this.connectionQuality = this.mapConnectionQuality(String(localQuality));
  }

  private async refreshConnectionHealth() {
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

  private stopTokenRefreshTimer() {
    if (this.tokenRefreshTimer !== null) window.clearTimeout(this.tokenRefreshTimer);
    this.tokenRefreshTimer = null;
  }

  private startTokenRefreshTimer() {
    this.stopTokenRefreshTimer();
    this.tokenRefreshTimer = window.setTimeout(
      () => void this.refreshJoinToken(),
      7 * 60 * 1000,
    );
  }

  private async refreshJoinToken() {
    const liveClassId = this.getClassId();
    if (liveClassId === null || !this.inRoom) return;
    try {
      const joinInfo = await this.client.action(api.livekit.token.issueJoin, { liveClassId });
      this.joinInfo = joinInfo;
      this.startExpiryTimer(joinInfo.joinClosesAt);
      this.startTokenRefreshTimer();
    } catch (reason) {
      console.warn("[LiveKit] Token refresh failed:", reason);
    }
  }

  private stopStatsTimer() {
    if (this.statsTimer !== null) window.clearInterval(this.statsTimer);
    this.statsTimer = null;
    this.previousStats.clear();
  }

  private checkJoinExpiryWarning() {
    if (this.joinExpiryWarned || !this.inRoom || this.isInstructorRoom) return;
    const seconds = this.secondsUntilExpiry;
    if (seconds === null || seconds > 120 || seconds <= 0) return;
    this.joinExpiryWarned = true;
    this.showJoinExpiryModal = true;
  }

  dismissMediaError() {
    this.mediaError = "";
  }

  dismissJoinExpiryModal() {
    this.showJoinExpiryModal = false;
  }

  handleClassEnded() {
    if (this.sessionEndedByHost) return;
    this.sessionEndedByHost = true;
    this.needsManualReconnect = false;
    this.showJoinExpiryModal = false;
    this.mediaError = i18n.t.live.room.disconnectRoomEnded();
    this.inRoom = false;
    this.stopStatsTimer();
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    this.clearMediaTiles();
    this._room?.disconnect();
    this._room = null;
  }

  private disconnectMessage(reason: number | undefined): string | null {
    if (reason === undefined) return null;
    if (reason === LK_DISCONNECT.DUPLICATE_IDENTITY) return i18n.t.live.room.disconnectDuplicate();
    if (reason === LK_DISCONNECT.PARTICIPANT_REMOVED) return i18n.t.live.room.disconnectRemoved();
    if (reason === LK_DISCONNECT.ROOM_DELETED || reason === LK_DISCONNECT.ROOM_CLOSED) {
      return i18n.t.live.room.disconnectRoomEnded();
    }
    if (reason === LK_DISCONNECT.JOIN_FAILURE) return i18n.t.live.room.disconnectJoinFailed();
    if (reason === LK_DISCONNECT.CONNECTION_TIMEOUT) return i18n.t.live.room.disconnectTimeout();
    if (reason === LK_DISCONNECT.MEDIA_FAILURE) return i18n.t.live.room.disconnectMediaFailed();
    return null;
  }

  private handleDisconnected(reason: number | undefined) {
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    if (this.isInstructorRoom) {
      this.instructorMicBeforeDrop = true;
    } else if (this.micEnabled) {
      this.instructorMicBeforeDrop = true;
    }

    const reasonMessage = this.disconnectMessage(reason);
    const endedByHost =
      reasonMessage !== null &&
      (reasonMessage === i18n.t.live.room.disconnectRoomEnded() ||
        reasonMessage === i18n.t.live.room.disconnectRemoved());

    if (endedByHost) {
      this.sessionEndedByHost = true;
      this.needsManualReconnect = false;
      this.inRoom = false;
      this.mediaError = reasonMessage;
      return;
    }

    if (reasonMessage) {
      this.mediaError = reasonMessage;
      if (reasonMessage === i18n.t.live.room.disconnectDuplicate()) {
        this.needsManualReconnect = false;
        this.inRoom = false;
        return;
      }
    }

    if (this.joinInfo && Date.now() < this.joinInfo.joinClosesAt && this.inRoom) {
      this.connectionState = "disconnected";
      this.needsManualReconnect = true;
      if (this.browserOffline) {
        this.mediaError = i18n.t.live.room.disconnectOffline();
      }
    } else {
      this.connectionState = "disconnected";
      this.needsManualReconnect = false;
      if (!this.inRoom) this.status = "ready";
    }
  }

  private async prepareJoinConnection() {
    if (!this.joinInfo || this.inRoom) return;
    try {
      const { Room } = await import("livekit-client");
      const warm = new Room({ adaptiveStream: true, dynacast: true });
      await warm.prepareConnection(this.joinInfo.wsUrl, this.joinInfo.token);
    } catch (reason) {
      console.warn("[LiveKit] prepareConnection failed:", reason);
    }
  }

  private async restoreInstructorMicIfNeeded() {
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
          this.mediaError = this.getMediaErrorMessage("microphone", reason);
        }
      }
      return;
    }
    await this.switchPreviewDevice();
  }

  async acquireWakeLock() {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    try {
      this.wakeLockSentinel = await navigator.wakeLock.request("screen");
    } catch (reason) {
      console.warn("[LiveKit] Wake lock failed:", reason);
    }
  }

  releaseWakeLock() {
    void this.wakeLockSentinel?.release();
    this.wakeLockSentinel = null;
  }

  initBrowserStabilityHandlers() {
    if (typeof window === "undefined" || this.browserHandlersBound) return;
    this.browserHandlersBound = true;
    this.browserOffline = !navigator.onLine;

    this.onOnlineHandler = () => {
      this.browserOffline = false;
      if (this.inRoom && this.needsManualReconnect) {
        void this.reconnect();
      }
    };
    this.onOfflineHandler = () => {
      this.browserOffline = true;
      this.networkWarning = i18n.t.live.room.offlineBanner();
    };
    this.onVisibilityHandler = () => {
      if (document.visibilityState === "visible" && this.inRoom) {
        void this.acquireWakeLock();
        if (this.needsManualReconnect && navigator.onLine) {
          void this.reconnect();
        }
      }
    };

    window.addEventListener("online", this.onOnlineHandler);
    window.addEventListener("offline", this.onOfflineHandler);
    document.addEventListener("visibilitychange", this.onVisibilityHandler);
  }

  disposeBrowserStabilityHandlers() {
    if (!this.browserHandlersBound || typeof window === "undefined") return;
    if (this.onOnlineHandler) window.removeEventListener("online", this.onOnlineHandler);
    if (this.onOfflineHandler) window.removeEventListener("offline", this.onOfflineHandler);
    if (this.onVisibilityHandler) {
      document.removeEventListener("visibilitychange", this.onVisibilityHandler);
    }
    this.onOnlineHandler = null;
    this.onOfflineHandler = null;
    this.onVisibilityHandler = null;
    this.browserHandlersBound = false;
  }

  private startExpiryTimer(expiresAt: number) {
    this.stopExpiryTimer();
    this.joinExpiryWarned = false;
    this.nowMs = Date.now();
    this.clockTimer = window.setInterval(() => {
      this.nowMs = Date.now();
      this.checkJoinExpiryWarning();
    }, 1000);
    this.expiryTimer = window.setTimeout(
      () => this.expireLocalRoom(),
      Math.max(0, expiresAt - Date.now())
    );
  }

  private stopExpiryTimer() {
    if (this.expiryTimer !== null) window.clearTimeout(this.expiryTimer);
    if (this.clockTimer !== null) window.clearInterval(this.clockTimer);
    this.expiryTimer = null;
    this.clockTimer = null;
  }

  private expireLocalRoom() {
    this.mediaError = i18n.t.live.room.sessionEnded();
    this.connectionState = "disconnected";
    this.needsManualReconnect = false;
    this.inRoom = false;
    this.stopStatsTimer();
    this.stopTokenRefreshTimer();
    this.clearMediaTiles();
    this._room?.disconnect();
    this._room = null;
  }

  // ── Pre-connect ────────────────────────────────────────────
  private getMediaErrorMessage(kind: "camera" | "microphone", reason: unknown) {
    const errName = reason instanceof DOMException ? reason.name : "";
    if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
      return kind === "camera"
        ? i18n.t.live.preConnect.cameraNotAllowed()
        : i18n.t.live.preConnect.micNotAllowed();
    }
    if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
      return kind === "camera"
        ? i18n.t.live.preConnect.cameraNotFound()
        : i18n.t.live.preConnect.micNotFound();
    }
    if (errName === "NotReadableError" || errName === "TrackStartError") {
      return kind === "camera"
        ? i18n.t.live.preConnect.cameraNotReadable()
        : i18n.t.live.preConnect.micNotReadable();
    }
    if (errName === "AbortError") {
      return kind === "camera"
        ? i18n.t.live.preConnect.cameraAborted()
        : i18n.t.live.preConnect.micAborted();
    }
    return kind === "camera"
      ? i18n.t.live.preConnect.cameraGeneric()
      : i18n.t.live.preConnect.micGeneric();
  }

  private accessStateFromError(reason: unknown): DeviceAccessState {
    const errName = reason instanceof DOMException ? reason.name : "";
    if (errName === "NotAllowedError" || errName === "PermissionDeniedError") return "denied";
    if (errName === "NotFoundError" || errName === "DevicesNotFoundError") return "missing";
    return "failed";
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
      this.cameraAccess = this.accessStateFromError(reason);
      this.wantsCameraOnJoin = false;
      messages.push(this.getMediaErrorMessage("camera", reason));
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

  // Switch audio/video device mid-stream using LiveKit's built-in API
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

  private resolutionDimensions(isInstructor: boolean) {
    const frameRate = this.selectedFramerate;
    if (this.selectedResolution === "1080p" && isInstructor) return { width: 1920, height: 1080, frameRate };
    if (this.selectedResolution === "720p" || isInstructor) return { width: 1280, height: 720, frameRate };
    return { width: 640, height: 360, frameRate: Math.min(frameRate, 30) };
  }

  private cameraCaptureOptions(isInstructor: boolean) {
    return {
      resolution: this.resolutionDimensions(isInstructor),
      frameRate: this.selectedFramerate,
      ...(this.selectedVideoDevice ? { deviceId: this.selectedVideoDevice } : {}),
    };
  }

  private microphoneCaptureOptions() {
    return {
      echoCancellation: this.audioProcessingEnabled,
      noiseSuppression: this.audioProcessingEnabled,
      autoGainControl: this.audioProcessingEnabled,
      ...(this.selectedAudioDevice ? { deviceId: this.selectedAudioDevice } : {}),
    };
  }

  private publishProfile(
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
    this.mediaError = ""; // Clear pre-connect errors when entering room
    // Firefox needs time to release the camera device before LiveKit grabs it
    const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
    if (isFirefox) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (this.joinInfo) void this.connectRoom(this.joinInfo);
  }

  async reconnect() {
    if (!this.joinInfo || Date.now() >= this.joinInfo.joinClosesAt) return;
    this.error = "";
    this.mediaError = "";
    this.needsManualReconnect = false;
    this.networkWarning = "";
    this.connectionState = "connecting";
    try {
      await this.loadToken();
      if (this.joinInfo) {
        await this.prepareJoinConnection();
        await this.connectRoom(this.joinInfo);
      }
    } catch (reason) {
      console.error("[LiveKit] Reconnect failed:", reason);
      this.connectionState = "disconnected";
      this.needsManualReconnect = true;
      this.mediaError =
        reason instanceof Error ? reason.message : i18n.t.live.room.reconnectBody();
    }
  }

  exitAfterDisconnect() {
    const isInstructor = this.isInstructorRoom;
    this.destroy();
    window.location.assign(isInstructor ? "/i/live" : "/u/calendar");
  }

  async startLiveAndConnect(publishAvailableDevices = true) {
    const liveClassId = this.getClassId();
    if (liveClassId === null) return;
    this.status = "checking";
    this.error = "";
    try {
      await this.client.mutation(api.live.class.start, { liveClassId });
      await this.loadToken();
      if (this.status as string === "ready") {
        await this.enterRoom(publishAvailableDevices);
      }
    } catch (reason){
      console.error("[LiveKit] Start live failed:", reason);
      this.error = reason instanceof Error ? reason.message : i18n.t.live.room.startLiveError();
      this.status = "error";
    }
  }

  async endLive() {
    const liveClassId = this.getClassId();
    if (liveClassId === null) return;
    try {
      await this.client.mutation(api.live.class.end, { liveClassId });
      this.destroy();
      window.location.assign("/i/live");
    } catch (reason) {
      console.error("[LiveKit] End live failed:", reason);
      this.mediaError = reason instanceof Error ? reason.message : i18n.t.live.room.endLiveError();
    }
  }

  // ── Token & Room connection ────────────────────────────────
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
      const joinInfo = await this.client.action(api.livekit.token.issueJoin, { liveClassId });
      this.joinInfo = joinInfo;
      this.startExpiryTimer(joinInfo.joinClosesAt);
      this.status = "ready";
      void this.prepareJoinConnection();
    } catch (reason) {
      console.error("[LiveKit] Token fetch failed:", reason);
      if (!this.auth.isAuthenticated) {
        this.status = "locked";
        return;
      }
      const message = reason instanceof Error ? reason.message : String(reason);
      if (message.includes("Class is not live") || message.includes("השיעור אינו חי")) {
        const role = getCachedRole();
        if (role === "instructor" || role === "admin") {
          this.status = "prep";
          return;
        }
      }
      this.error = this.auth.error || message || i18n.t.live.room.tokenError();
      this.status = "error";
    }
  }

  private async connectRoom(info: NonNullable<typeof this.joinInfo>) {
    this.connectionState = "connecting";
    try {
      const {
        Room,
        RoomEvent,
        ParticipantEvent,
        VideoPreset,
        AudioPresets,
      } = await import("livekit-client");
      const isInstructor = info.participantRole === "instructor" || info.participantRole === "admin";
      const lkRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        disconnectOnPageLeave: false,
        stopLocalTrackOnUnpublish: false,
        reconnectPolicy: {
          nextRetryDelayInMs(ctx) {
            if (ctx.retryCount >= 10) return null;
            return Math.min(3_000 * (ctx.retryCount + 1), 15_000);
          },
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        videoCaptureDefaults: { resolution: this.resolutionDimensions(isInstructor) },
        publishDefaults: this.publishProfile(isInstructor, VideoPreset, AudioPresets),
      });
      this._room = lkRoom;
      lkRoom.registerTextStreamHandler("homebody.chat", (reader: { info?: { id?: string; timestamp?: number }; readAll: () => Promise<string> }, participantInfo: { identity: string }) => {
        void (async () => {
          const text = await reader.readAll();
          const participant = participantInfo.identity === lkRoom.localParticipant.identity
            ? lkRoom.localParticipant
            : lkRoom.remoteParticipants.get(participantInfo.identity);
          const next = [...this.chatMessages, {
            id: reader.info?.id ?? `${participantInfo.identity}:${Date.now()}`,
            identity: participantInfo.identity,
            name: participant?.name || participantInfo.identity,
            text,
            createdAt: reader.info?.timestamp ?? Date.now(),
            isLocal: participantInfo.identity === lkRoom.localParticipant.identity,
          }];
          this.chatMessages = next.length > 200 ? next.slice(-200) : next;
          if (!this.showChat) this.unreadChatCount += 1;
        })();
      });
      lkRoom
        .on(RoomEvent.ConnectionQualityChanged, () => {
          this.updateConnectionQualityFromRoom();
        })
        .on(RoomEvent.Reconnecting, () => {
          this.connectionState = "reconnecting";
          this.needsManualReconnect = false;
        })
        .on(RoomEvent.Reconnected, () => {
          this.connectionState = "connected";
          this.needsManualReconnect = false;
          this.networkWarning = "";
          this.refreshParticipants();
          void this.refreshConnectionHealth();
          void this.restoreInstructorMicIfNeeded();
        })
        .on(RoomEvent.Disconnected, (reason?: number) => {
          this.handleDisconnected(reason);
        })
        .on(RoomEvent.ParticipantConnected, (participant: unknown) => {
          this.attachParticipantListeners(participant, ParticipantEvent);
          this.refreshParticipants();
        })
        .on(RoomEvent.ParticipantDisconnected, (participant: unknown) => {
          this.removeTiles(
            (tile) => tile.identity === this.participantIdentity(participant)
          );
          this.refreshParticipants();
        })
        .on(RoomEvent.ActiveSpeakersChanged, (speakers: unknown[]) => {
          this.activeSpeakerIdentity =
            (speakers as Array<{ identity?: string; isSpeaking?: boolean }>).find(
              (s) => s.isSpeaking
            )?.identity ?? null;
          this.refreshParticipants();
        })
        .on(RoomEvent.LocalTrackPublished, (publication: unknown, participant: unknown) => {
          this.addTrackTile(
            (publication as { track?: unknown }).track,
            publication,
            participant,
            "local"
          );
        })
        .on(RoomEvent.LocalTrackUnpublished, (publication: unknown, participant: unknown) => {
          this.removeTileByPublication(
            participant,
            publication,
            (publication as { track?: unknown }).track
          );
          const source = this.trackSource(publication);
          if (source === "screen_share" || source === "screen_share_audio")
            this.screenShareEnabled = false;
        })
        .on(RoomEvent.TrackUnpublished, (publication: unknown, participant: unknown) => {
          this.removeTileByPublication(
            participant,
            publication,
            (publication as { track?: unknown }).track
          );
        })
        .on(RoomEvent.TrackSubscribed, (track: unknown, publication: unknown, participant: unknown) => {
          this.addTrackTile(track, publication, participant, "remote");
        })
        .on(RoomEvent.TrackPublished, (publication: unknown, participant: unknown) => {
          this.subscribeIfAllowed(publication, participant);
        })
        .on(
          RoomEvent.TrackUnsubscribed,
          (track: unknown, publication: unknown, participant: unknown) => {
            this.removeTileByPublication(participant, publication, track);
          }
        );
      await lkRoom.prepareConnection(info.wsUrl, info.token);
      await lkRoom.connect(info.wsUrl, info.token);
      this.inRoom = true;
      void this.acquireWakeLock();
      this.needsManualReconnect = false;
      this.status = "ready";
      if (info.liveClassType === "group_live" && !this.isInstructorRoom) {
        this.showChat = true;
      }
      if (isInstructor) {
        this.publishMicOnNextJoin = true;
      }
      if (this.publishCameraOnNextJoin) {
        try {
          await lkRoom.localParticipant.setCameraEnabled(
            true,
            this.cameraCaptureOptions(isInstructor)
          );
          this.cameraEnabled = true;
        } catch (cameraReason) {
          this.cameraEnabled = false;
          console.warn("[LiveKit] Camera failed:", cameraReason);
          this.mediaError = this.getMediaErrorMessage("camera", cameraReason);
        }
      }
      if (this.publishMicOnNextJoin) {
        try {
          await lkRoom.localParticipant.setMicrophoneEnabled(
            true,
            this.microphoneCaptureOptions()
          );
          this.micEnabled = true;
        } catch (micReason) {
          this.micEnabled = false;
          console.warn("[LiveKit] Microphone failed:", micReason);
          this.mediaError = [this.mediaError, this.getMediaErrorMessage("microphone", micReason)]
            .filter(Boolean)
            .join(" ");
        }
      }
      if (isInstructor && !this.micEnabled) {
        try {
          await lkRoom.localParticipant.setMicrophoneEnabled(
            true,
            this.microphoneCaptureOptions(),
          );
          this.micEnabled = true;
        } catch (micReason) {
          console.warn("[LiveKit] Instructor mic failed:", micReason);
          this.mediaError = this.getMediaErrorMessage("microphone", micReason);
        }
      }
      this.connectionState = "connected";
      this.updateConnectionQualityFromRoom();
      this.refreshParticipants();
      this.startStatsTimer();
      this.startTokenRefreshTimer();
      lkRoom.remoteParticipants.forEach((participant) =>
        this.attachParticipantListeners(participant, ParticipantEvent)
      );
    } catch (reason) {
      this.connectionState = "disconnected";
      this.inRoom = false;
      throw reason;
    }
  }

  openChat() {
    this.showChat = true;
    this.unreadChatCount = 0;
  }

  toggleChat() {
    if (this.showChat) {
      this.showChat = false;
    } else {
      this.openChat();
    }
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

  destroy() {
    this.stopPreview();
    this.stopExpiryTimer();
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    this.disposeBrowserStabilityHandlers();
    this.inRoom = false;
    this.needsManualReconnect = false;
    this.sessionEndedByHost = false;
    this.showJoinExpiryModal = false;
    this.joinExpiryWarned = false;
    this.unreadChatCount = 0;
    this.networkWarning = "";
    this.browserOffline = false;
    this.connectionQuality = "unknown";
    this.clearMediaTiles();
    this.stopStatsTimer();
    this._room?.unregisterTextStreamHandler("homebody.chat");
    this._room?.disconnect();
    this._room = null;
  }
}
