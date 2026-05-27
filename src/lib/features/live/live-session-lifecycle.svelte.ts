import { tick } from "svelte";
import { api } from "$convex/_generated/api";
import type { Room } from "livekit-client";
import { sanitizeMediaDeviceId } from "$lib/media/device-id";
import { disconnectMessage, i18n, LK_DISCONNECT } from "./live-room-shared";
import { fetchJoinAccessSnapshot, issueJoinCredentials } from "./join-token";
import {
  prepareJoinConnection as warmJoinConnection,
  teardownLiveSessionRoom,
} from "./live-session-connect";
import { LiveSessionMedia } from "./live-session-media.svelte";
import { tryGetLiveDockContext } from "./dock/live-dock.svelte";
import type { ConnectionState } from "./types";

/** Token lifecycle, session connect sync, timers, and browser stability. */
export class LiveSessionLifecycle extends LiveSessionMedia {
  connectionState = $state<ConnectionState>("idle");
  inRoom = $state(false);
  needsManualReconnect = $state(false);
  browserOffline = $state(false);
  /** Reference `simple.tsx` `connect` flag — drives sequential start/end. */
  sessionConnect = $state(false);
  /** True from join click until connected — keeps one entry screen (no full-page loader). */
  joiningLive = $state(false);
  private sessionSyncInFlight = false;

  protected _room: Room | null = null;

  get liveKitRoom() {
    return this._room;
  }
  private wakeLockSentinel: WakeLockSentinel | null = null;
  private browserHandlersBound = false;
  private onOnlineHandler: (() => void) | null = null;
  private onOfflineHandler: (() => void) | null = null;
  private onVisibilityHandler: (() => void) | null = null;
  private onPageHideHandler: ((event: PageTransitionEvent) => void) | null = null;

  /** When true, in-app navigation keeps the LiveKit room connected (instructor PiP). */
  keepAliveAcrossNavigation = false;
  private expiryTimer: number | null = null;
  private clockTimer: number | null = null;
  private tokenRefreshTimer: number | null = null;
  private nowMs = $state(Date.now());

  checkJoinExpiryWarning() {
    if (this.joinExpiryWarned || !this.inRoom || this.isInstructorRoom) return;
    const seconds = this.secondsUntilExpiry;
    if (seconds === null || seconds > 120 || seconds <= 0) return;
    this.joinExpiryWarned = true;
    this.showJoinExpiryModal = true;
  }

  handleClassEnded() {
    void this.confirmClassEndedAndApplyOverlay();
  }

  private applySessionEnded(message: string) {
    if (this.sessionEndedByHost) return;
    this.sessionEndedByHost = true;
    this.needsManualReconnect = false;
    this.showJoinExpiryModal = false;
    this.mediaError = message;
    this.inRoom = false;
    this.stopStatsTimer();
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    this._room?.disconnect();
    this._room = null;
  }

  private async fetchJoinAccessSnapshot() {
    const liveClassId = this.getClassId();
    if (liveClassId === null) return null;
    try {
      return await this.client.query(api.live.class.getJoinAccess, {
        liveClassId,
        now: Date.now(),
      });
    } catch (reason) {
      console.warn("[LiveKit] Join access snapshot failed:", reason);
      return null;
    }
  }

  private async confirmClassEndedAndApplyOverlay() {
    if (this.sessionEndedByHost) return;
    const access = await this.fetchJoinAccessSnapshot();
    if (
      access !== null &&
      access.status !== "ended" &&
      access.status !== "cancelled"
    ) {
      return;
    }
    this.applySessionEnded(i18n.t.live.room.disconnectRoomEnded());
  }

  protected handleDisconnected(reason: number | undefined) {
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    if (this.isInstructorRoom) {
      this.instructorMicBeforeDrop = true;
    } else if (this.micEnabled) {
      this.instructorMicBeforeDrop = true;
    }
    if (
      this.sessionConnect &&
      reason !== LK_DISCONNECT.DUPLICATE_IDENTITY &&
      !this.keepAliveAcrossNavigation
    ) {
      this.sessionConnect = false;
    }
    void this.resolveDisconnectOutcome(reason);
  }

  private async resolveDisconnectOutcome(reason: number | undefined) {
    const reasonMessage = disconnectMessage(reason);

    if (reason === LK_DISCONNECT.DUPLICATE_IDENTITY) {
      this.mediaError = reasonMessage ?? "";
      this.needsManualReconnect = false;
      this.inRoom = false;
      return;
    }

    const verifyWithConvex =
      reason === LK_DISCONNECT.PARTICIPANT_REMOVED ||
      reason === LK_DISCONNECT.ROOM_DELETED ||
      reason === LK_DISCONNECT.ROOM_CLOSED;

    if (verifyWithConvex) {
      const access = await this.fetchJoinAccessSnapshot();
      if (access?.status === "ended" || access?.status === "cancelled") {
        this.applySessionEnded(i18n.t.live.room.disconnectRoomEnded());
        return;
      }
      if (access?.canEnter && this.inRoom) {
        this.connectionState = "disconnected";
        this.needsManualReconnect = true;
        this.mediaError =
          reason === LK_DISCONNECT.PARTICIPANT_REMOVED
            ? i18n.t.live.room.disconnectRemoved()
            : i18n.t.live.room.reconnectBody();
        return;
      }
    }

    if (reasonMessage) {
      this.mediaError = reasonMessage;
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
    await warmJoinConnection(this.joinInfo);
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
    this.onPageHideHandler = (event: PageTransitionEvent) => {
      // disconnectOnPageLeave is false — explicitly leave the room on tab close/navigation
      // so LiveKit does not keep ghost participants. Skip bfcache restores (persisted).
      if (event.persisted || this._room === null) return;
      if (this.keepAliveAcrossNavigation) return;
      if (!this.inRoom) return;
      void this._room.disconnect();
      this.inRoom = false;
      this.connectionState = "disconnected";
    };

    window.addEventListener("online", this.onOnlineHandler);
    window.addEventListener("offline", this.onOfflineHandler);
    document.addEventListener("visibilitychange", this.onVisibilityHandler);
    window.addEventListener("pagehide", this.onPageHideHandler);
  }

  disposeBrowserStabilityHandlers() {
    if (!this.browserHandlersBound || typeof window === "undefined") return;
    if (this.onOnlineHandler) window.removeEventListener("online", this.onOnlineHandler);
    if (this.onOfflineHandler) window.removeEventListener("offline", this.onOfflineHandler);
    if (this.onVisibilityHandler) {
      document.removeEventListener("visibilitychange", this.onVisibilityHandler);
    }
    if (this.onPageHideHandler) {
      window.removeEventListener("pagehide", this.onPageHideHandler);
    }
    this.onOnlineHandler = null;
    this.onOfflineHandler = null;
    this.onVisibilityHandler = null;
    this.onPageHideHandler = null;
    this.browserHandlersBound = false;
  }

  private startExpiryTimer(expiresAt: number) {
    this.stopExpiryTimer();
    this.joinExpiryWarned = false;
    this.nowMs = Date.now();
    this.scheduleJoinExpiryClock(expiresAt);
    this.expiryTimer = window.setTimeout(
      () => this.expireLocalRoom(),
      Math.max(0, expiresAt - Date.now()),
    );
  }

  private scheduleJoinExpiryClock(expiresAt: number) {
    if (this.clockTimer !== null) {
      window.clearTimeout(this.clockTimer);
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }

    const tick = () => {
      this.nowMs = Date.now();
      this.checkJoinExpiryWarning();
      const remainingMs = expiresAt - Date.now();
      const remainingSec = Math.floor(remainingMs / 1000);
      if (remainingSec <= 0) return;

      if (remainingSec > 120) {
        const delayMs = Math.min(remainingMs - 120_000, 60_000);
        this.clockTimer = window.setTimeout(tick, delayMs);
        return;
      }

      this.clockTimer = window.setInterval(() => {
        this.nowMs = Date.now();
        this.checkJoinExpiryWarning();
      }, 1000);
    };

    tick();
  }

  private stopExpiryTimer() {
    if (this.expiryTimer !== null) window.clearTimeout(this.expiryTimer);
    if (this.clockTimer !== null) {
      window.clearTimeout(this.clockTimer);
      window.clearInterval(this.clockTimer);
    }
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
    this._room?.disconnect();
    this._room = null;
  }

  private stopTokenRefreshTimer() {
    if (this.tokenRefreshTimer !== null) window.clearTimeout(this.tokenRefreshTimer);
    this.tokenRefreshTimer = null;
  }

  protected startTokenRefreshTimer() {
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
      const joinInfo = await issueJoinCredentials(this.client, liveClassId);
      this.joinInfo = joinInfo;
      const lkRoom = this._room;
      if (lkRoom) {
        const { ConnectionState } = await import("livekit-client");
        if (
          lkRoom.state === ConnectionState.Connected ||
          lkRoom.state === ConnectionState.Reconnecting
        ) {
          await lkRoom.connect(joinInfo.wsUrl, joinInfo.token);
        }
      }
      this.startExpiryTimer(joinInfo.joinClosesAt);
      this.startTokenRefreshTimer();
    } catch (reason) {
      console.warn("[LiveKit] Token refresh failed:", reason);
    }
  }

  async ensureJoinCredentials(): Promise<boolean> {
    if (this.joinInfo) return true;
    const liveClassId = this.getClassId();
    if (liveClassId === null) return false;
    try {
      this.joinInfo = await issueJoinCredentials(this.client, liveClassId);
      this.startExpiryTimer(this.joinInfo.joinClosesAt);
      this.startTokenRefreshTimer();
      return true;
    } catch (reason) {
      console.error("[LiveKit] issueJoin failed:", reason);
      this.error = reason instanceof Error ? reason.message : i18n.t.live.room.tokenError();
      this.status = "error";
      return false;
    }
  }

  async reconnect() {
    if (this.joinInfo && Date.now() >= this.joinInfo.joinClosesAt) return;
    this.error = "";
    this.mediaError = "";
    this.needsManualReconnect = false;
    this.networkWarning = "";
    try {
      if (!(await this.ensureJoinCredentials())) return;
      await this.prepareJoinConnection();
      this.sessionConnect = true;
      await this.syncSessionConnect();
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
    const dock = tryGetLiveDockContext();
    if (dock) {
      dock.finishSession();
    } else {
      this.destroy();
    }
    window.location.assign(isInstructor ? "/i/calendar" : "/u/calendar");
  }

  applyPreJoinChoices(choices: {
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId: string;
    audioDeviceId: string;
  }) {
    this.wantsCameraOnJoin = choices.videoEnabled;
    this.wantsMicOnJoin = choices.audioEnabled;
    this.selectedVideoDevice = sanitizeMediaDeviceId(choices.videoDeviceId) ?? "";
    this.selectedAudioDevice = sanitizeMediaDeviceId(choices.audioDeviceId) ?? "";
  }

  /** Release preview tracks before LiveKit claims devices (stay on entry screen). */
  protected async releasePreConnectMedia() {
    this.joiningLive = true;
    this.stopPreview();
    await tick();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const isFirefox =
      typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
    if (isFirefox) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  async enterFromPreJoin(
    choices: {
      videoEnabled: boolean;
      audioEnabled: boolean;
      videoDeviceId: string;
      audioDeviceId: string;
    },
    options: { isPrep: boolean },
  ) {
    this.applyPreJoinChoices(choices);
    if (options.isPrep) {
      await this.startLiveAndConnect(choices.videoEnabled || choices.audioEnabled);
    } else {
      await this.requestSessionStart(choices.videoEnabled || choices.audioEnabled);
    }
  }

  async enterWithoutDevicesFromPreJoin(options: { isPrep: boolean }) {
    this.wantsCameraOnJoin = false;
    this.wantsMicOnJoin = false;
    if (options.isPrep) {
      await this.startLiveAndConnect(false);
    } else {
      await this.requestSessionStart(false);
    }
  }

  async startLiveAndConnect(publishAvailableDevices = true) {
    const liveClassId = this.getClassId();
    if (liveClassId === null) return;
    this.status = "checking";
    this.error = "";
    try {
      await this.client.mutation(api.live.class.start, { liveClassId });
      if (await this.ensureJoinCredentials()) {
        await this.requestSessionStart(publishAvailableDevices);
      }
    } catch (reason) {
      console.error("[LiveKit] Start live failed:", reason);
      this.error = reason instanceof Error ? reason.message : i18n.t.live.room.startLiveError();
      this.status = "error";
    }
  }

  async endLive(onFinished?: () => void) {
    const liveClassId = this.getClassId();
    if (liveClassId === null) return;
    try {
      await this.client.mutation(api.live.class.end, { liveClassId });
      this.keepAliveAcrossNavigation = false;
      this.pinnedClassId = null;
      if (onFinished) {
        onFinished();
      } else {
        this.destroy();
        window.location.assign("/i/calendar");
      }
    } catch (reason) {
      console.error("[LiveKit] End live failed:", reason);
      this.mediaError = reason instanceof Error ? reason.message : i18n.t.live.room.endLiveError();
    }
  }

  applyJoinTokenSnapshot(
    snapshot: Awaited<ReturnType<typeof fetchJoinAccessSnapshot>> & {
      joinInfo?: import("./join-token").JoinInfo | null;
    },
  ) {
    this.joinTokenPhase = snapshot.phase;
    if (snapshot.phase === "loading") {
      this.status = "checking";
      return;
    }
    this.status = snapshot.status;
    this.error = snapshot.error;
    this.joinAccess = snapshot.joinAccess;
    this.joinContextTitle = snapshot.classTitle;
    if (snapshot.joinInfo) {
      this.joinInfo = snapshot.joinInfo;
      this.startExpiryTimer(snapshot.joinInfo.joinClosesAt);
      void this.prepareJoinConnection();
    }
  }

  async loadToken() {
    if (this.refetchJoinToken) {
      await this.refetchJoinToken();
      return;
    }
    await this.loadTokenDirect();
  }

  /** Internal fallback when shell has not wired {@link refetchJoinToken}. */
  async loadTokenDirect() {
    this.joinTokenPhase = "loading";
    this.status = "checking";
    this.error = "";
    this.mediaError = "";

    const rawClassId = new URLSearchParams(window.location.search).get("classId");
    const snapshot = await fetchJoinAccessSnapshot({
      client: this.client,
      isAuthenticated: this.auth.isAuthenticated,
      authError: this.auth.error,
      classIdFromUrl: rawClassId,
      now: Date.now(),
    });

    if (snapshot.phase === "error" && snapshot.status === "error") {
      console.error("[LiveKit] Token fetch failed:", snapshot.error);
    }

    this.applyJoinTokenSnapshot(snapshot);
  }

  /**
   * Reference `useEffect([connect])`: end session before a new connect.
   */
  async syncSessionConnect() {
    if (this.sessionSyncInFlight) return;
    this.sessionSyncInFlight = true;
    try {
      if (!this.sessionConnect) {
        if (this.keepAliveAcrossNavigation && this._room !== null) {
          return;
        }
        if (this.inRoom || this._room !== null) {
          this.inRoom = false;
          this.connectionState = "idle";
          await this.teardownActiveRoom();
        }
        return;
      }

      if (!this.joinInfo || this.inRoom) return;

      const isFirefox =
        typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
      if (isFirefox) {
        await new Promise((r) => setTimeout(r, 500));
      }

      await this.connectRoom(this.joinInfo);
    } catch (reason) {
      console.error("[LiveKit] Session connect failed:", reason);
      this.connectionState = "disconnected";
      this.sessionConnect = false;
      this.joiningLive = false;
      this.mediaError =
        reason instanceof Error ? reason.message : i18n.t.live.room.reconnectBody();
    } finally {
      this.sessionSyncInFlight = false;
    }
  }

  async requestSessionStart(publishAvailableDevices = true) {
    this.publishCameraOnNextJoin = publishAvailableDevices && this.wantsCameraOnJoin;
    this.publishMicOnNextJoin =
      this.isInstructorRoom || (publishAvailableDevices && this.wantsMicOnJoin);
    this.mediaError = "";
    if (!(await this.ensureJoinCredentials())) return;
    await this.releasePreConnectMedia();
    this.sessionConnect = true;
    await this.syncSessionConnect();
  }

  async requestSessionEnd() {
    this.sessionConnect = false;
    await this.syncSessionConnect();
  }

  private async teardownActiveRoom() {
    const previous = this._room;
    this._room = null;
    await teardownLiveSessionRoom(previous);
  }

  destroy() {
    this.sessionConnect = false;
    this.joiningLive = false;
    this.stopMediaSession();
    this.stopExpiryTimer();
    this.stopTokenRefreshTimer();
    this.releaseWakeLock();
    this.disposeBrowserStabilityHandlers();
    this.inRoom = false;
    this.needsManualReconnect = false;
    this.resetUiSession();
    this.browserOffline = false;
    this.connectionQuality = "unknown";
    this.joinTokenPhase = "idle";
    void this.teardownActiveRoom();
  }

  /** Used by join expiry labels in {@link LiveSession}. */
  get expiresAt() {
    return this.joinInfo?.joinClosesAt ?? null;
  }

  get secondsUntilExpiry() {
    return this.expiresAt === null ? null : Math.max(0, Math.floor((this.expiresAt - this.nowMs) / 1000));
  }
}
