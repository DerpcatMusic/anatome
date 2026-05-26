import { api } from "$convex/_generated/api";
import { getCachedRole } from "$lib/auth/session.svelte";
import type { Room } from "livekit-client";
import {
  disconnectMessage,
  getMediaErrorMessage,
  i18n,
  isEquipmentJoinError,
  participantIdentity,
  trackSource,
} from "./live-room-shared";
import { hasLiveClassIdParam, parseLiveClassId } from "$lib/convex/ids";
import { assertIssueJoinMatchesClass } from "$lib/live/join-guard";
import { LiveRoomMedia } from "./livekit-media.svelte";
import type { ConnectionState } from "./types";

/** LiveKit Room connect/disconnect, token lifecycle, timers, and browser stability. */
export class LiveRoomConnection extends LiveRoomMedia {
  connectionState = $state<ConnectionState>("idle");
  inRoom = $state(false);
  needsManualReconnect = $state(false);
  browserOffline = $state(false);

  protected _room: Room | null = null;

  get liveKitRoom() {
    return this._room;
  }
  private wakeLockSentinel: WakeLockSentinel | null = null;
  private browserHandlersBound = false;
  private onOnlineHandler: (() => void) | null = null;
  private onOfflineHandler: (() => void) | null = null;
  private onVisibilityHandler: (() => void) | null = null;
  private expiryTimer: number | null = null;
  private clockTimer: number | null = null;
  private tokenRefreshTimer: number | null = null;
  private nowMs = $state(Date.now());
  private waitingPollTimer: number | null = null;

  checkJoinExpiryWarning() {
    if (this.joinExpiryWarned || !this.inRoom || this.isInstructorRoom) return;
    const seconds = this.secondsUntilExpiry;
    if (seconds === null || seconds > 120 || seconds <= 0) return;
    this.joinExpiryWarned = true;
    this.showJoinExpiryModal = true;
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

  private handleDisconnected(reason: number | undefined) {
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    if (this.isInstructorRoom) {
      this.instructorMicBeforeDrop = true;
    } else if (this.micEnabled) {
      this.instructorMicBeforeDrop = true;
    }

    const reasonMessage = disconnectMessage(reason);
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
      assertIssueJoinMatchesClass(liveClassId, joinInfo);
      this.joinInfo = joinInfo;
      this.startExpiryTimer(joinInfo.joinClosesAt);
      this.startTokenRefreshTimer();
    } catch (reason) {
      console.warn("[LiveKit] Token refresh failed:", reason);
    }
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
    } catch (reason) {
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

  async loadToken() {
    if (!this.auth.isAuthenticated) {
      this.status = "locked";
      return;
    }
    const rawClassId = new URLSearchParams(window.location.search).get("classId");
    if (hasLiveClassIdParam(rawClassId) && parseLiveClassId(rawClassId) === null) {
      this.status = "invalidClass";
      this.error = "";
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
      const access = await this.client.query(api.live.class.getJoinAccess, { liveClassId });
      if (access === null) {
        this.status = "missing";
        return;
      }
      this.joinAccess = access;

      if (access.equipmentBlocked) {
        this.error = "";
        this.status = "equipment";
        return;
      }

      if (!access.canEnter) {
        if (access.minutesUntilOpen !== null) {
          this.stopWaitingPoll();
          this.status = "waiting";
          this.startWaitingPoll();
          return;
        }
        this.error =
          access.status === "ended" || access.status === "cancelled"
            ? i18n.t.live.room.disconnectRoomEnded()
            : i18n.t.live.room.joinTooEarlyBody();
        this.status = "error";
        return;
      }

      this.stopWaitingPoll();
      const joinInfo = await this.client.action(api.livekit.token.issueJoin, { liveClassId });
      assertIssueJoinMatchesClass(liveClassId, joinInfo);
      this.joinInfo = joinInfo;
      this.startExpiryTimer(joinInfo.joinClosesAt);
      if (access.isInstructor && access.status === "scheduled") {
        this.status = "prep";
      } else {
        this.status = "ready";
      }
      void this.prepareJoinConnection();
    } catch (reason) {
      console.error("[LiveKit] Token fetch failed:", reason);
      if (!this.auth.isAuthenticated) {
        this.status = "locked";
        return;
      }
      const message = reason instanceof Error ? reason.message : String(reason);
      if (
        message.includes("ההצטרפות תיפתח") ||
        message.includes("מחוץ לחלון") ||
        message.includes("join window")
      ) {
        this.status = "waiting";
        this.startWaitingPoll();
        return;
      }
      if (message.includes("Class is not live") || message.includes("השיעור אינו חי")) {
        const role = getCachedRole();
        if (role === "instructor" || role === "admin") {
          this.status = "prep";
          return;
        }
      }
      if (isEquipmentJoinError(message)) {
        this.error = "";
        this.status = "equipment";
        return;
      }
      this.error = this.auth.error || message || i18n.t.live.room.tokenError();
      this.status = "error";
    }
  }

  private startWaitingPoll() {
    if (this.waitingPollTimer !== null) return;
    this.waitingPollTimer = window.setInterval(() => {
      void this.refreshJoinAccess();
    }, 30_000);
  }

  private stopWaitingPoll() {
    if (this.waitingPollTimer !== null) {
      window.clearInterval(this.waitingPollTimer);
      this.waitingPollTimer = null;
    }
  }

  private async refreshJoinAccess() {
    const liveClassId = this.getClassId();
    if (liveClassId === null || this.status !== "waiting") return;
    try {
      const access = await this.client.query(api.live.class.getJoinAccess, { liveClassId });
      if (access === null) {
        this.status = "missing";
        this.stopWaitingPoll();
        return;
      }
      this.joinAccess = access;
      if (access.equipmentBlocked) {
        this.stopWaitingPoll();
        this.error = "";
        this.status = "equipment";
        return;
      }
      if (access.canEnter) {
        this.stopWaitingPoll();
        await this.loadToken();
      }
    } catch (reason) {
      console.warn("[LiveKit] Join access refresh failed:", reason);
    }
  }

  protected attachParticipantListeners(participant: unknown) {
    const value = participant as {
      trackPublications?: Map<string, unknown>;
    };
    value.trackPublications?.forEach((publication) => {
      this.subscribeIfAllowed(publication, participant);
      const track = (publication as { track?: unknown }).track;
      if (track) this.addTrackTile(track, publication, participant, "remote");
    });
  }

  protected override async connectRoom(info: NonNullable<typeof this.joinInfo>) {
    this.connectionState = "connecting";
    try {
      const {
        Room,
        RoomEvent,
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
          void this.refreshConnectionHealth();
          void this.restoreInstructorMicIfNeeded();
        })
        .on(RoomEvent.Disconnected, (reason?: number) => {
          this.handleDisconnected(reason);
        })
        .on(RoomEvent.ParticipantConnected, (participant: unknown) => {
          this.attachParticipantListeners(participant);
        })
        .on(RoomEvent.ParticipantDisconnected, (participant: unknown) => {
          this.removeTiles(
            (tile) => tile.identity === participantIdentity(participant)
          );
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
          const source = trackSource(publication);
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
          this.mediaError = getMediaErrorMessage("camera", cameraReason);
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
          this.mediaError = [this.mediaError, getMediaErrorMessage("microphone", micReason)]
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
          this.mediaError = getMediaErrorMessage("microphone", micReason);
        }
      }
      this.connectionState = "connected";
      this.updateConnectionQualityFromRoom();
      this.startStatsTimer();
      this.startTokenRefreshTimer();
      lkRoom.remoteParticipants.forEach((participant) =>
        this.attachParticipantListeners(participant)
      );
    } catch (reason) {
      this.connectionState = "disconnected";
      this.inRoom = false;
      throw reason;
    }
  }

  destroy() {
    this.stopMediaSession();
    this.stopExpiryTimer();
    this.stopWaitingPoll();
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    this.disposeBrowserStabilityHandlers();
    this.inRoom = false;
    this.needsManualReconnect = false;
    this.resetUiSession();
    this.browserOffline = false;
    this.connectionQuality = "unknown";
    this._room?.unregisterTextStreamHandler("homebody.chat");
    this._room?.disconnect();
    this._room = null;
  }

  /** Used by derived expiry labels in {@link LiveRoom}. */
  get expiresAt() {
    return this.joinInfo?.joinClosesAt ?? null;
  }

  get secondsUntilExpiry() {
    return this.expiresAt === null ? null : Math.max(0, Math.floor((this.expiresAt - this.nowMs) / 1000));
  }
}
