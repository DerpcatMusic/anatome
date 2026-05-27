import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { api } from "$convex/_generated/api";
import { useQuery } from "convex-svelte";
import {
  authQuery,
  canRunAuthenticatedQuery,
  initAuth,
} from "$lib/auth/session.svelte";
import { joinSnapshotFromContext } from "../../join-token";
import type { JoinInfo, JoinTokenPhase } from "./types";
import type { RoomStatus } from "./types";
import { mintJoinCredentials } from "./mintJoin";

export type UseJoinContextOptions = {
  client: ConvexClient;
  get liveClassId(): Id<"liveClasses"> | null;
  get nowMs(): number;
};

/**
 * Reactive `getJoinContext` only — no JWT until {@link enterRoom}.
 */
export function useJoinContext(options: UseJoinContextOptions) {
  const auth = initAuth();

  const contextQuery = useQuery(api.live.session.getJoinContext, () => {
    const id = options.liveClassId;
    if (id === null || auth.isLoading || !canRunAuthenticatedQuery()) return "skip";
    return { liveClassId: id, now: options.nowMs };
  });

  let contextOverride = $state<import("./types").JoinContextSnapshot | null | undefined>(
    undefined,
  );

  $effect(() => {
    const id = options.liveClassId;
    const now = options.nowMs;
    if (id === null || auth.isLoading) {
      contextOverride = undefined;
      return;
    }
    if (!auth.isAuthenticated) {
      contextOverride = undefined;
      return;
    }
    if (canRunAuthenticatedQuery()) {
      if (contextQuery.data !== undefined) {
        contextOverride = undefined;
      }
      return;
    }
    if (contextOverride !== undefined) return;

    let cancelled = false;
    void authQuery(api.live.session.getJoinContext, { liveClassId: id, now }).then(
      (data) => {
        if (!cancelled) contextOverride = data ?? null;
      },
    );
    return () => {
      cancelled = true;
    };
  });

  const awaitingJoinContext = $derived(
    options.liveClassId !== null &&
      (auth.isLoading ||
        (!canRunAuthenticatedQuery() &&
          auth.isAuthenticated &&
          contextOverride === undefined) ||
        (canRunAuthenticatedQuery() &&
          contextOverride === undefined &&
          contextQuery.data === undefined &&
          contextQuery.isLoading)),
  );

  const snapshot = $derived(
    joinSnapshotFromContext(contextOverride ?? contextQuery.data, {
      isLoading: auth.isLoading || contextQuery.isLoading || awaitingJoinContext,
      isAuthenticated: auth.isAuthenticated,
      authError: auth.error,
      hasClassId: options.liveClassId !== null,
    }),
  );

  let credentials = $state<JoinInfo | null>(null);
  let mintError = $state("");
  let minting = $state(false);

  $effect(() => {
    const id = options.liveClassId;
    if (id === null) {
      credentials = null;
      mintError = "";
      return;
    }
    if (snapshot.status !== "ready" && snapshot.status !== "prep") {
      credentials = null;
    }
  });

  const phase = $derived<JoinTokenPhase>(credentials !== null ? "token" : snapshot.phase);

  async function refetchContext() {
    const id = options.liveClassId;
    if (id === null) {
      credentials = null;
      contextOverride = undefined;
      return;
    }
    const args = { liveClassId: id, now: options.nowMs };
    contextOverride = canRunAuthenticatedQuery()
      ? await options.client.query(api.live.session.getJoinContext, args)
      : await authQuery(api.live.session.getJoinContext, args);
  }

  /** User gesture — mint JWT (Phase 1 gate). */
  async function enterRoom(): Promise<JoinInfo | null> {
    const id = options.liveClassId;
    if (id === null || snapshot.joinAccess?.canEnter !== true) return null;

    minting = true;
    mintError = "";
    try {
      const info = await mintJoinCredentials(options.client, id);
      credentials = info;
      return info;
    } catch (reason) {
      mintError = reason instanceof Error ? reason.message : String(reason);
      credentials = null;
      return null;
    } finally {
      minting = false;
    }
  }

  function clearCredentials() {
    credentials = null;
    mintError = "";
  }

  return {
    get phase() {
      return phase;
    },
    get status() {
      return snapshot.status as RoomStatus;
    },
    get error() {
      return snapshot.error || mintError;
    },
    get joinAccess() {
      return snapshot.joinAccess;
    },
    get classTitle() {
      return snapshot.classTitle;
    },
    get credentials() {
      return credentials;
    },
    get minting() {
      return minting;
    },
    get canEnter() {
      return snapshot.joinAccess?.canEnter === true;
    },
    get isLoading() {
      return phase === "loading" || minting;
    },
    refetchContext,
    enterRoom,
    clearCredentials,
  };
}
