/**
 * Approach A live session — join token, connect module, and room chrome state.
 */
import type { ConvexClient } from "convex/browser";
import { useI18n } from "$lib/i18n/runes.svelte";
import type { JoinInfo } from "./join-token";
import { LiveSessionLifecycle } from "./live-session-lifecycle.svelte";
import {
  connectLiveSessionRoom,
  teardownLiveSessionRoom,
  type SessionCaptureOptions,
} from "./live-session-connect";
import { buildSessionSubscribePolicy } from "./live-subscribe-policy";
import { isCameraNotFoundMediaError } from "./live-room-shared";

const i18n = useI18n();

export type { JoinInfo, JoinAccessSnapshot, JoinTokenPhase, JoinTokenSnapshot } from "./join-token";
export type { ConnectionState, RoomStatus } from "./types";
export type {
  ConnectLiveSessionInput,
  ConnectLiveSessionResult,
  SessionCaptureOptions,
  SessionDeviceSelection,
  SessionPublishIntent,
} from "./live-session-connect";

/** Control bar + settings popover (structural slice of {@link LiveSession}). */
export type LiveSessionControlBar = LiveSession;

/** Instructor quality / stats panel. */
export type LiveSessionQuality = LiveSession;

/** PreJoin overlay through first connect. */
export type LiveSessionPreConnect = LiveSession;

/** Room header chrome (data + actions). */
export type LiveSessionHeader = LiveSession;

/** Self-monitor audio element attachment. */
export type LiveSessionSelfAudio = LiveSession;

/** Full session passed from shell when a single object drives chrome. */
export type LiveSessionChrome = LiveSession;

/**
 * Resolves `session` vs deprecated `room` prop for room chrome components.
 */
export function resolveLiveSession(
  session: LiveSession | undefined,
  roomAlias: LiveSession | undefined,
  componentName: string,
): LiveSession {
  const resolved = session ?? roomAlias;
  if (!resolved) {
    throw new Error(`${componentName}: pass session= (room= is deprecated)`);
  }
  return resolved;
}

/** Shell-facing session (Approach A). */
export class LiveSession extends LiveSessionLifecycle {
  constructor(client: ConvexClient) {
    super(client);
  }

  readonly isInstructorRoom = $derived.by(() => {
    if (this.joinInfo) {
      return (
        this.joinInfo.participantRole === "instructor" ||
        this.joinInfo.participantRole === "admin"
      );
    }
    if (this.joinAccess !== null) {
      return this.joinAccess.isInstructor;
    }
    return false;
  });

  /** Class-scoped host (owner instructor or admin), not global app role. */
  readonly isClassHost = $derived(this.joinAccess?.isInstructor === true);

  readonly classTitle = $derived(
    this.joinInfo?.classTitle?.trim() || this.joinContextTitle?.trim() || "",
  );

  readonly connectionLabel = $derived(
    this.connectionState === "connected"
      ? i18n.t.live.room.connected()
      : this.connectionState === "reconnecting"
        ? i18n.t.live.room.reconnecting()
        : this.connectionState === "connecting"
          ? i18n.t.live.room.connecting()
          : i18n.t.live.room.disconnected(),
  );
  readonly formattedBitrate = $derived(
    this.streamStats.bitrateMbps === null
      ? "—"
      : `${this.streamStats.bitrateMbps.toFixed(1)} Mbps`,
  );
  readonly formattedResolution = $derived(
    this.streamStats.width && this.streamStats.height
      ? `${this.streamStats.width}×${this.streamStats.height}`
      : "—",
  );
  readonly formattedFps = $derived(
    this.streamStats.fps === null ? "—" : `${Math.round(this.streamStats.fps)} fps`,
  );
  readonly formattedPacketLoss = $derived(
    this.streamStats.packetLoss === null
      ? "—"
      : `${this.streamStats.packetLoss.toFixed(1)}%`,
  );
  readonly hasPreviewCamera = $derived(Boolean(this.previewStream?.getVideoTracks().length));
  readonly hasPreviewMic = $derived(Boolean(this.previewStream?.getAudioTracks().length));
  readonly joinExpiryLabel = $derived.by(() => {
    const seconds = this.secondsUntilExpiry;
    if (seconds === null) return null;
    if (seconds <= 120) return i18n.t.live.room.joinClosesSoon();
    const minutes = Math.ceil(seconds / 60);
    return i18n.t.live.room.joinClosesIn({ minutes });
  });
  readonly joinWaitingMessage = $derived.by(() => {
    const access = this.joinAccess;
    if (!access) return null;
    const minutes = access.minutesUntilOpen;
    if (minutes !== null) {
      return i18n.t.live.room.joinOpensIn({ minutes });
    }
    if (!access.isInstructor && access.status === "scheduled" && !access.canEnter) {
      const instructor = this.joinInfo?.instructorName?.trim();
      if (instructor) {
        return i18n.t.live.room.waitingForInstructorNamed({ instructor });
      }
      return i18n.t.live.room.waitingForBroadcastStart();
    }
    return null;
  });

  readonly joinWaitingTitle = $derived.by(() => {
    const access = this.joinAccess;
    if (
      access &&
      !access.isInstructor &&
      access.status === "scheduled" &&
      !access.canEnter &&
      access.minutesUntilOpen === null
    ) {
      return i18n.t.live.room.waitingForBroadcastTitle();
    }
    return i18n.t.live.room.joinTooEarlyTitle();
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
    this.connectionQuality === "poor" || this.connectionQuality === "lost",
  );

  /** Convex class lifecycle (distinct from WebRTC connection state). */
  readonly classBroadcastStatus = $derived(this.joinAccess?.status ?? null);

  readonly classBroadcastLabel = $derived.by(() => {
    switch (this.classBroadcastStatus) {
      case "live":
        return i18n.t.live.room.classStatusLive();
      case "scheduled":
        return i18n.t.live.room.classStatusScheduled();
      case "ended":
      case "cancelled":
        return i18n.t.live.room.classStatusEnded();
      default:
        return null;
    }
  });
  readonly statusBanner = $derived(
    this.browserOffline ? i18n.t.live.room.offlineBanner() : this.networkWarning,
  );

  toggleParticipants() {
    this.toggleSidebarTab("participants");
  }

  toggleQualityPanel() {
    this.toggleSidebarTab("info");
  }

  readonly subscribePolicy = $derived(
    buildSessionSubscribePolicy({
      isInstructorRoom: this.isInstructorRoom,
      selectedResolution: this.selectedResolution,
      joinAccess: this.joinAccess,
      instructorUserId:
        this.joinInfo?.instructorUserId ?? this.joinAccess?.instructorUserId ?? null,
    }),
  );

  readonly classHostUserId = $derived(
    this.joinInfo?.instructorUserId ??
      this.joinAccess?.instructorUserId ??
      this.joinAccess?.broadcastStartedByUserId ??
      null,
  );

  leave() {
    if (this.isInstructorRoom && this.inRoom && this.onInstructorLeaveInApp) {
      this.keepAliveAcrossNavigation = true;
      this.onInstructorLeaveInApp();
      return;
    }
    void this.requestSessionEnd();
    this.keepAliveAcrossNavigation = false;
    this.destroy();
    window.location.href = this.isInstructorRoom ? "/i/calendar" : "/u/calendar";
  }

  protected override async connectRoom(info: NonNullable<typeof this.joinInfo>) {
    const devices = {
      selectedVideoDevice: this.selectedVideoDevice,
      selectedAudioDevice: this.selectedAudioDevice,
    };
    let roomEntered = false;

    const enterRoomShell = (room: NonNullable<typeof this._room>) => {
      if (roomEntered) return;
      roomEntered = true;
      this._room = room;
      this.inRoom = true;
      this.joiningLive = false;
      this.needsManualReconnect = false;
      this.status = "ready";

      if (info.liveClassType === "group_live" && !this.isInstructorRoom) {
        this.openChat();
      }
      if (this.isInstructorRoom) {
        this.publishMicOnNextJoin = true;
      }

      void this.attachConnectedRoomListeners(room).then(() => {
        this.registerChatHandler(room);
        this.updateConnectionQualityFromRoom();
        this.applySubscribePolicyToRoom();
        this.startStatsTimer();
        this.startTokenRefreshTimer();
        void this.acquireWakeLock();
      });
      void this.refreshInRoomDevices().then(() => this.syncLocalMediaFromRoom());
    };

    try {
      const result = await connectLiveSessionRoom({
        joinInfo: info,
        previousRoom: this.liveKitRoom,
        devices,
        capture: this.sessionCaptureOptions(),
        publish: {
          publishCamera: this.publishCameraOnNextJoin,
          publishMic: this.publishMicOnNextJoin,
        },
        subscribe: this.subscribePolicy,
        skipPrepareConnection: this.joinPrepareWsUrl === info.wsUrl,
        handlers: {
          onConnectionState: (state) => {
            this.connectionState = state;
            if (state === "reconnecting") {
              this.needsManualReconnect = false;
            }
            if (state === "connected") {
              this.needsManualReconnect = false;
              this.networkWarning = "";
            }
          },
          onDisconnected: (reason) => {
            this.handleDisconnected(reason);
          },
          onReconnected: () => {
            this.connectionState = "connected";
            this.needsManualReconnect = false;
            this.networkWarning = "";
            void this.refreshConnectionHealth();
            void this.restoreInstructorMicIfNeeded();
            this.applySubscribePolicyToRoom();
            this.startTokenRefreshTimer();
            void this.acquireWakeLock();
          },
          onRoomReady: (room) => {
            enterRoomShell(room);
            this.syncLocalMediaFromRoom();
          },
        },
      });

      if (!roomEntered) {
        enterRoomShell(result.room);
      }
      this.selectedVideoDevice = devices.selectedVideoDevice;
      this.selectedAudioDevice = devices.selectedAudioDevice;
      this.cameraEnabled = result.cameraEnabled;
      this.micEnabled = result.micEnabled;
      this.mediaError = result.mediaError;
      if (!this.cameraEnabled && isCameraNotFoundMediaError(this.mediaError)) {
        this.mediaError = "";
      }
      this.syncLocalMediaFromRoom();
      this.joinPrepareWsUrl = info.wsUrl;
    } catch (reason) {
      this.connectionState = "disconnected";
      this.inRoom = false;
      this.joiningLive = false;
      await teardownLiveSessionRoom(this.liveKitRoom);
      this._room = null;
      throw reason;
    }
  }

  private async attachConnectedRoomListeners(
    connectedRoom: NonNullable<typeof this.liveKitRoom>,
  ) {
    const { RoomEvent } = await import("livekit-client");
    const syncMedia = () => this.syncLocalMediaFromRoom();

    connectedRoom
      .on(RoomEvent.ConnectionQualityChanged, () => {
        this.updateConnectionQualityFromRoom();
      })
      .on(RoomEvent.LocalTrackPublished, syncMedia)
      .on(RoomEvent.LocalTrackUnpublished, syncMedia)
      .on(RoomEvent.TrackMuted, syncMedia)
      .on(RoomEvent.TrackUnmuted, syncMedia);
  }

  private sessionCaptureOptions(): SessionCaptureOptions {
    return {
      cameraCaptureOptions: (isInstructor) => this.cameraCaptureOptions(isInstructor),
      microphoneCaptureOptions: () => this.microphoneCaptureOptions(),
      resolutionDimensions: (isInstructor) => this.resolutionDimensions(isInstructor),
      publishProfile: (isInstructor, VideoPreset, AudioPresets) =>
        this.publishProfile(isInstructor, VideoPreset, AudioPresets),
      publishProfileInput: (isInstructor) => this.publishProfileInput(isInstructor),
    };
  }

  private registerChatHandler(connectedRoom: NonNullable<typeof this.liveKitRoom>) {
    connectedRoom.registerTextStreamHandler(
      "homebody.chat",
      (
        reader: { info?: { id?: string; timestamp?: number }; readAll: () => Promise<string> },
        participantInfo: { identity: string },
      ) => {
        void (async () => {
          const text = await reader.readAll();
          const isLocal =
            participantInfo.identity === connectedRoom.localParticipant.identity;
          if (
            isLocal &&
            this.chatMessages.some(
              (message) => message.isLocal && message.text === text && Date.now() - message.createdAt < 5000,
            )
          ) {
            return;
          }
          const participant = isLocal
            ? connectedRoom.localParticipant
            : connectedRoom.remoteParticipants.get(participantInfo.identity);
          const next = [
            ...this.chatMessages,
            {
              id: reader.info?.id ?? `${participantInfo.identity}:${Date.now()}`,
              identity: participantInfo.identity,
              name: participant?.name || participantInfo.identity,
              text,
              createdAt: reader.info?.timestamp ?? Date.now(),
              isLocal,
            },
          ];
          this.chatMessages = next.length > 200 ? next.slice(-200) : next;
          if (this.sidebarTab !== "chat") this.unreadChatCount += 1;
        })();
      },
    );
  }
}

export function createLiveSession(client: ConvexClient): LiveSession {
  return new LiveSession(client);
}
