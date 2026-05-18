<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "../../../convex/_generated/api";
  import type { Id } from "../../../convex/_generated/dataModel";
  import { initAuth } from "../../lib/auth/session.svelte";
  import { convex } from "../../lib/convex/client";
  import Notice from "../ui/Notice.svelte";
  import type { Room } from "livekit-client";

  type ParticipantRole = "instructor" | "customer";
  type RoomStatus = "checking" | "locked" | "missing" | "ready" | "error";
  type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
  type MediaSource = "camera" | "microphone" | "screen_share" | "screen_share_audio" | "unknown";
  type MediaTile = {
    id: string;
    identity: string;
    name: string;
    element: HTMLElement;
    kind: "audio" | "video";
    source: MediaSource;
    isLocal: boolean;
    isInstructor: boolean;
  };
  type ParticipantItem = {
    identity: string;
    name: string;
    isInstructor: boolean;
    isLocal: boolean;
    isSpeaking: boolean;
  };
  type StreamStats = {
    bitrateMbps: number | null;
    packetLoss: number | null;
    width: number | null;
    height: number | null;
    fps: number | null;
    videoTracks: number;
    audioTracks: number;
  };

  const auth = initAuth();

  let status = $state<RoomStatus>("checking");
  let connectionState = $state<ConnectionState>("idle");
  let error = $state("");
  let mediaError = $state("");
  let joinInfo = $state<{
    wsUrl: string;
    token: string;
    roomName: string;
    participantRole: ParticipantRole;
  } | null>(null);
  let room: Room | null = null;
  let mediaTiles = $state<MediaTile[]>([]);
  let participants = $state<ParticipantItem[]>([]);
  let micEnabled = $state(false);
  let cameraEnabled = $state(false);
  let screenShareEnabled = $state(false);
  let pendingControl = $state<"mic" | "camera" | "screen" | null>(null);
  let navbarBlockSize = $state(0);
  let navbarObserver: ResizeObserver | null = null;
  let streamStats = $state<StreamStats>({
    bitrateMbps: null,
    packetLoss: null,
    width: null,
    height: null,
    fps: null,
    videoTracks: 0,
    audioTracks: 0,
  });
  let statsTimer: number | null = null;
  const previousStats = new Map<string, { timestamp: number; bytes: number }>();

  const isInstructorRoom = $derived(joinInfo?.participantRole === "instructor");
  const videoTiles = $derived(mediaTiles.filter((tile) => tile.kind === "video"));
  const audioTiles = $derived(mediaTiles.filter((tile) => tile.kind === "audio"));
  const instructorVideos = $derived(videoTiles.filter((tile) => tile.isInstructor).sort(tileSort));
  const studentVideos = $derived(videoTiles.filter((tile) => !tile.isInstructor).sort(tileSort));
  const screenShareVideo = $derived(videoTiles.find((tile) => tile.source === "screen_share") ?? null);
  const primaryInstructorVideo = $derived(screenShareVideo ?? instructorVideos.find((tile) => !tile.isLocal) ?? instructorVideos[0] ?? null);
  const selfVideo = $derived(videoTiles.find((tile) => tile.isLocal && tile.source !== "screen_share") ?? null);
  const studentParticipants = $derived(participants.filter((participant) => !participant.isInstructor));
  const connectionLabel = $derived(connectionState === "connected" ? "מחובר" : connectionState === "reconnecting" ? "מתחבר מחדש" : connectionState === "connecting" ? "מתחבר" : "מנותק");
  const formattedBitrate = $derived(streamStats.bitrateMbps === null ? "—" : `${streamStats.bitrateMbps.toFixed(1)} Mbps`);
  const formattedResolution = $derived(streamStats.width && streamStats.height ? `${streamStats.width}×${streamStats.height}` : "—");
  const formattedFps = $derived(streamStats.fps === null ? "—" : `${Math.round(streamStats.fps)} fps`);
  const formattedPacketLoss = $derived(streamStats.packetLoss === null ? "—" : `${streamStats.packetLoss.toFixed(1)}%`);

  function getClassId() {
    const classId = new URLSearchParams(window.location.search).get("classId");
    return classId as Id<"liveClasses"> | null;
  }

  function isInstructorIdentity(identity: string) {
    return identity.startsWith("instructor_");
  }

  function participantName(participant: unknown) {
    const value = participant as { name?: string; identity?: string };
    return value.name || value.identity || "HomeBody";
  }

  function participantIdentity(participant: unknown) {
    return (participant as { identity?: string }).identity ?? "unknown";
  }

  function participantIsLocal(participant: unknown) {
    return Boolean((participant as { isLocal?: boolean }).isLocal);
  }

  function publicationId(publication: unknown, track: unknown, fallback: string) {
    const pub = publication as { trackSid?: string; sid?: string };
    const value = track as { sid?: string; mediaStreamTrack?: { id?: string } };
    return pub.trackSid ?? pub.sid ?? value.sid ?? value.mediaStreamTrack?.id ?? fallback;
  }

  function trackSource(publication: unknown): MediaSource {
    const source = String((publication as { source?: string }).source ?? "unknown");
    if (source === "camera" || source === "microphone" || source === "screen_share" || source === "screen_share_audio") return source;
    return "unknown";
  }

  function tileSort(a: MediaTile, b: MediaTile) {
    if (a.source === "screen_share" && b.source !== "screen_share") return -1;
    if (a.source !== "screen_share" && b.source === "screen_share") return 1;
    if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
    return a.name.localeCompare(b.name);
  }

  function refreshParticipants() {
    if (room === null) return;
    const local = room.localParticipant;
    const next: ParticipantItem[] = [
      {
        identity: local.identity,
        name: local.name || local.identity,
        isInstructor: isInstructorIdentity(local.identity),
        isLocal: true,
        isSpeaking: Boolean(local.isSpeaking),
      },
    ];

    room.remoteParticipants.forEach((participant) => {
      const value = participant as { identity: string; name?: string; isSpeaking?: boolean };
      next.push({
        identity: value.identity,
        name: value.name || value.identity,
        isInstructor: isInstructorIdentity(value.identity),
        isLocal: false,
        isSpeaking: Boolean(value.isSpeaking),
      });
    });

    participants = next.sort((a, b) => Number(b.isInstructor) - Number(a.isInstructor) || a.name.localeCompare(b.name));
  }

  function mountMedia(node: HTMLElement, element: HTMLElement) {
    node.replaceChildren(element);
    return {
      destroy() {
        element.remove();
      },
    };
  }

  function upsertTile(tile: MediaTile) {
    const existing = mediaTiles.find((item) => item.id === tile.id);
    if (existing) existing.element.remove();
    mediaTiles = [...mediaTiles.filter((item) => item.id !== tile.id), tile];
  }

  function detachTrack(track: unknown) {
    const value = track as { detach?: () => HTMLElement[] };
    value.detach?.().forEach((element) => element.remove());
  }

  function removeTiles(predicate: (tile: MediaTile) => boolean) {
    const removed = mediaTiles.filter(predicate);
    removed.forEach((tile) => tile.element.remove());
    mediaTiles = mediaTiles.filter((tile) => !predicate(tile));
  }

  function removeTileByPublication(participant: unknown, publication: unknown, track: unknown) {
    const identity = participantIdentity(participant);
    const source = trackSource(publication);
    const id = `${identity}_${source}_${publicationId(publication, track, "track")}`;
    removeTiles((tile) => tile.id === id || (tile.identity === identity && tile.source === source));
    detachTrack(track);
  }

  function clearMediaTiles() {
    mediaTiles.forEach((tile) => tile.element.remove());
    mediaTiles = [];
  }

  function addTrackTile(track: unknown, publication: unknown, participant: unknown, prefix: "local" | "remote") {
    const value = track as { attach?: () => HTMLElement };
    if (typeof value.attach !== "function") return;

    const identity = participantIdentity(participant);
    const source = trackSource(publication);
    const tileId = `${identity}_${source}_${publicationId(publication, track, prefix)}`;
    detachTrack(track);
    const element = value.attach();
    const kind = element instanceof HTMLAudioElement ? "audio" : "video";
    const isLocal = participantIsLocal(participant);

    if (kind === "video") {
      element.setAttribute("playsinline", "true");
      element.setAttribute("data-source", source);
      (element as HTMLMediaElement).muted = isLocal;
    }

    upsertTile({
      id: tileId,
      identity,
      name: participantName(participant),
      element,
      kind,
      source,
      isLocal,
      isInstructor: isInstructorIdentity(identity),
    });
  }

  function shouldSubscribeToPublication(participant: unknown) {
    if (isInstructorRoom) return true;
    return isInstructorIdentity(participantIdentity(participant));
  }

  function subscribeIfAllowed(publication: unknown, participant: unknown) {
    const value = publication as { setSubscribed?: (subscribed: boolean) => void };
    if (typeof value.setSubscribed !== "function") return;
    value.setSubscribed(shouldSubscribeToPublication(participant));
  }

  function attachParticipantListeners(participant: unknown, participantEvent: { IsSpeakingChanged: unknown }) {
    const value = participant as {
      identity?: string;
      on?: (event: unknown, handler: () => void) => void;
      trackPublications?: Map<string, unknown>;
    };
    value.on?.(participantEvent.IsSpeakingChanged, refreshParticipants);
    value.trackPublications?.forEach((publication) => {
      subscribeIfAllowed(publication, participant);
      const track = (publication as { track?: unknown }).track;
      if (track) addTrackTile(track, publication, participant, "remote");
    });
  }

  async function collectTrackStats(track: unknown, id: string) {
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
        const previous = previousStats.get(key);
        if (previous && stats.timestamp > previous.timestamp) {
          bitrate += ((bytes - previous.bytes) * 8) / ((stats.timestamp - previous.timestamp) / 1000) / 1_000_000;
        }
        previousStats.set(key, { timestamp: stats.timestamp, bytes });
      }
      if (typeof stats.packetsLost === "number") packetsLost += Math.max(0, stats.packetsLost);
      if (typeof stats.packetsReceived === "number") packetsTotal += stats.packetsReceived + Math.max(0, stats.packetsLost ?? 0);
    });

    return {
      bitrate,
      packetLoss: packetsTotal > 0 ? (packetsLost / packetsTotal) * 100 : null,
      width: settings?.width ?? null,
      height: settings?.height ?? null,
      fps: settings?.frameRate ?? null,
    };
  }

  async function refreshStreamStats() {
    if (room === null) return;
    const publications: Array<{ id: string; track: unknown; kind?: string }> = [];
    const local = room.localParticipant as { trackPublications?: Map<string, unknown> };
    local.trackPublications?.forEach((publication, id) => {
      const track = (publication as { track?: unknown }).track;
      if (track) publications.push({ id: `local:${id}`, track, kind: String((publication as { kind?: string }).kind ?? "") });
    });
    room.remoteParticipants.forEach((participant) => {
      const remote = participant as { identity?: string; trackPublications?: Map<string, unknown> };
      remote.trackPublications?.forEach((publication, id) => {
        const track = (publication as { track?: unknown }).track;
        if (track) publications.push({ id: `${remote.identity ?? "remote"}:${id}`, track, kind: String((publication as { kind?: string }).kind ?? "") });
      });
    });

    const results = await Promise.all(publications.map((publication) => collectTrackStats(publication.track, publication.id)));
    const bestVideo = results.reduce(
      (best, item) => ({
        bitrate: best.bitrate + item.bitrate,
        packetLoss: item.packetLoss ?? best.packetLoss,
        width: Math.max(best.width ?? 0, item.width ?? 0) || null,
        height: Math.max(best.height ?? 0, item.height ?? 0) || null,
        fps: Math.max(best.fps ?? 0, item.fps ?? 0) || null,
      }),
      { bitrate: 0, packetLoss: null as number | null, width: null as number | null, height: null as number | null, fps: null as number | null },
    );

    streamStats = {
      bitrateMbps: bestVideo.bitrate > 0 ? bestVideo.bitrate : null,
      packetLoss: bestVideo.packetLoss,
      width: bestVideo.width,
      height: bestVideo.height,
      fps: bestVideo.fps,
      videoTracks: videoTiles.length,
      audioTracks: audioTiles.length,
    };
  }

  function startStatsTimer() {
    if (statsTimer !== null) return;
    void refreshStreamStats();
    statsTimer = window.setInterval(() => {
      void refreshStreamStats();
    }, 2500);
  }

  function stopStatsTimer() {
    if (statsTimer !== null) window.clearInterval(statsTimer);
    statsTimer = null;
    previousStats.clear();
  }

  function observeNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!(navbar instanceof HTMLElement)) return;
    const update = () => {
      navbarBlockSize = navbar.getBoundingClientRect().height;
    };
    update();
    navbarObserver = new ResizeObserver(update);
    navbarObserver.observe(navbar);
  }

  async function loadToken() {
    if (!auth.isAuthenticated) {
      status = "locked";
      return;
    }

    const liveClassId = getClassId();
    if (liveClassId === null) {
      status = "missing";
      return;
    }

    status = "checking";
    error = "";
    mediaError = "";

    try {
      console.log("[LiveKit] Fetching join token for class:", liveClassId);
      joinInfo = await convex.action(api.livekit.issueJoinToken, { liveClassId });
      console.log("[LiveKit] Token received, role:", joinInfo.participantRole);
      status = "ready";
    } catch (reason) {
      console.error("[LiveKit] Token fetch failed:", reason);
      if (!auth.isAuthenticated) {
        status = "locked";
        return;
      }
      error = auth.error || (reason instanceof Error ? reason.message : "לא הצלחנו לפתוח את חדר הלייב.");
      status = "error";
      return;
    }

    // Connect room separately — media errors are non-fatal
    try {
      await connectRoom(joinInfo);
    } catch (reason) {
      console.error("[LiveKit] Room connection failed:", reason);
      connectionState = "disconnected";
      error = reason instanceof Error ? reason.message : "לא הצלחנו להתחבר לחדר הווידאו.";
      status = "error";
    }
  }

  async function connectRoom(info: NonNullable<typeof joinInfo>) {
    connectionState = "connecting";
    try {
      const { Room, RoomEvent, ParticipantEvent } = await import("livekit-client");
      const lkRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      room = lkRoom;

      lkRoom
        .on(RoomEvent.Reconnecting, () => {
          connectionState = "reconnecting";
        })
        .on(RoomEvent.Reconnected, () => {
          connectionState = "connected";
          refreshParticipants();
        })
        .on(RoomEvent.Disconnected, () => {
          connectionState = "disconnected";
        })
        .on(RoomEvent.ParticipantConnected, (participant: unknown) => {
          attachParticipantListeners(participant, ParticipantEvent);
          refreshParticipants();
        })
        .on(RoomEvent.ParticipantDisconnected, (participant: unknown) => {
          const identity = participantIdentity(participant);
          removeTiles((tile) => tile.identity === identity);
          refreshParticipants();
        })
        .on(RoomEvent.ActiveSpeakersChanged, () => {
          refreshParticipants();
        })
        .on(RoomEvent.LocalTrackPublished, (publication: unknown, participant: unknown) => {
          addTrackTile((publication as { track?: unknown }).track, publication, participant, "local");
        })
        .on(RoomEvent.LocalTrackUnpublished, (publication: unknown, participant: unknown) => {
          const track = (publication as { track?: unknown }).track;
          removeTileByPublication(participant, publication, track);
          const source = trackSource(publication);
          if (source === "screen_share" || source === "screen_share_audio") screenShareEnabled = false;
        })
        .on(RoomEvent.TrackUnpublished, (publication: unknown, participant: unknown) => {
          removeTileByPublication(participant, publication, (publication as { track?: unknown }).track);
        })
        .on(RoomEvent.TrackSubscribed, (track: unknown, publication: unknown, participant: unknown) => {
          addTrackTile(track, publication, participant, "remote");
        })
        .on(RoomEvent.TrackPublished, (publication: unknown, participant: unknown) => {
          subscribeIfAllowed(publication, participant);
        })
        .on(RoomEvent.TrackUnsubscribed, (track: unknown, publication: unknown, participant: unknown) => {
          removeTileByPublication(participant, publication, track);
        });

      await lkRoom.connect(info.wsUrl, info.token);
      console.log("[LiveKit] WebSocket connected to room:", info.roomName);

      // Camera — non-fatal
      try {
        await lkRoom.localParticipant.setCameraEnabled(true);
        cameraEnabled = true;
        console.log("[LiveKit] Camera enabled");
      } catch (cameraReason) {
        cameraEnabled = false;
        const msg = cameraReason instanceof Error ? cameraReason.message : String(cameraReason);
        console.warn("[LiveKit] Camera failed:", msg);
        mediaError = msg.includes("found") || msg.includes("NotFound")
          ? "לא נמצאה מצלמה. אפשר להמשיך ללייב ללא וידאו."
          : "לא הצלחנו להפעיל את המצלמה. אפשר להמשיך ללייב ללא וידאו.";
      }

      // Microphone — non-fatal
      try {
        await lkRoom.localParticipant.setMicrophoneEnabled(true);
        micEnabled = true;
        console.log("[LiveKit] Microphone enabled");
      } catch (micReason) {
        micEnabled = false;
        const msg = micReason instanceof Error ? micReason.message : String(micReason);
        console.warn("[LiveKit] Microphone failed:", msg);
        const micMsg = msg.includes("found") || msg.includes("NotFound")
          ? "לא נמצא מיקרופון."
          : "לא הצלחנו להפעיל את המיקרופון.";
        mediaError = mediaError ? `${mediaError} ${micMsg}` : micMsg;
      }

      connectionState = "connected";
      refreshParticipants();
      startStatsTimer();

      lkRoom.remoteParticipants.forEach((participant) => attachParticipantListeners(participant, ParticipantEvent));
    } catch (reason) {
      connectionState = "disconnected";
      throw reason;
    }
  }

  async function toggleCamera() {
    if (room === null || pendingControl !== null) return;
    const next = !cameraEnabled;
    pendingControl = "camera";
    try {
      await room.localParticipant.setCameraEnabled(next);
      cameraEnabled = next;
      mediaError = "";
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : String(reason);
      console.warn("[LiveKit] Toggle camera failed:", msg);
      mediaError = "לא הצלחנו להפעיל את המצלמה.";
    } finally {
      pendingControl = null;
    }
  }

  async function toggleMic() {
    if (room === null || pendingControl !== null) return;
    const next = !micEnabled;
    pendingControl = "mic";
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      micEnabled = next;
      mediaError = "";
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : String(reason);
      console.warn("[LiveKit] Toggle mic failed:", msg);
      mediaError = "לא הצלחנו להפעיל את המיקרופון.";
    } finally {
      pendingControl = null;
    }
  }

  async function toggleScreenShare() {
    if (room === null || !isInstructorRoom || !room.localParticipant.setScreenShareEnabled || pendingControl !== null) return;
    const next = !screenShareEnabled;
    pendingControl = "screen";
    try {
      await room.localParticipant.setScreenShareEnabled(next);
      screenShareEnabled = next;
      if (!next) removeTiles((tile) => tile.isLocal && tile.source === "screen_share");
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : String(reason);
      console.warn("[LiveKit] Toggle screen share failed:", msg);
      mediaError = "לא הצלחנו לשתף מסך.";
    } finally {
      pendingControl = null;
    }
  }

  onMount(() => {
    observeNavbar();
    void loadToken();
  });

  onDestroy(() => {
    console.log("[LiveKit] Disconnecting room");
    clearMediaTiles();
    stopStatsTimer();
    navbarObserver?.disconnect();
    room?.disconnect();
    room = null;
  });
</script>

<section class="live-room" style={`--navbar-block-size: ${navbarBlockSize}px;`}>
  {#if auth.isLoading || status === "checking"}
    <div class="state-card">
      <p class="kicker">HomeBody Live</p>
      <h1>בודקים הרשאה ללייב</h1>
      <div class="skeleton"></div>
    </div>
  {:else if status === "locked"}
    <div class="state-card">
      <p class="kicker">חשבון נעול</p>
      <h1>צריך להתחבר כדי להיכנס ללייב</h1>
      {#if auth.error}
        <Notice>{auth.error}</Notice>
      {/if}
      <a class="button-link" href="/">כניסה</a>
    </div>
  {:else if status === "missing"}
    <div class="state-card">
      <p class="kicker">חסר שיעור</p>
      <h1>לא נבחר שיעור לייב</h1>
      <a class="button-link" href="/calendar">חזרה ללוח</a>
    </div>
  {:else if status === "error"}
    <div class="state-card">
      <p class="kicker">לא נכנסים עדיין</p>
      <h1>הכניסה ללייב נחסמה</h1>
      <Notice tone="danger">{error}</Notice>
      <div class="state-actions">
        <button type="button" onclick={loadToken}>לנסות שוב</button>
        <a href="/calendar">חזרה ללוח</a>
      </div>
    </div>
  {:else if joinInfo}
    <div class="room-shell" class:room-shell--student={!isInstructorRoom}>
      {#if mediaError}
        <Notice tone="caution">{mediaError}</Notice>
      {/if}

      <main class="room-workspace" class:room-workspace--student={!isInstructorRoom}>
        {#if isInstructorRoom}
          <aside class="quality-panel" aria-label="נתוני שידור">
            <div class="quality-status" class:quality-status--on={connectionState === "connected"}>
              <span></span>
              {connectionLabel}
            </div>
            <dl>
              <div>
                <dt>משתתפות</dt>
                <dd>{participants.length}</dd>
              </div>
              <div>
                <dt>וידאו</dt>
                <dd>{streamStats.videoTracks}</dd>
              </div>
              <div>
                <dt>אודיו</dt>
                <dd>{streamStats.audioTracks}</dd>
              </div>
              <div>
                <dt>קצב</dt>
                <dd>{formattedBitrate}</dd>
              </div>
              <div>
                <dt>רזולוציה</dt>
                <dd>{formattedResolution}</dd>
              </div>
              <div>
                <dt>FPS</dt>
                <dd>{formattedFps}</dd>
              </div>
              <div>
                <dt>אובדן</dt>
                <dd>{formattedPacketLoss}</dd>
              </div>
            </dl>
          </aside>

          <section class="media-surface" aria-label="קיר משתתפות">
            <div class="instructor-wall">
              {#if videoTiles.length === 0}
                <div class="empty-video">מחכים למצלמות...</div>
              {/if}
              {#each videoTiles.sort(tileSort) as tile (tile.id)}
                <figure class="wall-tile" class:wall-tile--self={tile.isLocal} class:wall-tile--screen={tile.source === "screen_share"}>
                  <div use:mountMedia={tile.element}></div>
                  <figcaption>{tile.name}</figcaption>
                </figure>
              {/each}
            </div>
          </section>
        {:else}
          <section class="media-surface" aria-label="שיעור לייב">
            <div class="student-stage">
              <aside class="participant-strip" aria-label="משתתפות">
                <p>משתתפות</p>
                {#each studentParticipants as participant (participant.identity)}
                  <div class="participant-row" class:participant-row--speaking={participant.isSpeaking}>
                    <span>{participant.name}</span>
                    {#if participant.isLocal}<small>את</small>{/if}
                  </div>
                {/each}
              </aside>

              <section class="instructor-focus">
                {#if primaryInstructorVideo}
                  <figure class="focus-video">
                    <div use:mountMedia={primaryInstructorVideo.element}></div>
                    <figcaption>{primaryInstructorVideo.name}</figcaption>
                  </figure>
                {:else}
                  <div class="empty-video">מחכים למדריכה...</div>
                {/if}

                {#if selfVideo}
                  <figure class="self-preview">
                    <div use:mountMedia={selfVideo.element}></div>
                    <figcaption>{selfVideo.name}</figcaption>
                  </figure>
                {/if}
              </section>
            </div>
          </section>
        {/if}

        <footer class="room-controls">
          <button class:control-on={micEnabled} class:control-off={!micEnabled} type="button" onclick={toggleMic} disabled={pendingControl !== null} aria-label={micEnabled ? "לכבות מיקרופון" : "להדליק מיקרופון"} title={micEnabled ? "לכבות מיקרופון" : "להדליק מיקרופון"}>
            <span class="material-symbols-rounded" aria-hidden="true">{micEnabled ? "mic" : "mic_off"}</span>
          </button>
          <button class:control-on={cameraEnabled} class:control-off={!cameraEnabled} type="button" onclick={toggleCamera} disabled={pendingControl !== null} aria-label={cameraEnabled ? "לכבות מצלמה" : "להדליק מצלמה"} title={cameraEnabled ? "לכבות מצלמה" : "להדליק מצלמה"}>
            <span class="material-symbols-rounded" aria-hidden="true">{cameraEnabled ? "videocam" : "videocam_off"}</span>
          </button>
          {#if isInstructorRoom}
            <button class:control-on={screenShareEnabled} type="button" onclick={toggleScreenShare} disabled={pendingControl !== null} aria-label={screenShareEnabled ? "לעצור שיתוף מסך" : "שיתוף מסך"} title={screenShareEnabled ? "לעצור שיתוף מסך" : "שיתוף מסך"}>
              <span class="material-symbols-rounded" aria-hidden="true">{screenShareEnabled ? "stop_screen_share" : "screen_share"}</span>
            </button>
          {/if}
          <a class="leave-control" href={isInstructorRoom ? "/live" : "/calendar"} aria-label="לצאת" title="לצאת">
            <span class="material-symbols-rounded" aria-hidden="true">logout</span>
          </a>
        </footer>
      </main>

      <div class="audio-sink" aria-hidden="true">
        {#each audioTiles as tile (tile.id)}
          <div use:mountMedia={tile.element}></div>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .live-room {
    --workspace-gap: var(--space-2);
    --stats-rail-size: clamp(9rem, 11vw, 12rem);
    position: fixed;
    inset-block: var(--navbar-block-size, 0px) 0;
    inset-inline: 0;
    z-index: 1;
    height: auto;
    background: #f7f8fa;
    padding: var(--space-2);
    overflow: hidden;
    box-sizing: border-box;
  }

  .state-card {
    width: min(100%, 680px);
    margin: 10vh auto 0;
    display: grid;
    gap: var(--space-4);
    border: var(--border);
    background: var(--white);
    padding: clamp(24px, 5vw, 56px);
  }

  .kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    margin: 0;
  }

  .state-card h1 {
    margin: 0;
    line-height: 1.05;
  }

  .button-link,
  .state-actions a,
  .state-actions button {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding-inline: var(--space-4);
    font: inherit;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }

  .state-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .skeleton {
    height: 180px;
    background: var(--line-light);
    animation: pulse 1.6s ease-in-out infinite;
  }

  .room-shell {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: var(--workspace-gap);
  }

  .room-workspace {
    position: relative;
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: var(--stats-rail-size) minmax(0, 1fr);
    gap: var(--workspace-gap);
    direction: ltr;
    overflow: hidden;
  }

  .room-workspace--student {
    display: block;
  }

  .quality-panel {
    height: 100%;
    min-height: 0;
    overflow: auto;
    border: var(--border);
    background: #fff;
    padding: var(--space-3);
    direction: rtl;
  }

  .quality-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--muted);
  }

  .quality-status span {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 99px;
    background: #8b949e;
  }

  .quality-status--on span {
    background: #188038;
  }

  .quality-panel dl {
    display: grid;
    gap: var(--space-2);
    margin: 0;
  }

  .quality-panel dl div {
    display: grid;
    gap: var(--space-1);
    border-bottom: 1px solid var(--line-light);
    padding-bottom: var(--space-2);
  }

  .quality-panel dt {
    color: var(--muted);
    font-size: var(--step--2);
    font-weight: 800;
  }

  .quality-panel dd {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    direction: ltr;
    text-align: right;
  }

  .media-surface {
    position: relative;
    min-width: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border: var(--border);
    background: #101418;
  }

  .instructor-wall {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
    grid-auto-rows: minmax(14rem, 1fr);
    gap: var(--workspace-gap);
    padding: var(--workspace-gap);
    overflow: auto;
  }

  .wall-tile,
  .focus-video,
  .self-preview,
  .empty-video {
    position: relative;
    margin: 0;
    border: var(--border);
    background: #111;
    color: var(--white);
    overflow: hidden;
    min-height: 0;
    border-radius: 0.25rem;
  }

  .wall-tile--self {
    outline: 0.125rem solid var(--sky-strong);
    outline-offset: -0.125rem;
  }

  .wall-tile--screen {
    grid-column: span 2;
  }

  .wall-tile div,
  .focus-video div,
  .self-preview div {
    width: 100%;
    height: 100%;
  }

  .wall-tile :global(video),
  .focus-video :global(video),
  .self-preview :global(video) {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .wall-tile figcaption,
  .focus-video figcaption,
  .self-preview figcaption {
    position: absolute;
    inset-inline: var(--space-2) auto;
    inset-block-end: var(--space-2);
    background: rgba(0, 0, 0, 0.72);
    color: var(--white);
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--1);
    font-weight: 800;
  }

  .student-stage {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr minmax(10rem, 14rem);
    gap: var(--workspace-gap);
    padding: var(--workspace-gap);
  }

  .participant-strip {
    border: var(--border);
    background: rgba(255, 255, 255, 0.94);
    padding: var(--space-3);
    overflow: auto;
  }

  .participant-strip p {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    color: var(--muted);
    font-size: var(--step--1);
  }

  .participant-row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    border-bottom: var(--border);
    padding: var(--space-2) 0;
    font-weight: 800;
  }

  .participant-row--speaking span::before {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    display: inline-block;
    border-radius: 99px;
    background: var(--sky-strong);
    margin-inline-end: var(--space-2);
  }

  .participant-row small {
    color: var(--muted);
  }

  .instructor-focus {
    position: relative;
    min-height: 0;
  }

  .focus-video {
    height: 100%;
    min-height: 0;
  }

  .self-preview {
    position: absolute;
    width: min(28vw, 14rem);
    aspect-ratio: 4 / 3;
    min-height: 0;
    inset-inline-end: var(--space-3);
    inset-block-end: var(--space-3);
  }

  .empty-video {
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 800;
  }

  .audio-sink {
    display: none;
  }

  .room-controls {
    position: absolute;
    z-index: 5;
    left: calc(var(--stats-rail-size) + var(--workspace-gap) + (100% - var(--stats-rail-size) - var(--workspace-gap)) / 2);
    right: auto;
    bottom: var(--space-4);
    transform: translateX(-50%);
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2);
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(16, 20, 24, 0.72);
    backdrop-filter: blur(0.625rem);
    direction: rtl;
  }

  .room-workspace--student .room-controls {
    left: 50%;
  }

  .room-controls button,
  .room-controls a {
    width: 3rem;
    height: 3rem;
    min-width: 3rem;
    min-height: 3rem;
    display: inline-grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.26);
    background: rgba(255, 255, 255, 0.94);
    color: var(--ink);
    padding: 0;
    cursor: pointer;
    box-sizing: border-box;
    line-height: 1;
  }

  .room-controls button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .material-symbols-rounded {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    overflow: hidden;
    font-family: "Material Symbols Rounded";
    font-weight: normal;
    font-style: normal;
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: "liga";
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
  }

  .room-controls .control-on {
    background: #e8f5ee;
    color: #137333;
    border-color: #137333;
  }

  .room-controls .control-off,
  .room-controls .leave-control {
    background: #fff1f0;
    color: #b3261e;
    border-color: #b3261e;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @media (max-width: 47.5rem) {
    .live-room {
      padding: var(--space-1);
    }

    .wall-tile--screen {
      grid-column: auto;
    }

    .room-workspace {
      grid-template-columns: 1fr;
    }

    .quality-panel {
      display: none;
    }

    .student-stage {
      grid-template-columns: 1fr;
    }

    .participant-strip {
      order: 2;
      max-height: 12rem;
    }

    .self-preview {
      width: min(42vw, 12rem);
    }
  }
</style>
