import { api } from "$convex/_generated/api";
import { useInterval } from "runed";
import type { Id } from "$convex/_generated/dataModel";
import { useConvexClient } from "convex-svelte";
import type { RoomStatus } from "../types";

const HEARTBEAT_MS = 15_000;

export type LiveLobbyHeartbeatOptions = {
  get liveClassId(): Id<"liveClasses"> | null;
  get nowMs(): number;
  get status(): RoomStatus;
  get isInstructor(): boolean;
  get inRoom(): boolean;
};

/**
 * Registers customer presence on the pre-connect screen so instructors see who is waiting.
 */
export function useLiveLobbyHeartbeat(options: LiveLobbyHeartbeatOptions) {
  const client = useConvexClient();

  const phase = $derived.by((): "waiting_broadcast" | "device_setup" | null => {
    if (options.isInstructor || options.inRoom || options.liveClassId === null) {
      return null;
    }
    if (options.status === "waiting") return "waiting_broadcast";
    if (options.status === "ready" || options.status === "prep") return "device_setup";
    return null;
  });

  $effect(() => {
    const classId = options.liveClassId;
    const lobbyPhase = phase;
    const nowMs = options.nowMs;
    if (classId === null || lobbyPhase === null) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      void client.mutation(api.live.roster.heartbeat, {
        liveClassId: classId,
        phase: lobbyPhase,
        now: nowMs,
      });
    };

    tick();
    useInterval(HEARTBEAT_MS, { callback: tick });

    return () => {
      cancelled = true;
      if (classId !== null) {
        void client.mutation(api.live.roster.clearLobbyPresence, { liveClassId: classId });
      }
    };
  });
}
