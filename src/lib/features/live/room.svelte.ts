/**
 * Live room façade — thin orchestration layer over focused modules.
 *
 * Module map:
 * - live-room-core.svelte.ts — auth, join metadata, status, errors
 * - live-room-ui.svelte.ts — panels, chat, modals
 * - livekit-media.ts — preview, devices, tiles, publish, toggles, stats
 * - livekit-connection.ts — LiveKit connect/disconnect, token, timers
 * - live-room-shared.ts — disconnect codes, participant/track helpers, i18n
 */
import type { ConvexClient } from "convex/browser";
import { getCachedRole } from "$lib/auth/session.svelte";
import { useI18n } from "$lib/i18n/runes.svelte";
import { LiveRoomConnection } from "./livekit-connection.svelte";
import type { MediaTile } from "./types";

const i18n = useI18n();

export class LiveRoom extends LiveRoomConnection {
  constructor(client: ConvexClient) {
    super(client);
  }

  readonly isInstructorRoom = $derived.by(() => {
    if (this.joinInfo) {
      return this.joinInfo.participantRole === "instructor" || this.joinInfo.participantRole === "admin";
    }
    const role = getCachedRole();
    return role === "instructor" || role === "admin";
  });

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
    const minutes = this.joinAccess?.minutesUntilOpen;
    if (minutes === null || minutes === undefined) return null;
    return i18n.t.live.room.joinOpensIn({ minutes });
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
  readonly statusBanner = $derived(
    this.browserOffline ? i18n.t.live.room.offlineBanner() : this.networkWarning,
  );
}
